// TypeScript bridge for SpacetimeDB <-> Godot communication
// This file bridges the TypeScript SpacetimeDB client with Godot's JavaScriptBridge

import { DbConnection } from './spacetime-bindings/index.js';
import { ensureLoggedIn, handleCallback, isCallbackUrl, logout } from './auth.js';

let dbConnection: DbConnection | null = null;
let subscriptionHandle: any = null;
let connectionPromise: Promise<{ success: boolean; error?: string }> | null = null;

// Local player state cache (updated from subscription callbacks)
// This is exposed on window for Godot to poll synchronously
let localPlayerIdentity: string | null = null;
let localPlayerState: { tile_x: number; tile_y: number; facing_x: number; facing_y: number; zone_id: number } | null = null;
let localPlayerDisplayName: string | null = null; // Added for username system

// Chat listener system for Godot integration
type ChatMessagePayload = {
    sender_name: string;
    text: string;
    zone_id: number;
    created_at: string; // String representation of timestamp
};

const godotChatListeners: Array<(msg: ChatMessagePayload) => void> = [];

function emitToGodotChatListeners(msg: ChatMessagePayload) {
    for (const cb of godotChatListeners) {
        try {
            cb(msg);
        } catch (e) {
            console.error('[BRIDGE] Error in chat listener callback:', e);
        }
    }
}

function registerChatListener(cb: (msg: ChatMessagePayload) => void) {
    if (typeof cb !== 'function') {
        console.error('[BRIDGE] register_chat_listener: callback must be a function');
        return;
    }
    godotChatListeners.push(cb);
    console.log('[BRIDGE] Registered chat listener (total listeners: ' + godotChatListeners.length + ')');
}

// Type for tile coordinates
type Tile = { x: number; y: number };

// Cached local player tile for path preview building
let localPlayerTile: Tile | null = null;

// Cached remaining movement steps for the local player (server-authored MoveQueue)
let localMoveQueueSteps: Array<{ dx: number; dy: number }> = [];

// NPC and Interactable definition caches (for joining spawn rows with definitions)
const npcDefs = new Map<number, { name: string; spriteId: string }>();
const interactableDefs = new Map<number, { displayName: string; spriteId: string; defaultDialogueKey?: string }>();

// Helper to call a Godot function via exposed JavaScript callbacks
// These callbacks are set up by scripts/network_client.gd using JavaScriptBridge.create_callback()
// JavaScriptBridge.create_callback expects the callback to receive a single Array argument
function callGodotBridge(functionName: string, ...args: any[]): void {
    if (typeof window === 'undefined') {
        console.warn('[BRIDGE] Cannot call Godot function: window not available');
        return;
    }
    
    const callback = (window as any)[functionName];
    if (!callback || typeof callback !== 'function') {
        // Callback not yet available - this is normal during initial load
        console.warn(`[BRIDGE] ${functionName} callback not available, retrying in 100ms...`);
        // Retry after a short delay
        setTimeout(() => {
            const retryCallback = (window as any)[functionName];
            if (retryCallback && typeof retryCallback === 'function') {
                try {
                    // Create a plain JavaScript array
                    const retryArgsArray: any[] = [];
                    for (let i = 0; i < args.length; i++) {
                        retryArgsArray.push(args[i]);
                    }
                    console.log(`[BRIDGE] Retrying: Calling ${functionName} with args array:`, retryArgsArray, "length:", retryArgsArray.length);
                    retryCallback(retryArgsArray);
                } catch (e) {
                    console.error(`[BRIDGE] Error calling ${functionName} (retry):`, e);
                }
            } else {
                console.error(`[BRIDGE] ${functionName} callback not available after retry. Available callbacks:`, Object.keys(window).filter(k => k.startsWith('bridgeOn')));
            }
        }, 100);
        return;
    }
    
    try {
        // JavaScriptBridge.create_callback expects to receive a single Array argument
        // Create a plain JavaScript array with literal syntax to ensure proper serialization
        // This ensures it's a true Array, not an array-like object
        const argsArray: any[] = [];
        for (let i = 0; i < args.length; i++) {
            argsArray.push(args[i]);
        }
        const result = callback(argsArray);
    } catch (e) {
        console.error(`[BRIDGE] Error calling ${functionName}:`, e);
        console.error(`[BRIDGE] Callback type:`, typeof callback);
        console.error(`[BRIDGE] Callback value:`, callback);
    }
}

// Parse the MoveQueue.queue string ("dx,dy;dx,dy;...") to an array of step deltas
function parseQueue(queueStr: string): Array<{ dx: number; dy: number }> {
    if (!queueStr || queueStr.trim() === '') return [];
    return queueStr
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(step => {
            const [dxStr, dyStr] = step.split(',');
            const dx = parseInt(dxStr, 10) || 0;
            const dy = parseInt(dyStr, 10) || 0;
            return { dx, dy };
        });
}

// Build a flat [x1, y1, x2, y2, ...] list of absolute tiles from a base tile + steps
function buildAbsoluteTilesFromQueue(
    base: Tile,
    steps: Array<{ dx: number; dy: number }>
): number[] {
    const flat: number[] = [];
    let x = base.x;
    let y = base.y;

    for (const step of steps) {
        x += step.dx;
        y += step.dy;
        // Push every step, including the final destination
        flat.push(x, y);
    }

    return flat;
}

function isLocalPlayer(identity: any): boolean {
    if (!localPlayerIdentity) return false;
    if (identity == null) return false;
    try {
        const idStr = typeof identity.toString === 'function' ? identity.toString() : String(identity);
        const match = idStr === localPlayerIdentity;
        // Also try toHexString() if available (SpacetimeDB Identity can have multiple string forms)
        if (!match && typeof identity.toHexString === 'function') {
            const hex = identity.toHexString();
            return hex === localPlayerIdentity || hex === localPlayerIdentity.replace(/^0x/i, '');
        }
        return match;
    } catch {
        return false;
    }
}

function onNpcSpawnAddedOrUpdated(spawn: any): void {
    const def = npcDefs.get(spawn.npcDefId);
    const name = def ? def.name : '';
    const sprite_id = def ? def.spriteId : '';
    const default_dialogue_key = def ? def.defaultDialogueKey : '';
    const data = {
        npc_spawn_id: spawn.npcSpawnId,
        npc_def_id: spawn.npcDefId,
        zone_id: spawn.zoneId,
        tile_x: spawn.tileX,
        tile_y: spawn.tileY,
        facing: spawn.facing,
        name,
        sprite_id,
        default_dialogue_key,
    };
    callGodotBridge('bridgeOnSpawnNpcFromDb', data);
}

function onNpcSpawnDeleted(spawn: any): void {
    callGodotBridge('bridgeOnDespawnNpcBySpawnId', spawn.npcSpawnId);
}

// Map server behavior_id (u32) to client behavior_key (string) so Godot gets intended behavior
function interactableBehaviorIdToKey(behaviorId: number): string {
    switch (behaviorId) {
        case 1: return 'interactable_behavior_sign';
        default: return 'interactable_behavior_generic';
    }
}

function onInteractableSpawnAddedOrUpdated(spawn: any): void {
    const def = interactableDefs.get(spawn.interactableDefId);
    const display_name = def ? def.displayName : '';
    const sprite_id = def ? def.spriteId : '';
    const default_dialogue_key = def && (def as any).defaultDialogueKey != null ? (def as any).defaultDialogueKey : '';
    const behavior_id = def != null && typeof (def as any).behaviorId === 'number' ? (def as any).behaviorId : 0;
    const behavior_key = interactableBehaviorIdToKey(behavior_id);
    const data = {
        interactable_spawn_id: spawn.interactableSpawnId,
        interactable_def_id: spawn.interactableDefId,
        zone_id: spawn.zoneId,
        tile_x: spawn.tileX,
        tile_y: spawn.tileY,
        display_name,
        sprite_id,
        default_dialogue_key,
        behavior_key,
    };
    callGodotBridge('bridgeOnSpawnInteractableFromDb', data);
}

