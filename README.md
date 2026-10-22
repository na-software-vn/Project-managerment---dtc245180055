# 🚀 Project Manager - Hệ Thống Quản Lý Dự Án & Giám Sát Phân Tán

> **Sinh viên thực hiện:** DTC245180055  
> **Đề tài:** Triển khai ứng dụng Web Quản lý Dự án kết hợp Reverse Proxy Nginx, Giám sát Prometheus/Grafana, Log tập trung Loki/Promtail và Bảo mật Hardening.

---

## 🏛️ 1. Kiến Trúc Hệ Thống (11 Microservices & 3 Mạng Độc Lập)

Hệ thống được đóng gói hoàn toàn bằng Docker Compose, phân tách thành **3 lớp mạng cô lập (Network Isolation)**:
- **`pm_frontend_net`**: Vùng tiếp nhận truy cập bên ngoài (Nginx Reverse Proxy, Web App).
- **`pm_backend_net`**: Vùng nghiệp vụ & dữ liệu (Web App, MySQL 8.0, phpMyAdmin, MySQL Exporter).
- **`pm_monitor_net`**: Vùng giám sát & quản lý nhật ký (Prometheus, Grafana, Loki, Promtail, cAdvisor, Node Exporter).

### Bảng tổng hợp 11 Containers:

| STT | Tên Container | Dịch Vụ | Cổng Truy Cập (Port) | Mạng Kết Nối | Vai Trò & Chức Năng |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `pm_nginx` | Nginx Alpine | **80, 443** (Host) | frontend | Reverse Proxy, SSL tự ký, Security Headers |
| 2 | `pm_app` | Node.js Express | 5000 (Nội bộ) | frontend, backend | Web Quản lý Dự án (Non-root UID 1000, RBAC) |
| 3 | `pm_mysql` | MySQL 8.0 Server | **127.0.0.1:3306** | backend | Database lưu trữ dữ liệu (Cô lập loopback) |
| 4 | `pm_phpmyadmin`| phpMyAdmin Web | 80 (Qua Nginx `/phpmyadmin/`) | frontend, backend | Quản trị CSDL trực quan trên trình duyệt |
| 5 | `pm_prometheus`| Prometheus TSDB | **9090** (Host) | monitor | Thu thập và lưu trữ số liệu (5 targets UP) |
| 6 | `pm_grafana` | Grafana Dashboard | **3000** (Host) | monitor | Trực quan hóa số liệu (Node, MySQL, Docker) |
| 7 | `pm_cadvisor` | Google cAdvisor | 8080 (monitor) | monitor | Giám sát mức tiêu thụ tài nguyên của 11 Container |
| 8 | `pm_node_exporter`| Node Exporter | 9100 (monitor) | monitor | Giám sát tải phần cứng máy chủ Ubuntu (CPU, RAM) |
| 9 | `pm_mysql_exporter`| MySQL Exporter | 9104 (monitor) | backend, monitor | Thu thập chỉ số chuyên sâu DB (QPS, Threads, Buffer) |
| 10 | `pm_loki` | Grafana Loki | 3100 (monitor) | monitor | Kho lưu trữ và đánh chỉ mục metadata log |
| 11 | `pm_promtail` | Promtail Agent | 9080 (monitor) | monitor | Đọc log từ Docker Socket và đẩy về Loki |

---

## ⚡ 2. Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

### Yêu cầu tiên quyết:
- Máy tính / Máy ảo cài đặt sẵn **Docker** và **Docker Compose**.

### Bước 1: Sao chép file cấu hình biến môi trường
```bash
cp .env.example .env
```

### Bước 2: Khởi chạy toàn bộ 11 container chỉ với 1 câu lệnh
```bash
docker compose up -d
```

### Bước 3: Kiểm tra trạng thái hoạt động
```bash
docker compose ps
```
*(Tất cả 11 container đều ở trạng thái `Up` hoặc `Up (healthy)` là hệ thống đã sẵn sàng).*

---

## 🌐 3. Danh Sách Địa Chỉ Truy Cập & Tài Khoản Thử Nghiệm

