# V4.155 — Ngày nghỉ + Lịch ngày từ Lịch báo giảng

## Chốt nghiệp vụ
- TKB là lịch dự kiến, không bị sửa khi khai báo ngày nghỉ.
- Lịch báo giảng là lịch thực tế duy nhất.
- Lịch ngày / Cả tuần đọc 100% từ Lịch báo giảng, không còn TKB dự phòng.
- Tiến độ được tính sau khi Lịch báo giảng đã cập nhật.

## Ngày nghỉ
- Thêm nút `💤 Ngày nghỉ` cạnh `Tiết phát sinh` và `Hoán đổi tiết`.
- Phạm vi: Cả trường / Buổi sáng / Buổi chiều / Một lớp cụ thể.
- Có lý do nghỉ, danh sách ngày đã khai báo, sửa/xóa.
- Ngày nghỉ dùng chung toàn hệ thống qua Script Properties.
- Các tiết thuộc phạm vi nghỉ bị loại khỏi lịch thực tế, không tiêu thụ PPCT.
- Khi xóa ngày nghỉ, tiết dạy được khôi phục và PPCT tính lại.
- Báo giảng đánh dấu `💤 Nghỉ · <lý do>` ở đúng tiết bị ảnh hưởng.
- Dashboard hiển thị banner NGHỈ và ghi rõ không tính tiến độ chương trình.

## Đồng bộ an toàn
- Không quét/ghi đồng loạt 33 giáo viên trong một lần để tránh timeout Apps Script.
- Mỗi giáo viên tự đồng bộ ngày nghỉ của tuần khi mở/chọn TKB.
- Giáo viên đang mở được đồng bộ ngay khi lưu/xóa ngày nghỉ.
- Có chữ ký đồng bộ theo giáo viên + tuần để không ghi lặp không cần thiết.
