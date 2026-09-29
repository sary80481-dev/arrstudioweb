--!optimize 2
--[[
	ArrSeal — segel modul server kit ArrStudio.

	Modul yang disegel hanya berisi stub + kode terenkripsi (ChaCha20). Kunci pembukanya
	dikirim /api/licenses/verify HANYA untuk lisensi yang valid di place yang terikat,
	jadi menghapus cek lisensi dari Bootstrap tidak membuat kit bisa jalan.

	Butuh: ServerScriptService.LoadStringEnabled = true (hanya server; client tidak terpengaruh).

	Menyegel (sekali, dari Command Bar Studio, di salinan place untuk dibagikan):
		local ArrSeal = require(<kit>.Core.ArrSeal)
		ArrSeal.sealAll(<kit root>, "<kunci hex dari: node scripts/kit-seal-key.mjs clubkit>")

	Membuka kembali ke source asli (butuh kunci yang sama):
		ArrSeal.unsealAll(<kit root>, "<kunci hex>")
]]

local ArrSeal = {}

local MAGIC = "--[[ARRSEAL1]]"
local PRELUDE = "local script = ...; "
local STUB_MARK = "ArrSeal).open(script"

-- Modul yang tidak disegel: dibutuhkan sebelum kunci ada, atau pihak ketiga
ArrSeal.SKIP = {
	ArrSeal = true,
	ArrLicense = true,
	Config = true,
}
ArrSeal.SKIP_FOLDERS = {
	Admin = true, -- Kohl's Admin (pihak ketiga, sangat besar)
	Packages = true, -- ProfileService dll.
}

local unlockKey: { number }? = nil

-- ─── base64 ───
local ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
local ENC, DEC = {}, {}
for i = 1, 64 do
	local ch = string.sub(ALPHABET, i, i)
	ENC[i - 1] = ch
	DEC[string.byte(ch)] = i - 1
end

