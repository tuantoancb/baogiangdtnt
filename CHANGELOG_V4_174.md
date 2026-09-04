# V4.174 — Mở chức năng ở tab mới + sửa 404 /gv

- Cả 3 thẻ: Thời khóa biểu cá nhân, Báo giảng, Nhập điểm mở ở tab mới (`target=_blank`).
- Báo giảng không còn gọi trực tiếp `/gv/<slug>` từ Cổng; thay bằng `/app.html?gv=<slug>` để app Báo giảng nhận đúng giáo viên và tránh 404.
- Thêm route tương thích `/gv/[slug]` tự chuyển sang `/app.html?gv=<slug>` để các link cũ/bookmark vẫn hoạt động.
- Thời khóa biểu tiếp tục dùng URL gốc với tham số `teacher`, `slug`, `name`.
- Nhập điểm cũng nhận bộ tham số giáo viên tương tự; app đích có thể dùng hoặc bỏ qua.
- Không thay đổi backend Apps Script.
