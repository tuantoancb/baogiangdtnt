# V4.168 — GIÁO VIÊN NTT

- Đổi Cổng giáo viên thành **GIÁO VIÊN NTT**.
- Quy trình: **chọn Tổ KHTN/KHXH → chọn giáo viên → mở chức năng cá nhân**.
- Ba chức năng: **Thời khóa biểu cá nhân / Báo giảng / Nhập điểm**.
- Giữ nguyên toàn bộ danh sách 35 giáo viên và link Báo giảng `/gv/{slug}`.
- Tìm kiếm giáo viên theo tên trên toàn trường.
- Nhớ giáo viên đã chọn bằng localStorage.
- BGH vẫn chọn được nhưng không lặp trong danh sách hai tổ.
- Thời khóa biểu dùng `NEXT_PUBLIC_TKB_BASE_URL` (mặc định `https://thoikhoabieuntt.vercel.app`).
- Báo giảng dùng `NEXT_PUBLIC_BAOGIANG_BASE_URL` (mặc định `https://baogiangdtnt.vercel.app`).
- Nhập điểm dùng `NEXT_PUBLIC_NHAPDIEM_BASE_URL`; nếu chưa cấu hình sẽ mở trang chờ theo đúng giáo viên đã chọn.
