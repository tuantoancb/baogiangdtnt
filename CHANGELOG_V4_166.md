# V4.166 — Cổng giáo viên chuyên nghiệp / chọn nhanh

- Thiết kế lại Cổng giáo viên theo bố cục chuyên nghiệp có thanh điều hướng trái trên máy tính và tự ẩn trên điện thoại.
- Thêm ô tìm kiếm nổi bật: tìm theo họ tên, mã giáo viên hoặc môn học; kết quả lọc ngay khi gõ.
- Ban Giám hiệu hiển thị gọn một hàng, không lặp lại trong danh sách tổ/môn.
- KHTN và KHXH giữ 2 cột trên màn hình lớn, chuyển 1 cột trên điện thoại.
- Mỗi môn là một accordion; Toán và Ngữ văn mở sẵn, các môn còn lại thu gọn.
- Mỗi giáo viên có nút “Mở app” rõ ràng, giữ nguyên đường dẫn `/gv/<slug>`.
- Nông Thị Thanh Hoài tiếp tục xuất hiện ở cả Lịch sử và GDĐP nhưng cùng trỏ về một app cá nhân.
- Chỉ thay frontend Cổng giáo viên; backend/Code.gs giữ nguyên logic V4.165/V4.163 hiện có.
