# Kiểm thử V4.156

1. Có `17-22.8`, `TKB 24-29.8` -> mở app phải chọn `TKB 24-29.8`.
2. Thêm `TKB 31.8-5.9` -> mở app phải tự chọn `TKB 31.8-5.9` dù tab không đứng cuối.
3. Có cả `TKB 31.8-5.9` và `TKB(GV) 31.8-5.9` -> ưu tiên TKB chính hoặc backendPreferred nếu backendPreferred thuộc đúng tuần mới nhất.
4. Chọn lại một tuần cũ -> thao tác tiếp theo trong trang không được tự nhảy về tuần mới nhất.
5. Reload/mở app lại -> tự trở về tuần mới nhất.
6. Kiểm tra liên kết Báo giảng cùng token tuần vẫn chạy qua `onTkbSheetChange(true)`.
