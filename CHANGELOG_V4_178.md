# V4.178 — FIX 404 /gv/{slug}
- Bổ sung `vercel.json` ở thư mục gốc.
- Rewrite trực tiếp `/gv/:slug` -> `/app.html?gv=:slug`.
- `app.html` đã tự đọc slug cả từ query và pathname `/gv/...`.
- Không redirect nên thanh địa chỉ giữ nguyên `/gv/{slug}`.
