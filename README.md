# 🚀 Project Manager - Hệ Thống Quản Lý Dự Án & Giám Sát Phân Tán

> **Sinh viên thực hiện:** DTC245180055  
> **Đề tài:** Đề 14 - Hệ thống Quản lý Dự án (Project Management)  
> **Công nghệ triển khai:** Node.js Express, PostgreSQL 16 + pgAdmin 4, Nginx Reverse Proxy (SSL/TLS), Prometheus + Grafana, Loki + Promtail và Bảo mật Hardening.

---

## 🏛️ 1. Kiến Trúc Hệ Thống (11 Microservices & 3 Mạng Độc Lập)

Hệ thống được đóng gói hoàn toàn bằng Docker Compose, phân tách thành **3 lớp mạng cô lập (Network Isolation)**:
- **`pm_frontend_net`**: Vùng tiếp nhận truy cập bên ngoài (Nginx Reverse Proxy, Web App, pgAdmin).
- **`pm_backend_net`**: Vùng nghiệp vụ & dữ liệu (Web App, PostgreSQL 16 Server, pgAdmin, Postgres Exporter).
- **`pm_monitoring_net`**: Vùng giám sát & quản lý nhật ký (Prometheus, Grafana, Loki, Promtail, cAdvisor, Node Exporter, Postgres Exporter).

### Bảng tổng hợp 11 Containers:

| STT | Tên Container | Dịch Vụ | Cổng Truy Cập (Port) | Mạng Kết Nối | Vai Trò & Chức Năng |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `pm_nginx` | Nginx Alpine | **80, 443** (Host) | frontend | Reverse Proxy, SSL tự ký, Security Headers |
| 2 | `pm_app` | Node.js Express | 5000 (Nội bộ) | frontend, backend, monitoring | Web Quản lý Dự án (Non-root UID 1000, RBAC) |
| 3 | `pm_postgres` | PostgreSQL 16 Server | **127.0.0.1:5432** | backend | Database lưu trữ dữ liệu quan hệ (Cô lập loopback) |
| 4 | `pm_pgadmin` | pgAdmin 4 Web GUI | 80 (Qua Nginx `/pgadmin/`) | frontend, backend | Quản trị CSDL trực quan trên trình duyệt |
| 5 | `pm_prometheus` | Prometheus TSDB | **9090** (Host) | monitoring | Thu thập và lưu trữ số liệu (5 targets UP) |
| 6 | `pm_grafana` | Grafana Dashboard | **3000** (Host) | monitoring | Trực quan hóa số liệu (Node, PostgreSQL, Containers) |
| 7 | `pm_cadvisor` | Google cAdvisor | 8081 (monitor) | monitoring | Giám sát mức tiêu thụ tài nguyên của 11 Container |
| 8 | `pm_node_exporter` | Node Exporter | 9100 (monitor) | monitoring | Giám sát tải phần cứng máy chủ Ubuntu (CPU, RAM, Disk) |
| 9 | `pm_postgres_exporter` | PostgreSQL Exporter | 9187 (monitor) | backend, monitoring | Thu thập chỉ số chuyên sâu DB (Transactions, Locks, QPS) |
| 10 | `pm_loki` | Grafana Loki | 3100 (monitor) | monitoring | Kho lưu trữ và đánh chỉ mục metadata log |
| 11 | `pm_promtail` | Promtail Agent | 9080 (monitor) | monitoring | Đọc log từ Docker Socket và đẩy về Loki |

---

## ⚡ 2. Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

### Yêu cầu tiên quyết:
- Máy tính / Máy ảo cài đặt sẵn **Docker** và **Docker Compose**.

### Bước 1: Khởi chạy toàn bộ 11 container chỉ với 1 câu lệnh
```bash
docker compose up -d
```

### Bước 2: Kiểm tra trạng thái hoạt động
```bash
docker compose ps
```
*(Tất cả 11 container đều ở trạng thái `Up` hoặc `Up (healthy)` là hệ thống đã sẵn sàng).*

