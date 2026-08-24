# BÁO GIẢNG V4.154 — CỔNG GIÁO VIÊN & KHO PPCT HOÀN THIỆN

Xem `CHANGELOG_V4_154.md` và `KIEM_THU_V4_154.md` để biết các thay đổi đã chốt.

# V4.153 — Hoán đổi tiết tự đồng bộ

Bản này kế thừa V4.152/V4.151 và bổ sung giao dịch Tiết nhận + Tiết nhường. Xem `CHANGELOG_V4_153.md` và `KIEM_THU_V4_153.md`.

# V4.152 — Tiết phát sinh tự đồng bộ Lịch báo giảng + PPCT

Bản này kế thừa toàn bộ V4.151 và hoàn thiện quy trình Tiết phát sinh theo nguyên tắc: **một thao tác của giáo viên → hệ thống tự xử lý phần còn lại**.

## Điểm mới V4.152

- Bấm **Lưu tiết phát sinh** → tự ghi ngay vào **Lịch báo giảng**.
- Tự tính lại **PPCT + tên bài** của đúng **Lớp + Môn + Chính khóa/Chuyên đề** từ vị trí phát sinh trở đi.
- **Sửa/Xóa** cũng tự xóa ô cũ, ghi ô mới và tính lại PPCT; không cần bấm **Ghi Báo giảng** lần nữa.
- Không ghi đè dữ liệu lớp khác khi tuần đã có Báo giảng.
- Tự cập nhật số tiết **Tiến độ**; lỗi Tiến độ được báo riêng.
- Nếu đồng bộ Báo giảng thất bại, Tiết phát sinh tự hoàn tác để tránh lệch dữ liệu.
- Lịch ngày/tuần hiển thị đúng nhãn **★ Phát sinh**.

## Cập nhật V4.152

1. **Apps Script (bắt buộc):** thay `Code.gs` bằng `apps-script/Code.gs` của V4.152 rồi triển khai **Phiên bản mới trên deployment hiện tại**.
2. **GitHub/Vercel (khuyến nghị):** cập nhật project để giao diện V4.152 hiển thị đúng thông báo “đã tự đồng bộ”, bỏ hướng dẫn cũ “bấm Ghi Báo giảng”.
3. Giữ nguyên URL `/exec`; không tạo deployment Apps Script mới.

---

# V4.151 — Kho PPCT chuẩn toàn trường

Bản này kế thừa toàn bộ V4.150 (Tiết phát sinh), V4.149 (lọc TKB chữ trắng/gạch ngang) và Parser PPCT V2.

## Điểm mới

- Tích hợp sẵn **15 nguồn Kế hoạch dạy học/PPCT** do nhà trường cung cấp.
- App tự nhận môn từ TKB và chuẩn hóa các tên viết tắt: Văn, Sử, Anh, TD, QPAN, Địa, GDKTPL, Lý, Hóa, Sinh, CNghệ, Tin, HĐTNHN, GDĐP.
- Giáo viên **không cần dán link PPCT** và không cần cấp quyền Drive/Docs để dùng nguồn chuẩn của trường.
- Modal đổi thành **Kho PPCT chuẩn của trường**; chỉ hiện đúng môn giáo viên đang dạy.
- Nút **Thay nguồn** cho phép giáo viên dùng Google Docs/Sheets cá nhân.
- Nút **Dùng nguồn trường** đưa môn đó trở về kho mặc định.
- Các link PPCT cũ không tự động trở thành nguồn cá nhân của V4.151; điều này giúp chuyển sang kho chuẩn an toàn và đồng nhất.

## Nguồn đã tích hợp

Ngữ văn · Lịch sử · Toán · Tiếng Anh · GDTC · GDQPAN · Địa lí · GDKTPL · Vật lí · Hóa học · Sinh học · Công nghệ · Tin học · HĐTNHN · GDĐP.

Dữ liệu đã chuẩn hóa theo **Lớp 10/11/12** và tách **Chính khóa / Chuyên đề** khi tài liệu có chuyên đề. File `ppct-warehouse-v4151.json` là bản dữ liệu kiểm tra đi kèm project.

## Nguyên tắc an toàn

App không tự bịa PPCT nếu tài liệu nguồn thiếu hoặc mâu thuẫn. Những điểm bất nhất được giữ thành cảnh báo nguồn. Ví dụ nguồn Vật lí 10 có một dòng thiếu Số tiết; nguồn Địa lí có chỗ lệch tổng. Khi tiến độ chạm đúng phần không xác định, app sẽ chặn ghi để tránh điền sai tên bài.

## Cập nhật

1. **GitHub/Vercel:** cập nhật toàn bộ project V4.151 (frontend có giao diện Kho PPCT mới).
2. **Google Apps Script:** thay `Code.gs` bằng `apps-script/Code.gs` của V4.151.
3. Trong Apps Script: **Triển khai → Quản lý hoạt động triển khai → Chỉnh sửa → Phiên bản mới → Triển khai**. Không tạo deployment mới.
4. Không cần nhập lại 15 link PPCT. Mở app → **Kho PPCT** để kiểm tra nguồn tự nhận.

---

# V4.150 — Tiết phát sinh

Bản này kế thừa V4.149 và bổ sung Tiết phát sinh tích hợp trong Lịch dạy.

- Thêm/Sửa/Xóa một tiết ngoài TKB cho Thứ 2–Thứ 7.
- Sáng: tiết 1–5; Chiều: tiết 1–3.
- Chống trùng với TKB, lịch dạy bù và tiết phát sinh khác.
- PPCT tự dồn theo Lớp + Môn + loại tiết từ đúng thời điểm phát sinh.
- Tên bài lấy bắt buộc từ Nguồn PPCT chuẩn; thiếu nguồn thì không cho lưu.
- Hàng phát sinh được gắn nhãn “Phát sinh” trong Lịch dạy.
- Giữ nguyên Parser PPCT V2 và quy tắc TKB: bỏ chữ trắng + gạch ngang, vẫn đọc chữ đỏ.

