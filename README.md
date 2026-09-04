# CỔNG GIÁO VIÊN NTT — V1.0

Bản chốt giao diện xanh nổi bật, tối ưu desktop/mobile.

## Chức năng
- Chọn 1 trong 35 giáo viên, hiển thị họ tên + môn.
- Ghi nhớ giáo viên trên thiết bị.
- Có thể mở portal bằng `?gv=t-tuan`, `?gv=v-diep`, ... để chọn sẵn giáo viên.
- Toàn bộ thẻ công cụ và nút CTA đều mở ở tab mới.
- TKB truyền slug giáo viên qua `/gv/<slug>`.
- Báo giảng truyền slug giáo viên qua `?gv=<slug>`.
- Nhập điểm có trang trung gian an toàn cho tới khi có URL production chính thức.

## Liên kết đang cấu hình
- TKB: `https://thoikhoabieuntt.vercel.app/gv/<slug>`
- Báo giảng: `https://baogiangdtnt.vercel.app/?gv=<slug>`
- Nhập điểm: chưa có URL production được xác nhận.

Khi có link Nhập điểm, mở `app.js` và đặt:

```js
score: 'https://TEN-APP-NHAP-DIEM.vercel.app/?gv='
```

Không cần sửa danh sách giáo viên hay từng thẻ.

## Deploy Vercel
Upload toàn bộ thư mục này hoặc ZIP lên Vercel. Không cần Environment Variables.
