# V4.184 — FIX CẢNH BÁO GHI ĐÈ ẢO

- Giữ nguyên cơ chế tự nhận cột khối giáo viên của V4.183 (cô Lan tự nhận FU; giáo viên khác tự nhận cột riêng).
- Sửa `checkExistingWrite`: chỉ cảnh báo khi 4 ô Môn/Lớp/PPCT/Tên bài thực sự chứa dữ liệu báo giảng.
- Bỏ qua tiêu đề bảng, ký tự zero-width/rác và ô mẫu không phải dữ liệu báo giảng.
- Không thay đổi logic ghi báo giảng, PĐ → Chính khóa, Chuyên đề, dạy bù, ngày nghỉ.
- Có thêm `details` trong kết quả kiểm tra để chẩn đoán nếu cần.