## Cập nhật triển khai

V4.150 thay đổi cả frontend và Apps Script, vì vậy cần cập nhật GitHub/Vercel **và** Code.gs Apps Script.

# V4.148 — PPCT Parser V2 tổng quát

Bản này kế thừa V4.147 và thay bộ đọc PPCT bằng Parser V2, thiết kế từ các mẫu PPCT thực tế đã phân tích: GDKTPL, Công nghệ, GDĐP, Vật lí, Hóa học, Sinh học và Ngữ văn.

## 1. Ba chiến lược đọc PPCT

### A. PPCT ghi trực tiếp
Dùng cho nguồn có cột kiểu `Tiết PPCT`, `Số TT tiết theo PPCT`, hoặc ô dữ liệu kiểu:
- `2-3`
- `1,2,3`
- `37 - 41`
- `2 (31,32)`
- `3\n(56,57,58)`
- `CĐHT 1-5`, `CĐ1-2`, `CĐ31-35`

Parser ưu tiên dãy PPCT trong ngoặc khi có, chuẩn hóa dấu gạch/dấu phẩy/khoảng trắng và giữ đúng số PPCT tác giả đã khai báo.

### B. Bài học + Số tiết
Dùng cho nguồn như Công nghệ, Vật lí, Sinh học. Parser không dùng TT/STT làm PPCT mà cộng dồn `Số tiết` theo đúng thứ tự bảng.

### C. Chủ đề + Số tiết
Dùng cho nguồn như GDĐP. Parser giữ nguyên thứ tự chủ đề trong tài liệu, kể cả khi số Chủ đề không tăng dần.

## 2. Quy tắc an toàn mới

- Tự nhận Lớp/Khối 10, 11, 12.
- Tách Chính khóa và Chuyên đề lựa chọn.
- Bỏ qua các dòng nhóm như `Chương I...`, `Chuyên đề 1...` nếu đó chỉ là tiêu đề.
- Ôn tập / Kiểm tra / Đánh giá được coi là nội dung PPCT hợp lệ.
- Chuẩn hóa `01 → 1`, `02 → 2`.
- Không tự chia một ô có nhiều bài nếu nguồn chỉ cho tổng số tiết.
- Nếu nguồn Bài/Chủ đề × Số tiết có một nội dung thật nhưng thiếu `Số tiết`, parser dừng tại đó và cảnh báo, không tự đoán để tránh lệch toàn bộ PPCT phía sau.
- Phát hiện bảng cùng khối gần trùng nhau, giữ bảng xuất hiện trước và cảnh báo thay vì cộng gấp đôi.
- Hỗ trợ ghi chú kiểu `Tiết 3,4 dạy/học sau kiểm tra giữa/cuối kì`: các tiết được chuyển đến sau mốc kiểm tra phù hợp thay vì lặp liên tục máy móc.
- Cache đổi sang `ppct_v4148_...` để không giữ kết quả cũ của V4.147.

## 3. Kiểm thử cấu trúc đã thực hiện

- Công nghệ: 10 = 70, 11 = 70, 12 = 70 tiết chính khóa.
- GDĐP: 10 = 35, 11 = 35, 12 = 35 tiết.
- Vật lí: 11 = 70, 12 = 70 chính khóa; Chuyên đề 10/11/12 = 35. Lớp 10 dừng an toàn tại dòng nguồn thiếu Số tiết.
- Sinh học: 10/11/12 = 70 chính khóa; Chuyên đề lớp 11 = 35; phát hiện hai bảng lớp 12 gần trùng và không nhân đôi.
- Đã kiểm thử bộ giải mã dãy PPCT trực tiếp theo cấu trúc Hóa học và Ngữ văn, gồm dãy dấu gạch, dấu phẩy, tiền tố CĐ/CĐHT và PPCT trong ngoặc.

Đây là kiểm thử parser/cấu trúc trước khi triển khai; sau khi cập nhật Apps Script vẫn nên bấm `Lưu nguồn` cho từng môn đại diện để kiểm tra trực tiếp với tài liệu Google Docs đang dùng.

## 4. Cách cập nhật

Bản V4.148 chỉ thay backend PPCT.

1. Mở Google Apps Script hiện tại.
2. Thay toàn bộ `Code.gs` bằng `apps-script/Code.gs` của V4.148.
3. Lưu.
4. Vào `Triển khai → Quản lý các hoạt động triển khai`.
5. Chỉnh sửa deployment hiện tại → chọn `Phiên bản mới` → `Triển khai`.

**Không tạo deployment mới** để URL `/exec` hiện tại không đổi.

Không cần thay `Index.html`, không cần thay `appsscript.json`, và không cần cập nhật GitHub/Vercel cho riêng bản nâng cấp parser này.

## V4.149 — Quy tắc đọc TKB theo định dạng
- Ô có chữ trắng: coi như lịch đã hủy/ẩn, không tạo Báo giảng.
- Ô có chữ gạch ngang: coi như tiết đã hủy, không tạo Báo giảng.
- Ô chữ đỏ: vẫn đọc bình thường (lịch điều chỉnh/chuyển tiết có hiệu lực).
- Ô chữ thường: đọc bình thường.
- Giữ toàn bộ PPCT Parser V2 của V4.148.

Chỉ cần cập nhật `apps-script/Code.gs` và tạo phiên bản triển khai mới trong deployment Apps Script hiện tại. Không cần thay Vercel/Index.html.