function onInteractableSpawnDeleted(spawn: any): void {
    callGodotBridge('bridgeOnDespawnInteractableBySpawnId', spawn.interactableSpawnId);
}

function onDialogueEventAddedOrUpdated(ev: any): void {
    const options = (ev.options || []).map((opt: any) => ({
        id: Number(opt.id),
        label: String(opt.label || ''),
    }));
    const eventId = typeof ev.eventId === 'bigint' ? Number(ev.eventId) : Number(ev.eventId);
    const npcName = String(ev.npcName || '');
    const text = String(ev.text || '');
    const payload = JSON.stringify({ eventId, npcName, text, options });
    // Godot's JavaScriptBridge receives strings as JavaScriptObject; str(args[0]) becomes
    // "<JavaScriptObject#...>" and JSON parse fails. Store payload in window so Godot
    // can read it via JavaScriptBridge.eval and get the actual string.
    (window as any).__dialoguePayload = payload;
    console.log('[INTERACT_DEBUG] TS PlayerDialogueEvent received, calling bridgeOnShowDialogueFromDb eventId=%s npcName=%s textLen=%s', eventId, npcName, text.length);
    callGodotBridge('bridgeOnShowDialogueFromDb');
}

function onDialogueEventDeleted(_ev: any): void {
    callGodotBridge('bridgeOnCloseDialogueFromDb');
}

// Send path preview to Godot as a single flat array argument
function sendPathPreviewToGodot(flatTiles: number[]): void {
    // Godot expects: bridgeOnMoveQueueUpdate(flatTilesArray)
    // callGodotBridge wraps all arguments in a single array, so we spread the numbers
    console.log(`[BRIDGE] Sending path preview to Godot: ${flatTiles.length} numbers`);
    callGodotBridge('bridgeOnMoveQueueUpdate', ...flatTiles);
}

// Recompute the local player's path preview from authoritative state:
// - localPlayerTile: current tile from PlayerState
// - localMoveQueueSteps: remaining steps from MoveQueue
function rebuildLocalPathPreview(reason: string): void {
    if (!localPlayerTile) {
        console.log(`[BRIDGE] rebuildLocalPathPreview skipped (${reason}) - no localPlayerTile yet`);
        return;
    }

    if (!localMoveQueueSteps || localMoveQueueSteps.length === 0) {
        console.log(`[BRIDGE] rebuildLocalPathPreview clearing (${reason}) - no remaining steps`);
        sendPathPreviewToGodot([]);
        return;
    }

    const flatTiles = buildAbsoluteTilesFromQueue(localPlayerTile, localMoveQueueSteps);
    console.log(
        `[BRIDGE] rebuildLocalPathPreview (${reason}) -> ${flatTiles.length / 2} tiles, first few: [${flatTiles
            .slice(0, 6)
            .join(', ')}]`
    );
    sendPathPreviewToGodot(flatTiles);
}

// Helper function that performs a single connection attempt with a specific token
// Returns a Promise that resolves with the DbConnection on success, or rejects on error
async function attemptConnectWithToken(
    token: string,
    sourceLabel: string,
    uri: string,
    moduleName: string
): Promise<DbConnection> {
    return new Promise((resolve, reject) => {
        let connectionResolved = false;
        
        const builder = DbConnection.builder()
            .withUri(uri)
            .withModuleName(moduleName)
            .withToken(token)
            .onConnect((...args: any[]) => {
                if (!connectionResolved) {
                    connectionResolved = true;
                    
                    // The connection object is available as dbConnection (set by builder.build())
                    // or as the first argument if provided
                    const conn = dbConnection || (args.length > 0 && args[0] ? args[0] : null);
                    if (!conn) {
                        reject(new Error('Connection object not available in onConnect callback'));
                        return;
                    }
                    
                    // Handle different SDK callback signatures:
                    // - onConnect() - no args
                    // - onConnect(conn, identity, token) - with args
                    let newToken: string | undefined = undefined;
                    if (args.length >= 3 && args[2]) {
                        newToken = args[2];
                    } else if (args.length >= 2 && args[1]) {
                        // Try to get token from second arg if it's an object
                        const identityObj = args[1];
                        if (identityObj && typeof identityObj === 'object' && 'token' in identityObj) {
                            newToken = (identityObj as any).token;
                        }
                    }
                    
                    // Cache the new private token for future fast reconnects
                    if (newToken) {
                        try {
                            window.localStorage.setItem("stdb_auth_token", newToken);
                            console.log("[BRIDGE] Cached SpacetimeDB token for fast reconnect");
                        } catch (e) {
                            console.warn("[BRIDGE] Failed to cache SpacetimeDB token:", e);
                        }
                    }
                    
                    // Get and cache local identity - identity is a property, not a method
                    try {
                        const identityObj = (conn as any).identity;
                        if (identityObj) {
                            localPlayerIdentity = identityObj.toString();
                            const identityStr = identityObj.toHexString ? identityObj.toHexString() : identityObj.toString();
                            console.log(`[BRIDGE] Connected to SpacetimeDB via ${sourceLabel} as ${identityStr}`);
                            console.log('[BRIDGE] Local identity:', localPlayerIdentity);
                        } else {
                            console.warn('[BRIDGE] Identity property is null/undefined');
                        }
                    } catch (e) {
                        console.warn('[BRIDGE] Could not get identity on connect:', e);
                    }
                    
                    resolve(conn);
                }
            })
            .onConnectError((_ctx, err) => {
                if (!connectionResolved) {
                    connectionResolved = true;
                    const errorMsg = err?.message || String(err) || 'Unknown connection error';
                    console.error(`[BRIDGE] SpacetimeDB connect error via ${sourceLabel}:`, errorMsg);
                    reject(new Error(errorMsg));
                }
            })
            .onDisconnect((_ctx, reason) => {
                console.warn("[BRIDGE] SpacetimeDB disconnected:", reason);
                dbConnection = null;
                subscriptionHandle = null;
                connectionPromise = null;
            });
        
        try {
            dbConnection = builder.build();
        } catch (e) {
            connectionResolved = true;
            reject(e);
        }
    });
}

