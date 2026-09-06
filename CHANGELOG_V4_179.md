# V4.179 — BẬT/TẮT PĐ → CHÍNH KHÓA THEO GIÁO VIÊN

- Mỗi giáo viên có công tắc riêng `PĐ → Chính khóa`.
- Mặc định Tắt.
- Bật: tiết PĐ trong TKB được đổi thành môn chính khóa tương ứng trước khi tính PPCT, dùng nguồn PPCT chính khóa và lấy CT tiếp theo.
- Tắt: tiết PĐ bị bỏ qua khi lên Báo giảng và không chiếm CT.
- Không ảnh hưởng luồng Chuyên đề CĐ.
- Trạng thái lưu trong Apps Script Properties theo mã giáo viên.
- Đã tích hợp sẵn vào `public/app.html` và `apps-script/Index.html`; không cần PATCH thủ công.
