# Thành viên 1: TRẦN PHƯƠNG LINH - 2312380015

## Vai trò trong dự án

Trong dự án này, có hai đầu việc lớn do em phụ trách: thứ nhất, tạo database cho Personal information và Market information; thứ hai, thiết kế hệ thống chấm điểm và phân loại người chơi khi kết thúc trò chơi.

Đối với đầu việc thứ nhất: Các sự kiện liên quan đến cá nhân (Life event) và đến thị trường (Market event) trong game sẽ được lấy từ Event database, là nơi em nghiên cứu, điều chỉnh, cập nhật và lưu trữ “kho sự kiện” của game. Các Life events sẽ được gắn tag là Positive hoặc Negative và tác động của nó sẽ là làm tăng giảm Cash (tiền mặt), Mental health và Physical health. Sau đó, em cũng có vai trò thiết kế logic và lập trình để các sự kiện này sẽ xuất hiện theo những cơ chế phù hợp.

Đối với đầu việc thứ hai: Khi người chơi hoàn thành xong 5 vòng của game, em sẽ có nhiệm vụ thiết kế một hệ thống chấm điểm cho phần chơi của họ, dựa trên 3 yếu tố là: Tiền bạc, Sức khỏe tinh thần và sức khỏe thể chất. Bằng cách này, người chơi sẽ biết những lựa chọn xuyên suốt game của họ sẽ dẫn đến kết quả như thế nào, liệu kết quả ấy có tiệm cận với mục tiêu “Cân bằng cuộc sống” hay không và người chơi có hài lòng với kết quả ấy không.

Sau khi có những dữ liệu đầu vào như trên, em có vai trò đưa các dữ liệu đó vào phiên bản lập trình và đảm bảo nó chạy đúng theo những cơ chế, luồng logic mà em đã thiết kế.

Cuối cùng, sau khi cả nhóm đã hoàn thành phần lập trình của mình và khởi tạo được những phiên bản game đầu tiên, em sẽ phụ trách Testing - kiểm thử độ chính xác của game bằng cách chơi thử, phát hiện và liệt kê ra những lỗi sai, những điểm bất hợp lý em gặp phải, liên quan đến tất tần tật từ hiển thị UI/UX, cơ chế chọn event, logic của game, độ chính xác trong tính toán, và phản hồi lại với các thành viên để có phương án sửa chữa, khắc phục.

## Dấu ấn cá nhân trong sản phẩm

Phần thể hiện rõ nhất đóng góp của em là toàn bộ hệ thống sự kiện và cơ chế chấm điểm người chơi. Trong game, người chơi liên tục phải đưa ra các quyết định tài chính dựa trên những biến động của cuộc sống và thị trường. Các tình huống này được xây dựng từ hệ thống Life Events và Market Events do em thiết kế. Bên cạnh đó, em cũng xây dựng bộ tiêu chí chấm điểm và phân loại người chơi ở cuối game. Nhờ đó, sản phẩm không chỉ dừng lại ở việc đưa ra lựa chọn mà còn có thể đánh giá phong cách quản lý tài chính của từng người chơi. Cụ thể, những dấu ấn này được thể hiện trong game qua các mục sau:

- Player background
- Personal information
- Market information
- Scoring system
- Game result classification

Đây là những thành phần quyết định luồng trải nghiệm của người chơi từ đầu game đến khi nhận kết quả cuối cùng.

## Những việc đã thực sự làm

Để ra được những output như trên thì quá trình brainstorm, research và verify là điều không thể thiếu. Cụ thể, quá trình làm việc của em diễn ra như sau:

