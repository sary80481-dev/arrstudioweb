/* Isi dokumentasi API — satu sumber untuk halaman /docs */

export type Access = "public" | "roblox" | "session" | "admin";

export interface Endpoint {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  access: Access;
  summary: string;
  description?: string;
  params?: { name: string; type: string; required?: boolean; desc: string }[];
  request?: string;
  response?: string;
  errors?: string[];
}

export interface EndpointGroup {
  id: string;
  title: string;
  intro?: string;
  endpoints: Endpoint[];
}

export const ACCESS_LABEL: Record<Access, string> = {
  public: "Public",
  roblox: "Roblox server",
  session: "Signed in",
  admin: "Admin",
};

export const errorCodes: { status: number; code: string; meaning: string }[] = [
  { status: 400, code: "VALIDATION_FAILED", meaning: "Body is invalid — see issues[]" },
  { status: 400, code: "INVALID_KEY_FORMAT", meaning: "Key is not ARR-XXXX-XXXX-XXXX" },
  { status: 400, code: "MISSING_PLACE_ID", meaning: "placeId missing (call from a game server)" },
  { status: 401, code: "UNAUTHENTICATED", meaning: "Not signed in / session expired" },
  { status: 403, code: "FORBIDDEN", meaning: "Admin role required" },
  { status: 403, code: "LICENSE_REVOKED", meaning: "License was revoked" },
  { status: 403, code: "WRONG_KIT", meaning: "Key belongs to another kit" },
  { status: 403, code: "PLACE_MISMATCH", meaning: "Key is bound to another place" },
  { status: 404, code: "INVALID_KEY", meaning: "Key does not exist" },
  { status: 404, code: "KIT_NOT_FOUND", meaning: "Kit id does not exist" },
  { status: 409, code: "KIT_HAS_LICENSES", meaning: "Kit has licenses — set it to Draft instead" },
  { status: 429, code: "RATE_LIMITED", meaning: "Too many requests — see retryAfter (s)" },
  { status: 429, code: "REBIND_COOLDOWN", meaning: "Place can change once per 30 days — see retryAt" },
  { status: 500, code: "INTERNAL", meaning: "Server error" },
];

