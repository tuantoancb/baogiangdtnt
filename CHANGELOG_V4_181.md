# V4.181 — FIX PĐ toggle không bật/tắt được

Nguyên nhân: giao diện Vercel đã có công tắc nhưng endpoint Apps Script đang chạy vẫn là deployment cũ, chưa có action `getPdRegularToggle` / `setPdRegularToggle`.

Sửa:
- Giữ công tắc có thể thao tác, không mắc kẹt ở trạng thái disabled.
- Nếu backend cũ, hiển thị rõ “Chưa kết nối” thay vì giả vờ “Đang tắt”.
- Bộ `apps-script/Code.gs` có đầy đủ 2 action PĐ.
- Bắt buộc cập nhật `Code.gs` trong Apps Script và Deploy > Manage deployments > Edit > New version > Deploy.
- Sau đó Vercel gọi lại cùng Web App URL sẽ lưu PĐ riêng từng giáo viên.
