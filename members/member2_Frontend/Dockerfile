# =========================================================================
# Multi-stage Dockerfile cho Frontend HTQLLH (React 18 + Vite + Nginx)
# Vị trí: members/member2_Frontend/Dockerfile
# Tác giả: Nhóm 6 HSU - Môn Phát Triển Dự Án Phần Mềm
# =========================================================================

# Stage 1: Build source code React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configurations
COPY package.json package-lock.json* ./

# Cài đặt dependencies (bao gồm devDependencies cho build Vite)
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Thực thi lệnh build production (Code-Splitting chunks)
RUN npm run build

# Stage 2: Phục vụ tệp tĩnh qua Nginx siêu nhẹ
FROM nginx:alpine

# Copy tệp cấu hình Nginx SPA & Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy kết quả build từ Stage 1 sang Nginx root
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
