# Thành viên 5: Trương Thùy Linh - 2312380014

## Vai trò trong dự án

- Phụ trách: Trưởng nhóm (Leader), Thiết kế kiến trúc hệ thống (System Architecture), Quản lý luồng game cốt lõi (Core Game Loop), Quản trị dự án (Project Management) và Tích hợp kỹ thuật toàn diện (Technical Integration).
- Chi tiết công việc quản lý & điều phối:
  - Nghiên cứu bài toán tài chính, phân rã ý tưởng lớn thành ma trận phân chia công việc (Task Division) và lập lịch trình phát triển cuốn chiếu theo tuần (Timetable).
  - Thiết lập và quản trị kho mã nguồn trên GitHub, kiểm soát các nhánh tính năng, xử lý xung đột (Merge conflicts) và phê duyệt Pull Request.
  - Đóng vai trò là cầu nối kỹ thuật, trực tiếp tư vấn, hướng dẫn và cùng các thành viên khác chỉnh sửa, tối ưu hóa từ bước lên ý tưởng (Idea), định hình cấu trúc dữ liệu (Data) cho đến khi tích hợp code hoàn chỉnh vào game.

## Dấu ấn cá nhân trong sản phẩm

Dấu ấn lớn nhất của em nằm ở tệp trung tâm game.js và cấu trúc điều phối dòng chảy của trò chơi. Em đã xây dựng "trục xương sống" cho Strive & Thrive bằng cách thiết lập đối tượng trạng thái state tập trung làm nguồn dữ liệu duy nhất (Single Source of Truth). Dấu ấn này không chỉ nằm ở những dòng lệnh, mà nằm ở việc đồng bộ hóa tư duy của cả 5 thành viên: biến các ý tưởng kịch bản, mô hình toán kinh tế riêng lẻ và các bản vẽ giao diện tĩnh từ các bạn thành một thực thể game chạy mượt mà, phản hồi thời gian thực qua 5 vòng đời (từ 22 đến 26 tuổi) của nhân vật.

## Những việc đã thực sự làm

- Thiết kế kiến trúc, phân chia công việc (Task Division) & lập lịch trình (Timetable): Em tiến hành bóc tách ý tưởng game thành các gói công việc độc lập để giao đúng người: M1 làm nội dung/QA, M2 & M3 lo thuật toán kinh tế, M4 thiết kế UI/UX. Đồng thời, em lập lịch trình 4 tuần nghiêm ngặt từ khâu Concept => Dev Module => Integration => QA/Refactor.
- Thiết lập hệ thống GitHub và quản trị mã nguồn: Em khởi tạo Repository, cấu trúc các nhánh tính năng (feature/), cấu hình tệp README và thiết lập "khế ước code" chung cho cả đội. Em trực tiếp review code và xử lý các ca xung đột mã nguồn phức tạp tại tệp index.html khi ráp nối sản phẩm.
- Đồng thiết kế, chuẩn hóa ý tưởng kịch bản và dữ liệu Sự kiện cùng M1 (Content & QA): Em đã hỗ trợ M1 chuyển hóa ý tưởng kịch bản văn bản thuần text sang cấu trúc mảng đối tượng JSON (LIFE_EVENTS, MARKET_EVENTS) trong data.js. Em định hướng cho M1 cách thiết lập các thuộc tính tác động (impact) như cash, physicalHealth, mentalHealth để thuật toán của game có thể đọc hiểu tự động. Hướng dẫn M1 xây dựng test matrix cho các trường hợp biên.
- Tinh chỉnh mô hình toán tài chính và sức khỏe cùng M2 (Income/Expense) & M3 (Investment): Em làm việc sát sao với M2 để cấu trúc lại các hàm tính toán chi phí cơ bản (BASE_EXPENSES) và hệ số nhân thể chất. Em tư vấn cho M3 cấu trúc dữ liệu biến động giá tài sản (STOCK_PRICE_CHANGES), ép các thuật toán phức tạp này về dạng các hàm thuần túy (Pure Functions) để tránh việc các bạn tự ý can thiệp làm sai lệch dữ liệu toàn cục.
- Định hình Design System và liên kết giao diện cùng M4 (UI/UX): Em phối hợp với M4 ngay từ bước xây dựng tệp component-demo.html nhằm thống nhất các ID, Class, và các hiệu ứng hoạt họa. Em hướng dẫn M4 đóng gói các hàm hiển thị vào không gian tên UI (như UI.updateAllStats(), UI.showScreen()), đảm bảo giao diện thay đổi linh hoạt theo trạng thái dữ liệu mà không làm rối mã nguồn logic.
- Lập trình vòng lặp game lõi (Core Game Loop) và Trình hướng dẫn người chơi (Tutorial mode): Em tự tay viết logic vận hành trung tâm trong game.js: hàm khởi tạo init(), luồng chuyển đổi các phân cảnh (setup => information => decisions => result), thuật toán kích hoạt sự kiện ngẫu nhiên theo lượt (rollRoundEvents), và xây dựng mảng dữ liệu tutorialSteps để tạo tính năng Tour hướng dẫn người chơi mới từng bước.

## File, tính năng, dữ liệu, logic, giao diện, tài liệu hoặc phần demo đã đóng góp

