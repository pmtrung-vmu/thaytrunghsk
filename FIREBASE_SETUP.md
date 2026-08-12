# Bật đăng nhập & theo dõi tiến độ học viên (Firebase) — khoảng 10-15 phút

**Bước này bắt buộc phải làm thì trang mới có nội dung xem được.** Trang hiện được thiết kế để không hiển thị bất kỳ nội dung ôn tập nào cho tới khi đăng nhập — kể cả khách vãng lai chưa đăng nhập cũng không xem được từ vựng/flashcard/trắc nghiệm nào. Nếu bạn bỏ qua phần này, mọi người mở trang sẽ chỉ thấy thông báo "chưa cấu hình". Làm theo các bước dưới đây để bật đăng nhập, tạo tài khoản giáo viên, phân lớp và tạo tài khoản học viên.

Firebase là dịch vụ của Google — miễn phí ở quy mô một lớp học/trung tâm nhỏ (gói **Spark**, không cần thẻ tín dụng).

## Bước 1 — Tạo dự án Firebase

1. Vào https://console.firebase.google.com, đăng nhập bằng tài khoản Google của bạn.
2. Bấm **"Add project" / "Thêm dự án"**, đặt tên tuỳ ý (ví dụ `hsk-on-tu`), bỏ qua Google Analytics nếu không cần (không bắt buộc).
3. Đợi vài giây để dự án được tạo.

## Bước 2 — Tạo "Web app" để lấy đoạn cấu hình

1. Trong trang tổng quan dự án, bấm biểu tượng **`</>`** (Web) để thêm một ứng dụng web.
2. Đặt tên app tuỳ ý (ví dụ `hsk-web`), **không cần** tick "Firebase Hosting".
3. Firebase sẽ hiện một đoạn code `firebaseConfig = { apiKey: "...", authDomain: "...", ... }` — **giữ nguyên trang này**, bạn sẽ copy các giá trị ở bước 6.

## Bước 3 — Bật đăng nhập bằng Email/Mật khẩu

1. Menu bên trái → **Build → Authentication** → **Get started**.
2. Tab **Sign-in method** → chọn **Email/Password** → bật (Enable) → **Save**.

## Bước 4 — Tạo cơ sở dữ liệu Firestore

1. Menu bên trái → **Build → Firestore Database** → **Create database**.
2. Chọn vị trí máy chủ gần bạn (ví dụ `asia-southeast1`), chọn chế độ **Production mode** → **Enable**.

## Bước 5 — Dán luật bảo mật (Firestore Rules)

1. Trong Firestore Database → tab **Rules**.
2. Mở file `firestore.rules` đi kèm trong thư mục `site/`, copy toàn bộ nội dung.
3. Dán đè vào ô luật trên Firebase Console → bấm **Publish**.

Luật này đảm bảo: mỗi học viên chỉ đọc/sửa được dữ liệu của chính mình; **chỉ tài khoản có vai trò "teacher" mới xem được dữ liệu của tất cả học viên**; và không ai có thể tự phong mình làm giáo viên từ trình duyệt.

## Bước 6 — Dán cấu hình vào trang web

Mở file `site/js/firebase-config.js`, thay các dòng `"DÁN_..."` bằng giá trị thật lấy từ Bước 2, ví dụ:

```js
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "hsk-on-tu.firebaseapp.com",
  projectId: "hsk-on-tu",
  storageBucket: "hsk-on-tu.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};
```

Lưu file. Các giá trị này **không phải bí mật** (chúng vốn công khai trong mã nguồn trình duyệt) — mức độ bảo mật thật sự nằm ở Firestore Rules đã dán ở Bước 5.

## Bước 7 — Cho phép domain khi đưa lên GitHub Pages

Sau khi đưa trang lên GitHub Pages (theo hướng dẫn trong `README.md`), vào **Authentication → Settings → Authorized domains** trên Firebase Console → **Add domain** → nhập domain GitHub Pages của bạn (dạng `<tên-bạn>.github.io`). Nếu thiếu bước này, đăng nhập từ domain đó sẽ báo lỗi.

## Bước 8 — Tạo tài khoản giáo viên đầu tiên (thủ công qua Console)

**Không còn trang tự đăng ký nữa** — toàn bộ tài khoản (kể cả giáo viên) phải được tạo qua Firebase Console hoặc (với học viên) qua Trang giáo viên trong app. Để tạo tài khoản giáo viên đầu tiên cho chính bạn:

