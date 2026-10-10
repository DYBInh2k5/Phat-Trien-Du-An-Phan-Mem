# BrainStorm Tuần 12: Đóng Gói Vùng Chứa Docker, Docker Compose & Tự Động Hóa CI/CD

Dự án: **Hệ thống Quản lý Trường học (HTQLLH / EduManage Pro)**  
Môn học: **Phát triển dự án phần mềm (SW320DV01)** - Đại học Hoa Sen (HSU)  
Trưởng nhóm & PM: **Võ Duy Bình (DYBInh2k5)**  

---

## CHƯƠNG I. MỤC TIÊU VÀ PHẠM VI TUẦN 12

### 1. Mục tiêu
Chuẩn hóa môi trường triển khai phần mềm theo nguyên lý "Build Once, Run Anywhere". Loại bỏ hoàn toàn tình trạng "chạy được trên máy em nhưng lỗi trên máy thầy/cô". Tuần 12 tập trung đóng gói toàn bộ hệ thống bằng Docker container, cấu hình mạng nội bộ và xây dựng đường ống phân phối tích hợp liên tục (CI/CD Pipeline) trên GitHub Actions.

### 2. Các trọng tâm kỹ thuật
1. **Multi-Stage Dockerfile cho Frontend & Backend**: Tối ưu hóa kích thước Docker image xuống mức tối thiểu (Alpine-based images).
2. **Docker Compose Orchestration**: Định nghĩa liên kết dịch vụ giữa `postgres-db`, `backend-api` và `frontend-ui` với cơ chế Healthcheck tự động chờ CSDL sẵn sàng trước khi nạp ứng dụng.
3. **Đường ống GitHub Actions CI**: Tự động kích hoạt khi có Pull Request hoặc Push vào nhánh `main`: Kiểm tra cú pháp Linting, chạy tự động Unit Test Suite và đóng gói kiểm tra Docker build.

---

## CHƯƠNG II. THIẾT KẾ ĐƯỜNG ỐNG CI/CD & MÃ NGUỒN CẤU HÌNH

### 1. Kịch bản GitHub Actions Workflow (`.github/workflows/ci.yml`)
```yaml
name: HTQLLH Continuous Integration (CI)

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test_and_build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: |
          cd members/member5_Modules_QA
          npm install

      - name: Run Automated QA Unit Test Suite
        run: |
          cd members/member5_Modules_QA
          node tests/unitTestingSuite.test.js

      - name: Verify Docker Compose Build
        run: |
          docker compose build
```

---

## CHƯƠNG III. KẾT QUẢ ĐẠT ĐƯỢC VÀ PHÂN CÔNG THỰC HIỆN

- **Võ Duy Bình (PM)**: Phê duyệt quy trình đóng gói và thiết lập bảo vệ nhánh `main` trên GitHub.
- **Huỳnh Trung Tính (Member 5)**: Xây dựng kịch bản CI workflow trên GitHub Actions và kiểm thử tự động.
- **Trần Quang Vinh (Member 3)**: Hoàn thiện Dockerfile và Docker Compose với mạng cầu nối nội bộ (Bridge Network).
- **Trạng thái tuần 12**: Dự án có thể khởi chạy hoàn chỉnh trên bất kỳ máy tính nào chỉ với lệnh `docker compose up -d`.