// Initialize SpacetimeDB connection with SpacetimeAuth authentication
// This function ensures the user is logged in via SpacetimeAuth, then connects to SpacetimeDB
// with the OIDC ID token. The SpacetimeDB token is cached in localStorage for fast reconnects.
// Implements two-stage connection: tries cached token first, falls back to ID token if that fails.
async function connectToSpacetimeDB(host?: string, database?: string, token?: string | null): Promise<{ success: boolean; error?: string }> {
    // If already connected, return success immediately
    if (dbConnection) {
        return Promise.resolve({ success: true });
    }
    
    // If connection is in progress, return the existing promise
    if (connectionPromise) {
        return connectionPromise;
    }
    
    // Create a new Promise that resolves only when connection succeeds and subscriptions are set up
    connectionPromise = new Promise<{ success: boolean; error?: string }>(async (resolve) => {
        try {
            // 1) Always ensure we have a valid OIDC ID token from SpacetimeAuth
            let idToken: string;
            try {
                idToken = await ensureLoggedIn();
            } catch (error) {
                // Redirecting to login - this is expected for unauthenticated users
                console.log('[BRIDGE] Redirecting to login...');
                connectionPromise = null;
                resolve({ success: false, error: 'Redirecting to login' });
                return;
            }
            
            const uri = host || 'ws://localhost:3000';
            const moduleName = database || 'sn-server';
            
            // 2) Try the cached SpacetimeDB private token first, if present
            const cachedToken = window.localStorage.getItem("stdb_auth_token");
            let conn: DbConnection | null = null;
            
            if (cachedToken && !token) {
                try {
                    console.log("[BRIDGE] Attempting fast reconnect with cached SpacetimeDB token...");
                    conn = await attemptConnectWithToken(cachedToken, "cached-token", uri, moduleName);
                } catch (err) {
                    console.warn("[BRIDGE] Cached SpacetimeDB token failed, clearing and falling back to ID token:", err);
                    try {
                        window.localStorage.removeItem("stdb_auth_token");
                    } catch (e) {
                        console.warn("[BRIDGE] Failed to remove cached token:", e);
                    }
                    // Clear dbConnection if it was set but failed
                    dbConnection = null;
                }
            }
            
            // 3) If we still don't have a connection, fall back to the OIDC ID token (or provided token)
            if (!conn) {
                const fallbackToken = token || idToken;
                console.log("[BRIDGE] Connecting with OIDC ID token...");
                try {
                    conn = await attemptConnectWithToken(fallbackToken, "id-token", uri, moduleName);
                } catch (err) {
                    const errorMsg = (err as Error)?.message || String(err) || 'Unknown connection error';
                    console.error("[BRIDGE] Failed to connect with ID token:", errorMsg);
                    dbConnection = null;
                    connectionPromise = null;
                    resolve({ success: false, error: errorMsg });
                    return;
                }
            }
            
            // At this point, conn is a live DbConnection and we've cached a fresh private token.
            // 4) Set up subscriptions and any bridge->Godot callbacks
            //    This must happen after successful connection
            try {
                setupSubscriptions(conn);
                console.log('[BRIDGE] Connection and subscriptions established successfully');
                resolve({ success: true });
            } catch (subErr) {
                const errorMsg = (subErr as Error)?.message || String(subErr) || 'Subscription setup error';
                console.error('[BRIDGE] Failed to set up subscriptions:', errorMsg);
                // Connection succeeded but subscriptions failed - still resolve as success
                // since connection is established (subscriptions can be retried)
                resolve({ success: true });
            }
        } catch (error: any) {
            const errorMsg = error?.message || String(error) || 'Unknown error';
            console.error('[BRIDGE] Connection setup error:', errorMsg);
            dbConnection = null;
            connectionPromise = null;
            resolve({ success: false, error: errorMsg });
        }
    });
    
    return connectionPromise;
}

// Safe initialization function - returns boolean immediately
// Note: This now requires authentication, so it may redirect to login if not authenticated
function init(host?: string, moduleName?: string, token?: string | null): boolean {
    // If already connected, return true immediately
    if (dbConnection) {
        return true;
    }
    
    // If connection is in progress, return true (already started)
    if (connectionPromise) {
        return true;
    }
    
    // Start the connection (async, don't await)
    // This will ensure user is logged in via SpacetimeAuth before connecting
    connectToSpacetimeDB(host, moduleName, token).catch((error) => {
        console.error('[BRIDGE] Connection initialization error:', error);
    });
    
    // Return true immediately - connection will complete asynchronously
    return true;
}

// Expose logout function for UI
function logoutUser(): void {
    logout().catch((error) => {
        console.error('[BRIDGE] Logout error:', error);
    });
}

