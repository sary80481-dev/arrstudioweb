import { LEGAL, type Policy } from "../shared";

const fil: Policy = {
  title: "Patakaran sa Privacy",
  subtitle: "Anong data ang kinokolekta namin, bakit, sino ang nakakakita nito, at ang mga pagpipilian mo — sa simpleng wika.",
  updatedLabel: "Huling na-update",
  tocLabel: "Sa pahinang ito",
  backLabel: "Bumalik sa site",
  contactLabels: { discord: "Discord (support ticket)", whatsapp: "WhatsApp", email: "Email" },
  sections: [
    {
      id: "summary",
      title: "1. Maikling bersyon",
      blocks: [
        { p: "Nagbebenta ang ArrStudio ng mga lisensyadong Roblox kit. Para patakbuhin ito, kailangan namin ng account, paraan para tumanggap ng bayad, at paraan para matiyak na ang license key ay ginagamit lang sa mga place kung saan ito nakarehistro. Ipinapaliwanag ng patakarang ito ang personal na data na kasangkot." },
        {
          ul: [
            "Kinokolekta lang namin ang kailangan: detalye ng account mo, mga order at lisensya, at teknikal na data para mapanatiling ligtas ang serbisyo.",
            "Hindi namin ibinebenta ang personal na data mo at hindi namin ito ibinabahagi para sa advertising. Walang ad o tracking cookies sa site na ito.",
            "Ang mga bayad ay hawak ng Midtrans. Hindi namin nakikita o iniimbak ang card number o e-wallet credentials mo.",
            "Maaari mong i-export ang data mo at burahin ang sarili mong account sa Dashboard → Account, o hilingin sa amin na gawin ito (seksyon 9).",
          ],
        },
      ],
    },
    {
      id: "who",
      title: "2. Sino kami at saklaw ng patakarang ito",
      blocks: [
        { p: `Ang ${LEGAL.controller} (“ArrStudio”, “kami”) ang controller ng personal na data na inilalarawan dito. Saklaw nito ang website, ang customer dashboard, ang admin tools na ginagamit namin sa pagpapatakbo, ang license-check API na tinatawag ng aming mga Roblox kit, at ang aming mga channel sa pagbili at suporta.` },
        { p: "Hindi nito sakop ang mga serbisyo ng third party na ini-link namin o ginagamit mo kasabay ng amin (Roblox, Discord, WhatsApp, bangko mo). May sarili silang patakaran na dapat mong basahin." },
      ],
    },
    {
      id: "collect",
      title: "3. Data na kinokolekta namin",
      blocks: [
        { p: "Kinokolekta namin ang data sa tatlong paraan: ang ibinibigay mo, ang nabubuo kapag ginagamit mo ang serbisyo, at ang galing sa mga serbisyong ikinonekta mo." },
        {
          table: {
            head: ["Kategorya", "Laman", "Pinagmulan"],
            rows: [
              ["Account", "Email address, display name, opsyonal na Roblox username, natatanging account ID, paraan ng pag-sign up, at password (iniimbak lang bilang hash ng Firebase Authentication — hindi namin ito mababasa).", "Ikaw"],
              ["Discord login", "Kung nag-sign in ka gamit ang Discord: Discord user ID, username, avatar URL at, kung na-verify, ang email mo.", "Discord, sa pahintulot mo"],
              ["Mga order at bayad", "Ano ang binili, presyo, discount code na ginamit, uri ng paraan ng bayad (hal. QRIS, bank transfer), status at oras. Para sa hulugan: kabuuan, mga halagang nabayaran, petsa at tala na itinala ng team namin matapos suriin ang patunay ng transfer.", "Ikaw / Midtrans / team namin"],
              ["Patunay ng transfer", "Kung magpadala ka ng patunay ng transfer sa Discord o WhatsApp: ang larawan o mensaheng ipinadala mo, na maaaring magpakita ng pangalan at detalye ng account mo.", "Ikaw"],
              ["Bayad sa QRIS", "Kung magbayad ka sa QRIS, lumalabas ang pangalan ng nagbayad at halaga sa merchant account namin (GoPay Merchant) at sa bank statement mo. Ginagamit lang namin ito para itugma ang bayad mo.", "Ikaw / bangko o e-wallet mo"],
              ["Mga lisensya", "Mga license key, ang kit, mga Roblox place ID na nakatali sa key, bilang ng place slot, petsa ng pagkakaloob at status.", "Binuo namin / ikaw"],
              ["Mga license check", "Tuwing nagsisimula ang game server, tinatawag ng kit namin ang license API. Natatanggap namin ang key, kit ID, bersyon ng kit, Roblox place ID at server job ID, at IP address ng server mo. Ang huling oras ng check, bersyon at kabuuang bilang lang ang itinatabi namin — hindi ang buong kasaysayan.", "Mga Roblox game server mo"],
              ["Teknikal at seguridad", "IP address, uri ng browser at device, mga hiniling na pahina, oras at error log; rate-limit counter (nakaimbak sa hashed na key); ulat ng paglabag sa content-security-policy.", "Awtomatiko"],
              ["Aktibidad ng admin", "Para sa mga staff account namin: talaan ng mga administratibong gawain (sino ang gumawa ng ano at kailan).", "Awtomatiko"],
              ["Komunikasyon", "Mga mensaheng ipinadala mo sa Discord o WhatsApp, at ang Discord / WhatsApp identifier mo.", "Ikaw"],
            ],
          },
        },
        { p: "Hindi namin sinasadyang mangolekta ng sensitibong personal na data (tulad ng kalusugan, biometric o pulitikal), at hindi kami humihingi ng government ID." },
        { note: "Ang mga thumbnail at pangalan ng Roblox place sa dashboard mo ay kinukuha mula sa pampublikong API ng Roblox gamit ang mga place ID na inirehistro mo. Wala kaming natatanggap na ibang data tungkol sa Roblox account mo." },
      ],
    },
    {
      id: "use",
      title: "4. Bakit namin ginagamit ang data mo (at ang legal na batayan)",
      blocks: [
        {
          table: {
            head: ["Layunin", "Data na ginagamit", "Legal na batayan"],
            rows: [
              ["Gumawa at pangalagaan ang account mo, i-sign in ka", "Account, teknikal", "Kontrata; lehitimong interes (seguridad)"],
              ["Tumanggap ng bayad, magbigay ng lisensya, magpadala ng kit file", "Account, mga order, lisensya", "Kontrata"],
              ["Tiyaking ang key ay ginagamit lang sa mga rehistradong place, at harangin ang mga binawing o hindi pa bayad na lisensya", "Lisensya, license check", "Kontrata; lehitimong interes (pag-iwas sa pamimirata at panloloko)"],
              ["Pamahalaan ang hulugan at i-unlock ang lisensya kapag bayad na lahat", "Mga order, tala ng hulugan", "Kontrata"],
              ["Magbigay ng suporta at sagutin ang mga mensahe mo", "Komunikasyon, account, lisensya", "Kontrata; lehitimong interes"],
              ["Pigilan ang pang-aabuso, panloloko at pag-atake (rate limit, 2FA ng staff, audit log)", "Teknikal, aktibidad ng admin", "Lehitimong interes; legal na obligasyon kung naaangkop"],
              ["Tandaan ang napili mong wika", "Language cookie", "Pahintulot mo (maaari mong tanggihan sa cookie banner)"],
              ["Itago ang mga talaan sa pananalapi at buwis", "Mga order, bayad", "Legal na obligasyon"],
              ["Magpadala ng mga mensahe ng serbisyo (hal. tungkol sa lisensya o bayad)", "Account, mga order", "Kontrata; lehitimong interes"],
            ],
          },
        },
        { p: "Kapag umaasa kami sa lehitimong interes, tinitimbang namin ito laban sa mga karapatan mo. Maaari kang tumutol sa pagproseso batay sa lehitimong interes — tingnan ang seksyon 9." },
        { p: "Hindi namin ginagamit ang data mo para sa advertising, marketing profiling, o para gumawa ng desisyong may legal o katulad na malaking epekto sa iyo batay lamang sa awtomatikong pagproseso. Ang tanging awtomatikong desisyon ay ang pagpapatupad ng lisensya: tinatanggihan ang key kapag binawi, hindi pa bayad, ginamit sa hindi rehistradong place, o puno na ang place slot nito. Kung sa tingin mo ay mali ang pagtanggi, makipag-ugnayan sa amin at susuriin ito ng isang tao." },
      ],
    },
    {
      id: "cookies",
      title: "5. Cookies at local storage",
      blocks: [
        { p: "Kaunti lang ang cookies na ginagamit namin. Hindi maaaring patayin ang mahahalaga dahil hindi gagana ang serbisyo kung wala ang mga ito. Maaari mong piliin ang “Mahahalaga lang” sa cookie banner, at buksan muli ang pagpili anumang oras sa “Mga setting ng cookie” sa footer." },
        {
          table: {
            head: ["Pangalan", "Layunin", "Uri", "Tagal"],
            rows: [
              ["__session", "Pinapanatili kang naka-sign in (HTTP-only, secure)", "Mahalaga", "Hanggang 5 araw"],
              ["arr_user", "Hindi sensitibong pahiwatig (display name at role) para lumabas ang menu nang walang dagdag na request", "Mahalaga", "Hanggang 5 araw"],
              ["discord_oauth_state", "Pinoprotektahan ang Discord sign-in laban sa pamemeke", "Mahalaga", "Ilang minuto"],
              ["__mfa", "Nagpapatunay na natapos ng staff ang two-factor verification", "Mahalaga (staff lang)", "12 oras"],
              ["arr_consent", "Tinatandaan ang pagpili mo sa cookie", "Mahalaga", "1 taon"],
              ["NEXT_LOCALE", "Tinatandaan ang napili mong wika", "Kagustuhan — kung tatanggapin mo lang", "1 taon"],
              ["theme (local storage)", "Kagustuhan sa light / dark na display", "Functional", "Hanggang burahin mo ang browser data"],
              ["Firebase auth state (IndexedDB)", "Pinapanatili ang live na koneksyon sa sarili mong license data sa dashboard", "Mahalaga", "Habang naka-sign in"],
            ],
          },
        },
        { p: "Kapag binuksan mo ang payment pop-up, naglo-load ang Midtrans ng sarili nitong mga script at maaaring magtakda ng sarili nitong cookies para sa pag-iwas sa panloloko at pagproseso ng bayad. Sakop ang mga iyon ng patakaran ng Midtrans." },
        { p: "Maaari mo ring burahin o harangin ang cookies sa browser settings. Ang pagharang sa mahahalagang cookies ay pipigil sa pag-sign in." },
      ],
    },
    {
      id: "sharing",
      title: "6. Kanino namin ibinabahagi ang data",
      blocks: [
        { p: "Nagbabahagi lang kami ng data sa mga service provider na tumutulong sa pagpapatakbo ng ArrStudio, sa ilalim ng mga tuntuning nag-oobliga sa kanilang protektahan ito, at kapag hinihingi ng batas. Hindi namin ibinebenta ang personal na data at hindi ibinabahagi para sa cross-context behavioral advertising." },
        {
          table: {
            head: ["Provider", "Ginagawa para sa amin", "Kaugnay na data"],
            rows: [
              ["Google (Firebase Authentication, Cloud Firestore)", "Sign-in at database namin", "Account, mga order, lisensya, log"],
              ["Vercel", "Website hosting, imbakan ng kit file at video, request log", "Lahat ng web request, mga na-upload na file"],
              ["Midtrans", "Pagproseso ng bayad (QRIS, virtual account, e-wallet, card)", "Pangalan, email, order at halaga; ang detalye ng bayad ay inilalagay sa Midtrans, hindi sa amin"],
              ["GoPay Merchant (QRIS)", "Tumatanggap ng QRIS payment sa merchant account namin", "Pangalan ng nagbayad at halagang lumalabas kasama ng transfer"],
              ["Discord", "“Mag-sign in gamit ang Discord” at ang support community namin", "Discord ID, username, avatar, na-verify na email"],
              ["Roblox", "Pampublikong pangalan at icon ng place; ang license check ay galing sa game server mo", "Mga place ID"],
              ["WhatsApp (Meta)", "Mga custom na order at suporta, kung doon mo kami kinontak", "Numero at mga mensahe mo"],
            ],
          },
        },
        { p: "Maaari rin kaming maglabas ng data kung hinihingi ng batas, korte o karampatang awtoridad, para ipatupad ang aming mga tuntunin, protektahan ang aming mga karapatan, mga user o publiko, o sa merger, acquisition o bentahan ng asset (aabisuhan ka muna at dapat igalang ng tatanggap ang patakarang ito)." },
        { p: "Ang license key at mga rehistradong place ID mo ay nakikita lang ng iyo, ng aming mga administrator at, hanggang sa kinakailangan, ng mga serbisyong nakalista sa itaas. Hindi sila nakikita ng ibang customer." },
      ],
    },
    {
      id: "transfers",
      title: "7. Paglilipat sa ibang bansa",
      blocks: [
        { p: "Pandaigdigan ang operasyon ng aming mga provider, kaya maaaring iproseso ang data mo sa ibang bansa bukod sa iyo — kasama ang Indonesia, Estados Unidos, Singapore at iba pang lugar kung saan nag-ooperate ang Google, Vercel, Midtrans o Discord." },
        { p: "Kung hinihingi ng batas, umaasa kami sa naaangkop na safeguards para sa mga paglilipat na ito, tulad ng standard contractual clauses ng mga provider, adequacy decisions, o ang pahintulot mo. Makipag-ugnayan sa amin para sa detalye." },
      ],
    },
    {
      id: "retention",
      title: "8. Gaano katagal namin itinatago ang data",
      blocks: [
        {
          table: {
            head: ["Data", "Gaano katagal"],
            rows: [
              ["Profile ng account", "Habang umiiral ang account mo. Agad na binubura kapag binura mo ang account sa Dashboard → Account (o sa loob ng 30 araw kung hihilingin mo sa amin)."],
              ["Mga lisensya at nakatali na place ID", "Habang aktibo ang lisensya. Kapag binura mo ang account, binabawi ang lisensya at itinatago nang walang email o ID mo hanggang 3 taon para sa paghawak ng mga alitan."],
              ["Mga order, bayad at tala ng hulugan", "Hangga't hinihingi ng batas sa buwis at accounting (sa Indonesia, karaniwang hanggang 10 taon). Pagkatapos ng pagbura ng account, itinatago ang mga ito nang walang pagkakakilanlan mo."],
              ["Data ng license check (huling check, bersyon, bilang)", "Nakaimbak sa talaan ng lisensya hangga't umiiral ang talaang iyon."],
              ["Mga session at sign-in cookie", "Hanggang 5 araw; 12 oras para sa two-factor status ng staff."],
              ["Mga rate-limit counter", "Awtomatikong binubura sa loob ng ilang minuto hanggang oras."],
              ["Admin audit log", "Hindi bababa sa 24 na buwan, para sa seguridad at accounting."],
              ["Server at security log", "Ayon sa retention ng hosting provider namin (karaniwan ay ilang araw hanggang ilang linggo)."],
              ["Mga mensahe sa suporta", "Hanggang 3 taon pagkatapos ng usapan, o hanggang hilingin mong burahin ang mga ito."],
            ],
          },
        },
        { p: "Kapag natapos ang retention, binubura o ina-anonymize namin ang data. Ang mga backup ay ino-overwrite ayon sa normal na siklo ng provider." },
      ],
    },
    {
      id: "rights",
      title: "9. Mga karapatan mo",
      blocks: [
        { p: "Depende kung saan ka nakatira, mayroon kang ilan o lahat ng mga karapatang ito sa personal na data mo:" },
        {
          ul: [
            "Access — makakuha ng kopya ng data na hawak namin tungkol sa iyo.",
            "Pagwawasto — ayusin ang maling o kulang na data (maaari mong i-edit ang pangalan at Roblox username mo sa account).",
            "Pagbura — burahin ang sarili mong account sa Dashboard → Account, o hilingin sa amin. Itinatago lang namin ang hinihingi ng batas o kailangan para ipagtanggol ang mga legal na claim (seksyon 8).",
            "Paghihigpit at pagtutol — hilingin na ihinto muna ang pagproseso, o tumutol sa pagproseso batay sa lehitimong interes.",
            "Portability — i-download ang data mo bilang JSON file mula sa Dashboard → Account, o hilingin sa amin.",
            "Bawiin ang pahintulot — halimbawa, baguhin ang pagpili mo sa cookie anumang oras. Hindi naaapektuhan ng pagbawi ang naunang pagproseso.",
            "Magreklamo — sa data-protection authority ng iyong bansa.",
          ],
        },
        { p: "Agad na gumagana ang pag-export ng data at pagbura ng account mula sa dashboard mo. Para sa ibang kahilingan, makipag-ugnayan sa amin (seksyon 15). Maaari ka naming hilingang patunayan muna na ikaw ang may-ari ng account, at sasagot kami sa loob ng 30 araw (o mas maaga kung hinihingi ng batas). Hindi kami naniningil maliban kung malinaw na labis ang kahilingan." },
        { p: "Mga tala ayon sa rehiyon:" },
        {
          ul: [
            "Pilipinas — sa ilalim ng Data Privacy Act of 2012 (RA 10173), may karapatan kang malaman, i-access, itama, hadlangan o burahin ang personal na data mo, tumutol sa pagproseso, humingi ng data portability, at magreklamo sa National Privacy Commission.",
            "Indonesia — ayon sa Batas Blg. 27 ng 2022 sa Proteksyon ng Personal na Data, may karapatan kang mag-access, magtama, magbura, maghigpit, bawiin ang pahintulot, tumutol sa awtomatikong pagproseso at humingi ng danyos para sa mga paglabag.",
            "European Economic Area at United Kingdom — nalalapat ang mga karapatan sa GDPR / UK GDPR sa itaas, at maaari kang magreklamo sa lokal na supervisory authority.",
            "California — may karapatan kang malaman, burahin at itama ang personal na impormasyon at tumangging ibenta o ibahagi ito. Hindi namin ibinebenta o ibinabahagi ang personal na impormasyon, at hindi kami nandidiskrimina sa paggamit ng mga karapatang ito.",
            "Malaysia (PDPA 2010), Thailand (PDPA 2019) at Vietnam (Decree 13/2023/ND-CP) — mayroon kang mga karapatan sa access, pagwawasto, pagbura, pagtutol at pagbawi ng pahintulot na ibinibigay ng mga batas na iyon, at iginagalang namin ang mga ito.",
          ],
        },
      ],
    },
    {
      id: "security",
      title: "10. Paano namin pinoprotektahan ang data mo",
      blocks: [
        {
          ul: [
            "Encryption habang ipinapadala (HTTPS na may HSTS) sa bawat pahina at API call.",
            "Ang mga password ay hawak ng Firebase Authentication at iniimbak bilang hash; hindi namin ito nakikita.",
            "Gumagamit ang mga session ng HTTP-only, secure, same-site na cookies at sinusuri sa Firebase sa bawat request.",
            "Mahigpit na access control: ang database ay masusulatan lang ng server namin, at nababasa lang ng bawat customer ang sarili niyang lisensya.",
            "Kailangan ng two-factor authentication ang mga staff account (authenticator app na may backup codes); naka-encrypt ang mga two-factor secret habang nakaimbak.",
            "Pinoprotektahan ng rate limiting, anti-replay at hashed counters ang sign-in, license check, discount code at bayad.",
            "Bine-verify ang kumpirmasyon ng bayad gamit ang cryptographic signature at muling sinusuri direkta sa Midtrans bago magbigay ng anumang lisensya.",
            "Itinatala ng audit log ang mga administratibong gawain sa pera, lisensya, role at presyo.",
            "Naka-encrypt ang mga kit module at nag-a-unlock lang para sa mga balido, bayad at rehistradong lisensya.",
          ],
        },
        { p: "Walang sistemang ganap na ligtas. Kung makakita ka ng kahinaan, pakisabi sa amin nang pribado sa mga contact sa ibaba bago ito isapubliko. Panatilihing pribado ang password, license key at Roblox place file mo." },
        { p: "Kung may paglabag na nakaaapekto sa personal na data mo at hinihingi ng batas, aabisuhan ka namin at ang karampatang awtoridad sa loob ng oras na hinihingi ng batas (halimbawa, 72 oras sa awtoridad sa ilalim ng GDPR)." },
      ],
    },
    {
      id: "payments",
      title: "11. Mga bayad at hulugan",
      blocks: [
        { p: "Dumadaan sa Midtrans ang mga online na bayad. Ilalagay mo ang detalye ng card, bangko o e-wallet sa mga pahina ng Midtrans; ang natatanggap lang namin ay ang resulta (bayad, nakabinbin, nabigo), ang uri ng paraan ng bayad at ang halaga." },
        { p: "Maaari ka ring magbayad sa QRIS sa merchant account namin (GoPay Merchant). Nakikita namin sa account na iyon ang pangalan ng nagbayad at halaga; itinutugma namin ang bayad sa order mo gamit ang patunay ng transfer na ipinadala mo, at hindi namin ginagamit ang impormasyong iyon sa iba." },
        { p: "Direkta sa amin inaayos ang mga hulugan. Itinatala ng team namin ang bawat kumpirmadong transfer (halaga, petsa, opsyonal na tala) sa lisensya mo. Hanggang hindi pa ganap na bayad ang plano, naka-lock ang lisensya mo: nakatago ang key, hindi ma-download ang kit file at pumapalya ang license check. Ginagamit lang ang mga patunay ng transfer na ipinadala mo sa Discord o WhatsApp para kumpirmahin ang bayad." },
        { p: "Ang mga discount code na inilalagay mo ay sinusuri sa server namin at binibilang laban sa limitasyon ng paggamit ng code; hindi ito iniuugnay sa anumang profile maliban sa order kung saan ito ginamit." },
      ],
    },
    {
      id: "children",
      title: "12. Mga bata",
      blocks: [
        { p: "Hindi nakatuon ang serbisyo namin sa mga batang wala pang 13 taong gulang (o sa mas mataas na minimum na edad ng digital consent sa bansa mo, tulad ng 16 sa ilang bahagi ng EU). Hindi namin sinasadyang mangolekta ng kanilang data. Kung ikaw ay magulang o tagapag-alaga at naniniwalang nagbigay ng personal na data sa amin ang isang bata, makipag-ugnayan sa amin at buburahin namin ito." },
        { p: "Maraming Roblox creator ang mga tinedyer. Kung wala ka pa sa edad ng pagtanda sa tinitirhan mo, mangyaring bumili nang may pahintulot ng magulang o tagapag-alaga." },
      ],
    },
    {
      id: "thirdparty",
      title: "13. Mga link at serbisyo ng third party",
      blocks: [
        { p: "May mga link ang site namin sa Discord, WhatsApp, Roblox at sa mga sample site na ginawa namin. Kapag sinundan mo ang link, ang patakaran ng ibang serbisyo ang nalalapat. Hindi kami responsable sa nilalaman o gawain nila." },
        { p: "Ang mga kit na ini-install mo sa sarili mong Roblox game ay tumatakbo sa mga server mo. Ang anumang data ng mga manlalaro na kinokolekta ng game mo ay ikaw ang may hawak; ang mga kit namin ay nagpapadala lang ng license-check data na inilarawan sa seksyon 3." },
      ],
    },
    {
      id: "changes",
      title: "14. Mga pagbabago sa patakarang ito",
      blocks: [
        { p: "Maaari naming i-update ang patakarang ito kapag nagbago ang serbisyo o hinihingi ng batas. Ipinapakita ng petsang “huling na-update” sa itaas ang kasalukuyang bersyon. Para sa mahahalagang pagbabago, magbibigay kami ng malinaw na abiso — halimbawa, mensahe sa dashboard mo o sa Discord — at, kung kailangan ng pahintulot, hihingin ulit ito." },
      ],
    },
    {
      id: "contact",
      title: "15. Makipag-ugnayan sa amin",
      blocks: [
        { p: `Para sa mga tanong sa privacy o para gamitin ang mga karapatan mo, makipag-ugnayan sa ${LEGAL.controller} sa alinman sa mga channel na ito. Isama ang email ng account mo at kung ano ang nais mong gawin namin.` },
      ],
    },
  ],
};

export default fil;
