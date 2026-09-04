CỔNG GIÁO VIÊN NTT V4.178 – SỬA LINK CÁ NHÂN

Quan trọng:
- File ZIP này chứa index.html + vercel.json ngay ở thư mục gốc, có thể giải nén rồi kéo thẳng lên Vercel.
- Cổng chính: /gv/{slug}
- TKB: https://thoikhoabieuntt.vercel.app/gv/{slug}
- Báo giảng V4.176 hiện nhận giáo viên bằng ?gv={slug}, nên link đúng là https://baogiangdtnt.vercel.app/?gv={slug}
- Nộp giáo án: https://nopgiaoan.vercel.app/?gv={slug}
- Nhập điểm: cấu hình domain một lần; mặc định nối /gv/{slug}.

Khi app Báo giảng được bổ sung rewrite /gv/:slug -> /?gv=:slug thì có thể đổi ROUTE.bg từ query sang path trong index.html.
