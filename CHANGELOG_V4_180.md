# V4.180 — FIX LAN + ĐỒNG BỘ CÔNG TẮC PĐ

- Sửa dò khối Báo giảng giáo viên: quét 4 hàng đầu, chuẩn hóa dấu/khoảng trắng, chấp nhận tên đầy đủ/khóa/slug và tiền tố như "GV:".
- Sửa trường hợp Hoàng Thị Lan báo "Không tìm thấy khối báo giảng" khi tên hiển thị khác nhẹ so với cấu hình.
- Công tắc PĐ → Chính khóa không còn tình trạng nút xanh nhưng chữ "Đang tắt": reset trạng thái trình duyệt, đọc lại backend khi trang hiện, hiển thị "Đang tải..." trong lúc đồng bộ.
- Khi không đọc được cấu hình, giao diện tạm coi PĐ là Tắt để an toàn.
- Giữ nguyên logic: Bật = PĐ dùng PPCT chính khóa và chiếm CT; Tắt = bỏ qua PĐ, không chiếm CT; Chuyên đề giữ riêng.
