# HSK Ôn Từ — trang ôn từ vựng HSK 3.0

Trang web tự viết từ đầu (HTML/CSS/JS thuần, không dùng framework, không sao chép code của bất kỳ trang nào khác), lấy cảm hứng bố cục từ "Meiday Chinese" nhưng thiết kế và code hoàn toàn mới. Bạn có toàn quyền chỉnh sửa vì đây là code do bạn sở hữu.

## Cách xem thử trên máy

Trình duyệt chặn `fetch()` file JSON khi mở trực tiếp bằng cách bấm đúp vào `index.html` (do giới hạn CORS với `file://`). Hãy chạy một server tĩnh đơn giản trong thư mục `site/`:

```bash
# Cách 1 — Python (có sẵn trên hầu hết máy)
python3 -m http.server 8000

# Cách 2 — Node
npx serve .
```

Sau đó mở `http://localhost:8000/` trên trình duyệt.

## Cách đưa lên GitHub Pages (miễn phí, giống trang mẫu)

1. Tạo repo mới trên GitHub, đẩy toàn bộ nội dung thư mục `site/` lên nhánh `main`.
2. Vào **Settings → Pages**, chọn nguồn là nhánh `main`, thư mục gốc `/`.
3. Sau vài phút, trang sẽ có địa chỉ dạng `https://<tên-bạn>.github.io/<tên-repo>/`.

## Đăng nhập, phân lớp & theo dõi tiến độ học viên

Trang dùng Firebase (miễn phí) để quản lý tài khoản, phân lớp và lưu kết quả ôn tập. **Đây không còn là tính năng tuỳ chọn** — cho tới khi bạn cấu hình Firebase, trang sẽ không hiển thị bất kỳ nội dung ôn tập nào cho bất kỳ ai (chỉ hiện thông báo hướng dẫn thiết lập). Sau khi cấu hình xong, chỉ tài khoản đã đăng nhập mới xem được nội dung — khách vãng lai (chưa đăng nhập) hoàn toàn không truy cập được trang từ vựng, flashcard, trắc nghiệm hay điền pinyin nào.

Điểm quan trọng về mô hình tài khoản:

- **Không có tự đăng ký, không có khách xem thử.** Chỉ giáo viên mới tạo được tài khoản học viên (từ Trang giáo viên trong app), luôn kèm theo việc gán học viên vào **một hoặc nhiều lớp cùng lúc** (mỗi lớp ứng với một trình độ HSK). Tài khoản giáo viên đầu tiên được tạo thủ công qua Firebase Console.
- **Học viên chỉ ôn tập được đúng (các) trình độ của (các) lớp mình đang thuộc** — các trình độ khác bị ẩn/khoá trên giao diện, kể cả khi cố vào thẳng bằng đường dẫn. Một học viên có thể thuộc đồng thời nhiều lớp (kể cả khác trình độ), và tiến độ ôn tập được lưu riêng theo từng lớp. Đây là giới hạn ở tầng ứng dụng, không phải khoá dữ liệu tuyệt đối (xem chi tiết trong `FIREBASE_SETUP.md`).
- Giáo viên đăng nhập thì xem được tất cả trình độ (để quản lý/kiểm tra nội dung), và có thể tạo nhiều lớp, thêm/bớt lớp của từng học viên bất cứ lúc nào.

Để bật: làm theo hướng dẫn từng bước trong file **`FIREBASE_SETUP.md`** (khoảng 10-15 phút, không cần biết lập trình, không cần thẻ tín dụng, và **bắt buộc phải làm** để trang có nội dung xem được).

