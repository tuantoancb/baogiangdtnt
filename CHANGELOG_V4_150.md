# V4.150 — Cải tiến Tiết phát sinh

## Chức năng mới
- Nút **＋ Tiết phát sinh** nằm trực tiếp trong khối Lịch dạy.
- Form mở ngay trong trang, không cần sửa TKB gốc.
- Chọn Ngày dạy, Buổi, Tiết, Lớp, Môn, Chính khóa/Chuyên đề.
- Tự tính PPCT kế tiếp và lấy tên bài từ Nguồn PPCT chuẩn trước khi lưu.
- Chống trùng với TKB gốc, lịch dạy bù và tiết phát sinh khác.
- Hỗ trợ Sáng tiết 1–5, Chiều tiết 1–3.
- Lưu theo Giáo viên + Tuần, dùng chung kiến trúc đa giáo viên.
- Có Sửa/Xóa tiết phát sinh.
- Tiết phát sinh hiển thị trong Lịch dạy với nhãn **★ Phát sinh**.
- PPCT của đúng **Lớp + Môn + loại tiết** tự dồn theo thứ tự dạy thực tế từ tiết phát sinh trở đi.
- Nếu thiếu Nguồn PPCT/tên bài, app không cho lưu để tránh ghi sai.

## Giữ nguyên từ V4.149
- PPCT Parser V2 tổng quát.
- TKB chữ trắng: bỏ qua.
- TKB chữ gạch ngang: bỏ qua.
- TKB chữ đỏ: vẫn đọc bình thường.
- Dạy bù/đổi TKB theo tuần.

## Kiểm thử logic
1. Chèn tiết 11A4 vào Thứ 2, Tiết 5 trước các tiết 11A4 ở Thứ 3/4: PPCT của 11A4 được dồn đúng.
2. Chèn vào ô đã có tiết: app chặn và yêu cầu chọn tiết trống.
3. Sửa/Xóa: cấu hình tuần được cập nhật; nếu tuần đã ghi Báo giảng, app nhắc ghi lại để đồng bộ PPCT trong sheet.

## Triển khai với mô hình GitHub → Vercel + Apps Script
- GitHub/Vercel: cập nhật toàn bộ project V4.150 (quan trọng nhất là `public/app.html`).
- Google Apps Script: cập nhật `Code.gs`, lưu và tạo **Phiên bản mới** trên deployment hiện tại để giữ nguyên URL `/exec`.
- `apps-script/Index.html` cũng đã đồng bộ giao diện V4.150, dùng nếu mở app trực tiếp từ Apps Script; với frontend Vercel thì không bắt buộc thay file này.
