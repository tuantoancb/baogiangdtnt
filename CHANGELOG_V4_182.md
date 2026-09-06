# V4.182 — FIX Ô ĐÍCH BÁO GIẢNG

- Sửa lỗi `Không tìm được ô đích nào trong sheet báo giảng.`
- Nhận diện ngày ở cả dạng `2`, `Thứ 2`, `2 (dd/mm)` và `Thứ 2 (dd/mm)`.
- Chuẩn hóa `Sáng/Chiều` trước khi dò ô đích.
- Có fallback cấu trúc chuẩn 6 ngày × 5 tiết cho mỗi buổi nếu ô ngày/tiết bị gộp hoặc định dạng khác.
- Không thay đổi logic PPCT, PĐ→Chính khóa, Chuyên đề, ngày nghỉ, dạy bù.
