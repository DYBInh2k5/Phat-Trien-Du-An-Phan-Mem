# TÀI LIỆU ĐẶC TẢ CHI TIẾT NGHIỆP VỤ HỌC VỤ
## HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) — THPT HOA SEN (HSU)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (SCHOOL MANAGEMENT SYSTEM - SMS)
MÃ MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM
VỊ TRÍ TÀI LIỆU: docs/CHI_TIET_NGHIEP_VU_HE_THONG.md
TÁC GIẢ: NHÓM DỰ ÁN PHÁT TRIỂN PHẦN MỀM HSU (TRƯỞNG NHÓM: VÕ DUY BÌNH)
NGÀY LẬP: 27/10/2026
PHIÊN BẢN: 2.0 (HOÀN THIỆN ĐẶC TẢ NGHIỆP VỤ HỌC VỤ & QUY CHẾ BGD&ĐT)
================================================================================
```

---

## MỤC LỤC

1. [Phần 1: Giới Thiệu & Bối Cảnh Nghiệp Vụ Giáo Dục](#phan-1-gioi-thieu--boi-canh-nghiep-vu-giao-duc)
2. [Phần 2: 5 Nhóm Người Dùng & Quyền Hạn Thực Tế (Actors)](#phan-2-5-nhom-nguoi-dung--quyen-han-thuc-te-actors)
3. [Phần 3: Phân Hệ Quản Lý Hồ Sơ Học Sinh, Lớp Học & Phân Công](#phan-3-phan-he-quan-ly-ho-so-hoc-sinh-lop-hoc--phan-cong)
4. [Phần 4: Phân Hệ Điểm Danh & Chuyên Cần Học Đường](#phan-4-phan-he-diem-danh--chuyen-can-hoc-duong)
5. [Phần 5: Phân Hệ Sổ Điểm Điện Tử & Quy Chế Thông Tư 22/2021/TT-BGDĐT](#phan-5-phan-he-so-diem-dien-tu--quy-che-thong-tu-222021tt-bgddt)
6. [Phần 6: Quy Trình Vòng Đời Sổ Điểm & Chốt Khóa Điểm Số](#phan-6-quy-trinh-vong-doi-so-diem--chot-khoa-diem-so)
7. [Phần 7: Phân Hệ Nhật Ký Kiểm Toán (Audit Trail) Chống Gian Lận Điểm](#phan-7-phan-he-nhat-ky-kiem-toan-audit-trail-chong-gian-lan-diem)
8. [Phần 8: Phân Hệ Thời Khóa Biểu & Thuật Toán Chống Xung Đột Lịch](#phan-8-phan-he-thoi-khoa-bieu--thuat-toan-chong-xung-dot-lich)
9. [Phần 9: Phân Hệ Đánh Giá Rèn Luyện (Hạnh Kiểm) & Khen Thưởng](#phan-9-phan-he-danh-gia-ren-luyen-hanh-kiem--khen-thuong)
10. [Phần 10: Phân Hệ Sổ Liên Lạc Điện Tử & Cổng Phụ Huynh Trực Tuyến](#phan-10-phan-he-so-lien-lac-dien-tu--cong-phu-huynh-truc-tuyen)
11. [Phần 11: Ma Trận Quy Tắc Nghiệp Vụ Cốt Lõi (Business Rules Summary)](#phan-11-ma-tran-quy-tac-nghiep-vu-cot-loi-business-rules-summary)

---

## PHẦN 1: GIỚI THIỆU & BỐI CẢNH NGHIỆP VỤ GIÁO DỤC

Hệ thống Quản lý Lớp học THPT HSU (HTQLLH) được xây dựng nhằm giải quyết bài toán chuyển đổi số công tác quản lý học vụ tại các trường Trung học Phổ thông tại Việt Nam:
- **Chuẩn hóa quy trình**: Bám sát Thông tư 22/2021/TT-BGDĐT của Bộ Giáo dục và Đào tạo về quy chế đánh giá và xếp loại học sinh THPT.
- **Minh bạch hóa**: Loại bỏ hoàn toàn khả năng tiêu cực hoặc can thiệp điểm số trái phép thông qua hệ thống kiểm toán lưu vết.
- **Tiết kiệm thời gian**: Tự động hóa tính điểm trung bình môn, điểm trung bình các môn học kỳ/cả năm, xếp loại học lực và gửi cảnh báo chuyên cần.
- **Gắn kết nhà trường và gia đình**: Cung cấp kênh giao tiếp tức thời giữa Ban Giám Hiệu, Giáo viên, Học sinh và Phụ huynh.

---

## PHẦN 2: 5 NHÓM NGƯỜI DÙNG & QUYỀN HẠN THỰC TẾ (ACTORS)

| Vai Trò | Tên Kỹ Thuật (Role) | Trách Nhiệm & Quyền Hạn Thực Tế |
| :--- | :---: | :--- |
| **Ban Giám Hiệu** | `ADMIN` / `BGH` | Quản lý danh mục toàn trường (khối, lớp, môn, phòng học); phân công giáo viên chủ nhiệm & giáo viên bộ môn; phê duyệt bảng điểm học kỳ; chốt khóa sổ điểm; xem toàn bộ báo cáo thống kê và nhật ký kiểm toán. |
| **Giáo Viên Chủ Nhiệm** | `GVCN` | Quản lý toàn bộ thông tin học sinh trong lớp chủ nhiệm; điểm danh chuyên cần đầu giờ mỗi ngày; đánh giá và tổng kết hạnh kiểm học kỳ/cả năm; duyệt hoặc từ chối đơn xin nghỉ học từ phụ huynh; chủ trì họp phụ huynh trực tuyến. |
| **Giáo Viên Bộ Môn** | `GVBM` | Nhập và chỉnh sửa điểm thành phần (miệng, 15 phút, 1 tiết, giữa kỳ, cuối kỳ) cho các lớp được phân công giảng dạy; điểm danh học sinh theo tiết dạy; nộp bảng điểm lên BGH khi kết thúc học kỳ. |
| **Học Sinh** | `STUDENT` | Tra cứu thời khóa biểu cá nhân; theo dõi điểm số các môn học; theo dõi số buổi vắng/trễ; xem xếp loại học lực, hạnh kiểm và nhận xét của giáo viên. |
| **Phụ Huynh** | `PARENT` | Sổ liên lạc điện tử 24/7; nhận thông báo vắng học ngay trong ngày; gửi đơn xin nghỉ học kèm lý do trực tuyến; tra cứu biểu đồ học tập của con em; nhận thông báo họp và học phí. |

---

## PHẦN 3: PHÂN HỆ QUẢN LÝ HỒ SƠ HỌC SINH, LỚP HỌC & PHÂN CÔNG

### 3.1 Quy Tắc Quản Lý Học Sinh & Lớp Học
- **Mã học sinh duy nhất**: Mỗi học sinh có một mã định danh duy nhất định dạng `HSxxxxx` (Ví dụ: `HS00001`, `HS00002`). Mã này không thay đổi trong suốt 3 năm học THPT.
- **Ràng buộc lớp học**: Một học sinh chỉ được thuộc về duy nhất một lớp học chính khóa trong một năm học. Sĩ số lớp chuẩn dao động từ 35 đến 45 học sinh.
- **Trạng thái học tập của học sinh**:
  + `ACTIVE`: Đang theo học bình thường.
  + `SUSPENDED`: Đang bảo lưu kết quả hoặc tạm đình chỉ học tập.
  + `TRANSFERRED`: Đã chuyển trường.
  + `GRADUATED`: Đã tốt nghiệp THPT.

### 3.2 Nghiệp Vụ Phân Công Giảng Dạy (Teacher Assignment)
- BGH lập bảng phân công giảng dạy trước thềm năm học mới:
  + Mỗi lớp có đúng **1 Giáo viên Chủ nhiệm (GVCN)** phụ trách xuyên suốt năm học.
  + Mỗi môn học tại một lớp trong một học kỳ chỉ do đúng **1 Giáo viên Bộ môn (GVBM)** giảng dạy và chịu trách nhiệm vào điểm.
  + Nghiêm cấm phân công 1 giáo viên dạy 2 lớp khác nhau trong cùng một khung giờ/tiết học.

---

## PHẦN 4: PHÂN HỆ ĐIỂM DANH & CHUYÊN CẦN HỌC ĐƯỜNG

### 4.1 Quy Trình Điểm Danh 2 Cấp
1. **Cấp 1 - Điểm danh Sinh hoạt Đầu giờ (GVCN)**:
   - Thực hiện từ 06h45 đến 07h15 mỗi sáng.
   - Ghi nhận sĩ số thực tế có mặt tại phòng học lớp chủ nhiệm.
2. **Cấp 2 - Điểm danh Từng Tiết Học (GVBM)**:
   - Giáo viên bộ môn giảng dạy tiết nào sẽ điểm danh sĩ số lớp trong 5 phút đầu của tiết đó.
   - Phát hiện các trường hợp học sinh trốn tiết giữa buổi.

### 4.2 Bốn Trạng Thái Điểm Danh
- `PRESENT` (Có mặt): Học sinh có mặt đúng giờ trong lớp.
- `LATE` (Đi trễ): Học sinh vào lớp muộn hơn 15 phút sau khi tiết học bắt đầu (hệ thống lưu số phút trễ).
- `EXCUSED` (Vắng có phép): Học sinh vắng có đơn xin phép được GVCN phê duyệt trước thời điểm điểm danh.
- `UNEXCUSED` (Vắng không phép): Học sinh vắng mặt không lý do hoặc đơn chưa được duyệt.

### 4.3 Quy Tắc Cảnh Báo & Xử Lý Vi Phạm
- **Cảnh báo Chuyên cần Tức thì**: Khi GVCN hoặc GVBM đánh dấu `UNEXCUSED`, hệ thống tự động gửi thông báo đến tài khoản Phụ huynh qua Cổng thông tin.
- **Cảnh báo Nguy cơ Cấm thi (Quy định 20% và 45 buổi)**:
  + Nếu học sinh nghỉ học quá 3 buổi không phép trong một tháng -> GVCN liên hệ làm việc với phụ huynh.
  + Nếu tổng số buổi nghỉ (có phép + không phép) trong cả năm học vượt quá **45 buổi**, theo Điều lệ trường THPT, hệ thống tự động khóa quyền dự thi cuối kỳ và chuyển danh sách về Hội đồng Kỷ luật xem xét ở lại lớp.

---

## PHẦN 5: PHÂN HỆ SỔ ĐIỂM ĐIỆN TỬ & QUY CHẾ THÔNG TƯ 22/2021/TT-BGDĐT

### 5.1 Các Cột Điểm Thành Phần Trong Học Kỳ
| Loại điểm kiểm tra | Ký hiệu quy chế | Hình thức kiểm tra | Hệ số | Số cột tối thiểu/học kỳ |
| :--- | :---: | :--- | :---: | :---: |
| **Đánh giá thường xuyên 1** | ĐĐGtx (Miệng) | Vấn đáp đầu giờ, hỏi bài cũ | **1** | 1 cột |
| **Đánh giá thường xuyên 2** | ĐĐGtx (15 phút) | Bài kiểm tra viết ngắn 15 phút | **1** | 1 cột |
| **Đánh giá thường xuyên 3** | ĐĐGtx (1 Tiết) | Kiểm tra định kỳ theo chương, bài thực hành | **1** | 1 cột |
| **Đánh giá giữa kỳ** | ĐĐGgk | Thi viết/trắc nghiệm tập trung giữa kỳ | **2** | 1 cột |
| **Đánh giá cuối kỳ** | ĐĐGck | Thi học kỳ toàn trường | **3** | 1 cột |

### 5.2 Công Thức Tính Điểm Trung Bình Môn Học Kỳ (ĐTBmhk)
```
ĐTBmhk = (ĐĐGtx_mieng + ĐĐGtx_15p + ĐĐGtx_1tiet*2 + ĐĐGgk*2 + ĐĐGck*3) / 9
```
- Điểm được chấm trên thang điểm 10 (từ 0.0 đến 10.0), bước nhảy 0.1 điểm.
- Kết quả ĐTBmhk được làm tròn số học đến **1 chữ số thập phân** (Ví dụ: 8.45 -> 8.5; 8.44 -> 8.4).

### 5.3 Tiêu Chuẩn Xếp Loại Học Lực Học Kỳ & Cả Năm (Theo Thông tư 22)
1. **Mức Tốt (Giỏi)**:
   - Tất cả các môn học đánh giá bằng điểm số có ĐTBmhk >= 6.5.
   - Có ít nhất 6 môn học có ĐTBmhk >= 8.0.
   - Không có môn học nào có ĐTBmhk < 5.0.
2. **Mức Khá**:
   - Tất cả các môn học có ĐTBmhk >= 5.0.
   - Có ít nhất 6 môn học có ĐTBmhk >= 6.5.
   - Không có môn học nào có ĐTBmhk < 3.5.
3. **Mức Đạt (Trung bình)**:
   - Có ít nhất 6 môn học có ĐTBmhk >= 5.0.
   - Không có môn học nào có ĐTBmhk < 2.0.
4. **Mức Chưa Đạt (Yếu/Kém)**:
   - Các trường hợp không đạt các tiêu chuẩn trên.

---

## PHẦN 6: QUY TRÌNH VÒNG ĐỜI SỔ ĐIỂM & CHỐT KHÓA ĐIỂM SỐ

Sổ điểm của từng lớp môn học vận hành theo máy trạng thái tuần tự:

```
[DRAFT]  -->  [SUBMITTED]  -->  [APPROVED]  -->  [LOCKED]
 (Nháp)        (Đã nộp)        (Đã duyệt)       (Đã khóa sổ)
    ^              |
    |--------------| (BGH trả về nếu sai sót)