1. Vào Firebase Console → **Authentication → Users** → bấm **Add user**.
2. Nhập email và mật khẩu của bạn → **Add user**. Sao chép lại **User UID** vừa được tạo (cột UID trong bảng danh sách).
3. Vào **Firestore Database → Data** → bấm **Start collection** (nếu collection `users` chưa có) → Collection ID nhập `users`.
4. Ở bước tạo document: **Document ID** dán đúng UID vừa copy ở bước 2 (không để Firestore tự sinh ID). Thêm các trường sau:
   - `name` (string) — tên hiển thị, ví dụ `Cô Hương`
   - `email` (string) — đúng email vừa tạo ở bước 2
   - `role` (string) — nhập đúng `teacher`
5. Bấm **Save**.
6. Quay lại trang web → **Đăng nhập** bằng email/mật khẩu vừa tạo — mục **"📊 Trang giáo viên"** sẽ xuất hiện trên thanh đăng nhập.

Từ giờ, **mọi tài khoản học viên đều được tạo từ Trang giáo viên trong app** (không cần vào Console nữa) — xem mục tiếp theo. Chỉ khi cần thêm một giáo viên khác thì mới lặp lại các bước thủ công ở trên.

## Quản lý lớp học & tài khoản học viên (từ Trang giáo viên)

Sau khi đăng nhập bằng tài khoản giáo viên, vào **"📊 Trang giáo viên"**:

1. **Tạo lớp mới**: đặt tên lớp (ví dụ "HSK1 - Tối 2/4/6") và chọn đúng trình độ HSK của lớp đó.
2. **Tạo tài khoản học viên**: nhập họ tên + email học viên, chọn lớp (mật khẩu có thể để trống để hệ thống tự sinh). Sau khi tạo, trang sẽ hiện email + mật khẩu tạm — gửi thông tin này cho học viên để họ tự đăng nhập.
3. Học viên đăng nhập bằng thông tin được cấp sẽ **chỉ ôn tập được đúng trình độ của lớp mình** — các trình độ khác bị khoá (hiện biểu tượng 🔒), kể cả khi họ cố vào thẳng bằng đường dẫn.
4. Muốn chuyển học viên sang lớp khác (đổi cả trình độ được phép ôn): trong bảng danh sách học viên, đổi lựa chọn ở cột **"Lớp"** — hệ thống lưu ngay lập tức.

**Lưu ý quan trọng:** việc giới hạn trình độ này hoạt động ở tầng ứng dụng (ẩn menu, chặn điều hướng) chứ **không phải khoá dữ liệu tuyệt đối** — vì các file từ vựng (`data/hsk*.json`) vẫn là file tĩnh công khai trên GitHub Pages, ai có đường dẫn trực tiếp vẫn tải được. Mức độ này phù hợp cho một lớp học bình thường (ngăn học viên vô tình lạc sang bài chưa học), không phải một hệ thống bảo mật thi cử nghiêm ngặt.

## Trang giáo viên hiển thị gì?

Với mỗi học viên: lớp đang học, hoạt động gần nhất, số bài đã ôn qua, điểm trung bình trắc nghiệm & điền pinyin, danh sách từ hay điền/chọn sai nhất, và số phút học hôm nay / 7 ngày qua (tự động cộng dồn khi học viên mở một bài học và ở lại trang).

## Giới hạn cần biết

- Gói Firebase miễn phí (Spark) đủ dùng cho quy mô vài chục–vài trăm học viên hoạt động bình thường; nếu lớp rất lớn, xem thêm gói trả phí "Blaze" (vẫn có hạn mức miễn phí hào phóng ở đầu mỗi tháng).
- Thời gian học hiện được đo bằng cách kiểm tra mỗi 30 giây khi trình duyệt đang mở và ở tab đó (tab ẩn/máy khoá sẽ không tính) — là số gần đúng, không phải đồng hồ bấm giờ chính xác tuyệt đối.
- "Bài đã ôn" tính khi học viên mở bất kỳ chế độ nào (danh sách/lật thẻ/trắc nghiệm/điền từ) của bài đó — chưa phân biệt mức độ thành thạo.
- Học viên được tạo trước khi cập nhật tính năng phân lớp (nếu có) sẽ chưa có lớp — vào Trang giáo viên, đổi cột "Lớp" cho học viên đó để gán trình độ.
