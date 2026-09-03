# V4.171 – Sửa liên kết Thời khóa biểu cá nhân

- Không còn mở `/gv/{slug}` trên `thoikhoabieuntt.vercel.app` vì app TKB hiện chưa có route này.
- Mở URL gốc và truyền thông tin giáo viên qua query: `?teacher=...&slug=...&name=...`.
- Báo giảng vẫn dùng `/gv/{slug}` như cũ.
- Nhập điểm vẫn mở `https://nhapdiemntt.vercel.app/`.
- Giữ nguyên giao diện hồng tối giản V4.170.