// Set up subscriptions and table callbacks after a successful connection
// This function is called automatically after connectToSpacetimeDB succeeds
function setupSubscriptions(conn: DbConnection): void {
    if (!conn) {
        console.error('[BRIDGE] Cannot set up subscriptions: no connection');
        return;
    }

    try {
        // Set up table callbacks for player_state before subscribing
        const playerStateTable = (conn.db as any).playerState;
        
        // Handle player_state inserts (new players)
        playerStateTable.onInsert((ctx, row) => {
            const identityStr = row.identity.toString();
            
            // Check if this is the local player
            if (!localPlayerIdentity) {
                // Try to get identity if not yet cached - identity is a property, not a method
                try {
                    const identity = (conn as any).identity;
                    if (identity) {
                        localPlayerIdentity = identity.toString();
                        console.log('[BRIDGE] Local identity set in onInsert: ' + localPlayerIdentity);
                    }
                } catch (e) {
                    console.warn('[BRIDGE] Could not get identity in onInsert:', e);
                }
            }
            
            const match = identityStr === localPlayerIdentity;
            // Update local player state cache if this is the local player
            if (match) {
                localPlayerState = {
                    tile_x: row.tileX,
                    tile_y: row.tileY,
                    facing_x: row.facingX,
                    facing_y: row.facingY,
                    zone_id: row.zoneId || 1
                };
                // Also update localPlayerTile for path preview building
                localPlayerTile = { x: row.tileX, y: row.tileY };
                console.log(`[BRIDGE] Local player_state updated (insert): (${localPlayerState.tile_x},${localPlayerState.tile_y}) facing (${localPlayerState.facing_x},${localPlayerState.facing_y}) zone=${localPlayerState.zone_id}`);
                // If we already have a MoveQueue cached, rebuild the preview from this new tile
                if (localMoveQueueSteps.length > 0) {
                    rebuildLocalPathPreview('player_state insert');
                }
            }
            
            // Call Godot for ALL players (local and remote)
            // Use the exposed JavaScript callback set up by scripts/network_client.gd
            // Include zone_id for zone filtering
            callGodotBridge('bridgeOnPlayerStateUpdate',
                identityStr,
                row.tileX,
                row.tileY,
                row.facingX,
                row.facingY,
                row.zoneId || 1
            );
        });
        
        // Handle player_state updates (existing players)
        playerStateTable.onUpdate((ctx, oldRow, newRow) => {
            const identityStr = newRow.identity.toString();
            const match = identityStr === localPlayerIdentity;
            
            // Update local player state cache if this is the local player
            if (match) {
                // Check if state actually changed
                const oldState = localPlayerState;
                const newState = {
                    tile_x: newRow.tileX,
                    tile_y: newRow.tileY,
                    facing_x: newRow.facingX,
                    facing_y: newRow.facingY,
                    zone_id: newRow.zoneId || 1
                };
                
                // Only log and update if state changed (including zone_id)
                if (!oldState || 
                    oldState.tile_x !== newState.tile_x || 
                    oldState.tile_y !== newState.tile_y ||
                    oldState.facing_x !== newState.facing_x ||
                    oldState.facing_y !== newState.facing_y ||
                    oldState.zone_id !== newState.zone_id) {
                    localPlayerState = newState;
                    // Also update localPlayerTile for path preview building
                    localPlayerTile = { x: newState.tile_x, y: newState.tile_y };
                    console.log(`[BRIDGE] Local player_state updated: (${newState.tile_x},${newState.tile_y}) facing (${newState.facing_x},${newState.facing_y}) zone=${newState.zone_id}`);
                    // When the player moves, their tile changes but the MoveQueue also shrinks on the server.
                    // Rebuild the preview so we never mix a new tile with old geometry.
                    if (localMoveQueueSteps.length > 0) {
                        rebuildLocalPathPreview('player_state update');
                    }
                }
            }
            
            // Call Godot for ALL players (local and remote)
            // Use the exposed JavaScript callback set up by scripts/network_client.gd
            // Include zone_id for zone filtering
            callGodotBridge('bridgeOnPlayerStateUpdate',
                identityStr,
                newRow.tileX,
                newRow.tileY,
                newRow.facingX,
                newRow.facingY,
                newRow.zoneId || 1
            );
        });
        
        // Handle player_state deletes (player disconnected)
        playerStateTable.onDelete((ctx, row) => {
            const identityStr = row.identity.toString();
            const match = identityStr === localPlayerIdentity;
            
            if (match) {
                // Local player deleted - clear cache
                localPlayerState = null;
                localPlayerTile = null;
            }
            
            // Call Godot to remove the player (for remote players)
            // Local player removal is handled separately if needed
            if (!match) {
                callGodotBridge('bridgeOnPlayerStateRemove', identityStr);
            }
        });
        
        // Set up ZoneCollision table callbacks for loading gate
        const zoneCollisionTable = (conn.db as any).zoneCollision;
        if (zoneCollisionTable) {
            zoneCollisionTable.onInsert((ctx, row) => {
                callGodotBridge('bridgeOnZoneCollisionUpdate', row.zoneId, row.ready, row.blockedCount);
            });
            
            zoneCollisionTable.onUpdate((ctx, oldRow, newRow) => {
                callGodotBridge('bridgeOnZoneCollisionUpdate', newRow.zoneId, newRow.ready, newRow.blockedCount);
            });
        } else {
            console.warn('[BRIDGE] ZoneCollision table not found in database');
        }
        
        // Set up MoveQueue table callbacks for path preview
        const moveQueueTable = (conn.db as any).moveQueue;
        if (moveQueueTable) {
            const forwardMoveQueueUpdate = (row: any) => {
                const identityStr = row.playerIdentity.toString();

                // Only process MoveQueue for local player
                if (identityStr === localPlayerIdentity) {
                    const { queue, queue_length } = row;
                    const steps = parseQueue(queue);

                    console.log(
                        `[BRIDGE] MoveQueue update for local player: queue="${queue}" queue_length=${queue_length} parsed_steps=${steps.length}`
                    );

                    // Update the cached steps for the local player
                    localMoveQueueSteps = steps;

                    if (!localPlayerTile) {
                        console.log('[BRIDGE] MoveQueue update but no localPlayerTile yet - will render once player_state arrives');
                        return;
                    }

                    // If there are no steps, clear the path preview
                    if (steps.length === 0) {
                        console.log('[BRIDGE] No steps in queue, clearing path preview');
                        rebuildLocalPathPreview('move_queue empty');
                        return;
                    }

                    // Rebuild the preview from the authoritative tile + new steps
                    rebuildLocalPathPreview('move_queue update');
                }
            };

            moveQueueTable.onInsert((ctx, row) => {
                forwardMoveQueueUpdate(row);
            });

            moveQueueTable.onUpdate((ctx, oldRow, newRow) => {
                forwardMoveQueueUpdate(newRow);
            });

            moveQueueTable.onDelete((ctx, row) => {
                const identityStr = row.playerIdentity.toString();

                // Only process MoveQueue delete for local player
                if (identityStr === localPlayerIdentity) {
                    console.log('[BRIDGE] MoveQueue deleted for local player, clearing path preview');
                    localMoveQueueSteps = [];
                    sendPathPreviewToGodot([]);
                }
            });
        } else {
            console.warn('[BRIDGE] MoveQueue table not found in database');
        }
        
        // Set up chat_message table callbacks
        const chatMessageTable = (conn.db as any).chatMessage;
        if (chatMessageTable) {
            chatMessageTable.onInsert((ctx, row) => {
                // Get current player zone for filtering (zone-local chat)
                const currentZoneId = localPlayerState?.zone_id || 1;
                
                // Filter: only forward messages from the current zone (zone-local chat)
                // If you want global chat, remove this check
                if (row.zoneId !== currentZoneId) {
                    console.debug(`[CHAT] Filtered message from zone ${row.zoneId} (current zone: ${currentZoneId})`);
                    return;
                }
                
                console.log(`[CHAT] ${row.senderName}: ${row.text} (zone ${row.zoneId})`);
                
                const payload: ChatMessagePayload = {
                    sender_name: row.senderName,
                    text: row.text,
                    zone_id: row.zoneId,
                    created_at: String(row.createdAt)
                };
                emitToGodotChatListeners(payload);
                
                // Also forward to Godot via legacy callback (for backward compatibility)
                callGodotBridge('bridgeOnChatMessageInsert',
                    row.id.toString(),
                    row.senderId.toString(),
                    row.senderName,
                    row.text,
                    row.zoneId.toString(),
                    row.createdAt.toString()
                );
            });
        } else {
            console.warn('[BRIDGE] ChatMessage table not found in database');
        }

        // Set up QuestDebugSnapshot table callbacks (dev-only quest/flags debug panel)
        const questDebugSnapshotTable = (conn.db as any).questDebugSnapshot;
        if (questDebugSnapshotTable) {
            const forwardQuestDebugSnapshot = (row: any) => {
                const identityStr = row.playerIdentity.toString();
                if (identityStr === localPlayerIdentity) {
                    try {
                        (window as any).__questDebugSnapshot = row.jsonData;
                        callGodotBridge('bridgeOnQuestDebugSnapshot');
                    } catch (e) {
                        console.error('[BRIDGE] Quest debug snapshot forward error:', e);
                    }
                }
            };
            questDebugSnapshotTable.onInsert((ctx: any, row: any) => forwardQuestDebugSnapshot(row));
            questDebugSnapshotTable.onUpdate((ctx: any, _oldRow: any, newRow: any) => forwardQuestDebugSnapshot(newRow));
        } else {
            console.warn('[BRIDGE] QuestDebugSnapshot table not found in database');
        }

        // Set up player table callbacks (for display name updates)
        const playerTable = (conn.db as any).player;
        if (playerTable) {
            playerTable.onInsert((ctx, row) => {
                const identityStr = row.id.toString();

                // Update local player display name if this is the local player
                if (!localPlayerIdentity) {
                    try {
                        const identity = (conn as any).identity;
                        if (identity) {
                            localPlayerIdentity = identity.toString();
                        }
                    } catch (e) {
                        console.warn('[BRIDGE] Could not get identity in Player onInsert:', e);
                    }
                }

                const isLocal = identityStr === localPlayerIdentity;
                if (isLocal) {
                    localPlayerDisplayName = row.displayName;
                    console.log(`[BRIDGE] Local player display name updated: ${localPlayerDisplayName}`);
                    
                    // Trigger ChatManager to refresh display name
                    if (typeof window !== 'undefined' && (window as any).godotDisplayNameRefreshCallback) {
                        try {
                            (window as any).godotDisplayNameRefreshCallback([]);
                        } catch (e) {
                            console.debug('[BRIDGE] godotDisplayNameRefreshCallback not available yet');
                        }
                    }
                }

                // Forward to Godot
                callGodotBridge('bridgeOnPlayerUpdate',
                    identityStr,
                    row.displayName,
                    isLocal ? '1' : '0'
                );
            });

            playerTable.onUpdate((ctx, oldRow, newRow) => {
                const identityStr = newRow.id.toString();
                const isLocal = identityStr === localPlayerIdentity;

                if (isLocal) {
                    localPlayerDisplayName = newRow.displayName;
                    console.log(`[BRIDGE] Local player display name updated: ${localPlayerDisplayName}`);
                    
                    // Trigger ChatManager to refresh display name
                    if (typeof window !== 'undefined' && (window as any).godotDisplayNameRefreshCallback) {
                        try {
                            (window as any).godotDisplayNameRefreshCallback([]);
                        } catch (e) {
                            console.debug('[BRIDGE] godotDisplayNameRefreshCallback not available yet');
                        }
                    }
                }

                // Forward to Godot (only if callback is available - it may not be registered yet)
                if (typeof window !== 'undefined' && (window as any).bridgeOnPlayerUpdate && typeof (window as any).bridgeOnPlayerUpdate === 'function') {
                    callGodotBridge('bridgeOnPlayerUpdate',
                        identityStr,
                        newRow.displayName,
                        isLocal ? '1' : '0'
                    );
                } else {
                    // Callback not available yet - will be called later when it's registered
                    // The display name is already cached in localPlayerDisplayName
                    console.debug(`[BRIDGE] bridgeOnPlayerUpdate not available yet, skipping forward (will retry on next update)`);
                }
            });
        } else {
            console.warn('[BRIDGE] Player table not found in database');
        }

        // --- NPC definitions and spawns ---
        const npcDefinitionTable = (conn.db as any).npcDefinition;
        if (npcDefinitionTable) {
            npcDefinitionTable.onInsert((ctx: any, row: any) => {
                npcDefs.set(row.npcDefId, { name: row.name, spriteId: row.spriteId, defaultDialogueKey: row.defaultDialogueKey });
            });
            npcDefinitionTable.onUpdate((ctx: any, oldRow: any, newRow: any) => {
                npcDefs.set(newRow.npcDefId, { name: newRow.name, spriteId: newRow.spriteId, defaultDialogueKey: newRow.defaultDialogueKey });
            });
            npcDefinitionTable.onDelete((ctx: any, row: any) => {
                npcDefs.delete(row.npcDefId);
            });
        }
        const npcSpawnTable = (conn.db as any).npcSpawn;
        if (npcSpawnTable) {
            npcSpawnTable.onInsert((ctx: any, row: any) => onNpcSpawnAddedOrUpdated(row));
            npcSpawnTable.onUpdate((ctx: any, oldRow: any, newRow: any) => onNpcSpawnAddedOrUpdated(newRow));
            npcSpawnTable.onDelete((ctx: any, row: any) => onNpcSpawnDeleted(row));
        }

        // --- Interactable definitions and spawns ---
        const interactableDefinitionTable = (conn.db as any).interactableDefinition;
        if (interactableDefinitionTable) {
            interactableDefinitionTable.onInsert((ctx: any, row: any) => {
                interactableDefs.set(row.interactableDefId, { displayName: row.displayName, spriteId: row.spriteId, defaultDialogueKey: (row as any).defaultDialogueKey ?? '' });
            });
            interactableDefinitionTable.onUpdate((ctx: any, oldRow: any, newRow: any) => {
                interactableDefs.set(newRow.interactableDefId, { displayName: newRow.displayName, spriteId: newRow.spriteId, defaultDialogueKey: (newRow as any).defaultDialogueKey ?? '' });
            });
            interactableDefinitionTable.onDelete((ctx: any, row: any) => {
                interactableDefs.delete(row.interactableDefId);
            });
        }
        const interactableSpawnTable = (conn.db as any).interactableSpawn;
        if (interactableSpawnTable) {
            interactableSpawnTable.onInsert((ctx: any, row: any) => onInteractableSpawnAddedOrUpdated(row));
            interactableSpawnTable.onUpdate((ctx: any, oldRow: any, newRow: any) => onInteractableSpawnAddedOrUpdated(newRow));
            interactableSpawnTable.onDelete((ctx: any, row: any) => onInteractableSpawnDeleted(row));
        }

        // --- Player dialogue events (local player only) ---
        const playerDialogueEventTable = (conn.db as any).playerDialogueEvent;
        if (playerDialogueEventTable) {
            playerDialogueEventTable.onInsert((ctx: any, row: any) => {
                const rowIdStr = row.playerIdentity != null && typeof row.playerIdentity.toString === 'function' ? row.playerIdentity.toString() : String(row.playerIdentity);
                const isLocal = isLocalPlayer(row.playerIdentity);
                console.log('[INTERACT_DEBUG] PlayerDialogueEvent insert: row.playerIdentity=%s localPlayerIdentity=%s isLocal=%s', rowIdStr, localPlayerIdentity, isLocal);
                if (isLocal) onDialogueEventAddedOrUpdated(row);
            });
            playerDialogueEventTable.onUpdate((ctx: any, oldRow: any, newRow: any) => {
                if (isLocalPlayer(newRow.playerIdentity)) onDialogueEventAddedOrUpdated(newRow);
            });
            playerDialogueEventTable.onDelete((ctx: any, row: any) => {
                if (isLocalPlayer(row.playerIdentity)) onDialogueEventDeleted(row);
            });
        }

        // Now subscribe to all tables
        subscriptionHandle = conn
            .subscriptionBuilder()
            .onApplied((_ctx) => {
                console.log('[BRIDGE] Player subscription applied');
                // Note: ZoneCollision table callbacks are set up above and will handle insert/update events
                // No need to manually check existing rows - the onInsert/onUpdate callbacks will fire for any existing rows

                // After subscription is applied, try to get identity again if not cached - identity is a property
                if (!localPlayerIdentity) {
                    try {
                        const identity = (conn as any).identity;
                        if (identity) {
                            localPlayerIdentity = identity.toString();
                            console.log('[BRIDGE] Local identity: ' + localPlayerIdentity);
                        }
                    } catch (e) {
                        console.warn('[BRIDGE] Could not get identity in onApplied:', e);
                    }
                }
            })
            .onError((ctx: any, err?: any) => {
                console.error('[BRIDGE] Subscription error:', err || ctx);
            })
            .subscribeToAllTables();

        console.log('[BRIDGE] Subscribed to player_state with callbacks');
    } catch (e) {
        console.error('[BRIDGE] Subscription error:', e);
        throw e; // Re-throw so caller knows subscription setup failed
    }
}

