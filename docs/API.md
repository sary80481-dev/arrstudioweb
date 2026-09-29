# ArrStudio API

API untuk akun, lisensi, dan verifikasi kit dari server Roblox. Dibangun di atas Next.js Route Handlers + Firebase (Auth & Firestore).

- **Base URL:** `https://arrstudioweb.vercel.app` (lokal: `http://localhost:3000`)
- **Format:** JSON (`Content-Type: application/json`)
- **Kode sumber:** `app/api/**`, logika di `lib/server/**`

---

## Daftar isi

1. [Setup](#1-setup)
2. [Autentikasi](#2-autentikasi)
3. [Format error](#3-format-error)
4. [Endpoint](#4-endpoint)
5. [Integrasi Roblox](#5-integrasi-roblox)
6. [Model data Firestore](#6-model-data-firestore)
7. [Admin panel & menerbitkan lisensi](#7-admin-panel--menerbitkan-lisensi)
8. [Realtime & state (Redux)](#8-realtime--state-redux)

---

## 1. Setup

### Firebase

1. Buat project di [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Sign-in method:** aktifkan **Email/Password**.
3. **Firestore Database:** buat database (mode production), lalu deploy rules & index:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
   `firestore.rules` menutup semua akses client — seluruh data hanya diakses lewat API ini.
4. **Project settings → General → Your apps:** tambahkan Web app, salin nilainya ke `NEXT_PUBLIC_FIREBASE_*`.
5. **Project settings → Service accounts → Generate new private key:** salin `project_id`, `client_email`, `private_key` ke `FIREBASE_*`.

### Discord (login)

1. Buat aplikasi di [discord.com/developers/applications](https://discord.com/developers/applications).
2. **OAuth2 → Redirects:** tambahkan `<APP_URL>/api/auth/discord/callback`
   (lokal: `http://localhost:3000/api/auth/discord/callback`).
3. Salin **Client ID** dan **Client Secret** ke `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`.

### Environment

Salin `.env.example` → `.env.local` dan isi semua nilai. `ADMIN_EMAILS` berisi email yang otomatis mendapat role `admin` saat akunnya pertama kali dibuat.

---

## 2. Autentikasi

Ada tiga jenis pemanggil:

| Pemanggil | Cara autentikasi |
| --- | --- |
| Website (browser) | Cookie httpOnly `__session`, dibuat oleh `POST /api/auth/session` atau login Discord |
| Klien lain (CLI, bot) | Header `Authorization: Bearer <Firebase ID token>` |
| Server Roblox | Tidak perlu login — cukup license key di body `POST /api/licenses/verify` |

### Alur login email/password

```
Browser ──signInWithEmailAndPassword──▶ Firebase Auth
Browser ◀────────── ID token ─────────── Firebase Auth
Browser ──POST /api/auth/session { idToken }──▶ API
Browser ◀── Set-Cookie: __session (5 hari, httpOnly) ── API
```

### Alur login Discord

```
Browser ──GET /api/auth/discord──▶ API ──302──▶ discord.com/oauth2/authorize
Discord ──302 /api/auth/discord/callback?code&state──▶ API
API: tukar code → profil Discord → akun Firebase → Set-Cookie __session ──302──▶ /dashboard
```

Akun Discord digabung otomatis dengan akun email yang sama **jika** email Discord sudah terverifikasi.

---

## 3. Format error

Semua error memakai bentuk yang sama. `code` stabil dan aman dipakai di logika (UI atau Lua); `message` untuk manusia.

```json
{
  "error": {
    "code": "PLACE_MISMATCH",
    "message": "This license is bound to a different place.",
    "boundPlaceId": "13284790215"
  }
}
```

| HTTP | `code` | Arti |
| --- | --- | --- |
| 400 | `INVALID_JSON` | Body bukan JSON |
| 400 | `VALIDATION_FAILED` | Field tidak valid — detail di `issues[]` |
| 400 | `INVALID_KEY_FORMAT` | Key tidak berformat `ARR-XXXX-XXXX-XXXX` |
| 400 | `MISSING_PLACE_ID` | `placeId` tidak dikirim |
| 401 | `UNAUTHENTICATED` | Belum login / sesi habis |
| 401 | `INVALID_TOKEN` / `STALE_LOGIN` | ID token salah, kedaluwarsa, atau login lebih dari 5 menit lalu |
| 403 | `FORBIDDEN` | Butuh role admin |
| 403 | `LICENSE_REVOKED` | Lisensi dicabut |
| 403 | `WRONG_KIT` | Key milik kit lain |
| 403 | `PLACE_MISMATCH` | Key sudah terikat ke place lain |
| 404 | `INVALID_KEY` | Key tidak ada |
| 404 | `LICENSE_NOT_FOUND` / `USER_NOT_FOUND` | Data tidak ditemukan |
| 429 | `RATE_LIMITED` | Terlalu banyak request — lihat `retryAfter` (detik) |
| 429 | `REBIND_COOLDOWN` | Pindah place hanya sekali per 30 hari — lihat `retryAt` |
| 500 | `INTERNAL` | Error server |

---

## 4. Endpoint

### Auth

#### `POST /api/auth/session`
Tukar Firebase ID token menjadi session cookie. Membuat dokumen profil jika ini login pertama.

```json
// request
{ "idToken": "eyJhbGciOi...", "displayName": "kyzo_dev" }

// 200
{ "user": { "uid": "abc123", "email": "you@studio.com", "displayName": "kyzo_dev", "role": "user", ... } }
```
`displayName` opsional, hanya dipakai saat akun baru. Rate limit: 20/menit per IP.

#### `DELETE /api/auth/session`
Logout: hapus cookie dan cabut refresh token user.

#### `GET /api/auth/firebase-token` 🔒
Custom token (dengan claim `role`) agar browser bisa login ke Firebase dan membaca data secara realtime sesuai `firestore.rules`. Dipanggil otomatis oleh `useRealtimeAuthSync()`.

#### `GET /api/auth/discord?next=/dashboard`
Mulai login Discord (redirect). `next` harus path internal.

#### `GET /api/auth/discord/callback`
Dipanggil oleh Discord. Jika gagal, redirect ke `/login?error=discord_cancelled | discord_state | discord_config | discord_failed`.

### Akun

#### `GET /api/account` 🔒
```json
{
  "user": {
    "uid": "abc123",
    "email": "you@studio.com",
    "displayName": "kyzo_dev",
    "robloxUsername": "kyzo_dev",
    "role": "user",
    "discordUsername": "kyzo",
    "avatarUrl": "https://cdn.discordapp.com/avatars/...",
    "createdAt": "2026-09-29T10:00:00.000Z"
  }
}
```

#### `PATCH /api/account` 🔒
```json
{ "displayName": "Kyzo", "robloxUsername": "kyzo_dev" }
```
Semua field opsional (minimal satu). `robloxUsername`: 3–20 karakter, huruf/angka/underscore, atau `null`.

### Lisensi

#### `GET /api/licenses` 🔒
Semua lisensi milik user yang login, terbaru dulu.

```json
{
  "licenses": [
    {
      "key": "ARR-7F2K-M4QX-Q9RD",
      "kit": "clubkit",
      "ownerUid": "abc123",
      "placeId": "13284790215",
      "status": "active",
      "note": null,
      "createdAt": "2026-09-20T08:00:00.000Z",
      "boundAt": "2026-09-20T09:12:00.000Z",
      "lastVerifiedAt": "2026-09-29T10:01:00.000Z",
      "verifyCount": 184,
      "rebindAvailableAt": null
    }
  ]
}
```

#### `POST /api/licenses/:key/rebind` 🔒
Pindahkan lisensi ke place lain. Pengikatan pertama bebas; pemindahan berikutnya hanya sekali per **30 hari**.

```json
// request
{ "placeId": "98765432101" }
// 200
{ "license": { ...LicenseDto } }
// 429
{ "error": { "code": "REBIND_COOLDOWN", "message": "...", "retryAt": "2026-10-20T09:12:00.000Z" } }
```

#### `POST /api/licenses/verify` 🎮
Dipanggil oleh kit dari **server Roblox**. Tanpa login — yang diverifikasi adalah key-nya.

```json
// request
{
  "key": "ARR-7F2K-M4QX-Q9RD",
  "kit": "clubkit",
  "placeId": "13284790215",
  "jobId": "a1b2c3d4-...",
  "version": "1.2.0"
}
```

| Field | Wajib | Keterangan |
| --- | --- | --- |
| `key` | ✓ | License key dari `Config.LicenseKey` |
| `kit` | ✓ | ID kit seperti di **/admin → Kits** (mis. `clubkit`, `summitkit`) |
| `placeId` | ✓* | `game.PlaceId`. *Boleh diganti header `Roblox-Id` bila tersedia. `"0"` = Roblox Studio |
| `jobId` | | `game.JobId`, untuk log |
| `version` | | Versi kit yang terpasang; tampil di dashboard & admin |

```json
// 200 — valid
{
  "valid": true,
  "kit": "clubkit",
  "placeId": "13284790215",
  "studio": false,
  "newlyBound": false,
  "latestVersion": "1.2.0",
  "checkedAt": "2026-09-29T10:01:00.000Z"
}
```

Aturan:
- **Pemakaian pertama** dari place yang sudah dipublish → lisensi otomatis terikat ke place itu (`newlyBound: true`).
- **Studio** (`placeId = "0"`) → valid untuk testing, tidak mengikat dan tidak dihitung (`studio: true`).
- Place berbeda dari yang terikat → `403 PLACE_MISMATCH`.
- `unlock` = kunci pembuka modul yang disegel (ArrSeal, hex 64 karakter). Hanya dikirim untuk place yang terikat (bukan Studio `placeId = "0"`) dan bila `KIT_SEAL_SECRET` diset. Kit yang disegel tidak bisa jalan tanpa kunci ini.
- `latestVersion` = versi kit di katalog (diatur admin). `ArrLicense.lua` memberi `warn` bila berbeda dengan versi terpasang.
- Setiap pengikatan / pencabutan langsung memperbarui counter realtime (`stats/public`, `kits/{id}.stats`).
- Rate limit: 30/menit per key, 120/menit per IP.

### Admin 🛡️

Butuh user dengan `role: "admin"`.

#### `GET /api/admin/kits`
Semua kit, termasuk draft.

#### `POST /api/admin/kits`
Buat kit baru. `POST /api/admin/kits?seed=1` mengimpor ClubKit Pro & Summit Kit bawaan (yang belum ada).

```json
{
  "id": "summitkit",
  "name": "Summit Kit",
  "tag": "Live events",
  "tagline": "Run launches like a festival.",
  "description": "Stage control, lighting presets, …",
  "version": "1.0.0",
  "price": 19,
  "status": "active",
  "icon": "mountain",
  "features": ["Stage & lighting presets", "Countdown & schedule board"],
  "integrations": ["Group ranks", "Gamepasses", "TextChat"],
  "attributes": { "systems": 85, "integration": 90, "setup": 92 },
  "configPath": "SummitKit/Config",
  "rating": 4.8,
  "order": 2
}
```

| Field | Aturan |
| --- | --- |
| `id` | huruf kecil/angka/`-`, maks. 32. Dipakai di Lua (`kit = "summitkit"`), tidak bisa diubah |
| `version` | semver, mis. `1.2.0` atau `2.0.0-beta.1` |
| `status` | `draft` (tersembunyi) · `active` (dijual) · `coming_soon` (tampil, belum bisa dibeli) |
| `icon` | salah satu key di `KIT_ICONS` (`lib/kits.ts`) |
| `integrations` | subset dari `DataStore`, `Group ranks`, `Gamepasses`, `Leaderstats`, `TextChat` |

#### `PATCH /api/admin/kits/:id`
Ubah sebagian field (semua opsional). Perubahan langsung tampil di landing (realtime).

#### `DELETE /api/admin/kits/:id`
Hanya untuk kit tanpa lisensi — kit yang sudah terjual cukup di-set `draft`.

#### `GET /api/admin/licenses?ownerUid=&kit=`
Daftar lisensi (maks. 100), bisa difilter.

#### `POST /api/admin/licenses`
Terbitkan lisensi untuk user — dipakai setelah pembayaran diterima.

```json
// request (pakai ownerUid ATAU ownerEmail)
{ "kit": "summitkit", "ownerEmail": "buyer@studio.com", "count": 1, "note": "Order #1042" }
// 201
{ "keys": ["ARR-H7KQ-2MXP-9TVA"] }
```
User harus sudah punya akun (pernah login sekali).

#### `PATCH /api/admin/licenses/:key`
```json
{ "status": "revoked" }   // atau "active" untuk memulihkan
```

---

## 5. Integrasi Roblox

File siap pakai ada di folder `roblox/`:

| File | Tipe | Isi |
| --- | --- | --- |
| `roblox/ArrLicense.lua` | ModuleScript | Klien API: verify, retry, cek ulang berkala |
| `roblox/example/Config.lua` | ModuleScript | Contoh Config yang diisi pembeli |
| `roblox/example/Bootstrap.server.lua` | Script (server) | Contoh titik masuk kit |

### Struktur kit yang disarankan

```
ClubKit (Folder / Model)
├── Config              ← ModuleScript — pembeli hanya mengubah file ini
├── Bootstrap           ← Script (server) — cek lisensi lalu start
└── Core                ← Folder
    ├── ArrLicense      ← ModuleScript (roblox/ArrLicense.lua)
    └── Main            ← ModuleScript — sistem kit
```

### Langkah

1. **Set URL API** di `ArrLicense.lua`:
   ```lua
   ArrLicense.API_URL = "https://arrstudioweb.vercel.app"
   ```
2. **Pembeli mengaktifkan HTTP:** Game Settings → Security → **Allow HTTP Requests**.
3. **Pembeli menempel key** di `Config`:
   ```lua
   LicenseKey = "ARR-7F2K-M4QX-Q9RD",
   ```
4. **Bootstrap memverifikasi** sebelum menjalankan apa pun:
   ```lua
   local ok, result = ArrLicense.verify({ key = Config.LicenseKey, kit = "clubkit" })
   if not ok then
       warn("[ClubKit] " .. result.message)
       return
   end
   require(Kit.Core.Main).start(Config)
   ```

### Alur saat server start

```
Server Roblox                          ArrStudio API                Firestore
     │  POST /api/licenses/verify            │                          │
     │  { key, kit, placeId, jobId } ───────▶│  cek format + rate limit │
     │                                       │── transaction ──────────▶│
     │                                       │   key ada? aktif?        │
     │                                       │   kit cocok?             │
     │                                       │   place cocok / ikat     │
     │◀──────── 200 { valid: true } ─────────│◀─────────────────────────│
     │  start sistem kit                     │                          │
```

### Menangani hasil di Lua

| `result.code` | Yang sebaiknya dilakukan kit |
| --- | --- |
| *(ok)* | Jalankan kit |
| `HTTP_DISABLED` | `warn` minta pembeli mengaktifkan Allow HTTP Requests |
| `INVALID_KEY`, `INVALID_KEY_FORMAT` | `warn` minta cek `Config.LicenseKey` |
| `PLACE_MISMATCH` | `warn` minta pindahkan lisensi dari dashboard |
| `WRONG_KIT` | `warn` key tertukar dengan kit lain |
| `LICENSE_REVOKED` | Jangan jalankan kit |
| `NETWORK`, `RATE_LIMITED`, `HTTP_5xx` | `ArrLicense` sudah retry 3× (2s/4s/8s); jika tetap gagal, putuskan sendiri apakah kit tetap jalan (mis. mode terbatas) |

`ArrLicense.verify` juga menerima `onRevoked(code, message)`: modul akan cek ulang tiap 30 menit dan memanggil callback ini hanya jika server **secara eksplisit** menolak key (bukan saat jaringan terganggu).

### Keamanan

- Panggil API **hanya dari server** (Script / ModuleScript yang di-require server). Jangan taruh key di `ReplicatedStorage` atau LocalScript.
- Key terikat ke satu place; key yang bocor tidak bisa dipakai di place lain.
- Validasi terjadi di server ArrStudio dalam transaksi Firestore, sehingga dua server yang start bersamaan tidak bisa mengikat key ke dua place.

### Testing dengan curl

```bash
curl -X POST http://localhost:3000/api/licenses/verify \
  -H "Content-Type: application/json" \
  -d '{"key":"ARR-7F2K-M4QX-Q9RD","kit":"clubkit","placeId":"0"}'
```

---

## 6. Model data Firestore

### `users/{uid}`

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `email` | string | |
| `displayName` | string | |
| `robloxUsername` | string \| null | |
| `role` | `"user"` \| `"admin"` | Ubah manual di console untuk menjadikan admin |
| `discordId`, `discordUsername`, `avatarUrl` | string \| null | Diisi saat login Discord |
| `createdAt`, `updatedAt` | timestamp | |

### `kits/{id}`

Katalog kit, diatur dari `/admin/kits`. Field sama dengan body `POST /api/admin/kits`, ditambah:

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `stats.licenses` | number | Jumlah lisensi yang diterbitkan (counter) |
| `stats.activePlaces` | number | Lisensi aktif yang terikat ke place (counter) |
| `createdAt`, `updatedAt` | timestamp | |

### `stats/public`

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `licensesIssued` | number | Total lisensi diterbitkan |
| `placesActive` | number | Total place yang sedang memakai kit |

Keduanya dibaca publik oleh landing (realtime). Counter diperbarui di transaksi yang sama dengan perubahan lisensi.

### `licenses/{key}`

ID dokumen = license key.

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `key` | string | `ARR-XXXX-XXXX-XXXX` |
| `kit` | string | → `kits/{id}` |
| `kitName` | string | Nama kit saat diterbitkan |
| `ownerEmail` | string \| null | |
| `lastKitVersion` | string \| null | Versi terakhir yang dilaporkan kit |
| `ownerUid` | string | → `users/{uid}` |
| `placeId` | string \| null | `null` sampai verifikasi pertama |
| `status` | `"active"` \| `"revoked"` | |
| `note` | string \| null | Mis. nomor order |
| `createdAt`, `boundAt`, `lastRebindAt`, `lastVerifiedAt` | timestamp \| null | |
| `lastJobId` | string \| null | `game.JobId` terakhir |
| `verifyCount` | number | |

---

## 7. Admin panel & menerbitkan lisensi

Belum ada integrasi pembayaran; lisensi diterbitkan admin setelah pembayaran masuk.

1. Email di `ADMIN_EMAILS` otomatis jadi admin saat akunnya pertama kali dibuat (atau ubah `role` jadi `"admin"` di Firestore).
2. Buka **`/admin`** (tombol *Admin* muncul di dashboard):
   - **Overview** — lisensi diterbitkan, place aktif, key belum dipakai, dicabut, dan rincian per kit. Semua realtime.
   - **Kits** — tambah / ubah kit (nama, versi, harga, status, fitur, integrasi, ikon, stat bar). Katalog kosong? Klik *Import ClubKit Pro & Summit Kit*.
   - **Licenses** — form *Issue license* (kit + email pembeli + jumlah + catatan), tabel realtime dengan pencarian & filter, tombol *Revoke / Restore*.
3. Key yang diterbitkan langsung muncul di dashboard pembeli tanpa refresh.

---

## 8. Realtime & state (Redux)

```
Firestore ──onSnapshot──▶ lib/realtime.ts (sync hooks) ──dispatch──▶ Redux store ──useAppSelector──▶ komponen
                                                                        ▲
                                    data awal dari server component ────┘ (StoreProvider preloaded)
```

| Area | Sync (dipasang sekali) | Data |
| --- | --- | --- |
| Landing | `PublicSync` → `usePublicSync()` | kit publik, `stats/public` (tanpa login) |
| Dashboard | `LiveLicenses` → `useRealtimeAuthSync()` + `useLicensesSync({ ownerUid })` | lisensi milik user |
| Admin | `AdminSync` → auth + `useAllKitsSync` + `useStatsSync` + `useLicensesSync({ all })` | semua kit, lisensi, statistik |

- Store: `lib/store/` (Redux Toolkit) — slice `catalog`, `stats`, `licenses`, `realtime`. Store dibuat per halaman (`StoreProvider`) agar data antar user tidak tercampur.
- Semua **penulisan** tetap lewat API server; browser hanya **membaca** sesuai `firestore.rules`.
- Landing di-generate statis dan diperbarui ulang tiap 60 detik (ISR) untuk SEO; setelah halaman terbuka, angka & katalog berjalan realtime.