**Nghiên cứu các tình huống liên quan đến đời sống, tài chính thực tế để xây dựng gameplay**: Đối với Life events, em cố gắng đưa thật nhiều các sự kiện trong nhiều khía cạnh của cuộc sống nhất có thể, liên quan đến: bản thân, gia đình, công việc, các mối quan hệ trong xã hội, các tình huống từ may mắn đến xui rủi mà một người có thể gặp trong cuộc đời của họ. Đối với Market events, đa phần các sự kiện lớn ảnh hưởng đến thị trường trong game đều được em lấy cảm hứng từ các sự kiện có thật bằng cách đọc báo, đọc tin tức, hỏi AI, sau đó em tìm hiểu sâu hơn để biết được tác động của các sự kiện đó đến nền kinh tế thế giới và Việt Nam như thế nào để có phương án điều chỉnh lại cho phù hợp với quy mô của game.


**Thiết kế và triển khai module Life Events**: Sau khi kiểm thử và thấy có những điểm bất hợp lý trong phiên bản ban đầu, em đã thay đổi hệ thống Life event bằng cách chia thành 4 loại:

- Random events: là những sự kiện diễn ra hoàn toàn ngẫu nhiên, được quyết định bởi xác suất. Loại sự kiện này chủ yếu dựa trên “may rủi” của người chơi và có thể xuất hiện ở bất cứ vòng nào.
- Job-reward events: là những sự kiện tích cực nhằm thưởng cho người chơi khi họ có sự cống hiến trong công việc chính. Cơ chế chủ yếu là người chơi cống hiến càng nhiều thì phần thưởng sẽ càng lớn, và càng về các round sau thì “quy mô” của phần thưởng cũng sẽ được tăng dần.
- Expense-penalty event: là những sự kiện tiêu cực xuất hiện để “phạt thẻ vàng” khi người chơi chi tiêu dưới mức tối thiểu. Việc chi tiêu dưới mức tối thiểu sẽ ảnh hưởng đến chất lượng cuộc sống và sức khỏe của người chơi và loại sự kiện này là để hiện thực hóa cơ chế đó.
- Health-warning event: khi người chơi có những lựa chọn khiến điểm sức khỏe tinh thần và sức khỏe thể chất bị giảm sút xuống những ngưỡng nhất định, các sự kiện này sẽ xuất hiện với mục đích cảnh báo người chơi nên chú ý bảo vệ sức khỏe hơn.

Với hệ thống 4 loại sự kiện, game sẽ có luồng logic chặt chẽ hơn và phản ánh cơ chế “trade-off” (đánh đổi) một cách rõ ràng hơn. Sau khi viết ra nội dung của các sự kiện, em sẽ gắn tag cho mỗi sự kiện (Tích cực / Tiêu cực), gán cho chúng xác suất, trọng số, hoặc điều kiện, cuối cùng là đưa ra các tác động liên quan đến Tiền, sức khỏe tinh thần, sức khỏe thể chất của mỗi event.


**Thiết kế và triển khai module Market Events**: Nếu Life Events mô phỏng những biến cố xảy ra trong cuộc sống cá nhân của người chơi thì Market Events sẽ đại diện cho các biến động của nền kinh tế và thị trường tài chính. Khi xây dựng hệ thống này, em không muốn các sự kiện thị trường chỉ xuất hiện một cách độc lập và ngẫu nhiên, bởi ngoài đời thực các sự kiện kinh tế thường có mối liên hệ với nhau và tạo ra hiệu ứng dây chuyền.

Vì vậy, em đã xây dựng Market Event Tree - một hệ thống nhiều nhánh diễn biến khác nhau. Mỗi nhánh sẽ đại diện cho một bối cảnh kinh tế riêng, ví dụ như giai đoạn phục hồi kinh tế, khủng hoảng kinh tế, lạm phát gia tăng, hay tăng trưởng ổn định. Từ một sự kiện gốc, thị trường có thể diễn biến theo nhiều hướng khác nhau tùy vào xác suất được thiết lập trước, tạo cảm giác khó đoán và gần với thực tế hơn.

