# V4.186 — PĐ GIỮ NGUYÊN KHI TẮT / CHỈ CHUYỂN CHÍNH KHÓA KHI BẬT

Chốt logic ngày 06/09/2026:

- Nút **PĐ → Chính khóa = TẮT**: tiết PĐ vẫn được ghi vào Lịch báo giảng bình thường, chạy tiến độ PĐ riêng `PĐ1, PĐ2, PĐ3...`.
- Nút **PĐ → Chính khóa = BẬT**: tiết PĐ trong TKB được chuyển sang Chính khóa, dùng PPCT chính khóa và lấy `CT` tiếp theo.
- Chuyên đề `CĐ` vẫn độc lập.
- Khôi phục luồng PĐ độc lập trong PPCT và Tiến độ, bao gồm khu **Phụ đạo đại trà** nếu sheet Tiến độ có cột tương ứng.
- Giữ nguyên toàn bộ fix V4.185 về tự nhận đúng khối giáo viên, tránh ghi nhầm giáo viên liền kề.
- PPCT PĐ Toán 10/11/12 tích hợp: 18 tiết/lớp.
