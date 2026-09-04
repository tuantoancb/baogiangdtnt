# V4.177 — Đường dẫn cá nhân /gv/{slug}

- Báo giảng hỗ trợ URL dạng `https://baogiangdtnt.vercel.app/gv/dung`.
- Dùng Next.js rewrite nội bộ `/gv/:slug -> /app.html?gv=:slug`, nên thanh địa chỉ vẫn giữ `/gv/dung`.
- Bỏ Route Handler cũ vốn redirect và làm URL đổi sang `/app.html?gv=dung`.
- Cổng giáo viên tạo link TKB/Báo giảng/Nhập điểm theo cùng chuẩn `/gv/{slug}`.
- Không thay đổi backend Apps Script hoặc dữ liệu báo giảng.