Để xây dựng các kịch bản này, em nghiên cứu các sự kiện kinh tế lớn từng xảy ra trong thực tế như đại dịch Covid-19, chiến tranh thương mại Mỹ - Trung, xung đột tại Trung Đông, các giai đoạn lãi suất tăng cao hay suy thoái kinh tế toàn cầu. Sau đó, em phân tích tác động của chúng tới các nhóm tài sản khác nhau và điều chỉnh lại quy mô ảnh hưởng để phù hợp với phạm vi của game.

Sau khi hoàn thiện nội dung, em tiến hành gán xác suất, điều kiện kích hoạt và mức độ ảnh hưởng của từng sự kiện tới thị trường. Các sự kiện này sẽ tác động trực tiếp tới giá trị tài sản của người chơi, buộc họ phải liên tục đánh giá lại chiến lược tài chính của mình thay vì chỉ đưa ra một quyết định rồi giữ nguyên trong suốt trò chơi.


**Chuyển đổi dữ liệu sự kiện sang cấu trúc JSON tích hợp vào source code**: Sau khi hoàn thành việc thiết kế nội dung cho các Life Events và Market Events, em tiến hành chuẩn hóa toàn bộ dữ liệu sang cấu trúc JSON để có thể tích hợp trực tiếp vào game. Đây là bước quan trọng vì dữ liệu ban đầu được xây dựng dưới dạng bảng và tài liệu mô tả, trong khi hệ thống game cần dữ liệu có cấu trúc rõ ràng để có thể tự động xử lý.

Đối với mỗi sự kiện, em xác định các thuộc tính cần thiết như mã sự kiện, mô tả, loại sự kiện, xác suất xuất hiện, điều kiện kích hoạt, các lựa chọn của người chơi và tác động tương ứng tới các chỉ số trong game. Việc chuẩn hóa dữ liệu giúp các sự kiện có cùng cấu trúc, dễ dàng mở rộng trong tương lai và giảm thiểu lỗi khi tích hợp vào hệ thống.

Ngoài ra, trong quá trình chuyển đổi dữ liệu, em cũng liên tục kiểm tra lại các giá trị đầu vào để đảm bảo các tác động của sự kiện được tính toán đúng theo logic gameplay đã thiết kế trước đó.


**Xây dựng hệ thống Scoring đánh giá quyết định tài chính**: Một trong những mục tiêu quan trọng nhất của game là giúp người chơi nhìn thấy hệ quả của những lựa chọn mà họ đưa ra trong suốt quá trình chơi. Vì vậy, em xây dựng hệ thống Scoring dựa trên hai nhóm chỉ số chính là Financial Score và Well-being Score.

Đối với Financial Score, điểm số được tính dựa trên Net Worth (tổng tài sản ròng) của người chơi khi kết thúc game. Thay vì sử dụng thang đo tuyến tính, em áp dụng công thức logarit nhằm giảm sự chênh lệch quá lớn giữa các mức tài sản khác nhau và phản ánh chính xác hơn hiệu quả tích lũy tài chính của người chơi. Sau khi tính toán, người chơi sẽ được xếp vào một trong ba nhóm: Weak, Moderate hoặc Strong. Mỗi nhóm sẽ đi kèm với phần nhận xét riêng nhằm giúp người chơi hiểu rõ điểm mạnh và điểm yếu trong chiến lược quản lý tài chính của mình.

Bên cạnh đó, em xây dựng Well-being Score dựa trên trung bình của hai chỉ số Mental Health và Physical Health. Mục tiêu là đánh giá mức độ cân bằng cuộc sống mà người chơi duy trì được sau 5 vòng chơi. Tương tự Financial Score, người chơi cũng sẽ được phân loại thành nhiều mức độ khác nhau, từ trạng thái sức khỏe đáng báo động cho tới trạng thái cân bằng và khỏe mạnh.

Việc sử dụng đồng thời Financial Score và Well-being Score giúp game không chỉ đánh giá khả năng kiếm tiền mà còn xem xét người chơi đã phải đánh đổi bao nhiêu sức khỏe để đạt được kết quả đó. Đây cũng chính là thông điệp cốt lõi mà nhóm muốn truyền tải thông qua trò chơi.