local function b64encode(s: string): string
	local out = table.create(math.ceil(#s / 3))
	for i = 1, #s, 3 do
		local a, b, c = string.byte(s, i, i + 2)
		local n = a * 65536 + (b or 0) * 256 + (c or 0)
		out[#out + 1] = ENC[bit32.extract(n, 18, 6)]
			.. ENC[bit32.extract(n, 12, 6)]
			.. (b and ENC[bit32.extract(n, 6, 6)] or "=")
			.. (c and ENC[bit32.extract(n, 0, 6)] or "=")
	end
	return table.concat(out)
end

local function b64decode(s: string): string
	s = string.gsub(s, "[^%w%+/]", "")
	local out = table.create(math.ceil(#s / 4))
	for i = 1, #s, 4 do
		local a, b, c, d = string.byte(s, i, i + 3)
		local n = DEC[a] * 262144 + DEC[b] * 4096 + (c and DEC[c] * 64 or 0) + (d and DEC[d] or 0)
		local chunk = string.char(bit32.extract(n, 16, 8))
		if c then chunk ..= string.char(bit32.extract(n, 8, 8)) end
		if d then chunk ..= string.char(bit32.extract(n, 0, 8)) end
		out[#out + 1] = chunk
	end
	return table.concat(out)
end

-- ─── ChaCha20 (RFC 8439) ───
local function qr(x: { number }, a: number, b: number, c: number, d: number)
	x[a] = bit32.bor(x[a] + x[b], 0); x[d] = bit32.lrotate(bit32.bxor(x[d], x[a]), 16)
	x[c] = bit32.bor(x[c] + x[d], 0); x[b] = bit32.lrotate(bit32.bxor(x[b], x[c]), 12)
	x[a] = bit32.bor(x[a] + x[b], 0); x[d] = bit32.lrotate(bit32.bxor(x[d], x[a]), 8)
	x[c] = bit32.bor(x[c] + x[d], 0); x[b] = bit32.lrotate(bit32.bxor(x[b], x[c]), 7)
end

local function chacha20(key: { number }, nonce: string, data: string): string
	local nb = buffer.fromstring(nonce)
	local inp = buffer.fromstring(data)
	local n = #data
	local out = buffer.create(n)
	local s = table.create(16, 0)
	local x = table.create(16, 0)
	s[1], s[2], s[3], s[4] = 0x61707865, 0x3320646e, 0x79622d32, 0x6b206574
	for i = 1, 8 do s[4 + i] = key[i] end
	s[14], s[15], s[16] = buffer.readu32(nb, 0), buffer.readu32(nb, 4), buffer.readu32(nb, 8)

	local counter, pos = 1, 0
	while pos < n do
		s[13] = counter
		table.move(s, 1, 16, 1, x)
		for _ = 1, 10 do
			qr(x, 1, 5, 9, 13); qr(x, 2, 6, 10, 14); qr(x, 3, 7, 11, 15); qr(x, 4, 8, 12, 16)
			qr(x, 1, 6, 11, 16); qr(x, 2, 7, 12, 13); qr(x, 3, 8, 9, 14); qr(x, 4, 5, 10, 15)
		end
		for i = 1, 16 do
			if pos >= n then break end
			local w = bit32.bor(x[i] + s[i], 0)
			if pos + 4 <= n then
				buffer.writeu32(out, pos, bit32.bxor(buffer.readu32(inp, pos), w))
				pos += 4
			else
				for k = 0, 3 do
					if pos >= n then break end
					buffer.writeu8(out, pos, bit32.bxor(buffer.readu8(inp, pos), bit32.extract(w, 8 * k, 8)))
					pos += 1
				end
			end
		end
		counter += 1
	end
	return buffer.tostring(out)
end

local function parseKey(hex: string): { number }
	assert(type(hex) == "string" and string.match(hex, "^%x+$") and #hex == 64, "ArrSeal: key must be 64 hex characters")
	local words = table.create(8, 0)
	for i = 0, 7 do
		local w = 0
		for b = 0, 3 do
			local byte = tonumber(string.sub(hex, i * 8 + b * 2 + 1, i * 8 + b * 2 + 2), 16) :: number
			w += byte * 256 ^ b
		end
		words[i + 1] = w
	end
	return words
end

local function randomBytes(count: number): string
	local rng = Random.new()
	local t = table.create(count)
	for i = 1, count do t[i] = string.char(rng:NextInteger(0, 255)) end
	return table.concat(t)
end

local function decrypt(key: { number }, payload: string): string?
	local raw = b64decode(payload)
	local plain = chacha20(key, string.sub(raw, 1, 12), string.sub(raw, 13))
	if string.sub(plain, 1, #MAGIC) ~= MAGIC then return nil end
	return plain
end

-- ─── runtime ───

--- Dipanggil Bootstrap setelah lisensi valid, dengan `result.unlock` dari API
function ArrSeal.setKey(hex: string)
	unlockKey = parseKey(hex)
end

function ArrSeal.unlocked(): boolean
	return unlockKey ~= nil
end

--- Dipanggil oleh stub modul yang disegel
function ArrSeal.open(module: ModuleScript, payload: string): any
	if not unlockKey then
		error(`[ArrStudio] {module.Name} is locked — license not verified`, 2)
	end
	local plain = decrypt(unlockKey, payload)
	if not plain then
		error(`[ArrStudio] {module.Name} could not be unlocked (seal key mismatch)`, 2)
	end
	local fn, err = loadstring(string.sub(plain, #MAGIC + 1), "=" .. module:GetFullName())
	if not fn then
		error(`[ArrStudio] {module.Name}: {err}`, 2)
	end
	return fn(module)
end

-- ─── tooling (Command Bar Studio) ───

local function isSealed(module: ModuleScript): boolean
	return string.find(module.Source, STUB_MARK, 1, true) ~= nil
end

local function targets(root: Instance): { ModuleScript }
	local list = {}
	local function walk(parent: Instance)
		for _, child in parent:GetChildren() do
			if ArrSeal.SKIP_FOLDERS[child.Name] then continue end
			if child:IsA("ModuleScript") and not ArrSeal.SKIP[child.Name] then
				table.insert(list, child)
			end
			walk(child)
		end
	end
	walk(root)
	return list
end

function ArrSeal.seal(module: ModuleScript, hex: string)
	if isSealed(module) then return false end
	local key = parseKey(hex)
	local nonce = randomBytes(12)
	local payload = b64encode(nonce .. chacha20(key, nonce, MAGIC .. PRELUDE .. module.Source))
	module.Source = table.concat({
		"-- ArrStudio · sealed module (ArrSeal v1). Runs only with a valid ArrStudio license.",
		"local r = script",
		'repeat r = r.Parent until r.Parent == game:GetService("ServerScriptService")',
		`return require(r.Core.ArrSeal).open(script, "{payload}")`,
		"",
	}, "\n")
	return true
end

function ArrSeal.unseal(module: ModuleScript, hex: string)
	if not isSealed(module) then return false end
	local payload = string.match(module.Source, 'open%(script, "([^"]+)"%)')
	local plain = payload and decrypt(parseKey(hex), payload)
	assert(plain, `ArrSeal: cannot unseal {module:GetFullName()} (wrong key?)`)
	module.Source = string.sub(plain, #MAGIC + #PRELUDE + 1)
	return true
end

function ArrSeal.sealAll(root: Instance, hex: string): number
	local count = 0
	for _, m in targets(root) do
		if ArrSeal.seal(m, hex) then count += 1 end
	end
	return count
end

function ArrSeal.unsealAll(root: Instance, hex: string): number
	local count = 0
	for _, m in targets(root) do
		if ArrSeal.unseal(m, hex) then count += 1 end
	end
	return count
end

return ArrSeal
