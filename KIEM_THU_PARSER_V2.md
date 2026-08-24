# Ma trận kiểm thử PPCT Parser V2 — V4.148

| Mẫu | Chính khóa | Chuyên đề | Kết quả đặc biệt |
|---|---|---|---|
| Công nghệ | 10:70 · 11:70 · 12:70 | Không | Ghi chú dạy sau kiểm tra được hỗ trợ |
| GDĐP | 10:35 · 11:35 · 12:35 | Không | Giữ nguyên thứ tự Chủ đề |
| Vật lí | 10: dừng tại điểm thiếu dữ liệu · 11:70 · 12:70 | 10:35 · 11:35 · 12:35 | Không đoán dòng thiếu Số tiết |
| Sinh học | 10:70 · 11:70 · 12:70 | 11:35 | Chống hai bảng lớp 12 gần trùng |
| Hóa học | PPCT trực tiếp | PPCT trực tiếp | Hỗ trợ `2-3`, `1,2,3`, `CĐHT 1-5`... |
| Ngữ văn | PPCT trong ngoặc | PPCT trong ngoặc | Lấy nội dung cụ thể, bỏ tiêu đề bài/chuyên đề tổng |

## Nguyên tắc ưu tiên

1. Nếu ô PPCT chứa danh sách/range rõ ràng → dùng trực tiếp số nguồn.
2. Nếu bảng là Bài học/Chủ đề + Số tiết → cộng dồn theo thứ tự nguồn.
3. Không lấy TT/STT làm PPCT ở bảng loại 2.
4. Không tự đoán dữ liệu bị thiếu.
