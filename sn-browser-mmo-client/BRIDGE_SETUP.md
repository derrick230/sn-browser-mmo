# SpacetimeDB Bridge Setup

## Building the Bridge

The JavaScript bridge bundles the SpacetimeDB TypeScript client and bindings into a single IIFE bundle that can be loaded in Godot web exports.

### Prerequisites

- Node.js and npm installed
- Dependencies installed: `npm install`

### Build Commands

```bash
# Build the bridge bundle
npm run build:bridge

# Build in watch mode (rebuilds on file changes)
npm run watch:bridge
```

### Output

The bundle is output to:
- `sn-browser-mmo-client/js/spacetime-bridge.bundle.js`
- `sn-browser-mmo-client/js/spacetime-bridge.bundle.js.map` (source map)

The bundle exposes `window.SNBridge` with the following API:
- `connectToSpacetimeDB(host, database, token)` - Connect to SpacetimeDB
- `subscribeToPlayerState(onUpdate, onInsert, onDelete)` - Subscribe to player_state table
- `sendMoveIntent(dx, dy)` - Send movement intent
- `getIdentity()` - Get current player identity

## Godot Web Export Setup

### Option 1: Custom HTML Shell (Recommended)

1. In Godot, go to **Project → Export**
2. Select **Web** export preset
3. In **Options → Custom Html Shell**, set the path to:
   ```
   res://html/index.html
   ```
4. The custom HTML shell already loads `js/spacetime-bridge.bundle.js` before the Godot engine

### Option 2: Manual HTML Modification

If you need to modify the HTML after export:

1. Export your project normally
2. Copy `sn-browser-mmo-client/js/spacetime-bridge.bundle.js` to the export directory's `js/` folder
3. Edit the exported `index.html` and add before the Godot engine script:
   ```html
   <script src="js/spacetime-bridge.bundle.js"></script>
   ```

### Verifying the Bridge

After loading, check the browser console:
- `[HTML] SNBridge loaded successfully` - Bridge loaded correctly
- `[NETWORK] Found window.SNBridge` - Godot can access the bridge

## Development Workflow

1. Make changes to `spacetime-bridge.ts`
2. Run `npm run build:bridge` (or `npm run watch:bridge` for auto-rebuild)
3. Export from Godot or test in web export
4. The bundle will be automatically included if using the custom HTML shell

## Troubleshooting

### Bridge not found
- Ensure `spacetime-bridge.bundle.js` is in the correct location (`js/` folder)
- Check that the custom HTML shell path is correct in export settings
- Verify the script tag loads before the Godot engine

### Connection errors
- Check that SpacetimeDB server is running
- Verify host/database name in `scripts/network_client.gd`
- Check browser console for detailed error messages

### TypeScript errors
- Run `npm install` to ensure dependencies are up to date
- Regenerate SpacetimeDB bindings if server schema changed
