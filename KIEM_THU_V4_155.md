# Kiểm thử V4.155

1. Mở một giáo viên, chọn đúng TKB/Báo giảng tuần.
2. Bấm `💤 Ngày nghỉ` → chọn một ngày có tiết → Cả trường → nhập lý do → Lưu.
3. Kiểm tra Lịch ngày: có banner NGHỈ, không hiện các tiết nghỉ như tiết dạy.
4. Kiểm tra Lịch báo giảng: tiết bị ảnh hưởng không còn Môn/Lớp/PPCT/Tên bài và cột ghi chú có `💤 Nghỉ · ...`.
5. Kiểm tra PPCT tiết sau: tự lùi, không mất số PPCT.
6. Kiểm tra Tiến độ: số tiết thực dạy giảm tương ứng.
7. Thử phạm vi Buổi sáng: buổi chiều vẫn giữ lịch.
8. Thử phạm vi Một lớp: chỉ lớp được chọn bị loại khỏi lịch thực tế.
9. Xóa ngày nghỉ: tiết được khôi phục, PPCT phía sau tính lại.
10. Mở giáo viên khác cùng tuần: app tự đồng bộ ngày nghỉ khi chọn TKB.
11. Ngày chưa có Lịch báo giảng: Lịch ngày phải báo chưa có Lịch báo giảng, không rơi về TKB dự phòng.
12. Tiết phát sinh/Hoán đổi ngoài ngày nghỉ vẫn hoạt động như V4.153/V4.154.