| Dịch vụ | Địa chỉ URL | Tài khoản / Mật khẩu |
| :--- | :--- | :--- |
| **Ứng dụng Web (HTTPS)** | `https://localhost` *(hoặc `https://<IP_MAY_CHU>`)* | Xem danh sách tài khoản bên dưới |
| **Quản trị Database (phpMyAdmin)** | `https://localhost/phpmyadmin/` | User: `root` / Pass: trong file `.env` |
| **Giám sát số liệu (Grafana)** | `http://localhost:3000` | User: `admin` / Pass: `admin` |
| **Máy chủ Prometheus** | `http://localhost:9090/targets` | Kiểm tra trạng thái 5 targets UP |

### Tài khoản đăng nhập hệ thống Web:
- **Quản trị viên (Admin):** `admin@example.com` | Mật khẩu: `123456` *(Toàn quyền hệ thống)*
- **Quản lý (Manager):** `manager@example.com` | Mật khẩu: `123456` *(Quản lý dự án & task)*
- **Thành viên (Member/Dev):** `dev1@example.com` | Mật khẩu: `123456` *(Chỉ xem task của mình)*

---

## 📊 4. Giám Sát & Truy Vấn Log Tập Trung

### Prometheus Scrape Targets (Cổng 9090):
Kiểm tra tại `http://localhost:9090/targets`, hệ thống tự động cào 5 mục tiêu:
1. `node` (:9100) - Tải CPU, RAM máy chủ Host.
2. `pm_app` (:5000) - Chỉ số HTTP request, độ trễ Node.js.
3. `pm_cadvisor` (:8080) - Tài nguyên từng container Docker.
4. `pm_mysql` (:9104) - QPS, Threads, InnoDB Buffer Pool.
5. `prometheus` (:9090) - Trạng thái máy chủ giám sát.

### Truy vấn LogQL mẫu trên Grafana (Mục Explore > Loki):
```logql
# 1. Xem toàn bộ log của ứng dụng Web theo thời gian thực
{container="pm_app"}

# 2. Lọc các dòng log báo lỗi của Web App
{container="pm_app"} |= "error"

# 3. Theo dõi các truy vấn HTTP lỗi 404 trên Nginx
{container="pm_nginx"} |= " 404 "
```

---

## 🛡️ 5. Các Biện Pháp Bảo Mật & Hardening (Bước 6)

1. **Non-root Container:** Container `pm_app` chạy với user thường `node` (UID `1000:1000`).
   ```bash
   # Kiểm tra:
   docker exec pm_app id
   # Kết quả: uid=1000(node) gid=1000(node)
   ```
2. **Cô lập cổng Database (Port Binding Isolation):** Cổng MySQL 3306 chỉ mở cho loopback nội bộ máy chủ, tuyệt đối không mở ra mạng ngoài `0.0.0.0`.
   ```bash
   # Kiểm tra:
   ss -tuln | grep 3306
   # Kết quả: 127.0.0.1:3306
   ```
3. **Phân đoạn mạng (Network Segmentation):** 3 mạng bridge cô lập, Nginx không thể truy cập trực tiếp MySQL.
4. **Nginx Hardening & Security Headers:** Bật `server_tokens off` để ẩn phiên bản máy chủ, tích hợp HSTS, X-Frame-Options, X-Content-Type-Options, CSP, XSS-Protection.
   ```bash
   # Kiểm tra:
   curl -k -I https://localhost/auth/login
   ```
5. **Phân quyền ứng dụng (RBAC):** Middleware kiểm soát chặt chẽ, Member chỉ xem được task của mình và bị chặn hoàn toàn khi truy cập trái phép menu `/members`.

---

## 📌 6. Lịch Sử Commit Quy Chuẩn

- **Commit 1 (`ea001d2`):** Hoàn thiện ứng dụng Web, Database và Nginx Reverse Proxy (HTTPS tự ký, Security Headers).
- **Commit 2 (`4c08c62`):** Tích hợp hệ thống giám sát Prometheus + Grafana và các Exporters (cAdvisor, Node Exporter, MySQL Exporter).
- **Commit 3 (`e9f0a48`):** Triển khai hệ thống log tập trung Loki + Promtail và cấu hình truy vấn LogQL.
- **Các Commit Hardening:** Cấu hình Non-root container, Cô lập mạng Network Isolation, Mật khẩu mạnh `.env`, Nâng cấp toàn diện Security Headers và Phân quyền RBAC.
