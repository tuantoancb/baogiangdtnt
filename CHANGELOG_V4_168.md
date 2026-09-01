# V4.168 – Liên thông 3 app theo một giáo viên

- Dùng **slug giáo viên** hiện có (`t-tuan`, `phong`, `ha-oanh`...) làm `teacherId` chung.
- Thêm nút **Thời khóa biểu** vào menu desktop và mobile.
- Mục **Giáo án** mở `minhchunggiaoan.vercel.app` thay vì trỏ nhầm vào app nộp giáo án.
- Giữ nguyên nút **Nộp giáo án**, nhưng truyền danh tính giáo viên sang `nopgiaoan.vercel.app`.
- Mọi link liên thông gửi đồng thời: `teacherId`, `gv`, `teacherKey`, `teacherName`, `source=baogiang`.
- Không thay đổi logic ghi Báo giảng, PPCT, Tiến độ, TKB nguồn, ngày nghỉ, tiết phát sinh hay hoán đổi tiết.
- Đồng bộ thay đổi vào cả `public/app.html` (Vercel) và `apps-script/Index.html` để hai bản giao diện không lệch nhau.

## Ví dụ Nguyễn Thanh Tuấn

Từ `/gv/t-tuan`, app sẽ mở URL dạng:

- TKB: `https://thoikhoabieuntt.vercel.app/?teacherId=t-tuan&gv=t-tuan&teacherKey=T.Tuấn&teacherName=Nguyễn%20Thanh%20Tuấn&source=baogiang`
- Minh chứng: `https://minhchunggiaoan.vercel.app/?teacherId=t-tuan&gv=t-tuan&teacherKey=T.Tuấn&teacherName=Nguyễn%20Thanh%20Tuấn&source=baogiang`
- Nộp giáo án: cùng bộ tham số, gửi sang `nopgiaoan.vercel.app`.

> Lưu ý: V4.168 hoàn thiện **phía Báo giảng (app gửi)**. Để TKB và Minh chứng tự lọc đúng giáo viên ngay khi mở, hai app nhận cần đọc `teacherId`/`gv`; đây là bước tích hợp tiếp theo.
