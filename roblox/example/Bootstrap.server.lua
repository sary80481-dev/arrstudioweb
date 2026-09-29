-- ClubKit/Bootstrap (Script, RunContext = Server)
-- Titik masuk kit: cek lisensi dulu, baru jalankan sistem.

local Kit = script.Parent
local Config = require(Kit.Config)
local ArrLicense = require(Kit.Core.ArrLicense)

local ok, result = ArrLicense.verify({
	key = Config.LicenseKey,
	kit = "clubkit",
	version = "1.2.0", -- samakan dengan versi kit ini
	onRevoked = function(code, message)
		warn(("[ClubKit] License stopped working (%s): %s"):format(code, message))
		-- matikan fitur berbayar dengan aman; jangan kick pemain
		Kit.Core:SetAttribute("Licensed", false)
	end,
})

if not ok then
	warn(("[ClubKit] Not starting — %s (%s)"):format(result.message, result.code or "?"))
	Kit.Core:SetAttribute("Licensed", false)
	return
end

print(("[ClubKit] %s · place %s"):format(result.message, result.placeId or "?"))
Kit.Core:SetAttribute("Licensed", true)

-- mulai sistem kit
require(Kit.Core.Main).start(Config)
