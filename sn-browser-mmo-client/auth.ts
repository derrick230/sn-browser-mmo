// SpacetimeAuth OIDC client configuration and helpers
// This module handles authentication via SpacetimeDB's built-in SpacetimeAuth
// Users log in via magic link / Google / etc., and we obtain an OIDC ID token
// which is then passed to SpacetimeDB via withToken()

import { UserManager, WebStorageStateStore } from "oidc-client-ts";

// SpacetimeAuth OIDC configuration
// REPLACE client_XXXXXXXXXXXX with your actual SpacetimeAuth Client ID
const OIDC_CONFIG = {
  authority: "https://auth.spacetimedb.com/oidc",
  client_id: "client_032GFAYg4gfBRBLNmGiU61", // REPLACE with your SpacetimeAuth Client ID
  redirect_uri: `${window.location.origin}/`,
  post_logout_redirect_uri: window.location.origin,
  scope: "openid profile email",
  response_type: "code",
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

// Create UserManager instance for OIDC operations
export const userManager = new UserManager(OIDC_CONFIG);

/**
 * Ensures the user is logged in via SpacetimeAuth.
 * If not logged in or token expired, redirects to login.
 * Returns the ID token if available and valid.
 * @throws Error if redirecting to login (caller should handle redirect)
 */
export async function ensureLoggedIn(): Promise<string> {
  try {
    const user = await userManager.getUser();
    
    // Check if user exists and token is not expired
    if (user && !user.expired && user.id_token) {
      console.log("[AUTH] User already logged in");
      return user.id_token;
    }
    
    // Token expired or missing - redirect to login
    console.log("[AUTH] User not logged in or token expired, redirecting to login...");
    await userManager.signinRedirect();
    throw new Error("Redirecting to login");
  } catch (error) {
    // If it's our redirect error, rethrow it
    if (error instanceof Error && error.message === "Redirecting to login") {
      throw error;
    }
    // Otherwise, log and redirect
    console.error("[AUTH] Error checking login status:", error);
    await userManager.signinRedirect();
    throw new Error("Redirecting to login");
  }
}

/**
 * Handles the OIDC callback after user logs in.
 * This should be called when the current URL contains `code` and `state` query parameters.
 * Returns the ID token after successful authentication.
 */
export async function handleCallback(): Promise<string> {
  try {
    console.log("[AUTH] Handling OIDC callback...");
    const user = await userManager.signinRedirectCallback();
    
    if (!user.id_token) {
      throw new Error("No ID token received after login");
    }
    
    console.log("[AUTH] Successfully authenticated, ID token obtained");
    return user.id_token;
  } catch (error) {
    console.error("[AUTH] Error handling callback:", error);
    throw error;
  }
}

/**
 * Logs out the user and clears stored tokens.
 * Redirects to the post-logout redirect URI.
 */
export async function logout(): Promise<void> {
  try {
    console.log("[AUTH] Logging out...");
    // Clear SpacetimeDB token from localStorage
    window.localStorage.removeItem("stdb_auth_token");
    // Sign out via OIDC (redirects to post_logout_redirect_uri)
    await userManager.signoutRedirect();
  } catch (error) {
    console.error("[AUTH] Error during logout:", error);
    throw error;
  }
}

/**
 * Checks if the current URL contains OIDC callback query parameters.
 * The callback happens at the root path (/) with `code` and `state` query params.
 */
export function isCallbackUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has("code") && params.has("state");
}