export const groups: EndpointGroup[] = [
  {
    id: "licensing",
    title: "Licensing (Roblox)",
    intro: "The only endpoint a kit calls. No login — the license key is the credential.",
    endpoints: [
      {
        id: "verify",
        method: "POST",
        path: "/api/licenses/verify",
        access: "roblox",
        summary: "Verify a license on server start",
        description:
          "Called by ArrLicense.lua from a Roblox game server. The first call from a published place binds the key to that place. Studio (placeId 0) is allowed for testing and never binds.",
        params: [
          { name: "key", type: "string", required: true, desc: "Config.LicenseKey" },
          { name: "kit", type: "string", required: true, desc: "Kit id from /admin → Kits, e.g. summitkit" },
          { name: "placeId", type: "string", required: true, desc: "game.PlaceId — \"0\" in Studio" },
          { name: "jobId", type: "string", desc: "game.JobId, for logs" },
          { name: "version", type: "string", desc: "Installed kit version, e.g. 1.2.0" },
        ],
        request: `{
  "key": "ARR-7F2K-M4QX-Q9RD",
  "kit": "clubkit",
  "placeId": "13284790215",
  "jobId": "a1b2c3d4-…",
  "version": "1.2.0"
}`,
        response: `{
  "valid": true,
  "kit": "clubkit",
  "placeId": "13284790215",
  "studio": false,
  "newlyBound": false,
  "latestVersion": "1.2.0",
  "checkedAt": "2026-09-29T10:01:00.000Z"
}`,
        errors: ["INVALID_KEY", "INVALID_KEY_FORMAT", "LICENSE_REVOKED", "WRONG_KIT", "PLACE_MISMATCH", "RATE_LIMITED"],
      },
    ],
  },
  {
    id: "auth",
    title: "Authentication",
    intro:
      "The website uses an httpOnly __session cookie. Other clients can send Authorization: Bearer <Firebase ID token>.",
    endpoints: [
      {
        id: "session-create",
        method: "POST",
        path: "/api/auth/session",
        access: "public",
        summary: "Exchange a Firebase ID token for a session",
        description: "Creates the profile on first sign-in. The ID token must come from a sign-in less than 5 minutes old.",
        request: `{ "idToken": "eyJhbGciOi…", "displayName": "kyzo_dev" }`,
        response: `{ "user": { "uid": "abc123", "email": "you@studio.com", "role": "user", … } }`,
        errors: ["INVALID_TOKEN", "STALE_LOGIN", "RATE_LIMITED"],
      },
      { id: "session-delete", method: "DELETE", path: "/api/auth/session", access: "session", summary: "Sign out", response: `{ "ok": true }` },
      {
        id: "discord",
        method: "GET",
        path: "/api/auth/discord?next=/dashboard",
        access: "public",
        summary: "Sign in with Discord (redirect)",
        description: "Redirects to Discord, then back to /api/auth/discord/callback, which sets the session and redirects to next.",
      },
      {
        id: "firebase-token",
        method: "GET",
        path: "/api/auth/firebase-token",
        access: "session",
        summary: "Custom token for realtime reads",
        description: "Lets the browser sign in to Firebase so onSnapshot listeners pass firestore.rules. Used automatically by the dashboard and admin.",
        response: `{ "token": "eyJhbGciOi…" }`,
      },
    ],
  },
  {
    id: "account",
    title: "Account & licenses",
    endpoints: [
      { id: "account-get", method: "GET", path: "/api/account", access: "session", summary: "Current user", response: `{ "user": { "uid": "abc123", "displayName": "kyzo_dev", "robloxUsername": null, "role": "user", … } }` },
      {
        id: "account-patch",
        method: "PATCH",
        path: "/api/account",
        access: "session",
        summary: "Update profile",
        request: `{ "displayName": "Kyzo", "robloxUsername": "kyzo_dev" }`,
      },
      {
        id: "licenses-list",
        method: "GET",
        path: "/api/licenses",
        access: "session",
        summary: "My licenses",
        response: `{
  "licenses": [
    {
      "key": "ARR-7F2K-M4QX-Q9RD",
      "kit": "clubkit",
      "kitName": "ClubKit Pro",
      "places": ["13284790215", "98765432101"],
      "maxPlaces": 3,
      "status": "active",
      "lastKitVersion": "1.2.0",
      "verifyCount": 184,
      "releaseAvailableAt": null
    }
  ]
}`,
      },
      {
        id: "release-place",
        method: "DELETE",
        path: "/api/licenses/:key/places/:placeId",
        access: "session",
        summary: "Remove a place from a license",
        description:
          "One key works in several places (maxPlaces). New places link themselves on their first server start while a slot is free; remove a place you no longer use to free its slot — once every 30 days.",
        errors: ["LICENSE_NOT_FOUND", "LICENSE_REVOKED", "PLACE_NOT_BOUND", "RELEASE_COOLDOWN"],
      },
    ],
  },
  {
    id: "admin",
    title: "Admin",
    intro: "Requires a user with role \"admin\". Every change is pushed to the site and dashboards in realtime.",
    endpoints: [
      { id: "kits-list", method: "GET", path: "/api/admin/kits", access: "admin", summary: "All kits, including drafts" },
      {
        id: "kits-create",
        method: "POST",
        path: "/api/admin/kits",
        access: "admin",
        summary: "Create a kit",
        description: "Add ?seed=1 to import the built-in ClubKit Pro and Summit Kit instead. Prices are whole Rupiah.",
        request: `{
  "id": "summitkit",
  "name": "Summit Kit",
  "tag": "Live events",
  "tagline": "Run launches like a festival.",
  "description": "Stage control, lighting presets, …",
  "version": "1.0.0",
  "price": 299000,
  "status": "active",
  "icon": "mountain",
  "features": ["Stage & lighting presets"],
  "integrations": ["Group ranks", "Gamepasses"],
  "attributes": { "systems": 85, "integration": 90, "setup": 92 },
  "configPath": "SummitKit/Config",
  "rating": 4.8,
  "order": 2
}`,
        errors: ["VALIDATION_FAILED", "KIT_EXISTS"],
      },
      { id: "kits-patch", method: "PATCH", path: "/api/admin/kits/:id", access: "admin", summary: "Update a kit (any subset of fields)", request: `{ "version": "1.3.0", "price": 349000 }` },
      { id: "kits-delete", method: "DELETE", path: "/api/admin/kits/:id", access: "admin", summary: "Delete a kit without licenses", errors: ["KIT_HAS_LICENSES"] },
      {
        id: "licenses-issue",
        method: "POST",
        path: "/api/admin/licenses",
        access: "admin",
        summary: "Issue licenses to a user",
        description: "The buyer must have an account. Keys appear in their dashboard instantly.",
        request: `{ "kit": "summitkit", "ownerEmail": "buyer@studio.com", "count": 1, "note": "Order #1042" }`,
        response: `{ "keys": ["ARR-H7KQ-2MXP-9TVA"] }`,
        errors: ["USER_NOT_FOUND", "KIT_NOT_FOUND"],
      },
      { id: "licenses-admin-list", method: "GET", path: "/api/admin/licenses?ownerUid=&kit=", access: "admin", summary: "List licenses (max 100)" },
      { id: "licenses-status", method: "PATCH", path: "/api/admin/licenses/:key", access: "admin", summary: "Revoke or restore", request: `{ "status": "revoked" }` },
      {
        id: "pricing",
        method: "PATCH",
        path: "/api/admin/settings/pricing",
        access: "admin",
        summary: "Studio bundle pricing",
        request: `{ "bundleEnabled": true, "bundlePrice": 599000, "bundlePlaces": 3 }`,
      },
    ],
  },
];