---

## 🌐 3. Danh Sách Địa Chỉ Truy Cập & Tài Khoản Thử Nghiệm

| Dịch vụ | Địa chỉ URL | Tài khoản / Mật khẩu |
| :--- | :--- | :--- |
| **Ứng dụng Web (HTTPS)** | `https://localhost` *(hoặc `https://<IP_MAY_CHU>`)* | Xem danh sách tài khoản bên dưới |
| **Quản trị Database (pgAdmin 4)** | `https://localhost/pgadmin/` | Email: `admin@example.com` / Pass: trong file `.env` |
| **Giám sát số liệu (Grafana)** | `http://localhost:3000` | User: `admin` / Pass: trong file `.env` |
| **Máy chủ Prometheus** | `http://localhost:9090/targets` | Kiểm tra trạng thái 5 targets UP |

### Tài khoản đăng nhập hệ thống Web:
- **Quản trị viên (Admin):** `admin@example.com` | Mật khẩu: `123456` *(Toàn quyền hệ thống)*
- **Quản lý (Manager):** `manager@example.com` | Mật khẩu: `123456` *(Quản lý dự án & phân công task)*
- **Thành viên (Member/Dev):** `dev1@example.com` | Mật khẩu: `123456` *(Chỉ xem task được giao cho mình)*

---

## 📊 4. Giám Sát & Truy Vấn Log Tập Trung

### Prometheus Scrape Targets (Cổng 9090):
Kiểm tra tại `http://localhost:9090/targets`, hệ thống tự động cào định kỳ 5 mục tiêu:
1. `node` (:9100) - Tải CPU, RAM, Disk máy chủ Host.
2. `pm_app` (:5000) - Chỉ số HTTP request, độ trễ và RPS của ứng dụng Node.js.
3. `pm_cadvisor` (:8080) - Tài nguyên từng container Docker.
4. `pm_postgres` (:9187) - Transactions, Tuples Read/Returned, Connections PostgreSQL.
5. `prometheus` (:9090) - Trạng thái hoạt động của chính Prometheus.

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

## 🛡️ 5. Các Biện Pháp Bảo Mật & Hardening

1. **Non-root Container:** Container `pm_app` chạy với user thường `node` (UID `1000:1000`), ngăn chặn leo thang đặc quyền Root.
   ```bash
   # Kiểm tra:
   docker exec pm_app id
   # Kết quả: uid=1000(node) gid=1000(node)
   ```
2. **Cô lập cổng Database (Port Binding Isolation):** Cổng PostgreSQL 5432 chỉ mở cho loopback nội bộ máy chủ (`127.0.0.1`), tuyệt đối không mở ra ngoài internet `0.0.0.0`.
   ```bash
   # Kiểm tra:
   ss -tuln | grep 5432
   # Kết quả: 127.0.0.1:5432
   ```
3. **Phân đoạn mạng (Network Segmentation):** 3 mạng bridge độc lập (`frontend_net`, `backend_net`, `monitoring_net`), Nginx không thể truy cập trực tiếp Database PostgreSQL.
4. **Nginx Hardening & Security Headers:** Bật `server_tokens off` để ẩn phiên bản máy chủ, tích hợp HSTS, X-Frame-Options, X-Content-Type-Options, CSP, XSS-Protection.
   ```bash
   # Kiểm tra:
   curl -k -I https://localhost/auth/login
   ```
5. **Phân quyền ứng dụng (RBAC):** Middleware kiểm soát phân quyền chặt chẽ giữa Admin, Manager và Member. Member chỉ xem được task của mình và bị chặn hoàn toàn khi cố tình nhập URL `/members`.
6. **Mật khẩu an toàn & Băm Bcrypt:** Toàn bộ mật khẩu người dùng được băm an toàn bằng `bcrypt` (10 rounds), mật khẩu các dịch vụ hệ thống sử dụng chuỗi phức tạp trên file `.env`.
