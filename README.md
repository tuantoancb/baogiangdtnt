# Báo giảng điện tử V4.145 — Vercel Multi-Teacher

- Vercel/Next.js: cổng giáo viên + URL `/gv/<slug>` + API proxy.
- Google Apps Script: giữ logic nghiệp vụ và quyền đọc/ghi Google Sheets/Docs.
- Google Sheets: tiếp tục dùng dữ liệu hiện tại.

## Kết nối
1. Cập nhật project Apps Script bằng thư mục `apps-script/`.
2. Deploy Apps Script: **Deploy → New deployment → Web app**; sao chép URL `/exec`.
3. Bản V4.145 đã gắn sẵn URL Apps Script backend hiện tại, có thể deploy thẳng lên Vercel.
4. Tùy chọn bảo mật về sau: đặt `GAS_API_TOKEN` trên Vercel và Script Property `VERCEL_API_TOKEN` cùng giá trị.

## URL
- `/` Cổng giáo viên
- `/admin` Kiểm tra cấu hình
- `/gv/t-tuan`, `/gv/quyen`, `/gv/ha`, ...

`public/app.html` giữ nguyên giao diện V4.143. `public/gas-bridge.js` giả lập `google.script.run` và chuyển lệnh sang `/api/gas`.