export const luaQuickstart = `-- ClubKit/Bootstrap (Script, server)
local Kit = script.Parent
local Config = require(Kit.Config)
local ArrLicense = require(Kit.Core.ArrLicense)

local ok, result = ArrLicense.verify({
	key = Config.LicenseKey,
	kit = "clubkit",       -- kit id from /admin → Kits
	version = "1.2.0",     -- the version of this kit build
	onRevoked = function(code, message)
		warn("[ClubKit] license stopped:", code, message)
		Kit.Core:SetAttribute("Licensed", false)
	end,
})

if not ok then
	warn("[ClubKit] not starting:", result.message)
	return
end

require(Kit.Core.Main).start(Config)`;

export const luaConfig = `-- ClubKit/Config (ModuleScript) — the only file buyers edit
return {
	LicenseKey = "ARR-XXXX-XXXX-XXXX",

	-- point the kit at what your place already uses
	DataStore = "PlayerData_v3",
	GroupId = 3401192,
	Gamepasses = { VIP = 71829301, DJ = 71829455 },
	Leaderstats = { Currency = "Coins" },
}`;

export const luaResults: { code: string; action: string }[] = [
  { code: "(ok)", action: "Start the kit" },
  { code: "HTTP_DISABLED", action: "Ask the owner to enable Allow HTTP Requests" },
  { code: "INVALID_KEY / INVALID_KEY_FORMAT", action: "Ask the owner to check Config.LicenseKey" },
  { code: "PLACE_MISMATCH", action: "Ask the owner to move the license in the dashboard" },
  { code: "WRONG_KIT", action: "The key belongs to another kit" },
  { code: "LICENSE_REVOKED", action: "Do not start the kit" },
  { code: "NETWORK / RATE_LIMITED / HTTP_5xx", action: "Already retried 3× (2s/4s/8s) — decide whether to run in a limited mode" },
];
