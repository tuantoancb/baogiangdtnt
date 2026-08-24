# V4.152 — Tiết phát sinh tự đồng bộ Lịch báo giảng + PPCT

## Thay đổi chính

- **Lưu/Sửa/Xóa Tiết phát sinh** giờ là một thao tác hoàn chỉnh: app tự cập nhật ngay Lịch báo giảng, không cần bấm **Ghi Báo giảng** lần nữa.
- Sau khi thay đổi, app tính lại PPCT theo đúng thứ tự dạy thực tế của **Lớp + Môn + loại tiết (Chính khóa/Chuyên đề)**.
- Chỉ các dòng thuộc cặp lớp/môn bị ảnh hưởng được xóa và ghi lại; dữ liệu của lớp khác được giữ nguyên.
- Khi sửa Tiết phát sinh sang lớp/môn khác, app đồng bộ cả cặp cũ và cặp mới.
- Khi xóa, ô của tiết phát sinh cũ được xóa khỏi Báo giảng và PPCT các tiết sau tự lùi lại.
- Nếu Báo giảng tuần đang hoàn toàn trống và tất cả nguồn PPCT hợp lệ, app tự ghi luôn toàn bộ tuần. Nếu còn nguồn PPCT khác chưa đủ, app chỉ đồng bộ đúng lớp/môn phát sinh để không ghi sai dữ liệu.
- Tự cập nhật lại số tiết trong file **Tiến độ**. Nếu Tiến độ lỗi, phần Báo giảng đã đồng bộ vẫn được giữ và giao diện báo cảnh báo riêng.
- Có khóa thao tác để tránh hai lần lưu đồng thời.
- Nếu phần đồng bộ Báo giảng thất bại, thay đổi Tiết phát sinh tự hoàn tác để trạng thái app và sheet không lệch nhau.
- Lịch ngày/tuần giữ cờ `isExtra`, vì vậy tiết phát sinh hiển thị đúng nhãn **★ Phát sinh**.

## Kế thừa

- V4.151: Kho PPCT chuẩn toàn trường, 15 nhóm môn.
- V4.150: Tiết phát sinh.
- V4.149: bỏ tiết TKB chữ trắng/gạch ngang; chữ đỏ vẫn đọc.
- Parser PPCT V2.
