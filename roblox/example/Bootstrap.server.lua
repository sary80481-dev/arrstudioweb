-- ClubKit/Bootstrap (Script, RunContext = Server)
-- Titik masuk kit: cek lisensi dulu, buka modul yang disegel (ArrSeal), baru jalankan sistem.
-- Butuh: ServerScriptService.LoadStringEnabled = true, Allow HTTP Requests = on.

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")

local Kit = script.Parent
local Config = require(Kit.Config)
local ArrLicense = require(Kit.Core.ArrLicense)
local ArrSeal = require(Kit.Core.ArrSeal)

local KIT_ID = "clubkit"

-- penolakan eksplisit dari server lisensi → salinan tidak resmi → kick semua pemain
local KICK_CODES = {
	INVALID_KEY = true,
	INVALID_KEY_FORMAT = true,
	LICENSE_REVOKED = true,
	WRONG_KIT = true,
	PLACE_MISMATCH = true,
	HTTP_DISABLED = true,
}

local function lockdown(code: string, message: string)
	Kit:SetAttribute("Licensed", false)
	warn(`[ClubKit] License rejected ({code}): {message}`)
	local reason = if code == "HTTP_DISABLED"
		then "ClubKit: enable 'Allow HTTP Requests' in Game Settings → Security."
		else `This game uses an unlicensed copy of ClubKit ({code}).`
	for _, player in Players:GetPlayers() do
		player:Kick(reason)
	end
	Players.PlayerAdded:Connect(function(player)
		player:Kick(reason)
	end)
end

-- kunci terakhir yang valid disimpan di DataStore place ini, dipakai hanya bila
-- server lisensi tidak bisa dihubungi (DataStore tidak ikut tersalin ke place lain)
local cacheStore = nil
pcall(function()
	cacheStore = DataStoreService:GetDataStore("ArrStudioLicense")
end)
local CACHE_KEY = `unlock:{KIT_ID}`

local ok, result = ArrLicense.verify({
	key = Config.LicenseKey,
	kit = KIT_ID,
	version = "1.2.0", -- samakan dengan versi kit ini
	onRevoked = lockdown,
})

if ok then
	if result.unlock then
		ArrSeal.setKey(result.unlock)
		if cacheStore then
			pcall(function()
				cacheStore:UpdateAsync(CACHE_KEY, function(old)
					return if old == result.unlock then nil else result.unlock
				end)
			end)
		end
	end
	print(("[ClubKit] %s · place %s"):format(result.message, result.placeId or "?"))
elseif KICK_CODES[result.code or ""] then
	lockdown(result.code :: string, result.message)
	return
else
	-- server lisensi tidak bisa dihubungi → coba kunci cadangan
	local cachedOk, cached = pcall(function()
		return cacheStore and cacheStore:GetAsync(CACHE_KEY)
	end)
	if cachedOk and type(cached) == "string" then
		ArrSeal.setKey(cached)
		warn(`[ClubKit] License server unreachable ({result.code or "?"}) — using cached license`)
	else
		warn(("[ClubKit] Not starting — %s (%s)"):format(result.message, result.code or "?"))
		Kit:SetAttribute("Licensed", false)
		return
	end
end

Kit:SetAttribute("Licensed", true)

-- mulai sistem kit (modul yang disegel terbuka otomatis saat di-require)
require(Kit.Core.Main).start(Config)
