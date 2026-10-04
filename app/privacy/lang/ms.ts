import { LEGAL, type Policy } from "../shared";

const ms: Policy = {
  title: "Dasar Privasi",
  subtitle: "Data apa yang kami kumpulkan, mengapa, siapa yang boleh melihatnya, dan pilihan yang anda ada — dalam bahasa yang mudah.",
  updatedLabel: "Dikemas kini kali terakhir",
  tocLabel: "Dalam halaman ini",
  backLabel: "Kembali ke laman",
  contactLabels: { discord: "Discord (tiket bantuan)", whatsapp: "WhatsApp", email: "E-mel" },
  sections: [
    {
      id: "summary",
      title: "1. Versi ringkas",
      blocks: [
        { p: "ArrStudio menjual kit Roblox berlesen. Untuk menjalankan perkhidmatan ini kami memerlukan akaun, cara menerima bayaran, dan cara memastikan kunci lesen hanya digunakan pada place yang didaftarkan. Dasar ini menerangkan data peribadi yang terlibat." },
        {
          ul: [
            "Kami mengumpul sekadar perlu: butiran akaun, pesanan dan lesen, serta data teknikal untuk memastikan perkhidmatan selamat.",
            "Kami tidak menjual data peribadi anda dan tidak berkongsinya untuk pengiklanan. Tiada kuki iklan atau penjejak di laman ini.",
            "Pembayaran diproses oleh Midtrans. Kami tidak pernah melihat atau menyimpan nombor kad atau kelayakan e-dompet anda.",
            "Anda boleh mengeksport data dan memadam akaun sendiri di Papan Pemuka → Account, atau meminta kami melakukannya (bahagian 9).",
          ],
        },
      ],
    },
    {
      id: "who",
      title: "2. Siapa kami dan skop dasar ini",
      blocks: [
        { p: `${LEGAL.controller} (“ArrStudio”, “kami”) ialah pengawal data peribadi yang diterangkan di sini. Dasar ini meliputi laman web, papan pemuka pelanggan, alat pentadbir yang kami gunakan untuk menjalankan perkhidmatan, API semakan lesen yang dipanggil oleh kit Roblox kami, serta saluran pembelian dan bantuan kami.` },
        { p: "Dasar ini tidak meliputi perkhidmatan pihak ketiga yang kami pautkan atau yang anda gunakan bersama perkhidmatan kami (Roblox, Discord, WhatsApp, bank anda). Mereka mempunyai dasar sendiri yang patut anda baca." },
      ],
    },
    {
      id: "collect",
      title: "3. Data yang kami kumpulkan",
      blocks: [
        { p: "Kami mengumpul data dalam tiga cara: apa yang anda berikan, apa yang tercipta semasa anda menggunakan perkhidmatan, dan apa yang datang daripada perkhidmatan yang anda sambungkan." },
        {
          table: {
            head: ["Kategori", "Kandungan", "Sumber"],
            rows: [
              ["Akaun", "Alamat e-mel, nama paparan, nama pengguna Roblox (pilihan), ID akaun unik, cara pendaftaran, dan kata laluan (hanya disimpan sebagai hash oleh Firebase Authentication — kami tidak dapat membacanya).", "Anda"],
              ["Log masuk Discord", "Jika anda log masuk dengan Discord: ID pengguna, nama pengguna, URL avatar dan e-mel jika disahkan.", "Discord, dengan kebenaran anda"],
              ["Pesanan & pembayaran", "Apa yang dibeli, harga, kod diskaun yang digunakan, jenis kaedah bayaran (cth. QRIS, pindahan bank), status dan masa. Untuk ansuran: jumlah, jumlah yang telah dibayar, tarikh dan nota yang direkod pasukan kami selepas menyemak bukti pindahan.", "Anda / Midtrans / pasukan kami"],
              ["Bukti pindahan", "Jika anda menghantar bukti pindahan melalui Discord atau WhatsApp: imej atau mesej yang anda hantar, yang mungkin memaparkan nama dan butiran akaun anda.", "Anda"],
              ["Pembayaran QRIS", "Jika anda membayar melalui QRIS, nama pembayar dan jumlah dipaparkan dalam akaun peniaga kami (GoPay Merchant) dan penyata bank anda. Kami menggunakannya hanya untuk memadankan pembayaran anda.", "Anda / bank atau e-dompet anda"],
              ["Lesen", "Kunci lesen, kit, ID place Roblox yang terikat pada kunci, bilangan slot place, tarikh dikeluarkan dan status.", "Dijana oleh kami / anda"],
              ["Semakan lesen", "Setiap kali pelayan permainan dimulakan, kit kami memanggil API lesen. Kami menerima kunci, ID kit, versi kit, ID place dan ID job pelayan Roblox, serta alamat IP pelayan anda. Kami hanya menyimpan masa semakan terakhir, versi dan kiraan keseluruhan — bukan sejarah penuh.", "Pelayan permainan Roblox anda"],
              ["Teknikal & keselamatan", "Alamat IP, jenis pelayar dan peranti, halaman yang diminta, masa, log ralat; pembilang had permintaan (disimpan dengan kunci ter-hash); laporan pelanggaran content-security-policy.", "Automatik"],
              ["Aktiviti pentadbir", "Untuk akaun kakitangan kami: log tindakan pentadbiran (siapa melakukan apa dan bila).", "Automatik"],
              ["Komunikasi", "Mesej yang anda hantar di Discord atau WhatsApp, serta pengenalan Discord / WhatsApp anda.", "Anda"],
            ],
          },
        },
        { p: "Kami tidak sengaja mengumpul data peribadi sensitif (seperti data kesihatan, biometrik atau politik), dan kami tidak meminta kad pengenalan." },
        { note: "Lakaran kecil dan nama place Roblox dalam papan pemuka anda diambil daripada API awam Roblox menggunakan ID place yang anda daftarkan. Kami tidak menerima data lain tentang akaun Roblox anda." },
      ],
    },
    {
      id: "use",
      title: "4. Mengapa kami menggunakan data anda (dan asas undang-undangnya)",
      blocks: [
        {
          table: {
            head: ["Tujuan", "Data yang digunakan", "Asas undang-undang"],
            rows: [
              ["Mencipta dan melindungi akaun, melog masuk anda", "Akaun, teknikal", "Kontrak; kepentingan sah (keselamatan)"],
              ["Menerima bayaran, mengeluarkan lesen, menghantar fail kit", "Akaun, pesanan, lesen", "Kontrak"],
              ["Memastikan kunci hanya digunakan pada place berdaftar, dan menolak lesen yang dibatalkan atau belum dijelaskan", "Lesen, semakan lesen", "Kontrak; kepentingan sah (mencegah cetak rompak dan penipuan)"],
              ["Menguruskan ansuran dan membuka lesen selepas dijelaskan sepenuhnya", "Pesanan, rekod ansuran", "Kontrak"],
              ["Memberi bantuan dan membalas mesej anda", "Komunikasi, akaun, lesen", "Kontrak; kepentingan sah"],
              ["Mencegah penyalahgunaan, penipuan dan serangan (had permintaan, 2FA kakitangan, log audit)", "Teknikal, aktiviti pentadbir", "Kepentingan sah; kewajipan undang-undang jika berkenaan"],
              ["Mengingati pilihan bahasa anda", "Kuki bahasa", "Persetujuan anda (boleh ditolak pada sepanduk kuki)"],
              ["Menyimpan rekod kewangan dan cukai", "Pesanan, pembayaran", "Kewajipan undang-undang"],
              ["Menghantar mesej perkhidmatan (cth. tentang lesen atau pembayaran)", "Akaun, pesanan", "Kontrak; kepentingan sah"],
            ],
          },
        },
        { p: "Apabila kami bergantung pada kepentingan sah, kami menimbangnya dengan hak anda. Anda boleh membantah pemprosesan berasaskan kepentingan sah — lihat bahagian 9." },
        { p: "Kami tidak menggunakan data anda untuk pengiklanan, pemprofilan pemasaran, atau keputusan yang memberi kesan undang-undang atau kesan ketara kepada anda berdasarkan pemprosesan automatik semata-mata. Satu-satunya keputusan automatik ialah penguatkuasaan lesen: kunci ditolak apabila dibatalkan, belum dijelaskan, digunakan pada place yang tidak berdaftar, atau slot place sudah penuh. Jika anda rasa penolakan itu salah, hubungi kami dan seorang kakitangan akan menyemaknya." },
      ],
    },
    {
      id: "cookies",
      title: "5. Kuki dan storan setempat",
      blocks: [
        { p: "Kami hanya menggunakan beberapa kuki. Kuki penting tidak boleh dimatikan kerana perkhidmatan tidak akan berfungsi tanpanya. Anda boleh memilih “Yang perlu sahaja” pada sepanduk kuki, dan membuka semula pilihan itu pada bila-bila masa melalui “Tetapan kuki” di pengaki." },
        {
          table: {
            head: ["Nama", "Fungsi", "Jenis", "Tempoh"],
            rows: [
              ["__session", "Mengekalkan anda log masuk (HTTP-only, secure)", "Penting", "Sehingga 5 hari"],
              ["arr_user", "Petunjuk tidak sensitif (nama paparan dan peranan) supaya menu dapat dipaparkan tanpa permintaan tambahan", "Penting", "Sehingga 5 hari"],
              ["discord_oauth_state", "Melindungi log masuk Discord daripada pemalsuan", "Penting", "Beberapa minit"],
              ["__mfa", "Menandakan kakitangan telah lulus pengesahan dua langkah", "Penting (kakitangan sahaja)", "12 jam"],
              ["arr_consent", "Mengingati pilihan kuki anda", "Penting", "1 tahun"],
              ["NEXT_LOCALE", "Mengingati bahasa pilihan anda", "Keutamaan — hanya jika anda bersetuju", "1 tahun"],
              ["theme (local storage)", "Keutamaan paparan terang / gelap", "Fungsian", "Sehingga data pelayar dipadam"],
              ["Status log masuk Firebase (IndexedDB)", "Mengekalkan sambungan langsung ke data lesen anda dalam papan pemuka", "Penting", "Semasa log masuk"],
            ],
          },
        },
        { p: "Apabila tetingkap pembayaran dibuka, Midtrans memuatkan skripnya sendiri dan mungkin menetapkan kukinya sendiri untuk pencegahan penipuan dan pemprosesan bayaran. Itu tertakluk kepada dasar Midtrans." },
        { p: "Anda juga boleh memadam atau menyekat kuki dalam tetapan pelayar. Menyekat kuki penting akan menghalang log masuk." },
      ],
    },
    {
      id: "sharing",
      title: "6. Dengan siapa data dikongsi",
      blocks: [
        { p: "Kami hanya berkongsi data dengan penyedia perkhidmatan yang membantu kami menjalankan ArrStudio, di bawah terma yang mewajibkan mereka melindunginya, dan apabila undang-undang menghendaki. Kami tidak menjual data peribadi dan tidak berkongsinya untuk pengiklanan tingkah laku merentas konteks." },
        {
          table: {
            head: ["Penyedia", "Peranan untuk kami", "Data berkaitan"],
            rows: [
              ["Google (Firebase Authentication, Cloud Firestore)", "Log masuk dan pangkalan data kami", "Akaun, pesanan, lesen, log"],
              ["Vercel", "Pengehosan laman, storan fail kit dan video, log permintaan", "Semua permintaan web, fail yang dimuat naik"],
              ["Midtrans", "Pemprosesan bayaran (QRIS, akaun maya, e-dompet, kad)", "Nama, e-mel, pesanan dan jumlah; butiran bayaran dimasukkan di Midtrans, bukan di kami"],
              ["GoPay Merchant (QRIS)", "Menerima bayaran QRIS ke akaun peniaga kami", "Nama pembayar dan jumlah yang dipaparkan bersama pindahan"],
              ["Discord", "“Log masuk dengan Discord” dan komuniti bantuan kami", "ID Discord, nama pengguna, avatar, e-mel yang disahkan"],
              ["Roblox", "Nama dan ikon place yang awam; semakan lesen datang daripada pelayan permainan anda", "ID place"],
              ["WhatsApp (Meta)", "Pesanan khas dan bantuan, jika anda menghubungi kami di sana", "Nombor dan mesej anda"],
            ],
          },
        },
        { p: "Kami juga boleh mendedahkan data jika dikehendaki oleh undang-undang, mahkamah atau pihak berkuasa, untuk menguatkuasakan terma kami, melindungi hak kami, pengguna atau orang awam, atau dalam penggabungan, pengambilalihan atau penjualan aset (anda akan dimaklumkan terlebih dahulu dan penerima mesti menghormati dasar ini)." },
        { p: "Kunci lesen dan ID place berdaftar anda hanya kelihatan kepada anda, pentadbir kami dan, setakat perlu, perkhidmatan yang disenaraikan di atas. Pelanggan lain tidak dapat melihatnya." },
      ],
    },
    {
      id: "transfers",
      title: "7. Pemindahan antarabangsa",
      blocks: [
        { p: "Penyedia kami beroperasi di seluruh dunia, jadi data anda mungkin diproses di negara selain negara anda — termasuk Indonesia, Amerika Syarikat, Singapura dan tempat lain di mana Google, Vercel, Midtrans atau Discord beroperasi." },
        { p: "Jika undang-undang menghendaki, kami bergantung pada perlindungan yang sesuai untuk pemindahan ini, seperti klausa kontrak standard penyedia, keputusan kecukupan, atau persetujuan anda. Hubungi kami untuk butiran." },
      ],
    },
    {
      id: "retention",
      title: "8. Berapa lama data disimpan",
      blocks: [
        {
          table: {
            head: ["Data", "Tempoh"],
            rows: [
              ["Profil akaun", "Selagi akaun anda wujud. Dipadam serta-merta apabila anda memadam akaun di Papan Pemuka → Account (atau dalam 30 hari jika anda meminta kami)."],
              ["Lesen dan ID place terikat", "Selagi lesen aktif. Selepas akaun anda dipadam, lesen dibatalkan dan disimpan tanpa e-mel atau ID anda sehingga 3 tahun untuk menangani pertikaian."],
              ["Pesanan, bayaran dan rekod ansuran", "Selama yang dikehendaki undang-undang cukai dan perakaunan (di Indonesia, amnya sehingga 10 tahun). Selepas akaun dipadam, ia disimpan tanpa identiti anda."],
              ["Data semakan lesen (semakan terakhir, versi, kiraan)", "Disimpan pada rekod lesen selagi rekod itu wujud."],
              ["Sesi dan kuki log masuk", "Sehingga 5 hari; 12 jam untuk status dua langkah kakitangan."],
              ["Pembilang had permintaan", "Dipadam secara automatik dalam beberapa minit hingga jam."],
              ["Log audit pentadbir", "Sekurang-kurangnya 24 bulan, untuk keselamatan dan perakaunan."],
              ["Log pelayan dan keselamatan", "Mengikut tempoh simpan penyedia pengehosan (biasanya beberapa hari hingga beberapa minggu)."],
              ["Mesej bantuan", "Sehingga 3 tahun selepas perbualan tamat, atau sehingga anda meminta pemadaman."],
            ],
          },
        },
        { p: "Selepas tempoh simpan tamat, kami memadam atau menganonimkan data. Sandaran ditulis ganti mengikut kitaran biasa penyedia." },
      ],
    },
    {
      id: "rights",
      title: "9. Hak anda",
      blocks: [
        { p: "Bergantung pada tempat tinggal anda, anda mempunyai sebahagian atau semua hak berikut ke atas data peribadi anda:" },
        {
          ul: [
            "Akses — mendapatkan salinan data yang kami simpan tentang anda.",
            "Pembetulan — membetulkan data yang salah atau tidak lengkap (anda boleh menyunting nama dan nama pengguna Roblox dalam akaun).",
            "Pemadaman — padam akaun anda sendiri di Papan Pemuka → Account, atau minta kami. Kami hanya menyimpan apa yang dikehendaki undang-undang atau perlu untuk mempertahankan tuntutan undang-undang (bahagian 8).",
            "Sekatan dan bantahan — meminta pemprosesan dihentikan sementara, atau membantah pemprosesan berasaskan kepentingan sah.",
            "Kebolehpindahan — muat turun data anda sebagai fail JSON dari Papan Pemuka → Account, atau minta kami.",
            "Tarik balik persetujuan — contohnya, tukar pilihan kuki pada bila-bila masa. Penarikan tidak menjejaskan pemprosesan terdahulu.",
            "Mengadu — kepada pihak berkuasa perlindungan data anda.",
          ],
        },
        { p: "Eksport data dan pemadaman akaun berfungsi serta-merta dari papan pemuka anda. Untuk permintaan lain, hubungi kami (bahagian 15). Kami mungkin meminta bukti bahawa anda pemilik akaun terlebih dahulu, dan membalas dalam 30 hari (atau lebih awal jika undang-undang menghendaki). Kami tidak mengenakan bayaran melainkan permintaan itu jelas keterlaluan." },
        { p: "Catatan mengikut wilayah:" },
        {
          ul: [
            "Malaysia — di bawah Akta Perlindungan Data Peribadi 2010 (PDPA), anda berhak mengakses dan membetulkan data peribadi anda, menarik balik persetujuan, dan menghalang pemprosesan yang mungkin menyebabkan kerosakan atau distres.",
            "Indonesia — menurut UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, anda berhak mengakses, membetulkan, memadam, menyekat, menarik balik persetujuan, membantah pemprosesan automatik dan menuntut ganti rugi atas pelanggaran.",
            "Kawasan Ekonomi Eropah dan United Kingdom — hak GDPR / UK GDPR di atas terpakai, dan anda boleh membuat aduan kepada pihak berkuasa penyeliaan tempatan.",
            "California — anda berhak mengetahui, memadam dan membetulkan maklumat peribadi serta menolak penjualan atau perkongsiannya. Kami tidak menjual atau berkongsi maklumat peribadi, dan tidak mendiskriminasi pengguna yang menggunakan hak ini.",
            "Filipina (Data Privacy Act 2012), Thailand (PDPA 2019) dan Vietnam (Decree 13/2023/ND-CP) — anda mempunyai hak akses, pembetulan, pemadaman, bantahan dan penarikan balik persetujuan yang diperuntukkan undang-undang tersebut, dan kami menghormatinya.",
          ],
        },
      ],
    },
    {
      id: "security",
      title: "10. Cara kami melindungi data anda",
      blocks: [
        {
          ul: [
            "Penyulitan semasa penghantaran (HTTPS dengan HSTS) pada setiap halaman dan panggilan API.",
            "Kata laluan diurus oleh Firebase Authentication dan disimpan sebagai hash; kami tidak pernah melihatnya.",
            "Sesi menggunakan kuki HTTP-only, secure, same-site dan disemak dengan Firebase pada setiap permintaan.",
            "Kawalan akses ketat: pangkalan data hanya boleh ditulis oleh pelayan kami, dan setiap pelanggan hanya boleh membaca lesen sendiri.",
            "Akaun kakitangan memerlukan pengesahan dua faktor (aplikasi pengesah dengan kod sandaran); rahsia dua faktor disulitkan semasa disimpan.",
            "Had permintaan, perlindungan anti-ulang dan pembilang ter-hash melindungi log masuk, semakan lesen, kod diskaun dan pembayaran.",
            "Pengesahan bayaran disahkan dengan tandatangan kriptografi dan disemak semula terus dengan Midtrans sebelum sebarang lesen dikeluarkan.",
            "Log audit merekod tindakan pentadbiran ke atas wang, lesen, peranan dan harga.",
            "Modul kit disulitkan dan hanya terbuka untuk lesen yang sah, dijelaskan dan berdaftar.",
          ],
        },
        { p: "Tiada sistem yang selamat sepenuhnya. Jika anda menemui kelemahan, sila maklumkan kami secara peribadi melalui kenalan di bawah sebelum mendedahkannya kepada umum. Rahsiakan kata laluan, kunci lesen dan fail place Roblox anda." },
        { p: "Jika berlaku pelanggaran yang menjejaskan data peribadi anda dan undang-undang menghendakinya, kami memaklumkan anda dan pihak berkuasa dalam tempoh yang dikehendaki (contohnya, 72 jam kepada pihak berkuasa di bawah GDPR)." },
      ],
    },
    {
      id: "payments",
      title: "11. Pembayaran dan ansuran",
      blocks: [
        { p: "Pembayaran dalam talian berjalan melalui Midtrans. Anda memasukkan butiran kad, bank atau e-dompet di halaman Midtrans; kami hanya menerima keputusannya (dibayar, menunggu, gagal), jenis kaedah bayaran dan jumlah." },
        { p: "Anda juga boleh membayar melalui QRIS ke akaun peniaga kami (GoPay Merchant). Nama pembayar dan jumlah kelihatan kepada kami dalam akaun itu; kami memadankan bayaran dengan pesanan anda menggunakan bukti pindahan yang anda hantar, dan tidak menggunakan maklumat itu untuk perkara lain." },
        { p: "Pelan ansuran diatur terus dengan kami. Pasukan kami merekod setiap pindahan yang disahkan (jumlah, tarikh, nota pilihan) pada lesen anda. Selagi pelan belum dijelaskan sepenuhnya, lesen anda kekal terkunci: kunci disembunyikan, fail kit tidak boleh dimuat turun dan semakan lesen gagal. Bukti pindahan yang anda hantar di Discord atau WhatsApp hanya digunakan untuk mengesahkan pembayaran." },
        { p: "Kod diskaun yang anda masukkan disemak pada pelayan kami dan dikira terhadap had penggunaan kod; ia tidak dikaitkan dengan sebarang profil selain pesanan di mana ia digunakan." },
      ],
    },
    {
      id: "children",
      title: "12. Kanak-kanak",
      blocks: [
        { p: "Perkhidmatan kami tidak ditujukan kepada kanak-kanak bawah 13 tahun (atau umur minimum persetujuan digital yang lebih tinggi di negara anda, seperti 16 tahun di sesetengah bahagian EU). Kami tidak dengan sengaja mengumpul data mereka. Jika anda ibu bapa atau penjaga dan percaya seorang kanak-kanak memberi kami data peribadi, hubungi kami dan kami akan memadamnya." },
        { p: "Ramai pencipta Roblox ialah remaja. Jika anda di bawah umur dewasa di tempat anda tinggal, sila membeli dengan kebenaran ibu bapa atau penjaga." },
      ],
    },
    {
      id: "thirdparty",
      title: "13. Pautan dan perkhidmatan pihak ketiga",
      blocks: [
        { p: "Laman kami memaut ke Discord, WhatsApp, Roblox dan laman contoh yang kami bina. Apabila anda mengikuti pautan, dasar perkhidmatan lain itu yang terpakai. Kami tidak bertanggungjawab atas kandungan atau amalan mereka." },
        { p: "Kit yang anda pasang dalam permainan Roblox anda berjalan pada pelayan anda. Data pemain yang dikumpul permainan anda ialah tanggungjawab anda; kit kami hanya menghantar data semakan lesen seperti diterangkan dalam bahagian 3." },
      ],
    },
    {
      id: "changes",
      title: "14. Perubahan dasar ini",
      blocks: [
        { p: "Kami boleh mengemas kini dasar ini apabila perkhidmatan berubah atau undang-undang menghendaki. Tarikh “dikemas kini kali terakhir” di atas menunjukkan versi semasa. Untuk perubahan ketara, kami akan memberi notis yang jelas — contohnya mesej dalam papan pemuka atau di Discord — dan, jika persetujuan diperlukan, memintanya semula." },
      ],
    },
    {
      id: "contact",
      title: "15. Hubungi kami",
      blocks: [
        { p: `Untuk soalan privasi atau menggunakan hak anda, hubungi ${LEGAL.controller} melalui mana-mana saluran berikut. Sertakan e-mel akaun anda dan apa yang anda mahu kami lakukan.` },
      ],
    },
  ],
};

export default ms;