// Subscribe to PlayerState table (backward compatibility wrapper)
// This function is kept for backward compatibility with Godot code that calls it directly
// The new flow automatically calls setupSubscriptions after successful connection
function subscribeToPlayerState() {
    if (!dbConnection) {
        console.error('[BRIDGE] Cannot subscribe: no connection');
        return;
    }
    
    // If already subscribed, don't set up again
    if (subscriptionHandle !== null) {
        console.log('[BRIDGE] Already subscribed, skipping');
        return;
    }
    
    // Call setupSubscriptions with the existing connection
    setupSubscriptions(dbConnection);
}

// Send move-to destination intent (click-to-move)
async function moveTo(destX: number, destY: number) {
    if (!dbConnection) {
        console.error('[BRIDGE] Cannot send move-to intent: no connection');
        return;
    }

    try {
        // Ensure parameters are numbers (not strings or other types)
        const dest_x: number = Number(destX);
        const dest_y: number = Number(destY);
        
        // Validate they're valid numbers
        if (isNaN(dest_x) || isNaN(dest_y)) {
            console.error('[BRIDGE] moveTo: Invalid parameters - destX=' + destX + ' destY=' + destY);
            throw new Error('Invalid destination coordinates');
        }
        
        const reducersObj = dbConnection.reducers;
        
        // Check snake_case first (matches Rust reducer name exactly)
        // Then fall back to camelCase (SDK might generate both)
        let reducerName: string | null = null;
        let moveToReducer: any = null;
        
        if ((reducersObj as any)['move_to'] && typeof (reducersObj as any)['move_to'] === 'function') {
            reducerName = 'move_to';
            moveToReducer = (reducersObj as any)['move_to'];
        } else if ((reducersObj as any)['moveTo'] && typeof (reducersObj as any)['moveTo'] === 'function') {
            reducerName = 'moveTo';
            moveToReducer = (reducersObj as any)['moveTo'];
        }
        
        if (!moveToReducer || !reducerName || typeof moveToReducer !== 'function') {
            const available = Object.keys(reducersObj || {}).join(', ');
            console.error('[BRIDGE] move_to reducer not found. Available reducers: ' + available);
            throw new Error('move_to reducer not found. Available: ' + available);
        }
        
        // CRITICAL: SpacetimeDB generated bindings use CAMELCASE property names!
        // Generated move_to_reducer.ts expects: { destX: i32, destY: i32 }
        // The SDK serializes based on the generated bindings schema, not the Rust parameter names
        const paramsObj = { destX: dest_x, destY: dest_y };
        
        // Call reducer with object parameter matching generated bindings format: { destX, destY }
        const result = (reducersObj as any)[reducerName](paramsObj);
        
        // Handle Promise result (if any)
        if (result instanceof Promise) {
            try {
                await result;
            } catch (err) {
                console.error('[BRIDGE] moveTo Promise rejected:', err);
                throw err;
            }
        }
    } catch (e) {
        console.error('[BRIDGE] moveTo error:', e);
        console.error('[BRIDGE] moveTo error stack:', (e as Error).stack);
        throw e;
    }
}