Sau khi bật, trang giáo viên (`#/teacher`, chỉ tài khoản có quyền giáo viên mới vào được) cho phép tạo lớp, tạo tài khoản học viên (chọn nhiều lớp cùng lúc), thêm/bớt lớp của học viên bất kỳ lúc nào, **sửa tên/xóa học viên, sửa tên-trình độ/xóa lớp**, và xem theo từng học viên: (các) lớp đang học, hoạt động gần nhất, số bài đã ôn, điểm trung bình **trắc nghiệm / điền pinyin / điền từ / viết chữ** (4 chế độ tách riêng), các từ hay sai nhất, và số phút học hôm nay/7 ngày qua. Mỗi lớp còn có **trang chi tiết riêng** (bấm "Xem chi tiết →" trong bảng "Danh sách lớp") để theo dõi tách biệt từng lớp — điểm/hoạt động ở đây chỉ tính riêng cho lớp đang xem, ngay cả khi học viên đó còn thuộc thêm lớp khác.

**Bấm vào tên một học viên** (hoặc nút "📖 Chi tiết") để xem trang chi tiết của riêng học viên đó: điểm **theo từng bài học** (ví dụ "HSK1 · Bài 1"), cả 4 chế độ, và quan trọng hơn — **lịch sử đầy đủ từng lần làm bài** (không chỉ điểm lần gần nhất): mỗi ô điểm hiện số lần đã làm (ví dụ "3 lần") kèm điểm chi tiết của từng lần theo đúng thứ tự thời gian (ví dụ "6/10 (60%), 8/10 (80%), 9/10 (90%)"), giúp giáo viên thấy được cả quá trình tiến bộ của học viên chứ không chỉ kết quả cuối cùng.

Về phía học viên: sau khi đăng nhập, mục **"📈 Tiến độ của tôi"** trên thanh đăng nhập cho học viên tự xem kết quả luyện tập của chính mình — tổng số bài đã ôn, điểm trung bình 4 chế độ, từ hay sai nhất, thời gian học, và bảng điểm chi tiết theo từng bài học (kèm lịch sử từng lần làm, giống trang giáo viên) — không cần hỏi giáo viên.

> **Lưu ý về dữ liệu cũ:** lịch sử từng lần làm chỉ bắt đầu được lưu từ sau khi tính năng này được bật. Điểm đã ghi nhận trước đó (chỉ có snapshot lần gần nhất) vẫn hiển thị được bình thường, chỉ tính là "1 lần" trong bảng chi tiết (không có lịch sử đầy đủ hơn vì dữ liệu cũ không lưu).

Chi tiết cách dùng và các giới hạn (ví dụ: xóa học viên chỉ thu hồi quyền truy cập chứ chưa xóa được tài khoản đăng nhập gốc; học viên tạo từ trước khi có tính năng nhiều lớp cần được gán lại lớp) — xem `FIREBASE_SETUP.md`.

## Cấu trúc thư mục

```
site/
├── index.html            # khung trang, điều hướng
├── css/style.css         # toàn bộ giao diện
├── js/app.js              # router + 6 chế độ ôn tập (kể cả "viết chữ") + ngữ pháp + "cách viết" + trang đăng nhập/giáo viên (tự viết)
├── js/auth.js             # xử lý đăng nhập/đăng ký + ghi nhận tiến độ vào Firestore (tự viết)
├── js/firebase-config.js  # nơi dán thông tin cấu hình Firebase của bạn (xem FIREBASE_SETUP.md)
├── firestore.rules        # luật bảo mật Firestore — dán vào Firebase Console
├── FIREBASE_SETUP.md      # hướng dẫn bật đăng nhập từng bước
└── data/
    ├── hsk1.json         # 296 từ, 15 bài — đúng thứ tự giáo trình HSK 3.0, đầy đủ nghĩa Việt, 291 từ có câu ví dụ
    ├── hsk2.json         # 205 từ, 15 bài — đúng thứ tự giáo trình HSK 3.0, đầy đủ nghĩa Việt, 196 từ có câu ví dụ
    ├── hsk3.json         # 450 từ, 18 bài — đúng thứ tự giáo trình HSK 3.0, đầy đủ nghĩa Việt, 428 từ có câu ví dụ
    ├── hsk4.json … hsk7-9.json  # còn lại — Hán tự/pinyin/từ loại/nghĩa tiếng Anh, sắp theo độ thông dụng
    ├── grammar1.json     # 35 điểm ngữ pháp HSK1 (14 bài) — lấy từ Meiday Chinese
    ├── grammar2.json     # 20 điểm ngữ pháp HSK2 (11 bài) — lấy từ Meiday Chinese
    └── grammar3.json     # 60 điểm ngữ pháp HSK3 (18 bài) — lấy từ Meiday Chinese
```

