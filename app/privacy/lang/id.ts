import { LEGAL, type Policy } from "../shared";

const id: Policy = {
  title: "Kebijakan Privasi",
  subtitle: "Data apa yang kami kumpulkan, untuk apa, siapa yang bisa melihatnya, dan pilihan yang kamu punya — dengan bahasa yang jelas.",
  updatedLabel: "Terakhir diperbarui",
  tocLabel: "Di halaman ini",
  backLabel: "Kembali ke situs",
  contactLabels: { discord: "Discord (tiket bantuan)", whatsapp: "WhatsApp", email: "Email" },
  sections: [
    {
      id: "summary",
      title: "1. Versi singkat",
      blocks: [
        { p: "ArrStudio menjual kit Roblox berlisensi. Agar layanan ini berjalan, kami butuh akun, cara menerima pembayaran, dan cara memastikan key lisensi hanya dipakai di place yang terdaftar. Kebijakan ini menjelaskan data pribadi yang terlibat." },
        {
          ul: [
            "Kami mengumpulkan seperlunya: data akun, pesanan dan lisensi, serta data teknis untuk menjaga keamanan layanan.",
            "Kami tidak menjual data pribadimu dan tidak membagikannya untuk iklan. Tidak ada cookie iklan atau pelacak di situs ini.",
            "Pembayaran diproses oleh Midtrans. Kami tidak pernah melihat atau menyimpan nomor kartu atau kredensial e-wallet-mu.",
            "Kamu bisa mengekspor data dan menghapus akunmu sendiri di Dasbor → Account, atau meminta kami melakukannya (bagian 9).",
          ],
        },
      ],
    },
    {
      id: "who",
      title: "2. Siapa kami dan cakupan kebijakan ini",
      blocks: [
        { p: `${LEGAL.controller} (“ArrStudio”, “kami”) adalah pengendali data pribadi yang dijelaskan di sini. Kebijakan ini mencakup situs web, dasbor pelanggan, alat admin yang kami pakai untuk menjalankan layanan, API pengecekan lisensi yang dipanggil kit Roblox kami, serta kanal pembelian dan bantuan kami.` },
        { p: "Kebijakan ini tidak mencakup layanan pihak ketiga yang kami tautkan atau yang kamu pakai bersama layanan kami (Roblox, Discord, WhatsApp, bankmu). Mereka punya kebijakan sendiri yang sebaiknya kamu baca." },
      ],
    },
    {
      id: "collect",
      title: "3. Data yang kami kumpulkan",
      blocks: [
        { p: "Kami mengumpulkan data dengan tiga cara: yang kamu berikan, yang tercipta saat kamu memakai layanan, dan yang berasal dari layanan yang kamu hubungkan." },
        {
          table: {
            head: ["Kategori", "Isinya", "Sumber"],
            rows: [
              ["Akun", "Alamat email, nama tampilan, username Roblox (opsional), ID akun unik, cara mendaftar, dan password (hanya disimpan sebagai hash oleh Firebase Authentication — kami tidak bisa membacanya).", "Kamu"],
              ["Login Discord", "Jika masuk dengan Discord: ID pengguna, username, URL avatar, dan email bila terverifikasi.", "Discord, dengan izinmu"],
              ["Pesanan & pembayaran", "Apa yang dibeli, harga, kode diskon yang dipakai, jenis metode bayar (mis. QRIS, transfer bank), status, dan waktu. Untuk cicilan: total, jumlah yang sudah dibayar, tanggal, dan catatan yang dicatat tim kami setelah mengecek bukti transfer.", "Kamu / Midtrans / tim kami"],
              ["Bukti transfer", "Jika kamu mengirim bukti transfer lewat Discord atau WhatsApp: gambar atau pesan yang kamu kirim, yang mungkin memuat namamu dan data rekening.", "Kamu"],
              ["Pembayaran QRIS", "Jika kamu membayar lewat QRIS, nama pembayar dan nominal terlihat di akun merchant kami (GoPay Merchant) dan di mutasi bankmu. Kami memakainya hanya untuk mencocokkan pembayaranmu.", "Kamu / bank atau e-wallet-mu"],
              ["Lisensi", "Key lisensi, kit, ID place Roblox yang terikat ke key, jumlah slot place, tanggal terbit, dan status.", "Dibuat oleh kami / kamu"],
              ["Pengecekan lisensi", "Tiap server game dijalankan, kit memanggil API lisensi. Kami menerima key, ID kit, versi kit, ID place dan ID job server Roblox, serta alamat IP servermu. Kami hanya menyimpan waktu cek terakhir, versi, dan jumlah total — bukan riwayat lengkap.", "Server game Roblox-mu"],
              ["Teknis & keamanan", "Alamat IP, jenis browser dan perangkat, halaman yang diminta, waktu, log error; penghitung batas request (disimpan dengan kunci ter-hash); laporan pelanggaran content-security-policy.", "Otomatis"],
              ["Aktivitas admin", "Untuk akun staf kami: catatan tindakan administratif (siapa melakukan apa dan kapan).", "Otomatis"],
              ["Komunikasi", "Pesan yang kamu kirim di Discord atau WhatsApp, beserta identitas Discord / WhatsApp-mu.", "Kamu"],
            ],
          },
        },
        { p: "Kami tidak sengaja mengumpulkan data pribadi sensitif (seperti data kesehatan, biometrik, atau politik), dan kami tidak meminta KTP atau identitas resmi." },
        { note: "Thumbnail dan nama place Roblox di dasbormu diambil dari API publik Roblox memakai ID place yang kamu daftarkan. Kami tidak menerima data lain tentang akun Roblox-mu." },
      ],
    },
    {
      id: "use",
      title: "4. Untuk apa data dipakai (dan dasar hukumnya)",
      blocks: [
        {
          table: {
            head: ["Tujuan", "Data yang dipakai", "Dasar hukum"],
            rows: [
              ["Membuat dan mengamankan akun, memasukkanmu", "Akun, teknis", "Perjanjian; kepentingan yang sah (keamanan)"],
              ["Menerima pembayaran, menerbitkan lisensi, mengirim file kit", "Akun, pesanan, lisensi", "Perjanjian"],
              ["Memastikan key hanya dipakai di place terdaftar, dan menolak lisensi yang dicabut atau belum lunas", "Lisensi, pengecekan lisensi", "Perjanjian; kepentingan yang sah (mencegah pembajakan dan penipuan)"],
              ["Mengelola cicilan dan membuka lisensi setelah lunas", "Pesanan, catatan cicilan", "Perjanjian"],
              ["Memberi bantuan dan membalas pesanmu", "Komunikasi, akun, lisensi", "Perjanjian; kepentingan yang sah"],
              ["Mencegah penyalahgunaan, penipuan, dan serangan (batas request, 2FA staf, audit log)", "Teknis, aktivitas admin", "Kepentingan yang sah; kewajiban hukum bila berlaku"],
              ["Mengingat bahasa pilihanmu", "Cookie bahasa", "Persetujuanmu (bisa ditolak di banner cookie)"],
              ["Menyimpan catatan keuangan dan pajak", "Pesanan, pembayaran", "Kewajiban hukum"],
              ["Mengirim pesan layanan (mis. soal lisensi atau pembayaran)", "Akun, pesanan", "Perjanjian; kepentingan yang sah"],
            ],
          },
        },
        { p: "Bila kami mengandalkan kepentingan yang sah, kami menimbangnya terhadap hakmu. Kamu boleh keberatan atas pemrosesan berdasarkan kepentingan yang sah — lihat bagian 9." },
        { p: "Kami tidak memakai datamu untuk iklan, pembuatan profil untuk pemasaran, atau keputusan yang berdampak hukum atau signifikan bagimu yang semata-mata berdasarkan pemrosesan otomatis. Satu-satunya keputusan otomatis adalah penegakan lisensi: key ditolak bila dicabut, belum lunas, dipakai di place yang tidak terdaftar, atau slot place-nya penuh. Jika kamu merasa penolakan itu keliru, hubungi kami dan seorang staf akan meninjaunya." },
      ],
    },
    {
      id: "cookies",
      title: "5. Cookie dan penyimpanan lokal",
      blocks: [
        { p: "Kami hanya memakai sedikit cookie. Cookie penting tidak bisa dimatikan karena layanan tidak akan berjalan tanpanya. Kamu bisa memilih “Hanya yang penting” di banner cookie, dan membuka kembali pilihan itu kapan saja lewat “Pengaturan cookie” di footer." },
        {
          table: {
            head: ["Nama", "Fungsi", "Jenis", "Masa berlaku"],
            rows: [
              ["__session", "Menjaga kamu tetap masuk (HTTP-only, secure)", "Penting", "Hingga 5 hari"],
              ["arr_user", "Petunjuk tidak sensitif (nama tampilan dan peran) agar menu tampil tanpa request tambahan", "Penting", "Hingga 5 hari"],
              ["discord_oauth_state", "Melindungi login Discord dari pemalsuan", "Penting", "Beberapa menit"],
              ["__mfa", "Menandai staf sudah lolos verifikasi dua langkah", "Penting (khusus staf)", "12 jam"],
              ["arr_consent", "Mengingat pilihan cookie-mu", "Penting", "1 tahun"],
              ["NEXT_LOCALE", "Mengingat bahasa pilihanmu", "Preferensi — hanya jika kamu setuju", "1 tahun"],
              ["theme (local storage)", "Preferensi tampilan terang / gelap", "Fungsional", "Sampai data browser dihapus"],
              ["Status login Firebase (IndexedDB)", "Menjaga koneksi langsung ke data lisensimu di dasbor", "Penting", "Selama masuk"],
            ],
          },
        },
        { p: "Saat jendela pembayaran terbuka, Midtrans memuat skripnya sendiri dan mungkin memasang cookie sendiri untuk pencegahan penipuan dan pemrosesan pembayaran. Itu diatur oleh kebijakan Midtrans." },
        { p: "Kamu juga bisa menghapus atau memblokir cookie lewat pengaturan browser. Memblokir cookie penting akan membuatmu tidak bisa masuk." },
      ],
    },
    {
      id: "sharing",
      title: "6. Dengan siapa data dibagikan",
      blocks: [
        { p: "Kami hanya membagikan data kepada penyedia layanan yang membantu menjalankan ArrStudio, dengan ketentuan yang mewajibkan mereka melindunginya, dan bila diwajibkan hukum. Kami tidak menjual data pribadi dan tidak membagikannya untuk iklan perilaku lintas konteks." },
        {
          table: {
            head: ["Penyedia", "Peran untuk kami", "Data terkait"],
            rows: [
              ["Google (Firebase Authentication, Cloud Firestore)", "Login dan basis data kami", "Akun, pesanan, lisensi, log"],
              ["Vercel", "Hosting situs, penyimpanan file kit dan video, log request", "Semua request web, file yang diunggah"],
              ["Midtrans", "Pemrosesan pembayaran (QRIS, virtual account, e-wallet, kartu)", "Nama, email, pesanan, dan nominal; detail pembayaran dimasukkan di Midtrans, bukan di kami"],
              ["GoPay Merchant (QRIS)", "Menerima pembayaran QRIS ke akun merchant kami", "Nama pembayar dan nominal yang tampil bersama transfer"],
              ["Discord", "“Masuk dengan Discord” dan komunitas bantuan kami", "ID Discord, username, avatar, email terverifikasi"],
              ["Roblox", "Nama dan ikon place yang publik; pengecekan lisensi datang dari server game-mu", "ID place"],
              ["WhatsApp (Meta)", "Pesanan khusus dan bantuan, bila kamu menghubungi kami di sana", "Nomormu dan pesan"],
            ],
          },
        },
        { p: "Kami juga dapat mengungkapkan data bila diwajibkan oleh hukum, pengadilan, atau otoritas berwenang, untuk menegakkan ketentuan kami, melindungi hak kami, pengguna, atau publik, atau dalam merger, akuisisi, atau penjualan aset (kamu akan diberi tahu lebih dulu dan penerimanya wajib menghormati kebijakan ini)." },
        { p: "Key lisensi dan ID place yang terdaftar hanya terlihat oleh kamu, administrator kami, dan, sebatas yang diperlukan, layanan yang tercantum di atas. Pelanggan lain tidak bisa melihatnya." },
      ],
    },
    {
      id: "transfers",
      title: "7. Transfer data ke luar negeri",
      blocks: [
        { p: "Penyedia kami beroperasi secara global, sehingga datamu dapat diproses di negara selain negaramu — termasuk Indonesia, Amerika Serikat, Singapura, dan tempat lain tempat Google, Vercel, Midtrans, atau Discord beroperasi." },
        { p: "Bila hukum mewajibkan, kami mengandalkan pengamanan yang memadai untuk transfer ini, seperti klausul kontrak standar penyedia, keputusan kecukupan, atau persetujuanmu. Hubungi kami untuk rinciannya." },
      ],
    },
    {
      id: "retention",
      title: "8. Berapa lama data disimpan",
      blocks: [
        {
          table: {
            head: ["Data", "Berapa lama"],
            rows: [
              ["Profil akun", "Selama akunmu ada. Dihapus seketika saat kamu menghapus akun di Dasbor → Account (atau dalam 30 hari bila kamu meminta kami)."],
              ["Lisensi dan ID place terikat", "Selama lisensi aktif. Setelah akunmu dihapus, lisensi dicabut dan disimpan tanpa email atau ID-mu hingga 3 tahun untuk menangani sengketa."],
              ["Pesanan, pembayaran, dan catatan cicilan", "Selama diwajibkan hukum pajak dan akuntansi (di Indonesia umumnya hingga 10 tahun). Setelah akun dihapus, disimpan tanpa identitasmu."],
              ["Data pengecekan lisensi (cek terakhir, versi, jumlah)", "Disimpan di catatan lisensi selama catatan itu ada."],
              ["Sesi dan cookie login", "Hingga 5 hari; 12 jam untuk status verifikasi dua langkah staf."],
              ["Penghitung batas request", "Dihapus otomatis dalam hitungan menit sampai jam."],
              ["Audit log admin", "Minimal 24 bulan, untuk keamanan dan akuntansi."],
              ["Log server dan keamanan", "Sesuai retensi penyedia hosting (biasanya beberapa hari sampai beberapa minggu)."],
              ["Pesan bantuan", "Hingga 3 tahun setelah percakapan selesai, atau sampai kamu meminta penghapusan."],
            ],
          },
        },
        { p: "Setelah masa simpan berakhir, kami menghapus atau menganonimkan data. Cadangan ditimpa mengikuti siklus normal penyedia." },
      ],
    },
    {
      id: "rights",
      title: "9. Hakmu",
      blocks: [
        { p: "Tergantung tempat tinggalmu, kamu punya sebagian atau seluruh hak berikut atas data pribadimu:" },
        {
          ul: [
            "Akses — mendapat salinan data yang kami simpan tentangmu.",
            "Koreksi — memperbaiki data yang salah atau tidak lengkap (nama dan username Roblox bisa kamu ubah sendiri di akun).",
            "Penghapusan — hapus akunmu sendiri di Dasbor → Account, atau minta kami. Kami hanya menyimpan yang diwajibkan hukum atau yang perlu untuk membela klaim hukum (bagian 8).",
            "Pembatasan dan keberatan — meminta pemrosesan dihentikan sementara, atau keberatan atas pemrosesan berdasarkan kepentingan yang sah.",
            "Portabilitas — unduh datamu sebagai berkas JSON dari Dasbor → Account, atau minta kami.",
            "Menarik persetujuan — misalnya mengubah pilihan cookie kapan saja. Penarikan tidak memengaruhi pemrosesan sebelumnya.",
            "Mengajukan keluhan — ke otoritas perlindungan data di negaramu.",
          ],
        },
        { p: "Ekspor data dan hapus akun bisa langsung dilakukan dari dasbormu. Untuk permintaan lain, hubungi kami (bagian 15). Kami mungkin meminta bukti bahwa kamu pemilik akun lebih dulu, dan membalas dalam 30 hari (atau lebih cepat bila hukum mewajibkan). Kami tidak memungut biaya kecuali permintaannya jelas berlebihan." },
        { p: "Catatan per wilayah:" },
        {
          ul: [
            "Indonesia — menurut UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, kamu berhak mengakses, memperbaiki, menghapus, membatasi, menarik persetujuan, keberatan atas pemrosesan otomatis, dan menuntut ganti rugi atas pelanggaran.",
            "Wilayah Ekonomi Eropa dan Inggris — hak GDPR / UK GDPR di atas berlaku, dan kamu dapat mengajukan keluhan ke otoritas pengawas setempat.",
            "California — kamu berhak mengetahui, menghapus, dan mengoreksi informasi pribadi serta menolak penjualan atau pembagiannya. Kami tidak menjual atau membagikan informasi pribadi, dan tidak mendiskriminasi pengguna yang menggunakan hak ini.",
            "Filipina (Data Privacy Act 2012), Malaysia (PDPA 2010), Thailand (PDPA 2019), dan Vietnam (Decree 13/2023/ND-CP) — kamu punya hak akses, koreksi, penghapusan, keberatan, dan penarikan persetujuan sesuai undang-undang tersebut, dan kami menghormatinya.",
          ],
        },
      ],
    },
    {
      id: "security",
      title: "10. Cara kami melindungi datamu",
      blocks: [
        {
          ul: [
            "Enkripsi saat transit (HTTPS dengan HSTS) di setiap halaman dan panggilan API.",
            "Password dikelola Firebase Authentication dan disimpan sebagai hash; kami tidak pernah melihatnya.",
            "Sesi memakai cookie HTTP-only, secure, same-site, dan diperiksa ke Firebase pada setiap request.",
            "Kontrol akses ketat: basis data hanya bisa ditulis oleh server kami, dan tiap pelanggan hanya bisa membaca lisensinya sendiri.",
            "Akun staf wajib autentikasi dua langkah (aplikasi authenticator dengan kode cadangan); rahasia dua langkah dienkripsi saat disimpan.",
            "Pembatasan request, perlindungan anti-replay, dan penghitung ter-hash menjaga login, pengecekan lisensi, kode diskon, dan pembayaran.",
            "Konfirmasi pembayaran diverifikasi dengan tanda tangan kriptografis dan dicek ulang langsung ke Midtrans sebelum lisensi diterbitkan.",
            "Audit log mencatat tindakan administratif atas uang, lisensi, peran, dan harga.",
            "Modul kit dienkripsi dan hanya terbuka untuk lisensi yang valid, lunas, dan terdaftar.",
          ],
        },
        { p: "Tidak ada sistem yang sepenuhnya aman. Jika kamu menemukan celah keamanan, mohon beri tahu kami secara privat lewat kontak di bawah sebelum mengungkapkannya ke publik. Jaga kerahasiaan password, key lisensi, dan file place Roblox-mu." },
        { p: "Bila terjadi kebocoran yang memengaruhi data pribadimu dan hukum mewajibkannya, kami memberi tahu kamu dan otoritas berwenang dalam waktu yang diwajibkan (misalnya 72 jam kepada otoritas menurut GDPR, dan 3×24 jam menurut hukum Indonesia)." },
      ],
    },
    {
      id: "payments",
      title: "11. Pembayaran dan cicilan",
      blocks: [
        { p: "Pembayaran online berjalan lewat Midtrans. Kamu memasukkan detail kartu, bank, atau e-wallet di halaman Midtrans; kami hanya menerima hasilnya (lunas, menunggu, gagal), jenis metode bayar, dan nominal." },
        { p: "Kamu juga bisa membayar lewat QRIS ke akun merchant kami (GoPay Merchant). Nama pembayar dan nominal terlihat oleh kami di akun itu; kami mencocokkan pembayaran dengan pesananmu lewat bukti transfer yang kamu kirim, dan tidak memakai informasi itu untuk hal lain." },
        { p: "Cicilan diatur langsung dengan kami. Tim kami mencatat setiap transfer yang sudah dikonfirmasi (nominal, tanggal, catatan opsional) pada lisensimu. Sebelum cicilan lunas, lisensimu terkunci: key disembunyikan, file kit tidak bisa diunduh, dan pengecekan lisensi gagal. Bukti transfer yang kamu kirim di Discord atau WhatsApp hanya dipakai untuk mengonfirmasi pembayaran." },
        { p: "Kode diskon yang kamu masukkan diperiksa di server kami dan dihitung terhadap batas pemakaian kode; kode itu tidak dikaitkan dengan profil apa pun selain pesanan tempat kode dipakai." },
      ],
    },
    {
      id: "children",
      title: "12. Anak-anak",
      blocks: [
        { p: "Layanan kami tidak ditujukan bagi anak di bawah 13 tahun (atau usia minimum persetujuan digital yang lebih tinggi di negaramu, misalnya 16 tahun di sebagian Uni Eropa). Kami tidak dengan sengaja mengumpulkan data mereka. Jika kamu orang tua atau wali dan yakin anak memberi kami data pribadi, hubungi kami dan kami akan menghapusnya." },
        { p: "Banyak kreator Roblox masih remaja. Jika usiamu di bawah usia dewasa di tempatmu tinggal, mohon membeli dengan izin orang tua atau wali." },
      ],
    },
    {
      id: "thirdparty",
      title: "13. Tautan dan layanan pihak ketiga",
      blocks: [
        { p: "Situs kami menautkan ke Discord, WhatsApp, Roblox, dan situs contoh buatan kami. Saat kamu mengikuti tautan, kebijakan layanan lain itulah yang berlaku. Kami tidak bertanggung jawab atas isi atau praktiknya." },
        { p: "Kit yang kamu pasang di game Roblox-mu berjalan di servermu. Data pemain yang dikumpulkan game-mu menjadi tanggung jawabmu; kit kami hanya mengirim data pengecekan lisensi seperti dijelaskan di bagian 3." },
      ],
    },
    {
      id: "changes",
      title: "14. Perubahan kebijakan",
      blocks: [
        { p: "Kami dapat memperbarui kebijakan ini seiring perubahan layanan atau tuntutan hukum. Tanggal “terakhir diperbarui” di atas menunjukkan versi terkini. Untuk perubahan penting, kami memberi pemberitahuan yang jelas — misalnya pesan di dasbor atau Discord — dan, bila perlu persetujuan, meminta lagi." },
      ],
    },
    {
      id: "contact",
      title: "15. Hubungi kami",
      blocks: [
        { p: `Untuk pertanyaan privasi atau menggunakan hakmu, hubungi ${LEGAL.controller} lewat salah satu kanal berikut. Sertakan email akunmu dan apa yang kamu inginkan.` },
      ],
    },
  ],
};

export default id;