// Send movement intent (single-step WASD movement)
async function sendMoveIntent(dx: number, dy: number) {
    if (!dbConnection) {
        console.error('[BRIDGE] Cannot send move intent: no connection');
        return;
    }

    try {
        // Try to find the reducer - check both snake_case and camelCase
        const moveReducer = (dbConnection.reducers as any)['move_player'] || (dbConnection.reducers as any).movePlayer;
        
        if (moveReducer && typeof moveReducer === 'function') {
            // Call the reducer directly on dbConnection.reducers (not extracted) to maintain correct 'this' binding
            // The reducer internally calls this.callReducerWithParams which needs 'this' to be dbConnection.reducers
            try {
                // Call directly as a method on dbConnection.reducers to ensure correct 'this' context
                const reducersObj = dbConnection.reducers;
                
                // Try calling via the stored reference to verify context
                // In newer SpacetimeDB SDK versions, reducer args should be passed as an object
                // Try both patterns: object first (newer SDK), then separate params (older SDK)
                let result: any;
                try {
                    // Try new SDK pattern: args as object
                    result = (reducersObj as any).movePlayer({ dx, dy });
                } catch (e) {
                    // Fallback to old SDK pattern: separate params
                    result = (reducersObj as any).movePlayer(dx, dy);
                }
                
                // Even if it returns undefined, the call may have been queued internally
                // The internal callReducerWithParams should handle the async transmission
                // If it's a Promise, await it to ensure the request is sent
                if (result instanceof Promise) {
                    try {
                        await result;
                    } catch (err) {
                        console.error('[BRIDGE] Reducer Promise rejected:', err);
                        throw err;
                    }
                }
            } catch (callError) {
                console.error('[BRIDGE] Error calling reducer:', callError);
                console.error('[BRIDGE] Error details:', (callError as Error).message, (callError as Error).stack);
                throw callError;
            }
        } else {
            console.error('[BRIDGE] Move reducer not found. Available reducers:', Object.keys(dbConnection.reducers || {}));
            console.error('[BRIDGE] dbConnection.reducers structure:', JSON.stringify(dbConnection.reducers, null, 2));
        }
    } catch (e) {
        console.error('[BRIDGE] Move intent error:', e);
        console.error('[BRIDGE] Move intent error stack:', (e as Error).stack);
    }
}

// Request interaction at tile (NPC / interactable) — calls request_interaction reducer
function requestInteraction(tileX: number, tileY: number): void {
    console.log('[INTERACT_DEBUG] TS requestInteraction called tileX=%s tileY=%s', tileX, tileY);
    if (!dbConnection) {
        console.error('[BRIDGE] Cannot request interaction: no connection');
        return;
    }
    try {
        const reducersObj = dbConnection.reducers;
        const reducer = (reducersObj as any)['request_interaction'] || (reducersObj as any).requestInteraction;
        if (reducer && typeof reducer === 'function') {
            const tile_x = Number(tileX);
            const tile_y = Number(tileY);
            const paramsObj = { tileX: tile_x, tileY: tile_y };
            console.log('[INTERACT_DEBUG] TS calling reducer request_interaction with', paramsObj);
            const result = reducer(paramsObj);
            if (result instanceof Promise) {
                result.catch((err: any) => console.error('[BRIDGE] request_interaction rejected:', err));
            }
            console.log('[INTERACT_DEBUG] TS request_interaction reducer invoked');
        } else {
            console.warn('[BRIDGE] request_interaction reducer not found');
        }
    } catch (e) {
        console.error('[BRIDGE] request_interaction error:', e);
    }
}

// Send dialogue choice — calls dialogue_choice reducer
function sendDialogueChoice(eventId: number | bigint, optionId: number): void {
    if (!dbConnection) {
        console.error('[BRIDGE] Cannot send dialogue choice: no connection');
        return;
    }
    try {
        const reducersObj = dbConnection.reducers;
        const reducer = (reducersObj as any)['dialogue_choice'] || (reducersObj as any).dialogueChoice;
        if (reducer && typeof reducer === 'function') {
            const event_id = typeof eventId === 'bigint' ? eventId : BigInt(Math.floor(Number(eventId)));
            const option_id = Number(optionId);
            const paramsObj = { eventId: event_id, optionId: option_id };
            const result = reducer(paramsObj);
            if (result instanceof Promise) {
                result.catch((err: any) => console.error('[BRIDGE] dialogue_choice rejected:', err));
            }
        } else {
            console.warn('[BRIDGE] dialogue_choice reducer not found');
        }
    } catch (e) {
        console.error('[BRIDGE] send_dialogue_choice error:', e);
    }
}

// Check if SpacetimeDB connection is established
function isConnected(): boolean {
    return dbConnection !== null && localPlayerIdentity !== null;
}

// Get current display name (synchronous - returns string or empty string)
// Note: This relies on the cached value from subscription callbacks.
// The Player table doesn't have a synchronous .get() method, so we wait for
// the onInsert/onUpdate callbacks to populate localPlayerDisplayName.
function getCurrentDisplayName(): string {
    // Don't try to get display name if not connected
    if (!isConnected()) {
        return "";
    }
    
    // Return cached value - this is updated by Player table subscription callbacks
    // (onInsert/onUpdate) when the player row is received from SpacetimeDB
    if (localPlayerDisplayName) {
        return localPlayerDisplayName;
    }
    
    // Not cached yet - subscription callbacks haven't fired or player row doesn't exist
    // Return empty string; the value will be available once the subscription syncs
    return "";
}

// Get current identity (synchronous - returns string or null)
function getIdentity(): string | null {
    if (!dbConnection) {
        return null;
    }
    
    try {
        // Return cached identity if available
        if (localPlayerIdentity) {
            return localPlayerIdentity;
        }
        
        // Try to get identity from connection - identity is a property, not a method
        const identityObj = (dbConnection as any).identity;
        const identity = identityObj ? identityObj.toString() : null;
        if (identity) {
            localPlayerIdentity = identity;
            return identity;
        }
        return null;
    } catch (error: any) {
        console.error('[BRIDGE] Get identity error:', error);
        return null;
    }
}

// Get local player state (synchronous - returns object or null)
// This is called by Godot via JavaScriptBridge to poll for state updates
function getLocalPlayerState(): { tile_x: number; tile_y: number; facing_x: number; facing_y: number; zone_id: number } | null {
    return localPlayerState;
}

// Send a chat message
async function sendChat(text: string): Promise<{ success: boolean; error?: string }> {
    const trimmed = text.trim();
    if (!trimmed) {
        console.warn('[BRIDGE] Cannot send empty chat message');
        return { success: false, error: 'Message cannot be empty' };
    }

    if (!dbConnection) {
        console.error('[BRIDGE] Cannot send chat: no connection');
        return { success: false, error: 'Not connected to server' };
    }

    try {
        const reducersObj = dbConnection.reducers;
        const reducer = (reducersObj as any)['send_chat_message'] || (reducersObj as any).sendChatMessage;

        if (!reducer || typeof reducer !== 'function') {
            console.error('[BRIDGE] send_chat_message reducer not found');
            return { success: false, error: 'send_chat_message reducer not found' };
        }

        let result: any;
        try {
            // Call reducer with text parameter (matches Rust: send_chat_message(ctx, text: String))
            result = reducer({ text: trimmed });
        } catch (e) {
            // Fallback: try calling with just the string
            try {
                result = reducer(trimmed);
            } catch (e2) {
                console.error('[BRIDGE] Error calling send_chat_message reducer:', e2);
                return { success: false, error: (e2 as Error).message || 'Unknown error' };
            }
        }

        if (result instanceof Promise) {
            await result;
        }

        console.log('[BRIDGE] Chat message sent:', trimmed);
        return { success: true };
    } catch (e) {
        const errorMsg = (e as Error).message || 'Unknown error';
        console.error('[BRIDGE] Error sending chat message:', e);
        return { success: false, error: errorMsg };
    }
}

