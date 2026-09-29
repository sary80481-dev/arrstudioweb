# Deploy ke Vercel

Setelah setup sekali, deploy berjalan otomatis lewat GitHub Actions (`.github/workflows/deploy.yml`):

| Kejadian | Yang terjadi |
| --- | --- |
| Push ke `main` / `master` | Lint + typecheck → build → **deploy production** |
| Pull request | Lint + typecheck → build → **deploy preview**, URL dikomentari di PR |
| Lint / typecheck gagal | Tidak ada deploy — situs lama tetap berjalan |

Deploy bawaan Vercel dari Git dimatikan (`"git": { "deploymentEnabled": false }` di `vercel.json`) supaya tidak terjadi deploy ganda dan kode yang gagal cek tidak pernah live.

---

## Setup sekali

### 1. Push repo ke GitHub

```bash
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin master
```

### 2. Buat project di Vercel & hubungkan folder

```bash
pnpm dlx vercel login
pnpm dlx vercel link        # pilih / buat project "arrstudio"
```

`vercel link` membuat `.vercel/project.json` (sudah di-.gitignore) berisi `orgId` dan `projectId`.

### 3. Upload environment variables

```bash
node scripts/vercel-env.mjs --dry-run   # cek dulu apa yang akan dikirim
node scripts/vercel-env.mjs             # kirim isi .env ke production + preview
```

Lalu di **Vercel → Project → Settings → Environment Variables** tambahkan:

| Nama | Nilai |
| --- | --- |
| `APP_URL` | domain produksi, mis. `https://arrstudioweb.vercel.app` (tanpa `/` di akhir) |

`FIREBASE_PRIVATE_KEY` boleh disimpan dalam satu baris dengan `\n` literal — kode sudah mengubahnya jadi baris baru.

### 4. Secrets di GitHub

**GitHub → repo → Settings → Secrets and variables → Actions → New repository secret:**

| Secret | Dari mana |
| --- | --- |
| `VERCEL_TOKEN` | vercel.com/account/tokens → Create |
| `VERCEL_ORG_ID` | `orgId` di `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` di `.vercel/project.json` |

### 5. Setelah deploy pertama

- **Discord Developer Portal → OAuth2 → Redirects:** tambahkan `https://<domain>/api/auth/discord/callback`.
- **Firebase Console → Authentication → Settings → Authorized domains:** tambahkan domain Vercel kamu.
- **`roblox/ArrLicense.lua`:** set `ArrLicense.API_URL = "https://<domain>"` lalu publish ulang kit.

---

## Catatan performa & skala

- **Region:** fungsi server berjalan di `sin1` (Singapura) — terdekat dengan Firestore `asia-southeast2` (Jakarta).
- **Landing** di-generate statis (6 bahasa) dan diperbarui tiap 60 detik (ISR); SDK Firestore baru dimuat saat browser idle. JS awal landing ± 200 KB gzip.
- **Halaman login/register** memuat Firebase Auth hanya saat form dikirim.
- **API** stateless, jadi otomatis ikut skala Vercel. Rate limit saat ini disimpan di memori per instance — untuk trafik sangat besar, ganti dengan store bersama (mis. Upstash Redis / Vercel KV) di `lib/server/http.ts`.
- **Firestore:** counter `stats/public` hanya ditulis saat lisensi diterbitkan / terikat / dicabut (jarang), jadi aman dari batas 1 tulis/detik per dokumen.

## Deploy manual (darurat)

```bash
pnpm dlx vercel --prod
```
