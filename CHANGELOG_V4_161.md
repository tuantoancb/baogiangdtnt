# V4.161 — Quản trị tài khoản giáo viên

- Thêm trang `/admin` có đăng nhập bằng mật khẩu quản trị.
- Theo dõi: đã dùng/chưa dùng, lần đầu truy cập, lần cuối truy cập, lần cuối ghi báo giảng, số lượt dùng.
- 3 mức quyền: **Hoạt động / Chỉ xem / Đã khóa**.
- Quyền được kiểm tra ở Apps Script backend trước khi thực thi API. `Chỉ xem` chặn thao tác ghi; `Đã khóa` chặn toàn bộ profile giáo viên.
- Tự tạo sheet `QuanLyGiaoVien` trong file Báo giảng để lưu trạng thái và nhật ký sử dụng.
- Thêm `V4161_TAO_MAT_KHAU_ADMIN()` để tạo mật khẩu quản trị an toàn trong Script Properties.
- Giữ nguyên 35 giáo viên và toàn bộ chức năng V4.160/V4.158.