// Set or update display name
async function setDisplayName(displayName: string): Promise<{ success: boolean; error?: string }> {
    const trimmed = displayName.trim();
    if (!trimmed) {
        console.warn('[BRIDGE] Cannot set empty display name');
        return { success: false, error: 'Display name cannot be empty' };
    }

    if (!dbConnection) {
        console.error('[BRIDGE] Cannot set display name: no connection');
        return { success: false, error: 'Not connected to server' };
    }

    try {
        const reducersObj = dbConnection.reducers;
        const reducer = (reducersObj as any)['set_display_name'] || (reducersObj as any).setDisplayName;

        if (!reducer || typeof reducer !== 'function') {
            console.error('[BRIDGE] set_display_name reducer not found');
            return { success: false, error: 'set_display_name reducer not found' };
        }

        let result: any;
        try {
            // Call reducer with newName parameter (camelCase - matches generated bindings)
            // Generated bindings use camelCase: newName, not snake_case: new_name
            result = reducer({ newName: trimmed });
        } catch (e) {
            // Fallback: try snake_case in case bindings are different
            try {
                result = reducer({ new_name: trimmed });
            } catch (e2) {
                // Final fallback: try calling with just the string
                try {
                    result = reducer(trimmed);
                } catch (e3) {
                    console.error('[BRIDGE] Error calling set_display_name reducer:', e3);
                    return { success: false, error: (e3 as Error).message || 'Unknown error' };
                }
            }
        }

        if (result instanceof Promise) {
            await result;
        }

        console.log('[BRIDGE] Display name set:', trimmed);
        return { success: true };
    } catch (e) {
        const errorMsg = (e as Error).message || 'Unknown error';
        console.error('[BRIDGE] Error setting display name:', e);
        return { success: false, error: errorMsg };
    }
}

// Upsert a blocked tile on the server
async function upsertBlockedTile(zoneId: number, x: number, y: number) {
    if (!dbConnection) {
        console.error('[BRIDGE] Cannot upsert blocked tile: no connection');
        return false;
    }

    try {
        const reducersObj = dbConnection.reducers;
        if (!reducersObj) {
            console.warn('[BRIDGE] Reducers object not available');
            return false;
        }
        
        // Try both snake_case and camelCase names
        const reducer = (reducersObj as any)['upsert_blocked_tile'] || (reducersObj as any).upsertBlockedTile;
        
        if (!reducer || typeof reducer !== 'function') {
            console.warn('[BRIDGE] upsert_blocked_tile reducer not found. Available reducers:', Object.keys(reducersObj));
            console.warn('[BRIDGE] This usually means the client bindings need to be regenerated after adding new reducers to the server.');
            return false;
        }
        
        let result: any;
        try {
            // Try new SDK pattern: args as object (snake_case to match Rust)
            result = reducer({ zone_id: zoneId, x, y });
        } catch (e) {
            // Fallback: try with camelCase
            try {
                result = reducer({ zoneId, x, y });
            } catch (e2) {
                // Fallback to old SDK pattern: separate params
                try {
                    result = reducer(zoneId, x, y);
                } catch (e3) {
                    console.error('[BRIDGE] Error calling upsert_blocked_tile reducer:', e3);
                    return false;
                }
            }
        }
        
        if (result instanceof Promise) {
            await result;
        }
        
        return true;
    } catch (e) {
        console.error('[BRIDGE] Error upserting blocked tile:', e);
        return false;
    }
}

// Finalize zone collision: mark zone as ready for movement
async function finalizeZoneCollision(zoneId: number) {
    if (!dbConnection) {
        console.error('[BRIDGE] Cannot finalize zone collision: no connection');
        return false;
    }

    try {
        const reducersObj = dbConnection.reducers;
        if (!reducersObj) {
            console.warn('[BRIDGE] Reducers object not available');
            return false;
        }
        
        // Try both snake_case and camelCase names
        const reducer = (reducersObj as any)['finalize_zone_collision'] || (reducersObj as any).finalizeZoneCollision;
        
        if (!reducer || typeof reducer !== 'function') {
            console.warn('[BRIDGE] finalize_zone_collision reducer not found. Available reducers:', Object.keys(reducersObj));
            console.warn('[BRIDGE] This usually means the client bindings need to be regenerated after adding new reducers to the server.');
            return false;
        }
        
        let result: any;
        try {
            // Try new SDK pattern: args as object (snake_case to match Rust)
            result = reducer({ zone_id: zoneId });
        } catch (e) {
            // Fallback: try with camelCase
            try {
                result = reducer({ zoneId });
            } catch (e2) {
                // Fallback to old SDK pattern: separate params
                try {
                    result = reducer(zoneId);
                } catch (e3) {
                    console.error('[BRIDGE] Error calling finalize_zone_collision reducer:', e3);
                    return false;
                }
            }
        }
        
        if (result instanceof Promise) {
            await result;
        }
        
        console.log(`[BRIDGE] Finalized zone collision for zone ${zoneId}`);
        // Note: The zoneCollisionTable.onUpdate callback (set up in subscribeToPlayerState) 
        // should fire automatically when the reducer updates the table.
        // If it doesn't fire, the callback setup timing may be the issue.
        
        return true;
    } catch (e) {
        console.error('[BRIDGE] Error finalizing zone collision:', e);
        return false;
    }
}

// Request quest/flags debug snapshot (dev-only)
// Calls debug_get_player_quest_state reducer; result arrives via QuestDebugSnapshot subscription
// and is forwarded to Godot via bridgeOnQuestDebugSnapshot callback.
function fetchQuestDebugSnapshot(): void {
    if (!dbConnection) {
        console.error('[BRIDGE] Cannot fetch quest debug: no connection');
        return;
    }
    try {
        const reducersObj = dbConnection.reducers;
        const reducer =
            (reducersObj as any)['debug_get_player_quest_state'] ||
            (reducersObj as any).debugGetPlayerQuestState;
        if (reducer && typeof reducer === 'function') {
            reducer({});
            console.log('[BRIDGE] debug_get_player_quest_state reducer invoked');
        } else {
            console.warn('[BRIDGE] debug_get_player_quest_state reducer not found');
        }
    } catch (e) {
        console.error('[BRIDGE] fetchQuestDebugSnapshot error:', e);
    }
}

// Clear all blocked tiles for a zone
async function clearBlockedTilesForZone(zoneId: number) {
    if (!dbConnection) {
        console.error('[BRIDGE] Cannot clear blocked tiles: no connection');
        return false;
    }

    try {
        const reducersObj = dbConnection.reducers;
        if (!reducersObj) {
            console.warn('[BRIDGE] Reducers object not available');
            return false;
        }
        
        // Try both snake_case and camelCase names
        const reducer = (reducersObj as any)['clear_blocked_tiles_for_zone'] || (reducersObj as any).clearBlockedTilesForZone;
        
        if (!reducer || typeof reducer !== 'function') {
            console.warn('[BRIDGE] clear_blocked_tiles_for_zone reducer not found. Available reducers:', Object.keys(reducersObj));
            console.warn('[BRIDGE] This usually means the client bindings need to be regenerated after adding new reducers to the server.');
            return false;
        }
        
        let result: any;
        try {
            // Try new SDK pattern: args as object (snake_case to match Rust)
            result = reducer({ zone_id: zoneId });
        } catch (e) {
            // Fallback: try with camelCase
            try {
                result = reducer({ zoneId });
            } catch (e2) {
                // Fallback to old SDK pattern: separate params
                try {
                    result = reducer(zoneId);
                } catch (e3) {
                    console.error('[BRIDGE] Error calling clear_blocked_tiles_for_zone reducer:', e3);
                    return false;
                }
            }
        }
        
        if (result instanceof Promise) {
            await result;
        }
        
        return true;
    } catch (e) {
        console.error('[BRIDGE] Error clearing blocked tiles:', e);
        return false;
    }
}

