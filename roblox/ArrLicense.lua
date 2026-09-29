--!strict
--[[
	ArrLicense — verifikasi lisensi ArrStudio dari server Roblox.

	Taruh ModuleScript ini di dalam kit (mis. ClubKit/Core/ArrLicense) dan panggil
	dari Script server kit. Jangan pernah require dari LocalScript: key lisensi
	tidak boleh sampai ke client.

	Contoh:
		local ArrLicense = require(script.Parent.ArrLicense)
		local Config = require(script.Parent.Parent.Config)

		local ok, result = ArrLicense.verify({
			key = Config.LicenseKey,
			kit = "clubkit",
		})
		if not ok then
			warn("[ClubKit] " .. result.message)
			return -- jangan jalankan kit
		end

	Lihat docs/API.md → "Integrasi Roblox" untuk alur lengkap.
]]

local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

local ArrLicense = {}

-- Ganti ke domain produksi kamu (tanpa garis miring di akhir)
ArrLicense.API_URL = "https://arrstudio.example.com"

-- Berapa kali mencoba ulang saat error jaringan / server (bukan saat key ditolak)
ArrLicense.MAX_ATTEMPTS = 3

-- Interval cek ulang di background (detik). 0 = nonaktif.
ArrLicense.RECHECK_INTERVAL = 30 * 60

export type VerifyOptions = {
	key: string,
	-- ID kit persis seperti di /admin → Kits (mis. "clubkit", "summitkit")
	kit: string,
	-- versi kit yang terpasang, mis. "1.2.0" — dipakai untuk memberi tahu jika ada update
	version: string?,
	-- dipanggil jika lisensi dicabut / pindah place saat server sedang berjalan
	onRevoked: ((code: string, message: string) -> ())?,
}

export type VerifyResult = {
	valid: boolean,
	kit: string?,
	placeId: string?,
	studio: boolean?,
	newlyBound: boolean?,
	latestVersion: string?,
	checkedAt: string?,
	code: string?,
	message: string,
}

-- Kode error yang berarti key memang ditolak → jangan retry
local FATAL_CODES = {
	INVALID_KEY = true,
	INVALID_KEY_FORMAT = true,
	LICENSE_REVOKED = true,
	WRONG_KIT = true,
	PLACE_MISMATCH = true,
	VALIDATION_FAILED = true,
}

local function request(options: VerifyOptions): (boolean, VerifyResult)
	local body = HttpService:JSONEncode({
		key = options.key,
		kit = options.kit,
		placeId = tostring(game.PlaceId),
		jobId = game.JobId ~= "" and game.JobId or nil,
		version = options.version,
	})

	local success, response = pcall(function()
		return HttpService:RequestAsync({
			Url = ArrLicense.API_URL .. "/api/licenses/verify",
			Method = "POST",
			Headers = { ["Content-Type"] = "application/json" },
			Body = body,
		})
	end)

	if not success then
		local err = tostring(response)
		if string.find(err, "Http requests are not enabled") then
			return false, {
				valid = false,
				code = "HTTP_DISABLED",
				message = "Enable 'Allow HTTP Requests' in Game Settings → Security.",
			}
		end
		return false, { valid = false, code = "NETWORK", message = err }
	end

	local ok, decoded = pcall(HttpService.JSONDecode, HttpService, response.Body)
	if not ok or type(decoded) ~= "table" then
		return false, { valid = false, code = "BAD_RESPONSE", message = "HTTP " .. response.StatusCode }
	end

	if response.Success and decoded.valid then
		decoded.message = decoded.studio and "Licensed (Studio test)" or "Licensed"
		return true, decoded :: VerifyResult
	end

	local e = decoded.error or {}
	return false, {
		valid = false,
		code = e.code or ("HTTP_" .. response.StatusCode),
		message = e.message or "License check failed.",
	}
end

--[[
	Verifikasi lisensi. Mengembalikan (true, result) jika valid,
	atau (false, { code, message }) jika tidak.
]]
function ArrLicense.verify(options: VerifyOptions): (boolean, VerifyResult)
	assert(RunService:IsServer(), "ArrLicense.verify must run on the server")
	assert(type(options.key) == "string" and options.key ~= "", "Config.LicenseKey is empty")

	local ok, result
	for attempt = 1, ArrLicense.MAX_ATTEMPTS do
		ok, result = request(options)
		if ok or FATAL_CODES[result.code or ""] or result.code == "HTTP_DISABLED" then
			break
		end
		task.wait(2 ^ attempt) -- 2s, 4s, 8s
	end

	-- beri tahu developer jika versi di katalog ArrStudio lebih baru
	if ok and options.version and result.latestVersion and result.latestVersion ~= options.version then
		warn(("[ArrStudio] %s %s is available (installed: %s)"):format(options.kit, result.latestVersion, options.version))
	end

	if ok and ArrLicense.RECHECK_INTERVAL > 0 and options.onRevoked then
		task.spawn(function()
			while true do
				task.wait(ArrLicense.RECHECK_INTERVAL)
				local stillOk, again = request(options)
				-- hanya bereaksi pada penolakan eksplisit, bukan gangguan jaringan
				if not stillOk and FATAL_CODES[again.code or ""] then
					options.onRevoked(again.code :: string, again.message)
					break
				end
			end
		end)
	end

	return ok, result
end

return ArrLicense
