import { LEGAL, type Policy } from "../shared";

const vi: Policy = {
  title: "Chính sách quyền riêng tư",
  subtitle: "Chúng tôi thu thập dữ liệu gì, vì sao, ai được xem, và bạn có những lựa chọn nào — bằng ngôn ngữ dễ hiểu.",
  updatedLabel: "Cập nhật lần cuối",
  tocLabel: "Trong trang này",
  backLabel: "Quay lại trang chủ",
  contactLabels: { discord: "Discord (phiếu hỗ trợ)", whatsapp: "WhatsApp", email: "Email" },
  sections: [
    {
      id: "summary",
      title: "1. Tóm tắt",
      blocks: [
        { p: "ArrStudio bán các bộ kit Roblox có giấy phép. Để vận hành, chúng tôi cần tài khoản, cách nhận thanh toán và cách đảm bảo khóa giấy phép chỉ được dùng trên các place đã đăng ký. Chính sách này giải thích các dữ liệu cá nhân liên quan." },
        {
          ul: [
            "Chúng tôi chỉ thu thập mức tối thiểu cần thiết: thông tin tài khoản, đơn hàng và giấy phép, cùng dữ liệu kỹ thuật để giữ dịch vụ an toàn.",
            "Chúng tôi không bán dữ liệu cá nhân của bạn và không chia sẻ cho mục đích quảng cáo. Trang web này không có cookie quảng cáo hay theo dõi.",
            "Thanh toán do Midtrans xử lý. Chúng tôi không bao giờ thấy hay lưu số thẻ hoặc thông tin ví điện tử của bạn.",
            "Bạn có thể tự xuất dữ liệu và xóa tài khoản tại Dashboard → Account, hoặc yêu cầu chúng tôi làm (mục 9).",
          ],
        },
      ],
    },
    {
      id: "who",
      title: "2. Chúng tôi là ai và phạm vi chính sách",
      blocks: [
        { p: `${LEGAL.controller} (“ArrStudio”, “chúng tôi”) là bên kiểm soát dữ liệu cá nhân được mô tả ở đây. Chính sách áp dụng cho trang web, bảng điều khiển khách hàng, công cụ quản trị chúng tôi dùng để vận hành, API kiểm tra giấy phép mà các kit Roblox của chúng tôi gọi, cùng các kênh mua hàng và hỗ trợ.` },
        { p: "Chính sách không bao gồm các dịch vụ bên thứ ba mà chúng tôi liên kết đến hoặc bạn dùng cùng dịch vụ của chúng tôi (Roblox, Discord, WhatsApp, ngân hàng của bạn). Họ có chính sách riêng mà bạn nên đọc." },
      ],
    },
    {
      id: "collect",
      title: "3. Dữ liệu chúng tôi thu thập",
      blocks: [
        { p: "Chúng tôi thu thập dữ liệu theo ba cách: những gì bạn cung cấp, những gì phát sinh khi bạn dùng dịch vụ, và những gì đến từ dịch vụ bạn kết nối." },
        {
          table: {
            head: ["Nhóm", "Bao gồm", "Nguồn"],
            rows: [
              ["Tài khoản", "Địa chỉ email, tên hiển thị, tên người dùng Roblox (tùy chọn), ID tài khoản duy nhất, cách đăng ký, và mật khẩu (chỉ lưu dưới dạng hash bởi Firebase Authentication — chúng tôi không thể đọc).", "Bạn"],
              ["Đăng nhập Discord", "Nếu đăng nhập bằng Discord: ID người dùng Discord, tên người dùng, URL ảnh đại diện và, khi đã xác minh, email của bạn.", "Discord, với sự cho phép của bạn"],
              ["Đơn hàng & thanh toán", "Đã mua gì, giá, mã giảm giá đã dùng, loại phương thức thanh toán (vd. QRIS, chuyển khoản), trạng thái và thời gian. Với trả góp: tổng tiền, số đã trả, ngày và ghi chú do đội ngũ chúng tôi ghi sau khi kiểm tra chứng từ chuyển khoản.", "Bạn / Midtrans / đội ngũ chúng tôi"],
              ["Chứng từ chuyển khoản", "Nếu bạn gửi chứng từ chuyển khoản qua Discord hoặc WhatsApp: hình ảnh hoặc tin nhắn bạn gửi, có thể hiển thị tên và thông tin tài khoản của bạn.", "Bạn"],
              ["Thanh toán QRIS", "Nếu bạn thanh toán bằng QRIS, tên người trả và số tiền hiển thị trong tài khoản merchant của chúng tôi (GoPay Merchant) và sao kê ngân hàng của bạn. Chúng tôi chỉ dùng để đối chiếu khoản thanh toán.", "Bạn / ngân hàng hoặc ví của bạn"],
              ["Giấy phép", "Khóa giấy phép, kit, ID place Roblox gắn với khóa, số slot place, ngày cấp và trạng thái.", "Do chúng tôi tạo / bạn"],
              ["Kiểm tra giấy phép", "Mỗi lần máy chủ game khởi động, kit của chúng tôi gọi API giấy phép. Chúng tôi nhận khóa, ID kit, phiên bản kit, ID place và ID job máy chủ Roblox, cùng địa chỉ IP máy chủ của bạn. Chúng tôi chỉ lưu thời điểm kiểm tra gần nhất, phiên bản và tổng số lần — không lưu toàn bộ lịch sử.", "Máy chủ game Roblox của bạn"],
              ["Kỹ thuật & bảo mật", "Địa chỉ IP, loại trình duyệt và thiết bị, trang đã yêu cầu, thời gian, nhật ký lỗi; bộ đếm giới hạn tần suất (lưu bằng khóa đã băm); báo cáo vi phạm content-security-policy.", "Tự động"],
              ["Hoạt động quản trị", "Với tài khoản nhân sự: nhật ký các thao tác quản trị (ai làm gì, khi nào).", "Tự động"],
              ["Liên lạc", "Tin nhắn bạn gửi trên Discord hoặc WhatsApp, cùng định danh Discord / WhatsApp của bạn.", "Bạn"],
            ],
          },
        },
        { p: "Chúng tôi không chủ ý thu thập dữ liệu cá nhân nhạy cảm (như sức khỏe, sinh trắc học, chính trị) và không yêu cầu giấy tờ tùy thân." },
        { note: "Ảnh thu nhỏ và tên place Roblox trong bảng điều khiển được lấy từ API công khai của Roblox bằng các ID place bạn đã đăng ký. Chúng tôi không nhận dữ liệu nào khác về tài khoản Roblox của bạn." },
      ],
    },
    {
      id: "use",
      title: "4. Vì sao chúng tôi dùng dữ liệu (và cơ sở pháp lý)",
      blocks: [
        {
          table: {
            head: ["Mục đích", "Dữ liệu sử dụng", "Cơ sở pháp lý"],
            rows: [
              ["Tạo và bảo vệ tài khoản, đăng nhập cho bạn", "Tài khoản, kỹ thuật", "Hợp đồng; lợi ích hợp pháp (bảo mật)"],
              ["Nhận thanh toán, cấp giấy phép, gửi tệp kit", "Tài khoản, đơn hàng, giấy phép", "Hợp đồng"],
              ["Đảm bảo khóa chỉ dùng trên place đã đăng ký, và chặn giấy phép bị thu hồi hoặc chưa thanh toán đủ", "Giấy phép, kiểm tra giấy phép", "Hợp đồng; lợi ích hợp pháp (chống vi phạm bản quyền và gian lận)"],
              ["Quản lý trả góp và mở khóa giấy phép khi đã thanh toán đủ", "Đơn hàng, hồ sơ trả góp", "Hợp đồng"],
              ["Hỗ trợ và trả lời tin nhắn của bạn", "Liên lạc, tài khoản, giấy phép", "Hợp đồng; lợi ích hợp pháp"],
              ["Ngăn chặn lạm dụng, gian lận và tấn công (giới hạn tần suất, 2FA nhân sự, nhật ký kiểm toán)", "Kỹ thuật, hoạt động quản trị", "Lợi ích hợp pháp; nghĩa vụ pháp lý khi áp dụng"],
              ["Ghi nhớ ngôn ngữ bạn chọn", "Cookie ngôn ngữ", "Sự đồng ý của bạn (có thể từ chối ở banner cookie)"],
              ["Lưu hồ sơ tài chính và thuế", "Đơn hàng, thanh toán", "Nghĩa vụ pháp lý"],
              ["Gửi thông báo dịch vụ (vd. về giấy phép hoặc thanh toán)", "Tài khoản, đơn hàng", "Hợp đồng; lợi ích hợp pháp"],
            ],
          },
        },
        { p: "Khi dựa vào lợi ích hợp pháp, chúng tôi cân nhắc nó với quyền của bạn. Bạn có thể phản đối việc xử lý dựa trên lợi ích hợp pháp — xem mục 9." },
        { p: "Chúng tôi không dùng dữ liệu của bạn cho quảng cáo, lập hồ sơ tiếp thị, hoặc đưa ra quyết định có tác động pháp lý hay đáng kể tương tự đối với bạn chỉ dựa trên xử lý tự động. Quyết định tự động duy nhất là thực thi giấy phép: khóa bị từ chối khi bị thu hồi, chưa thanh toán đủ, dùng trên place chưa đăng ký, hoặc đã hết slot place. Nếu bạn cho rằng việc từ chối là sai, hãy liên hệ và sẽ có người xem xét." },
      ],
    },
    {
      id: "cookies",
      title: "5. Cookie và bộ nhớ cục bộ",
      blocks: [
        { p: "Chúng tôi chỉ dùng một số ít cookie. Cookie thiết yếu không thể tắt vì dịch vụ sẽ không hoạt động nếu thiếu. Bạn có thể chọn “Chỉ cần thiết” ở banner cookie, và mở lại lựa chọn bất cứ lúc nào qua “Cài đặt cookie” ở chân trang." },
        {
          table: {
            head: ["Tên", "Mục đích", "Loại", "Thời hạn"],
            rows: [
              ["__session", "Giữ bạn đăng nhập (HTTP-only, secure)", "Thiết yếu", "Tối đa 5 ngày"],
              ["arr_user", "Gợi ý không nhạy cảm (tên hiển thị và vai trò) để menu hiển thị mà không cần thêm yêu cầu", "Thiết yếu", "Tối đa 5 ngày"],
              ["discord_oauth_state", "Bảo vệ đăng nhập Discord khỏi giả mạo", "Thiết yếu", "Vài phút"],
              ["__mfa", "Xác nhận nhân sự đã hoàn tất xác minh hai bước", "Thiết yếu (chỉ nhân sự)", "12 giờ"],
              ["arr_consent", "Ghi nhớ lựa chọn cookie của bạn", "Thiết yếu", "1 năm"],
              ["NEXT_LOCALE", "Ghi nhớ ngôn ngữ bạn chọn", "Tùy chọn — chỉ khi bạn đồng ý", "1 năm"],
              ["theme (local storage)", "Tùy chọn hiển thị sáng / tối", "Chức năng", "Đến khi bạn xóa dữ liệu trình duyệt"],
              ["Trạng thái đăng nhập Firebase (IndexedDB)", "Giữ kết nối trực tiếp tới dữ liệu giấy phép của chính bạn trong bảng điều khiển", "Thiết yếu", "Khi đang đăng nhập"],
            ],
          },
        },
        { p: "Khi bạn mở cửa sổ thanh toán, Midtrans tải script riêng và có thể đặt cookie riêng để chống gian lận và xử lý thanh toán. Các cookie đó tuân theo chính sách của Midtrans." },
        { p: "Bạn cũng có thể xóa hoặc chặn cookie trong cài đặt trình duyệt. Chặn cookie thiết yếu sẽ khiến bạn không đăng nhập được." },
      ],
    },
    {
      id: "sharing",
      title: "6. Chúng tôi chia sẻ dữ liệu với ai",
      blocks: [
        { p: "Chúng tôi chỉ chia sẻ dữ liệu với các nhà cung cấp dịch vụ giúp vận hành ArrStudio, theo điều khoản yêu cầu họ bảo vệ dữ liệu, và khi pháp luật yêu cầu. Chúng tôi không bán dữ liệu cá nhân và không chia sẻ cho quảng cáo hành vi đa ngữ cảnh." },
        {
          table: {
            head: ["Nhà cung cấp", "Vai trò với chúng tôi", "Dữ liệu liên quan"],
            rows: [
              ["Google (Firebase Authentication, Cloud Firestore)", "Đăng nhập và cơ sở dữ liệu của chúng tôi", "Tài khoản, đơn hàng, giấy phép, nhật ký"],
              ["Vercel", "Lưu trữ web, lưu tệp kit và video, nhật ký yêu cầu", "Mọi yêu cầu web, tệp tải lên"],
              ["Midtrans", "Xử lý thanh toán (QRIS, tài khoản ảo, ví điện tử, thẻ)", "Tên, email, đơn hàng và số tiền; thông tin thanh toán nhập tại Midtrans, không phải chỗ chúng tôi"],
              ["GoPay Merchant (QRIS)", "Nhận thanh toán QRIS vào tài khoản merchant của chúng tôi", "Tên người trả và số tiền hiển thị cùng giao dịch"],
              ["Discord", "“Đăng nhập bằng Discord” và cộng đồng hỗ trợ", "ID Discord, tên người dùng, ảnh đại diện, email đã xác minh"],
              ["Roblox", "Tên và biểu tượng place công khai; kiểm tra giấy phép đến từ máy chủ game của bạn", "ID place"],
              ["WhatsApp (Meta)", "Đơn hàng riêng và hỗ trợ, nếu bạn nhắn cho chúng tôi ở đó", "Số điện thoại và tin nhắn của bạn"],
            ],
          },
        },
        { p: "Chúng tôi cũng có thể tiết lộ dữ liệu khi pháp luật, tòa án hoặc cơ quan có thẩm quyền yêu cầu, để thực thi điều khoản, bảo vệ quyền của chúng tôi, người dùng hoặc công chúng, hoặc trong trường hợp sáp nhập, mua lại hay bán tài sản (bạn sẽ được thông báo trước và bên nhận phải tuân thủ chính sách này)." },
        { p: "Khóa giấy phép và ID place đã đăng ký của bạn chỉ hiển thị với bạn, quản trị viên của chúng tôi và, trong phạm vi cần thiết, các dịch vụ nêu trên. Khách hàng khác không thể thấy." },
      ],
    },
    {
      id: "transfers",
      title: "7. Chuyển dữ liệu quốc tế",
      blocks: [
        { p: "Các nhà cung cấp của chúng tôi hoạt động toàn cầu, nên dữ liệu của bạn có thể được xử lý ở quốc gia khác nơi bạn sống — gồm Indonesia, Hoa Kỳ, Singapore và những nơi Google, Vercel, Midtrans hoặc Discord hoạt động." },
        { p: "Khi pháp luật yêu cầu, chúng tôi dựa vào các biện pháp bảo vệ phù hợp cho việc chuyển này, như điều khoản hợp đồng chuẩn của nhà cung cấp, quyết định về mức độ bảo vệ tương đương, hoặc sự đồng ý của bạn. Hãy liên hệ để biết chi tiết." },
      ],
    },
    {
      id: "retention",
      title: "8. Chúng tôi lưu dữ liệu bao lâu",
      blocks: [
        {
          table: {
            head: ["Dữ liệu", "Thời gian lưu"],
            rows: [
              ["Hồ sơ tài khoản", "Khi tài khoản còn tồn tại. Xóa ngay khi bạn xóa tài khoản tại Dashboard → Account (hoặc trong 30 ngày nếu bạn yêu cầu chúng tôi)."],
              ["Giấy phép và ID place đã gắn", "Khi giấy phép còn hiệu lực. Sau khi bạn xóa tài khoản, giấy phép bị thu hồi và được giữ lại không kèm email hay ID của bạn tối đa 3 năm để xử lý tranh chấp."],
              ["Đơn hàng, thanh toán và hồ sơ trả góp", "Theo thời hạn luật thuế và kế toán yêu cầu (tại Indonesia thường tối đa 10 năm). Sau khi xóa tài khoản, được giữ lại không kèm danh tính của bạn."],
              ["Dữ liệu kiểm tra giấy phép (lần cuối, phiên bản, số lần)", "Lưu trong hồ sơ giấy phép chừng nào hồ sơ đó còn tồn tại."],
              ["Phiên và cookie đăng nhập", "Tối đa 5 ngày; 12 giờ cho trạng thái hai bước của nhân sự."],
              ["Bộ đếm giới hạn tần suất", "Tự động xóa trong vài phút đến vài giờ."],
              ["Nhật ký kiểm toán quản trị", "Tối thiểu 24 tháng, phục vụ bảo mật và kế toán."],
              ["Nhật ký máy chủ và bảo mật", "Theo thời hạn lưu của nhà cung cấp lưu trữ (thường vài ngày đến vài tuần)."],
              ["Tin nhắn hỗ trợ", "Tối đa 3 năm sau khi cuộc trò chuyện kết thúc, hoặc đến khi bạn yêu cầu xóa."],
            ],
          },
        },
        { p: "Khi hết thời hạn lưu, chúng tôi xóa hoặc ẩn danh dữ liệu. Bản sao lưu được ghi đè theo chu kỳ bình thường của nhà cung cấp." },
      ],
    },
    {
      id: "rights",
      title: "9. Quyền của bạn",
      blocks: [
        { p: "Tùy nơi bạn sinh sống, bạn có một số hoặc tất cả các quyền sau đối với dữ liệu cá nhân:" },
        {
          ul: [
            "Truy cập — nhận bản sao dữ liệu chúng tôi lưu về bạn.",
            "Chỉnh sửa — sửa dữ liệu sai hoặc thiếu (bạn có thể sửa tên và tên người dùng Roblox trong tài khoản).",
            "Xóa — tự xóa tài khoản tại Dashboard → Account, hoặc yêu cầu chúng tôi. Chúng tôi chỉ giữ những gì pháp luật yêu cầu hoặc cần để bảo vệ các yêu cầu pháp lý (mục 8).",
            "Hạn chế và phản đối — yêu cầu tạm dừng xử lý, hoặc phản đối việc xử lý dựa trên lợi ích hợp pháp.",
            "Chuyển dữ liệu — tải dữ liệu của bạn dưới dạng tệp JSON từ Dashboard → Account, hoặc yêu cầu chúng tôi.",
            "Rút lại sự đồng ý — ví dụ, đổi lựa chọn cookie bất cứ lúc nào. Việc rút lại không ảnh hưởng đến xử lý trước đó.",
            "Khiếu nại — tới cơ quan bảo vệ dữ liệu của quốc gia bạn.",
          ],
        },
        { p: "Xuất dữ liệu và xóa tài khoản hoạt động ngay từ bảng điều khiển. Với yêu cầu khác, hãy liên hệ chúng tôi (mục 15). Chúng tôi có thể yêu cầu bạn chứng minh quyền sở hữu tài khoản trước, và phản hồi trong 30 ngày (hoặc sớm hơn nếu luật yêu cầu). Chúng tôi không thu phí trừ khi yêu cầu rõ ràng quá mức." },
        { p: "Lưu ý theo khu vực:" },
        {
          ul: [
            "Việt Nam — theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, bạn có quyền được biết, đồng ý hoặc không đồng ý, truy cập, chỉnh sửa, xóa, hạn chế xử lý, cung cấp dữ liệu, phản đối xử lý, khiếu nại và yêu cầu bồi thường thiệt hại.",
            "Indonesia — theo Luật số 27 năm 2022 về Bảo vệ Dữ liệu Cá nhân, bạn có quyền truy cập, chỉnh sửa, xóa, hạn chế, rút lại sự đồng ý, phản đối xử lý tự động và yêu cầu bồi thường khi bị vi phạm.",
            "Khu vực Kinh tế châu Âu và Vương quốc Anh — áp dụng các quyền GDPR / UK GDPR nêu trên, và bạn có thể khiếu nại tới cơ quan giám sát địa phương.",
            "California — bạn có quyền biết, xóa và chỉnh sửa thông tin cá nhân và từ chối việc bán hoặc chia sẻ. Chúng tôi không bán hay chia sẻ thông tin cá nhân, và không phân biệt đối xử khi bạn thực hiện các quyền này.",
            "Philippines (Data Privacy Act 2012), Malaysia (PDPA 2010) và Thái Lan (PDPA 2019) — bạn có các quyền truy cập, chỉnh sửa, xóa, phản đối và rút lại sự đồng ý theo các luật đó, và chúng tôi tôn trọng chúng.",
          ],
        },
      ],
    },
    {
      id: "security",
      title: "10. Cách chúng tôi bảo vệ dữ liệu",
      blocks: [
        {
          ul: [
            "Mã hóa khi truyền (HTTPS kèm HSTS) trên mọi trang và lệnh gọi API.",
            "Mật khẩu do Firebase Authentication xử lý và lưu dưới dạng hash; chúng tôi không bao giờ thấy.",
            "Phiên dùng cookie HTTP-only, secure, same-site và được kiểm tra với Firebase ở mỗi yêu cầu.",
            "Kiểm soát truy cập chặt: cơ sở dữ liệu chỉ máy chủ của chúng tôi mới ghi được, và mỗi khách hàng chỉ đọc được giấy phép của chính mình.",
            "Tài khoản nhân sự bắt buộc xác thực hai yếu tố (ứng dụng xác thực kèm mã dự phòng); bí mật hai yếu tố được mã hóa khi lưu.",
            "Giới hạn tần suất, chống phát lại và bộ đếm đã băm bảo vệ đăng nhập, kiểm tra giấy phép, mã giảm giá và thanh toán.",
            "Xác nhận thanh toán được kiểm chứng bằng chữ ký mật mã và kiểm tra lại trực tiếp với Midtrans trước khi cấp bất kỳ giấy phép nào.",
            "Nhật ký kiểm toán ghi lại các thao tác quản trị liên quan đến tiền, giấy phép, vai trò và giá.",
            "Mô-đun kit được mã hóa và chỉ mở khóa cho giấy phép hợp lệ, đã thanh toán và đã đăng ký.",
          ],
        },
        { p: "Không hệ thống nào an toàn tuyệt đối. Nếu bạn phát hiện lỗ hổng, vui lòng báo riêng cho chúng tôi qua các kênh liên hệ bên dưới trước khi công bố. Hãy giữ kín mật khẩu, khóa giấy phép và tệp place Roblox của bạn." },
        { p: "Nếu xảy ra vi phạm ảnh hưởng đến dữ liệu cá nhân của bạn và pháp luật yêu cầu, chúng tôi sẽ thông báo cho bạn và cơ quan có thẩm quyền trong thời hạn luật định (ví dụ 72 giờ tới cơ quan theo GDPR)." },
      ],
    },
    {
      id: "payments",
      title: "11. Thanh toán và trả góp",
      blocks: [
        { p: "Thanh toán trực tuyến chạy qua Midtrans. Bạn nhập thông tin thẻ, ngân hàng hoặc ví điện tử trên trang của Midtrans; chúng tôi chỉ nhận kết quả (đã trả, chờ xử lý, thất bại), loại phương thức thanh toán và số tiền." },
        { p: "Bạn cũng có thể thanh toán bằng QRIS vào tài khoản merchant của chúng tôi (GoPay Merchant). Chúng tôi thấy tên người trả và số tiền trong tài khoản đó; chúng tôi đối chiếu khoản thanh toán với đơn hàng bằng chứng từ chuyển khoản bạn gửi, và không dùng thông tin đó cho việc nào khác." },
        { p: "Kế hoạch trả góp được thỏa thuận trực tiếp với chúng tôi. Đội ngũ ghi lại từng khoản chuyển đã xác nhận (số tiền, ngày, ghi chú tùy chọn) vào giấy phép của bạn. Cho đến khi thanh toán đủ, giấy phép bị khóa: khóa bị ẩn, không tải được tệp kit và kiểm tra giấy phép thất bại. Chứng từ chuyển khoản bạn gửi qua Discord hoặc WhatsApp chỉ dùng để xác nhận thanh toán." },
        { p: "Mã giảm giá bạn nhập được kiểm tra trên máy chủ của chúng tôi và tính vào giới hạn sử dụng của mã; nó không gắn với hồ sơ nào ngoài đơn hàng đã dùng mã." },
      ],
    },
    {
      id: "children",
      title: "12. Trẻ em",
      blocks: [
        { p: "Dịch vụ của chúng tôi không hướng đến trẻ em dưới 13 tuổi (hoặc độ tuổi tối thiểu đồng ý kỹ thuật số cao hơn tại quốc gia bạn, như 16 tuổi ở một số nơi trong EU). Chúng tôi không cố ý thu thập dữ liệu của các em. Nếu bạn là phụ huynh hoặc người giám hộ và tin rằng một trẻ đã cung cấp dữ liệu cá nhân cho chúng tôi, hãy liên hệ và chúng tôi sẽ xóa." },
        { p: "Nhiều nhà sáng tạo Roblox là thiếu niên. Nếu bạn chưa đủ tuổi thành niên tại nơi bạn sống, vui lòng mua hàng khi có sự cho phép của phụ huynh hoặc người giám hộ." },
      ],
    },
    {
      id: "thirdparty",
      title: "13. Liên kết và dịch vụ bên thứ ba",
      blocks: [
        { p: "Trang web của chúng tôi có liên kết đến Discord, WhatsApp, Roblox và các trang mẫu do chúng tôi xây dựng. Khi bạn theo liên kết, chính sách của dịch vụ đó sẽ áp dụng. Chúng tôi không chịu trách nhiệm về nội dung hay hoạt động của họ." },
        { p: "Các kit bạn cài trong game Roblox của mình chạy trên máy chủ của bạn. Mọi dữ liệu về người chơi mà game của bạn thu thập do bạn quản lý; kit của chúng tôi chỉ gửi dữ liệu kiểm tra giấy phép như mô tả ở mục 3." },
      ],
    },
    {
      id: "changes",
      title: "14. Thay đổi chính sách",
      blocks: [
        { p: "Chúng tôi có thể cập nhật chính sách này khi dịch vụ thay đổi hoặc pháp luật yêu cầu. Ngày “cập nhật lần cuối” ở trên cho biết phiên bản hiện tại. Với thay đổi quan trọng, chúng tôi sẽ thông báo rõ ràng — ví dụ qua tin nhắn trong bảng điều khiển hoặc Discord — và, khi cần sự đồng ý, sẽ xin lại." },
      ],
    },
    {
      id: "contact",
      title: "15. Liên hệ chúng tôi",
      blocks: [
        { p: `Với câu hỏi về quyền riêng tư hoặc để thực hiện quyền của bạn, hãy liên hệ ${LEGAL.controller} qua một trong các kênh sau. Vui lòng kèm email tài khoản và điều bạn muốn chúng tôi làm.` },
      ],
    },
  ],
};

export default vi;