/**
 * Bootstrap function that handles OIDC callback and initializes the app.
 * This should be called on page load to:
 * 1. Check for OIDC callback (code + state query params)
 * 2. Handle callback if present and clean up URL
 * 3. Ensure user is logged in
 * 4. Connect to SpacetimeDB
 * 5. Initialize game/UI
 */
export async function bootstrap(): Promise<void> {
    // Step 1: Check for OIDC callback query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const hasCode = urlParams.has("code");
    const hasState = urlParams.has("state");
    
    if (hasCode && hasState) {
        // Handle OIDC callback
        console.log('[BOOTSTRAP] Detected OIDC callback, handling...');
        try {
            await handleCallback();
            // Clean up URL by removing query parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log('[BOOTSTRAP] Callback handled, URL cleaned');
        } catch (error) {
            console.error('[BOOTSTRAP] Callback error:', error);
            // Show error message
            if (document.body) {
                document.body.innerHTML = `
                    <div style="color: white; text-align: center; padding: 2rem; font-family: Arial; background: #000;">
                        <h1>Authentication Error</h1>
                        <p>${error instanceof Error ? error.message : 'Failed to complete login'}</p>
                        <button onclick="window.location.href='/'" style="padding: 10px 20px; font-size: 16px; margin: 10px; cursor: pointer;">Return to Home</button>
                    </div>
                `;
            }
            throw error; // Re-throw to stop bootstrap
        }
    }
    
    // Step 2: Ensure user is logged in (will redirect if not)
    // On normal page load without code/state, this will check existing session
    // and return the ID token without redirecting if user is already logged in
    let idToken: string;
    try {
        idToken = await ensureLoggedIn();
        console.log('[BOOTSTRAP] User authenticated');
    } catch (error) {
        // Redirecting to login - this is expected for unauthenticated users
        // The redirect will happen, so we don't need to do anything else
        console.log('[BOOTSTRAP] Redirecting to login...');
        return; // Exit bootstrap, redirect will happen
    }
    
    // Step 3: Connect to SpacetimeDB
    // The connectToSpacetimeDB function will use the ID token or cached token
    console.log('[BOOTSTRAP] Connecting to SpacetimeDB...');
    const connectResult = await connectToSpacetimeDB();
    if (!connectResult.success) {
        console.error('[BOOTSTRAP] Failed to connect to SpacetimeDB:', connectResult.error);
        // Connection will be retried or user will see error
        return;
    }
    
    console.log('[BOOTSTRAP] Bootstrap complete - ready for game initialization');
    // Step 4: Game/UI initialization happens elsewhere (Godot loads automatically)
}

// Auto-bootstrap on load if in browser environment
if (typeof window !== 'undefined') {
    // Call bootstrap automatically when the script loads
    // This handles OIDC callback and initializes the connection
    bootstrap().catch((error) => {
        console.error('[BRIDGE] Bootstrap error:', error);
    });
}

// Expose API on window.SNBridge for Godot JavaScriptBridge
// This will be available after the IIFE bundle loads
// Explicitly assign each function to ensure they're plain functions
if (typeof window !== 'undefined') {
    // Ensure window.SNBridge exists as an object
    (window as any).SNBridge = (window as any).SNBridge || {};

    // Explicitly assign each function to window.SNBridge
    // Using direct assignment ensures functions are callable via JavaScriptBridge
    (window as any).SNBridge.bootstrap = bootstrap;
    (window as any).SNBridge.init = init;
    (window as any).SNBridge.connectToSpacetimeDB = connectToSpacetimeDB;
    (window as any).SNBridge.subscribeToPlayerState = subscribeToPlayerState;
    (window as any).SNBridge.logout = logoutUser;
    (window as any).SNBridge.sendMoveIntent = sendMoveIntent;
    (window as any).SNBridge.moveTo = moveTo;
    (window as any).SNBridge.getIdentity = getIdentity;
    (window as any).SNBridge.getLocalPlayerState = getLocalPlayerState;
    (window as any).SNBridge.upsertBlockedTile = upsertBlockedTile;
    (window as any).SNBridge.clearBlockedTilesForZone = clearBlockedTilesForZone;
    (window as any).SNBridge.finalizeZoneCollision = finalizeZoneCollision;
    (window as any).SNBridge.sendChat = sendChat;
    (window as any).SNBridge.setDisplayName = setDisplayName;
    (window as any).SNBridge.request_interaction = requestInteraction;
    (window as any).SNBridge.send_dialogue_choice = sendDialogueChoice;
    (window as any).SNBridge.fetchQuestDebugSnapshot = fetchQuestDebugSnapshot;

    // Also expose as SpacetimeBridge for compatibility (as mentioned in user requirements)
    (window as any).SpacetimeBridge = (window as any).SpacetimeBridge || {};
    (window as any).SpacetimeBridge.getLocalPlayerState = getLocalPlayerState;
    (window as any).SpacetimeBridge.getIdentity = getIdentity;

    console.log('[BRIDGE] SNBridge functions attached:', Object.keys((window as any).SNBridge));
    
    // ============================================================================
    // EXPOSE network_client GLOBAL FOR GODOT INTEGRATION
    // ============================================================================
    // This is the primary API for Godot to interact with username and chat
    // Functions must match exact names: set_display_name, send_chat_message, register_chat_listener
    (globalThis as any).network_client = {
        // Set display name (username)
        set_display_name: async (name: string) => {
            const result = await setDisplayName(name);
            return result;
        },
        
        // Send chat message
        send_chat_message: async (text: string) => {
            const result = await sendChat(text);
            return result;
        },
        
        // Register chat listener callback
        register_chat_listener: (cb: (msg: ChatMessagePayload) => void) => {
            registerChatListener(cb);
        },
        
        // Get current display name (synchronous)
        get_current_display_name: () => {
            return getCurrentDisplayName();
        },
        
        // Check if SpacetimeDB is connected
        is_connected: () => {
            return isConnected();
        }
    };
    
    console.log('[BRIDGE] network_client global exposed for Godot integration');
    console.log('[BRIDGE] Added get_current_display_name()');
    
    // Expose polling-based chat dequeue function for Godot
    // Chat is delivered via register_chat_listener only (polling removed to fix duplicate messages)
    
    // Handle browser tab close / page unload - attempt to disconnect cleanly
    // Note: onbeforeunload/pagehide may fire very quickly, so we try to disconnect immediately
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
            if (dbConnection) {
                try {
                    // Attempt to disconnect before page unloads
                    // Note: This may not always complete before the page closes
                    console.log('[BRIDGE] Page unloading - attempting disconnect');
                    dbConnection.disconnect();
                } catch (e) {
                    // Ignore errors during unload - page is closing anyway
                }
            }
        });
        
        // Also handle pagehide (more reliable than beforeunload in some browsers)
        window.addEventListener('pagehide', () => {
            if (dbConnection) {
                try {
                    console.log('[BRIDGE] Page hiding - attempting disconnect');
                    dbConnection.disconnect();
                } catch (e) {
                    // Ignore errors during unload
                }
            }
        });
    }
}