- File chịu trách nhiệm chính: game.js (logic điều hướng, quản lý trạng thái, vòng lặp game và tour hướng dẫn).
- File phối hợp cấu trúc dữ liệu & liên kết:
  - data.js (Phần khung API trả về cấu trúc dữ liệu)
  - index.html (Phần phân chia phân cảnh <section class="screen"> và các nút bấm điều hướng hệ thống)
- Tính năng đóng góp: Cơ chế chuyển vòng (Round progression), Trình hướng dẫn tương tác (Interactive Tutorial Tour), Hệ thống kiểm soát điều kiện kết thúc game (Game Over routing) và cơ chế dọn dẹp bộ nhớ/chơi lại (clearSave()).

## Bằng chứng đóng góp

- Link commit: https://github.com/EpicDolphindape/Strive-Thrive-Game-src/commits/main/ (trong main branch), https://github.com/EpicDolphindape/Strive-Thrive-Game-src/tree/DEV-LINKU (trong personal branch)
- Link file:
  - game.js: https://github.com/EpicDolphindape/Strive-Thrive-Game-src/blob/main/js/game.js
  - data.js: https://github.com/EpicDolphindape/Strive-Thrive-Game-src/blob/main/js/data.js
- Link task division: Group 03 - Task division
- Link timetable: Deadline & Tasks

## Phần đóng góp đó kết nối thế nào với sản phẩm cuối cùng

Nếu không có cấu trúc quản trị luồng và sự hỗ trợ điều phối dữ liệu từ em, dự án sẽ chỉ là một tập hợp các file rời rạc: kịch bản của M1 chỉ nằm trên giấy, công thức tài chính của M2 & M3 chỉ là những phép toán trên màn hình console, và giao diện của M4 sẽ là những trang HTML tĩnh. Phần việc của em đóng vai trò là kết nối toàn bộ hệ thống lại: tiếp nhận ý tưởng và dữ liệu từ các thành viên, đưa vào bộ lọc thuật toán xử lý luân phiên theo vòng, rồi chuyển lệnh cho giao diện hiển thị, tạo nên một sản phẩm game mô phỏng tài chính hoàn chỉnh, thống nhất và có thể chơi trực tuyến.

## Điều cá nhân học được

- Kỹ năng thiết kế hệ thống (Architecture): Em học được cách áp dụng Module Pattern trong Javascript thuần để quản lý tầm vực (scope), tránh xung đột biến toàn cục khi tích hợp nhiều tệp mã nguồn lớn.
- Tư tư duy quản lý sản phẩm toàn diện (Product Lifecycle): Em hiểu rõ rằng làm Leader không chỉ là đi hối thúc tiến độ, mà là phải biết định hình cấu trúc dữ liệu ngay từ đầu, biết lắng nghe ý tưởng của thành viên thiết kế nội dung và chuyển hóa nó thành các trường dữ liệu (Data fields) logic mà lập trình viên có thể code được.
- Quản trị và giải quyết xung đột (Git & Teamwork): Em thành thạo kỹ năng điều phối nhân sự thông qua GitHub, học cách giữ bình tĩnh để "gỡ bom" các đoạn code bị xung đột (conflict) trong giai đoạn nước rút mà không làm mất mát công sức của các thành viên khác.

## Khó khăn đã gặp và cách xử lý

- Khó khăn: Giai đoạn giữa dự án, khi ráp nối thử nghiệm, game liên tục bị lỗi treo hoặc màn hình trắng. Nguyên nhân là do ý tưởng kịch bản quá rộng, các hàm toán kinh tế của trả về sai định dạng dữ liệu, dẫn đến việc xung đột dữ liệu toàn cục.
- Cách xử lý: Với vai trò Leader, em đã tổ chức một buổi "Họp kỹ thuật và Đồng bộ hóa dữ liệu". Tại đây, em đưa ra một Data Contract cố định: Ép các hàm tính toán của thành các hàm thuần (Pure functions) chỉ nhận số và trả ra số; chuẩn hóa kịch bản của M1 thành các thẻ mảng JSON mẫu; và đóng gói các hiệu ứng của M4 vào không gian tên UI riêng biệt. Mọi luồng đọc/ghi và chuyển màn hình bắt buộc phải đi qua bộ điều phối trung tâm GAME của em. Nhờ phân định ranh giới trách nhiệm code rõ ràng này, hệ thống đã vận hành ổn định và sạch lỗi.

## Lời nhắn cho sinh viên khóa sau

> “Đừng xem việc tích hợp hệ thống là bước cuối cùng của dự án. Hãy xem đó là một quá trình bắt đầu ngay từ ngày đầu tiên. Càng sớm thống nhất được kiến trúc hệ thống và luồng dữ liệu, các giai đoạn phát triển sau này sẽ càng diễn ra thuận lợi và hiệu quả hơn đấy.

> Cuối cùng, hãy tận hưởng hành trình thực hiện dự án. Một dự án thành công không chỉ được đánh giá qua sản phẩm cuối cùng, mà còn qua tinh thần làm việc nhóm, những thử thách đã vượt qua và những bài học rút ra trong suốt quá trình thực hiện. Chúc các nhóm khóa sau thật nhiều thành công, và hy vọng các bạn sẽ có những trải nghiệm thú vị khi xây dựng dự án của mình như chúng mình đã từng nhé!”
