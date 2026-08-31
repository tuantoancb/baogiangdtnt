# V4.159 — Thêm giáo viên Hoàng Thị Lan

## Đã bổ sung
- Giáo viên: **Hoàng Thị Lan**
- Mã TKB/Báo giảng: **Lan**
- Môn: **Toán**
- Tổ: **KHTN**
- Đường dẫn: **/gv/lan**

## Thay đổi kỹ thuật
- Thêm hồ sơ vào `lib/teachers.ts` để hiển thị trên Cổng giáo viên.
- Thêm `Lan` vào `TEACHER_PROFILES` trong Apps Script để `/gv/lan` nhận đúng giáo viên.
- Giữ `TEACHER_DIRECTORY` hiện có: Hoàng Thị Lan → KHTN → Toán.
- Kế thừa toàn bộ logic V4.158 về chuẩn hóa tên môn và cập nhật Tiến độ.

## Triển khai
V4.159 thay đổi cả frontend và backend: cập nhật GitHub/Vercel và thay `Code.gs`, sau đó tạo **Phiên bản mới** trên deployment Apps Script hiện tại.