## Tình trạng dữ liệu — phần nào xong, phần nào cần làm thêm

**Đã hoàn chỉnh:**
- Toàn bộ khung trang, 6 chế độ ôn (Danh sách / Lật thẻ / Trắc nghiệm / Điền pinyin / Điền từ / **Viết chữ**), phần Ngữ pháp, và tính năng **"✏️ Cách viết"** (hoạt hình nét bút từng chữ Hán, bấm vào một từ trong Danh sách để mở).
- **Trắc nghiệm 2 chiều**: chế độ Trắc nghiệm có nút chuyển "Hán tự → Nghĩa" (mặc định, xem chữ Hán chọn nghĩa tiếng Việt) và **"Nghĩa → Hán tự"** (xem nghĩa tiếng Việt, chọn đúng chữ Hán) — chuyển đổi bất cứ lúc nào, kể cả sau khi làm xong bài.
- **Câu ví dụ cho từng từ (HSK1, HSK2, HSK3)**: lấy từ trang tổng ôn từ vựng của Meiday Chinese — hiển thị ngay dưới mỗi từ trong chế độ Danh sách, và ở mặt sau thẻ trong chế độ Lật thẻ. HSK1/HSK2 có 1 câu ví dụ đầy đủ; một số từ HSK3 có 2-3 cụm ngắn (đúng theo cách Meiday trình bày cho cấp này) thay vì 1 câu dài.
- **"📝 Điền từ" (mới)**: bài tập điền từ vào chỗ trống dựa trên câu ví dụ ở trên — hiện câu có chỗ trống thay cho từ vựng, kèm nghĩa tiếng Việt làm gợi ý, chọn đúng chữ Hán trong 4 lựa chọn. Chỉ áp dụng cho từ đã có câu ví dụ; bài học nào chưa có câu ví dụ nào sẽ hiện thông báo "chưa có câu ví dụ".
- **HSK 1, 2, 3** (296 + 205 + 450 = 951 từ, chia thành 48 bài học): nội dung — Hán tự, pinyin, từ loại, nghĩa tiếng Việt, và **thứ tự/cách chia bài học** — lấy theo đúng giáo trình HSK 3.0 mà trang Meiday Chinese (meidaychinese.github.io/Meiday-Chinese) đang dùng, do bạn đã xin phép và được chủ sở hữu nội dung đồng ý cho sử dụng lại toàn bộ. Mỗi bài học trên trang này giữ nguyên tiêu đề chữ Hán + tiêu đề tiếng Việt + số lượng từ đúng như bản gốc.
- **Ngữ pháp HSK 1, 2, 3** (35 + 20 + 60 = 115 điểm ngữ pháp, chia theo từng bài học): lấy trực tiếp từ Meiday Chinese, cùng nguồn cấp phép như từ vựng ở trên — tên điểm ngữ pháp (chữ Hán + pinyin nếu có), tên/giải nghĩa tiếng Việt, mẫu cấu trúc, và các câu ví dụ (kèm pinyin + nghĩa tiếng Việt khi bản gốc có hiển thị). HSK3 dùng định dạng gọn hơn (thường chỉ 1 ví dụ, không kèm pinyin/nghĩa cho ví dụ) đúng như trên trang gốc.
- **"✏️ Cách viết"** cho từ vựng HSK1, HSK2, HSK3: bấm vào một dòng từ trong chế độ Danh sách sẽ mở bảng hiển thị từng chữ Hán trong từ đó, bấm "▶ Xem viết" để xem hoạt hình thứ tự nét bút — dùng thư viện mã nguồn mở [HanziWriter](https://github.com/chanind/hanzi-writer) (MIT), đúng thư viện mà Meiday Chinese cũng dùng cho tính năng này.
- **"🖌️ Viết chữ" (mới)** — bài tập luyện viết tay: hiện nghĩa tiếng Việt của một từ ngẫu nhiên trong bài (có nút "💡 Gợi ý pinyin" nếu cần), yêu cầu viết tay từng chữ Hán của từ đó lên khung vẽ; hệ thống tự chấm đúng/sai từng nét ngay khi viết (dùng API `.quiz()` có sẵn của HanziWriter), viết đúng ngay từ lần đầu (không sai nét nào) mới tính là đúng câu đó. Có nút "Bỏ qua →" nếu muốn qua từ khác. Chỉ áp dụng cho HSK1-3 (cùng phạm vi với "Cách viết", vì cùng dùng chung dữ liệu nét bút).

**Cần bổ sung (đã có sẵn khung để bạn hoặc mình làm tiếp):**
- **HSK 4 → HSK 7-9** (khoảng 8.760 từ còn lại): hiện lấy từ bộ dữ liệu mở `complete-hsk-vocabulary`, có đủ Hán tự, pinyin, từ loại và **nghĩa tiếng Anh**, nhưng **chưa theo cấu trúc bài học của giáo trình** — đang chia tạm theo lô 20 từ/bài, sắp theo độ thông dụng, và **chưa có nghĩa tiếng Việt** (giao diện hiện nhãn "EN · chưa dịch"). Nếu bạn muốn có đúng cấu trúc bài học HSK4-9 giống Meiday, mình có thể lấy tiếp (khối lượng lớn hơn nhiều — khoảng 500 trang bài học).
- Với các cấp cao (đặc biệt HSK 7-9), một số từ đa âm/đa nghĩa có thể vẫn bị chọn sai nghĩa/âm đọc chính do dữ liệu gốc không phân biệt theo tần suất sử dụng — nên rà lại khi dùng để dạy/thi chính thức.
- **Ngữ pháp HSK4 → HSK7-9**: chưa có (trang sẽ hiện "đang cập nhật").
- **"Cách viết"** và **"Viết chữ"** hiện chỉ bật cho HSK1-3 (đúng theo yêu cầu ban đầu, vì cùng dùng chung dữ liệu nét bút HanziWriter) — có thể mở rộng sang HSK4-9 nếu cần, chỉ cần thêm level vào danh sách `STROKE_ORDER_LEVELS` trong `js/app.js` (áp dụng cho cả hai tính năng cùng lúc).

## Nguồn dữ liệu & giấy phép

- **HSK 1-3** (từ vựng, cách chia bài học, tiêu đề bài, và toàn bộ ngữ pháp): lấy từ trang [Meiday Chinese](https://meidaychinese.github.io/Meiday-Chinese/), sử dụng lại theo sự đồng ý của chủ sở hữu nội dung (do bạn trực tiếp trao đổi và xác nhận). Nếu sau này cần chứng minh lại quyền sử dụng, nên lưu lại xác nhận đó (tin nhắn/email) để đối chiếu.
- **HSK 4-9** (Hán tự, pinyin, từ loại, nghĩa tiếng Anh): [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) — giấy phép MIT (được phép dùng, sửa, phân phối lại, kể cả cho mục đích thương mại).
- **Hoạt hình nét viết ("Cách viết")**: thư viện mã nguồn mở [HanziWriter](https://github.com/chanind/hanzi-writer) — giấy phép MIT, tải qua CDN (`jsdelivr`), không lưu trữ dữ liệu nét bút trên máy chủ riêng.
- Code, giao diện: tự biên soạn/tự viết cho trang này.

## Gợi ý chỉnh sửa

- Đổi màu sắc: sửa các biến CSS ở đầu file `css/style.css` (phần `:root`).
- Đổi số từ mỗi bài học: sửa hằng số `UNIT_SIZE` trong `js/app.js`.
- Thêm phát âm bằng file audio thật thay vì giọng đọc trình duyệt: thay hàm `speak()` trong `js/app.js`.
- Bổ sung nghĩa tiếng Việt cho một cấp: mở file `data/hskX.json` tương ứng, điền vào trường `"meaning_vi"` của mỗi từ.