**Lập trình**: Cụ thể, phần lập trình của em tập trung vào ba thành phần liên kết với nhau. Thứ nhất, em xây dựng hệ thống sự kiện; các sự kiện được lựa chọn theo xác suất, độ hiếm, trọng số và hành vi của người chơi. Thứ hai, em tích hợp tác động của sự kiện vào kết quả từng vòng thông qua các biến tiền mặt, sức khỏe thể chất và sức khỏe tinh thần. Thứ ba, em xây dựng cơ chế chấm điểm và phân loại cuối trò chơi dựa trên tài sản, well-being, độ cân bằng giữa tài chính và sức khỏe, đồng thời phân loại rõ nguyên nhân thất bại. Kết quả tính toán được chuyển sang các màn hình kết quả vòng, chiến thắng và thất bại để người chơi hiểu hậu quả của các quyết định đã đưa ra.


**Kiểm thử và hiệu chỉnh dữ liệu nhằm đảm bảo cân bằng gameplay**: Sau khi hoàn thành các phiên bản đầu tiên của game, em dành khá nhiều thời gian cho việc kiểm thử. Đầu tiên, em xây dựng một file Excel để mô phỏng và tính toán trước các kết quả có thể xảy ra khi người chơi đưa ra những lựa chọn khác nhau. Việc này giúp em kiểm tra xem các công thức tính toán và hệ thống chấm điểm có đang hoạt động đúng như thiết kế hay không.

Tiếp theo, khi game đã có phiên bản chạy được, em trực tiếp đóng vai người chơi và thử nghiệm nhiều cách chơi khác nhau. Có những lần em cố gắng tối đa hóa tài sản bằng mọi giá, có những lần ưu tiên sức khỏe, hoặc cố tình đưa ra các lựa chọn cực đoan để kiểm tra phản ứng của hệ thống.

Thông qua quá trình này, em phát hiện và ghi nhận nhiều vấn đề cần điều chỉnh như sự kiện bị lặp lại giữa các vòng chơi, mức độ ảnh hưởng của một số sự kiện chưa hợp lý, các trường hợp tính toán chưa phản ánh đúng logic của game hoặc kết quả cuối cùng chưa thực sự tương xứng với hành vi của người chơi. Sau đó, em tổng hợp các vấn đề này, trao đổi với các thành viên trong nhóm và tiến hành điều chỉnh dữ liệu cũng như logic xử lý cho tới khi gameplay đạt được mức độ ổn định và hợp lý hơn.

## File, tính năng, dữ liệu, logic, giao diện, tài liệu hoặc phần demo đã đóng góp

Dữ liệu người chơi:

- Hồ sơ nhân vật mẫu
- Các thuộc tính khởi tạo người chơi

Hệ thống sự kiện:

- Life Events Dataset
- Market Events Dataset
- Market Event Tree Structure
- Các lựa chọn và hệ quả của từng sự kiện

Logic đánh giá:

- Scoring Framework
- Game Result Classification System

Tài liệu:

- Tài liệu mô tả hệ thống sự kiện
- Tài liệu quy tắc chấm điểm
- Tài liệu mô tả các nhóm người chơi cuối game

## Bằng chứng đóng góp

**Bằng chứng phần code:**

Phạm vi đối chiếu: Các bằng chứng về Hệ thống event, chấm điểm và phân loại được xác định từ ba file:

- [data.js](https://github.com/EpicDolphindape/Strive-Thrive-Game-src/blob/main/js/data.js) : khai báo dữ liệu và luật của event, ngưỡng điểm, điều kiện phân loại.
- [health.js](https://github.com/EpicDolphindape/Strive-Thrive-Game-src/blob/main/js/health.js) : tính tác động theo vòng, điểm cuối và nhãn phân loại.
- [game.js](https://github.com/EpicDolphindape/Strive-Thrive-Game-src/blob/main/js/game.js) : điều phối event, chuyển dữ liệu sang bộ máy tính toán và hiển thị kết quả.
- [parsed_event.json](https://github.com/EpicDolphindape/Strive-Thrive-Game-src/blob/main/js/parsed_events.json): khai báo và lưu trữ các dữ liệu của events 

**Bằng chứng GitHub:**

- [Link commit](https://github.com/EpicDolphindape/Strive-Thrive-Game-src/commits/main/) (trong main branch),
- [Link issue](https://github.com/EpicDolphindape/Strive-Thrive-Game-src/issues) (toàn bộ các issue được khởi tạo bởi em) 
**Bằng chứng qua Google Drive:**

- Event database: [LIFE & MARKET EVENTS - CODE VER.](https://docs.google.com/spreadsheets/d/1F2M7RwASEpm-_Bb-pauA4BoNVNGVZbXtf1n_F-aj-Sw/edit?usp=drive_link)
- Game calculation: [Game calculation.xlsx](https://docs.google.com/spreadsheets/d/1sTLpvLrrfsqLviuwBA7urOszuDI9iiog/edit?usp=drive_link&ouid=100601133900175798794&rtpof=true&sd=true)
- Logic roll event: [EVENT SETTING.docx](https://docs.google.com/document/d/13kYUikUzxFCQ2ctV0iadtTbV3L8fbpsD/edit?usp=drive_link&ouid=100601133900175798794&rtpof=true&sd=true) 
- Hệ thống chấm điểm: [Strive & Thrive: A life balance simulation](https://docs.google.com/document/d/1hkAhdvF2FkIExWK7geCIyrKJlvish7BMRzkapYUii_Q/edit?usp=drive_link) (trang 4 → 8)

## Phần đóng góp đó kết nối thế nào với sản phẩm cuối cùng

Những phần em phụ trách đóng vai trò là nền tảng vận hành của toàn bộ trò chơi. Player Background giúp xây dựng bối cảnh ban đầu để người chơi dễ dàng nhập vai và đưa ra quyết định dưới góc nhìn của một nhân vật cụ thể. Hệ thống Life Events và Market Events tạo ra các tình huống liên tục xuất hiện trong quá trình chơi, buộc người chơi phải cân nhắc giữa mục tiêu tài chính và chất lượng cuộc sống của mình.

Bên cạnh đó, hệ thống Scoring và Game Result Classification giúp chuyển đổi toàn bộ hành trình của người chơi thành một kết quả có ý nghĩa ở cuối game. Thay vì chỉ biết mình kiếm được bao nhiêu tiền, người chơi còn hiểu được liệu họ đã thực sự đạt được sự cân bằng giữa tài chính, sức khỏe tinh thần và sức khỏe thể chất hay chưa.

Ngoài việc xây dựng nội dung và logic cho các hệ thống trên, em cũng tham gia đưa dữ liệu vào phiên bản lập trình, kiểm thử và hiệu chỉnh để đảm bảo mọi thành phần hoạt động đúng theo thiết kế ban đầu. Vì vậy, các phần việc em thực hiện không chỉ cung cấp dữ liệu đầu vào mà còn ảnh hưởng trực tiếp tới gameplay, trải nghiệm người dùng và kết quả cuối cùng mà sản phẩm mang lại.

## Điều cá nhân học được

Thông qua dự án này, điều đầu tiên em học được là cách làm việc theo một workflow có tổ chức, có sự phân chia nhiệm vụ rõ ràng và có sự tương tác, trao đổi liên tục giữa các thành viên trong nhóm. Trước đây, em thường quen với các bài tập cá nhân hoặc các dự án có quy mô nhỏ. Tuy nhiên, với một sản phẩm có nhiều thành phần liên kết chặt chẽ với nhau như game mô phỏng tài chính, em nhận ra rằng việc giao tiếp và cập nhật tiến độ thường xuyên quan trọng không kém gì chuyên môn của từng cá nhân.

Với nhiệm vụ nghiên cứu và xây dựng database cho Life Events và Market Events, em có cơ hội tìm hiểu lại nhiều sự kiện kinh tế nổi bật mà thế giới từng trải qua. Không chỉ dừng lại ở việc biết sự kiện đó đã xảy ra, em còn phải tìm hiểu nguyên nhân hình thành, cơ chế tác động và những hệ quả mà chúng tạo ra đối với nền kinh tế và thị trường tài chính. Điều này giúp em có góc nhìn thực tế hơn về cách các yếu tố kinh tế vĩ mô ảnh hưởng tới cuộc sống và các quyết định tài chính của mỗi cá nhân.

Bên cạnh đó, em cũng học được cách sử dụng GitHub - một nền tảng quản lý phiên bản và lưu trữ mã nguồn rất phổ biến trong lĩnh vực phát triển phần mềm. Trong giai đoạn cuối của dự án, GitHub đóng vai trò quan trọng trong việc trao đổi, đối chiếu, cập nhật và kiểm tra các thay đổi giữa các thành viên, giúp cả nhóm làm việc hiệu quả hơn và hạn chế việc ghi đè dữ liệu của nhau.

Quan trọng nhất, đây là lần đầu tiên em có cơ hội tiếp cận sâu hơn với ngôn ngữ lập trình JavaScript và trực tiếp tham gia vào quá trình xây dựng một trò chơi mô phỏng hoàn chỉnh. Từ những ý tưởng ban đầu trên giấy, những bảng dữ liệu trên Excel cho tới khi các cơ chế được chuyển hóa thành mã nguồn và có thể vận hành thực sự trong game, em hiểu rõ hơn rất nhiều về quy trình phát triển một sản phẩm công nghệ từ lúc hình thành ý tưởng đến khi hoàn thiện phiên bản có thể sử dụng được.

## Khó khăn đã gặp và cách xử lý

Khó khăn đầu tiên mà nhóm gặp phải là ở giai đoạn đầu của dự án. Trong khoảng một đến hai tuần đầu tiên, cả nhóm đã mất khá nhiều thời gian để xác định chính xác mình muốn xây dựng sản phẩm gì và phạm vi của sản phẩm nên ở mức nào. Sau khi thống nhất được ý tưởng, nhóm tiếp tục phải tìm ra workflow phù hợp, phân chia nhiệm vụ, đặt deadline và xây dựng cách thức phối hợp giữa các thành viên. Đây là một thách thức không nhỏ vì các hệ thống trong game có sự liên kết rất chặt chẽ với nhau, nên bất kỳ thay đổi nào ở một phần cũng có thể ảnh hưởng tới các phần còn lại.

Đối với riêng phần việc của em, để xây dựng được hệ thống gồm bốn nhóm Life Events và một Market Event Tree hoàn chỉnh, em đã phải trải qua rất nhiều vòng nghiên cứu, thử nghiệm và chỉnh sửa. Không ít lần những cơ chế ban đầu nghe có vẻ hợp lý nhưng khi đưa vào gameplay lại xuất hiện các điểm bất cập hoặc tạo ra kết quả không như mong muốn. Vì vậy, em phải liên tục rà soát, điều chỉnh và kiểm thử để đảm bảo hệ thống sự kiện vừa đủ đa dạng, vừa giữ được tính logic và nhất quán trong toàn bộ trò chơi. Mặc dù vẫn còn những điểm có thể cải thiện thêm trong tương lai, phiên bản hiện tại đã đáp ứng được mục tiêu về tính đa dạng của sự kiện và phản ánh được các cơ chế đánh đổi mà nhóm mong muốn truyền tải.

Khó khăn lớn nhất đối với em là công đoạn lập trình. Việc chuyển đổi từ các ý tưởng, quy tắc và logic được mô tả bằng lời sang mã nguồn thực tế khó hơn em tưởng tượng rất nhiều. Từ việc xây dựng database trên Excel, thiết kế logic gameplay cho đến khi chuyển hóa chúng thành các cấu trúc dữ liệu và đoạn code có thể chạy được đều đòi hỏi rất nhiều thời gian, công sức và sự kiên nhẫn.

Để giải quyết vấn đề này, em đã chủ động tìm hiểu thêm về JavaScript, đồng thời tận dụng các công cụ AI như một trợ lý hỗ trợ trong quá trình làm việc. AI giúp em giải thích các đoạn code, gợi ý hướng xử lý và hỗ trợ tìm lỗi khi chương trình hoạt động chưa đúng như mong muốn. Tuy nhiên, em cũng nhận ra rằng AI không phải lúc nào cũng đưa ra đáp án chính xác, vì vậy em phải thường xuyên kiểm tra lại, đặt câu hỏi ngược lại và tự đánh giá tính hợp lý của những gì nó đề xuất. Ngoài ra, em cũng nhận được nhiều sự hỗ trợ từ bạn bè đang theo học hoặc làm việc trong lĩnh vực công nghệ thông tin, giúp em hiểu rõ hơn về cách tổ chức mã nguồn, xử lý lỗi và cải thiện chất lượng sản phẩm.

## Lời nhắn cho sinh viên khóa sau

Đây là một môn học rất thú vị nhưng cũng không kém phần thử thách. Điểm đặc biệt của môn học này là các bạn được trao quyền sáng tạo rất lớn. Các bạn có thể nghĩ ra những ý tưởng nghe vô cùng hấp dẫn, độc đáo và đầy tiềm năng. Tuy nhiên, chỉ khi thật sự bắt tay vào thực hiện, các bạn mới nhận ra rằng khoảng cách giữa một ý tưởng hay và một sản phẩm hoạt động được là rất lớn.

Quá trình brainstorm, xây dựng những phiên bản đầu tiên, rồi liên tục sửa đi sửa lại để khắc phục lỗi và hoàn thiện sản phẩm là một trải nghiệm đáng nhớ. Tuy nhiên, đó cũng là giai đoạn tiêu tốn nhiều thời gian và công sức nhất. Vì vậy, lời khuyên của em là đừng quá tập trung vào việc tạo ra một sản phẩm hoàn hảo ngay từ đầu. Hãy ưu tiên xây dựng được một phiên bản đơn giản nhưng hoạt động ổn định, đáp ứng được các mục tiêu cốt lõi của dự án. Khi nền tảng đã vững chắc, việc mở rộng và bổ sung các tính năng nâng cao sẽ trở nên dễ dàng hơn rất nhiều.

Bên cạnh đó, quá trình làm việc nhóm cũng đóng vai trò cực kỳ quan trọng. Dù mỗi thành viên phụ trách một phần khác nhau, tất cả các phần đều có mối liên hệ với nhau. Nếu thiếu sự trao đổi thường xuyên hoặc không thống nhất được cách làm việc chung, nhóm sẽ rất dễ gặp phải các vấn đề về tiến độ, logic sản phẩm hoặc tích hợp hệ thống ở giai đoạn cuối. Vì vậy, hãy dành thời gian để trao đổi với nhau nhiều hơn, thống nhất mục tiêu từ sớm và luôn cập nhật tiến độ cho các thành viên còn lại.

Cuối cùng, em xin chúc các sinh viên khóa sau sẽ có một học kỳ thật đáng nhớ với môn học này. Hy vọng các bạn sẽ có cơ hội trải nghiệm cảm giác nhìn thấy ý tưởng của mình từng bước trở thành một sản phẩm hoàn chỉnh, đồng thời học được thật nhiều kiến thức và kỹ năng mới trong suốt quá trình thực hiện dự án.
