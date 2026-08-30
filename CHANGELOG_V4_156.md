# V4.156 — Tự chọn TKB tuần mới nhất

- Khi mở app, ô **THỜI KHÓA BIỂU** tự chọn tuần có ngày bắt đầu mới nhất.
- Không phụ thuộc thứ tự các tab trong Google Sheet.
- Nếu tuần mới nhất có nhiều phiên bản, ưu tiên phiên bản backend đang dùng khi nó thuộc tuần mới nhất; nếu không, ưu tiên tab `TKB ...` chính và tránh tự chọn `TKB(GV) ...`.
- Bỏ việc nhớ TKB cũ bằng `localStorage`, nên mở app lại luôn trở về tuần mới nhất.
- Khi giáo viên chủ động chọn tuần cũ, lựa chọn đó được giữ nguyên trong phiên thao tác hiện tại; app không tự nhảy lại trong lúc đang làm việc.
- Dòng hướng dẫn đổi thành: **Mặc định chọn tuần mới nhất · Có thể mở lại tuần cũ**.
- Không thay đổi Apps Script/backend của V4.155.
