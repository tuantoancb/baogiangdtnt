# Kiểm thử V4.152 — Tự đồng bộ Tiết phát sinh

## 1. Thêm một tiết

Ví dụ: Thứ 2, Tiết 5, 11A4, Toán, Chính khóa.

Kỳ vọng sau khi bấm **Lưu tiết phát sinh**:
1. Tiết được lưu trong danh sách Tiết phát sinh.
2. Lịch báo giảng của đúng tuần có ngay dòng 11A4 tại Thứ 2 – Tiết 5.
3. PPCT/Tên bài lấy từ Kho PPCT.
4. Các tiết 11A4 + Toán + Chính khóa phía sau trong tuần tăng 1 PPCT.
5. Không cần bấm Ghi Báo giảng lần nữa.
6. Lịch ngày/tuần hiện nhãn ★ Phát sinh.

## 2. Xóa tiết

Kỳ vọng:
- Ô cũ trong Lịch báo giảng được xóa.
- PPCT các tiết cùng Lớp + Môn + loại tiết phía sau tự lùi lại.
- Lớp khác không thay đổi.

## 3. Sửa tiết

- Sửa ngày/tiết trong cùng lớp: ô cũ được xóa, ô mới được ghi; PPCT tính lại theo thứ tự thời gian.
- Sửa sang lớp/môn khác: cả cặp cũ và cặp mới được đồng bộ.

## 4. Chống lỗi

- Chọn tiết đang có TKB/dạy bù/phát sinh khác: phải chặn trước khi lưu.
- Thiếu tên bài PPCT của đúng lớp/môn bị ảnh hưởng: không lưu.
- Nếu ghi Lịch báo giảng lỗi: dữ liệu Tiết phát sinh tự hoàn tác.
- Nếu chỉ cập nhật Tiến độ lỗi: Báo giảng vẫn giữ dữ liệu đã đồng bộ và app báo cảnh báo Tiến độ.

## 5. Kiểm tra kỹ thuật đã chạy khi đóng gói

- `Code.gs`: kiểm tra cú pháp JavaScript bằng Node — đạt.
- JavaScript inline của giao diện Vercel: trích xuất và kiểm tra cú pháp — đạt.
- `public/app.html` và `apps-script/Index.html`: đồng bộ nội dung, chỉ khác thẻ bridge dành cho Vercel — đạt.
