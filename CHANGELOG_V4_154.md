# V4.154 — Hoàn thiện Cổng giáo viên & Kho PPCT

## Nội dung đã chốt

- Giữ nguyên toàn bộ logic V4.153: TKB chữ trắng/gạch ngang, Tiết phát sinh, tự đồng bộ Lịch báo giảng + PPCT, Hoán đổi tiết và Kho PPCT chuẩn toàn trường.
- Thiết kế lại Cổng giáo viên: Ban giám hiệu riêng ở trên, sau đó KHTN và KHXH, trong mỗi tổ nhóm theo môn; có tìm kiếm, lọc tổ, lọc môn, sắp xếp và chuyển dạng lưới/danh sách.
- Bổ sung **Lê Thị Lan Phương**: Hiệu trưởng, GDĐP 10–11–12, đường dẫn `/gv/phuong`.
- Đánh dấu **Nguyễn Thế Phong** và **Hà Thị Thu Oanh** là Phó Hiệu trưởng.
- Chuẩn hóa tổ KHTN: Nông Thị Bích Ngọc, Ma Thị Anh, Nông Hồng Lanh.
- Chuẩn hóa tổ KHXH: Nguyễn Thị Ngọc Liễu, Trần Chiến Thắng, Nông Trung Hiếu.
- Sửa lỗi Kho PPCT: lần mở đầu không còn rơi về Toán khi giáo viên chưa nhận diện xong. Frontend chờ teacher + TKB; backend không dùng Toán làm fallback cho yêu cầu rỗng.
- Thu gọn thẻ Kho PPCT: mặc định chỉ hiện môn, các khối có dữ liệu, trạng thái sẵn sàng; số PPCT chi tiết nằm trong “Xem chi tiết”.

## Cập nhật triển khai

- **Vercel/GitHub:** bắt buộc cập nhật vì Cổng giáo viên và giao diện Kho PPCT thay đổi.
- **Apps Script:** thay `apps-script/Code.gs`, sau đó chỉnh sửa deployment hiện tại → Phiên bản mới → Triển khai. Không tạo deployment mới.
