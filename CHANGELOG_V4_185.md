# V4.185 — FIX GHI NHẦM KHỐI GIÁO VIÊN LIỀN KỀ

- Sửa lỗi khi hai khối giáo viên nằm sát nhau, vùng quét của giáo viên sau có thể nhìn thấy tiêu đề của giáo viên trước.
- Không còn lấy tiêu đề `Ngày, thứ` đầu tiên trong vùng quét.
- Thu tất cả tiêu đề hợp lệ và chọn tiêu đề gần ô tên giáo viên nhất.
- Thêm chốt an toàn: nếu tiêu đề gần nhất cách ô tên giáo viên quá 4 cột thì dừng, không đoán và không ghi.
- Trường hợp ảnh kiểm tra: Vũ Thị Diệp bắt đầu ở FM, Hoàng Thị Lan bắt đầu ở FU; cô Lan sẽ chọn FU thay vì FM.
- Không hard-code FU nên không ảnh hưởng giáo viên khác.
