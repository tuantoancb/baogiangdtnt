BÁO GIẢNG V4.179 — BẬT/TẮT PĐ → CHÍNH KHÓA THEO TỪNG GIÁO VIÊN

Nền nâng cấp: V4.178 — 3 luồng tiến độ Chính khóa / CĐ / PĐ.

1) Code_V4_179_BAT_TAT_PD_THEO_GIAO_VIEN.gs
- Thay Code.gs backend hiện tại bằng file này.
- Mặc định công tắc PĐ của mọi giáo viên là TẮT.
- BẬT: môn có hậu tố PĐ/PD/Phụ đạo được bỏ hậu tố và tính như chính khóa => lấy CT kế tiếp.
- TẮT: tiết PĐ bị bỏ qua khỏi lịch hiệu lực => không chiếm CT.
- Trạng thái lưu riêng từng giáo viên bằng Script Properties.
- API thêm: getPdAsRegularConfig, savePdAsRegularConfig.

2) PD_TOGGLE_CARD.html
- Đây là thẻ UI hoàn chỉnh của công tắc, không chứa logic PPCT.
- Nếu chạy trong Apps Script HTMLService, thẻ gọi trực tiếp google.script.run.
- Nếu giao diện chính ở Vercel, thẻ phát sự kiện baogiang:pd-toggle; frontend hiện tại chỉ cần nối sự kiện này vào API action savePdAsRegularConfig.

Lưu ý quan trọng:
Frontend baogiangdtnt.vercel.app hiện không có source project trong Vercel connector/Library của phiên làm việc, nên không thay nguyên index.html của app để tránh làm mất giao diện hiện tại. Backend V4.179 đã được tích hợp trên đúng nền V4.178 mới nhất tìm thấy trong Library.