```

1. **Giai đoạn DRAFT (Bản nháp)**:
   - Giáo viên bộ môn nhập điểm kiểm tra miệng, 15 phút, 1 tiết.
   - GVBM có toàn quyền chỉnh sửa và bổ sung điểm số.
2. **Giai đoạn SUBMITTED (Đã nộp)**:
   - Sau khi hoàn thành nhập điểm cuối kỳ, GVBM nhấn nút "Nộp Bảng Điểm".
   - Quyền sửa điểm của GVBM tạm thời bị khóa. Bảng điểm được gửi lên BGH chờ kiểm duyệt.
   - Nếu phát hiện sai sót, BGH có quyền từ chối và trả về trạng thái `DRAFT` kèm ghi chú lý do.
3. **Giai đoạn APPROVED (Đã duyệt)**:
   - BGH phê duyệt bảng điểm. Bảng điểm chính thức được công bố trên Cổng thông tin cho Học sinh và Phụ huynh xem.
   - Cho phép học sinh nộp đơn phúc khảo trong vòng 7 ngày làm việc.
4. **Giai đoạn LOCKED (Khóa sổ vĩnh viễn)**:
   - Hết thời hạn phúc khảo, BGH thực hiện "Khóa Sổ Điểm Học Kỳ".
   - Toàn bộ dữ liệu bảng điểm bị đóng băng tại mức cơ sở dữ liệu. Bất kỳ ai (kể cả Admin) muốn sửa điểm đều phải có Quyết định mở khóa bằng văn bản của Hiệu trưởng kèm Hội đồng sư phạm.

---

## PHẦN 7: PHÂN HỆ NHẬT KÝ KIỂM TOÁN (AUDIT TRAIL) CHỐNG GIAN LẬN ĐIỂM

Để phòng chống gian lận thi cử và sửa điểm học bạ, hệ thống bắt buộc kích hoạt ghi vết kiểm toán cho 100% thao tác thay đổi:

- **Các trường thông tin bắt buộc trong mỗi bản ghi kiểm toán**:
  1. `audit_id`: Mã định danh bản ghi kiểm toán duy nhất.
  2. `table_name`: Bảng bị tác động (`grade_books`).
  3. `record_id`: Khóa chính của bản ghi điểm bị thay đổi.
  4. `action`: Hành động thực hiện (`INSERT`, `UPDATE_SCORE`, `DELETE`).
  5. `performed_by`: ID, Tên và Vai trò của người thực hiện thao tác.
  6. `client_ip`: Địa chỉ IP máy tính gửi yêu cầu.
  7. `old_values`: JSON chứa giá trị điểm trước khi sửa.
  8. `new_values`: JSON chứa giá trị điểm sau khi sửa.
  9. `reason`: Lý do sửa điểm (Bắt buộc phải nhập, tối thiểu 20 ký tự).
  10. `timestamp`: Thời gian chính xác đến từng mili-giây.

- **Nguyên tắc bất biến của Nhật ký Kiểm toán**:
  - Bảng `audit_logs` được phân quyền mức CSDL chỉ cho phép `INSERT` và `SELECT`.
  - Nghiêm cấm các lệnh `UPDATE`, `DELETE`, `DROP`, `TRUNCATE` trên bảng này.

---

## PHẦN 8: PHÂN HỆ THỜI KHÓA BIỂU & THUẬT TOÁN CHỐNG XUNG ĐỘT LỊCH

Khi Ban Giám Hiệu sắp xếp hoặc điều chỉnh thời khóa biểu, hệ thống tự động kiểm tra 3 điều kiện ràng buộc:
1. **Ràng buộc 1 - Giáo viên không trùng tiết**: Một giáo viên không thể được xếp dạy ở hai lớp khác nhau trong cùng một buổi và cùng một tiết.
2. **Ràng buộc 2 - Lớp học không trùng môn**: Một lớp không thể học hai môn khác nhau trong cùng một tiết.
3. **Ràng buộc 3 - Phòng học chuyên dụng không trùng**: Các phòng học chức năng (Phòng Tin học, Phòng Thí nghiệm Lý - Hóa - Sinh) chỉ phục vụ tối đa 1 lớp tại một thời điểm.

---

## PHẦN 9: PHÂN HỆ ĐÁNH GIÁ RÈN LUYỆN (HẠNH KIỂM) & KHEN THƯỞNG

### 9.1 Bốn Mức Xếp Loại Hạnh Kiểm
- **Mức Tốt**: Chấp hành nghiêm chỉnh nội quy, không đi trễ, không vắng không phép, tích cực tham gia phong trào, trung thực trong kiểm tra.
- **Mức Khá**: Chấp hành nội quy, số lần đi trễ không quá 2 lần/học kỳ, không có vắng không phép.
- **Mức Đạt**: Có vi phạm nội quy nhưng đã khắc phục sau khi nhắc nhở; số lần đi trễ không quá 4 lần.
- **Mức Chưa Đạt**: Vi phạm kỷ luật nghiêm trọng, gian lận trong kiểm tra thi cử, hoặc vắng không phép quá số buổi quy định.

### 9.2 Tiêu Chuẩn Khen Thưởng Cuối Năm
- **Học sinh Xuất sắc**: Học lực Tốt + Hạnh kiểm Tốt + ĐTB tất cả các môn >= 9.0.
- **Học sinh Giỏi**: Học lực Tốt + Hạnh kiểm Tốt.
- **Học sinh Tiên tiến**: Học lực Khá + Hạnh kiểm Khá trở lên.

---

## PHẦN 10: PHÂN HỆ SỔ LIÊN LẠC ĐIỆN TỬ & CỔNG PHỤ HUYNH TRỰC TUYẾN

- **Tra cứu kết quả học tập tức thời**: Phụ huynh theo dõi điểm số chi tiết từng môn ngay sau khi GVBM cập nhật.
- **Nộp đơn xin nghỉ học trực tuyến**:
  + Phụ huynh chọn ngày nghỉ, số tiết nghỉ, lý do và đính kèm minh chứng y tế (nếu có).
  + GVCN nhận thông báo trên hệ thống và nhấn "Phê duyệt" hoặc "Từ chối".
  + Trạng thái đơn được tự động liên kết sang phân hệ Điểm danh (Chuyển từ `UNEXCUSED` thành `EXCUSED`).

---

## PHẦN 11: MA TRẬN QUY TẮC NGHIỆP VỤ CỐT LÕI (BUSINESS RULES SUMMARY)

| Mã Quy Tắc | Tên Quy Tắc Nghiệp Vụ | Nội Dung Ràng Buộc Kỹ Thuật |
| :---: | :--- | :--- |
| **BR-01** | Mã định danh duy nhất | Mã học sinh `HSxxxxx` và Mã lớp học là duy nhất trong toàn hệ thống. |
| **BR-02** | Giới hạn điểm số | Điểm nhập phải nằm trong khoảng `[0.0, 10.0]`, bước nhảy `0.1`. |
| **BR-03** | Khóa sổ điểm học kỳ | Khi `status === 'LOCKED'`, CSDL từ chối mọi thao tác sửa điểm. |
| **BR-04** | Trọng số Thông tư 22 | Tổng số trọng số chia mẫu số trong công thức ĐTBmhk là 9. |
| **BR-05** | Bắt buộc ghi vết kiểm toán | Mọi thao tác sửa điểm bắt buộc kèm lý do và ghi vào `audit_logs`. |
| **BR-06** | Giới hạn vắng học | Nghỉ quá 45 buổi/năm học tự động gắn cờ cấm thi và lưu ban. |
| **BR-07** | Đơn nghỉ học có hiệu lực | Chỉ đơn nghỉ học được GVCN nhấn "Duyệt" mới được tính là `EXCUSED`. |
| **BR-08** | Chống xung đột TKB | Không xếp trùng tiết của giáo viên, trùng phòng và trùng lớp. |
