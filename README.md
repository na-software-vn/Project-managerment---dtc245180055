# 🚀 Hệ Thống Quản Lý Dự Án (Project Management System)

> Ứng dụng quản lý dự án, công việc (Task), bảng Kanban và phân quyền thành viên trong đội ngũ được xây dựng với công nghệ **Node.js (Express) + MySQL 8.0 + phpMyAdmin** kết hợp giao diện Bootstrap 5 hiện đại, thân thiện và tập trung vào luồng nghiệp vụ cốt lõi.

---

## 📑 Mục Lục
1. [Giới Thiệu Tổng Quan](#-giới-thiệu-tổng-quan)
2. [Công Nghệ Sử Dụng (Tech Stack)](#-công-nghệ-sử-dụng)
3. [Hướng Dẫn Chạy Bằng Docker (Khuyến Nghị)](#-hướng-dẫn-chạy-bằng-docker-khuyến-nghị)
4. [Hướng Dẫn Chạy Môi Trường Cục Bộ (Local)](#-hướng-dẫn-chạy-môi-trường-cục-bộ-local)
5. [Thông Tin Đăng Nhập & Cổng Dịch Vụ](#-thông-tin-đăng-nhập--cổng-dịch-vụ)
6. [Hướng Dẫn Sử Dụng Chi Tiết Từng Chức Năng](#-hướng-dẫn-sử-dụng-chi-tiết)
7. [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
8. [Xử Lý Sự Cố Thường Gặp (FAQ)](#-xử-lý-sự-cố-thường-gặp)

---

## 📖 Giới Thiệu Tổng Quan

Hệ thống Quản lý Dự án được thiết kế nhằm giúp các đội nhóm công nghệ, phòng ban doanh nghiệp quản lý công việc rõ ràng, minh bạch và hiệu quả:
- **Tập trung vào luồng chính**: Tạo dự án &rarr; Phân công thành viên &rarr; Tạo việc (Task) &rarr; Kéo thả / Đổi trạng thái trên Kanban &rarr; Trao đổi bình luận &rarr; Hoàn thành.
- **Giao diện trực quan**: Không phức tạp, hiển thị tiến độ % thời gian thực, huy hiệu mức ưu tiên và cảnh báo quá hạn.
- **Đóng gói sẵn Docker**: Chỉ cần 1 câu lệnh duy nhất để chạy toàn bộ cả ứng dụng Web, Cơ sở dữ liệu MySQL và công cụ quản trị phpMyAdmin.

---

## 🛠️ Công Nghệ Sử Dụng

- **Backend**: Node.js v20+, Express.js 4.x
- **Database**: MySQL 8.0 (kết nối qua `mysql2/promise` connection pool)
- **Database GUI**: phpMyAdmin (quản lý trực quan qua web)
- **View Engine**: EJS (Embedded JavaScript Templates)
- **Frontend / Styling**: Bootstrap 5.3 + Bootstrap Icons
- **Reverse Proxy & Bảo mật**: Nginx Alpine (SSL/TLS tự ký, Security Headers: HSTS, X-Frame-Options, XSS, nosniff)
- **Bảo mật & Session**: `express-session`, `connect-flash`, `bcryptjs`
- **Containerization**: Docker, Docker Compose

---

## 🐳 Hướng Dẫn Chạy Bằng Docker (Khuyến Nghị)

Đây là cách nhanh nhất và tiện lợi nhất. Bạn **không cần cài đặt Node.js hay MySQL** trên máy chủ/máy tính cá nhân, chỉ cần cài sẵn **Docker** và **Docker Compose**.

### Bước 1: Mở Terminal tại thư mục gốc dự án
```bash
cd /home/unbutu/ProjectManager_Dtc245180055
```

### Bước 2: Khởi chạy toàn bộ hệ thống bằng Docker Compose
Chạy lệnh sau để Docker tự động tải ảnh, build ứng dụng và khởi động 4 container (`pm_nginx`, `pm_app`, `pm_mysql`, `pm_phpmyadmin`):
```bash
docker compose up -d --build
```

### Bước 3: Kiểm tra trạng thái các container
```bash
docker compose ps
```
Khi chạy thành công, bạn sẽ thấy 4 container có trạng thái `Up` (Running):
- `pm_nginx` (Port `80`, `443` - Cửa ngõ Reverse Proxy & HTTPS)
- `pm_app` (Port `5000` - Ứng dụng Node.js Express)
- `pm_mysql` (Port `3306` - Cơ sở dữ liệu MySQL 8.0)
- `pm_phpmyadmin` (Port `8085` - Giao diện quản trị CSDL)

### Bước 4: Xem log hoạt động (nếu cần theo dõi)
```bash
# Xem log toàn bộ hệ thống
docker compose logs -f

# Hoặc chỉ xem riêng log của web app
docker compose logs -f pm_app
```

### Các lệnh Docker hữu ích khác:
- **Dừng hệ thống (tạm dừng)**:
  ```bash
  docker compose stop
  ```
- **Tắt và dọn dẹp container**:
  ```bash
  docker compose down
  ```
- **Xóa toàn bộ container và reset dữ liệu CSDL về ban đầu**:
  ```bash
  docker compose down -v
  docker compose up -d --build
  ```

---

## 💻 Hướng Dẫn Chạy Môi Trường Cục Bộ (Local)

Nếu bạn là lập trình viên muốn chỉnh sửa code và xem thay đổi ngay lập tức (Hot-Reload) mà không muốn rebuild Docker:

### Bước 1: Khởi động MySQL & phpMyAdmin trong Docker
```bash
docker compose up -d pm_mysql pm_phpmyadmin
```

### Bước 2: Cài đặt thư viện Node.js
```bash
npm install
```

### Bước 3: Nạp cấu trúc bảng và dữ liệu mẫu vào MySQL (chỉ chạy lần đầu)
```bash
npm run db:init
```

### Bước 4: Chạy ứng dụng Web
- **Chế độ thông thường**:
  ```bash
  npm start
  ```
- **Chế độ phát triển (Tự động tải lại khi sửa file)**:
  ```bash
  npm run dev
  ```

---

## 🔐 Ma Trận Phân Quyền Bảo Mật (Role-Based Access Control - RBAC)

Hệ thống thiết lập ràng buộc quyền hạn nghiêm ngặt ở cả **Giao diện người dùng (UI)** lẫn **Phía máy chủ (Server Backend)**:

| Quyền hạn & Chức năng | Admin | Manager | Member (Thành viên) |
| :--- | :---: | :---: | :---: |
| **Xem Dashboard, Projects, Tasks** | ✅ Toàn bộ | ✅ Toàn bộ | ✅ Toàn bộ |
| **Tạo Dự án Mới** | ✅ Có | ✅ Có | ❌ **Không** |
| **Chỉnh sửa / Cập nhật Dự án** | ✅ Có | ✅ Có | ❌ **Không** |
| **Xóa Dự án** | ✅ Có | ❌ Không | ❌ **Không** |
| **Thêm / Xóa nhân sự trong Dự án** | ✅ Có | ✅ Có | ❌ **Không** |
| **Tạo Công việc Mới (Task)** | ✅ Có | ✅ Có | ❌ **Không** (Chỉ Manager/Admin giao việc) |
| **Chỉnh sửa chi tiết Task (Tên, Deadline, Gán người)** | ✅ Có | ✅ Có | ❌ **Chỉ task do mình tạo** |
| **Xóa Task** | ✅ Có | ✅ Có | ❌ **Không** (Trừ khi do mình tạo) |
| **Đổi trạng thái Task (To Do / In Progress / Review / Done)** | ✅ Có | ✅ Có | 🔒 **CHỈ task được giao cho mình** |
| **Bình luận & Trao đổi trong Task** | ✅ Có | ✅ Có | ✅ Có |
| **Thêm nhân sự mới vào hệ thống** | ✅ Có | ✅ Có | ❌ **Không** |
| **Đổi vai trò / Xóa tài khoản nhân sự** | ✅ Có | ❌ Không | ❌ **Không** |

> 🛡️ **Bảo mật 2 lớp**:
> 1. **Lớp hiển thị (UI)**: Member không thấy các nút Sửa, Xóa hay Dropdown đổi trạng thái của công việc người khác.
> 2. **Lớp xử lý máy chủ (Backend Controller & Middleware)**: Nếu người dùng cố tình gửi request POST/DELETE can thiệp vào task của người khác, máy chủ sẽ tự động từ chối (403 Forbidden hoặc chặn kèm thông báo lỗi).

---

## 🔑 Thông Tin Đăng Nhập & Cổng Dịch Vụ

### 1. Bảng Cổng Kết Nối

| Dịch vụ | Địa chỉ URL | Ghi chú & Tính năng |
| :--- | :--- | :--- |
| **Ứng Dụng (HTTPS qua Nginx - Khuyến nghị)** | [https://localhost](https://localhost) | Reverse Proxy Nginx, mã hóa SSL, bảo vệ Security Headers |
| **Ứng Dụng (HTTP)** | [http://localhost](http://localhost) | Tự động chuyển hướng (Redirect 301) sang `https://localhost` |
| **Ứng Dụng (Trực tiếp Node.js)** | [http://localhost:5000](http://localhost:5000) | Cổng Express nội bộ (dành cho debug) |
| **Quản Trị phpMyAdmin (Khuyến nghị)** | [https://localhost/phpmyadmin/](https://localhost/phpmyadmin/) | Tích hợp qua Nginx HTTPS, không lo lỗi trình duyệt ép HTTPS |
| **Quản Trị phpMyAdmin (Cổng trực tiếp)** | [http://localhost:8085](http://localhost:8085) hoặc `http://127.0.0.1:8085` | Cổng Apache gốc của container phpMyAdmin |
| **MySQL Server** | `localhost:3306` | Cổng kết nối CSDL trực tiếp |

> ⚠️ **Lưu ý khi vào `https://localhost` lần đầu**: Vì sử dụng chứng chỉ SSL tự ký (Self-signed) cho môi trường nội bộ, trình duyệt sẽ hiển thị cảnh báo riêng tư. Bạn chỉ cần chọn **Nâng cao (Advanced) &rarr; Tiếp tục truy cập localhost (Proceed to localhost)** để vào ứng dụng.

---

### 2. Danh Sách Tài Khoản Thử Nghiệm

Toàn bộ tài khoản bên dưới đều dùng mật khẩu chung: `123456`

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn và công việc chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@example.com` | `123456` | Toàn quyền tạo/sửa/xóa dự án, quản lý người dùng, phân vai trò |
| **Quản lý dự án (Manager)** | `manager@example.com` | `123456` | Khởi tạo dự án, tạo task, phân công nhân sự, duyệt việc |
| **Lập trình viên (Developer)** | `dev1@example.com` | `123456` | Nhận công việc được giao, cập nhật trạng thái, bình luận |
| **Kiểm thử viên (Tester/QA)** | `tester@example.com` | `123456` | Kiểm tra task, chuyển trạng thái Review & Done |

> 💡 **Mẹo tiện lợi**: Trên màn hình Đăng nhập `http://localhost:5000/auth/login`, hệ thống có sẵn các nút bấm chọn nhanh từng tài khoản để tự động điền form, bạn chỉ cần nhấn nút tương ứng và đăng nhập ngay.

---

### 3. Đăng Nhập phpMyAdmin

Khi truy cập `http://localhost:8085`:
- **Server**: `pm_mysql` (hoặc để mặc định)
- **Tài khoản**: `root`
- **Mật khẩu**: `rootpassword`
*(hoặc sử dụng tài khoản User: `pm_user` / Mật khẩu: `pm_password`)*
- Cơ sở dữ liệu: `project_manager_db`

---

## 🎯 Hướng Dẫn Sử Dụng Chi Tiết

### 1. Bảng Điều Khiển (Dashboard)
Sau khi đăng nhập thành công, bạn sẽ vào màn hình **Bảng điều khiển**:
- **4 Thẻ số liệu KPI**:
  - *Tổng số Dự án*: Số lượng dự án có trong toàn hệ thống.
  - *Task Đang làm*: Số công việc đang trong tiến trình xử lý.
  - *Task Hoàn thành*: Số công việc đã cán đích thành công.
  - *Thành viên Đội ngũ*: Tổng số nhân sự đang hoạt động.
- **Khu vực "Công việc được giao cho tôi" (My Tasks)**:
  - Liệt kê các task mà người dùng hiện tại được phân công phụ trách.
  - Bạn có thể **đổi trạng thái công việc ngay tại chỗ** thông qua menu dropdown mà không cần mở nhiều trang.
- **Khu vực "Tiến độ Dự án"**:
  - Hiển thị thanh % hoàn thành thực tế của từng dự án dựa trên tỷ lệ các task đã hoàn thành.

---

### 2. Quản Lý Dự Án (Projects)
Truy cập qua menu **Quản lý Dự án** bên trái (`/projects`):
- **Xem danh sách**: Dự án được thể hiện dưới dạng thẻ (Cards) trực quan với mã code, tên dự án, số thành viên, số lượng task, ngân sách và thanh tiến độ.
- **Bộ lọc & Tìm kiếm**:
  - Nhập từ khóa tên dự án hoặc mã dự án vào thanh tìm kiếm.
  - Lọc nhanh theo các trạng thái: *Đang lập kế hoạch, Đang triển khai, Hoàn tất, Tạm dừng*.
- **Tạo dự án mới**: Nhấn nút `Tạo Dự Án Mới`, điền Mã (VD: `PRJ-APP`), Tên dự án, Mô tả, Ngày bắt đầu/kết thúc và Ngân sách dự kiến.
- **Sửa & Xóa**: Nhấn vào dấu 3 chấm góc dưới mỗi thẻ để cập nhật thông tin hoặc xóa dự án.

---

### 3. Chi Tiết Dự Án & Bảng Kanban (Kanban Board)
Khi nhấn vào tên bất kỳ dự án nào, bạn sẽ vào trang chi tiết bao gồm 3 Tab:

#### Tab 1: Bảng Kanban (Kanban Board)
- Chia thành 4 cột trạng thái chuẩn:
  1. **Cần làm (To Do)**
  2. **Đang làm (In Progress)**
  3. **Chờ duyệt (Review)**
  4. **Hoàn tất (Done)**
- Mỗi thẻ công việc (Card) hiển thị: Mức độ ưu tiên (Khẩn cấp, Cao, Trung bình, Thấp), Người phụ trách kèm Avatar, Hạn chót (tô đỏ cảnh báo nếu quá hạn), và số lượng bình luận.
- **Thao tác nhanh**: Menu chuyển trạng thái ngay dưới chân thẻ giúp bạn chuyển task qua lại giữa các cột chỉ trong 1 thao tác.
- **Thêm việc nhanh**: Nhấn nút `+ Thêm Task` trên thanh công cụ để mở Modal tạo việc trực tiếp vào dự án hiện tại.

#### Tab 2: Danh Sách Công Việc (Table View)
- Dành cho những ai thích theo dõi theo bảng tổng thể dạng dòng. Có đầy đủ nút sửa, xóa và đổi trạng thái.

#### Tab 3: Thành Viên Dự Án (Project Members)
- Hiển thị danh sách toàn bộ nhân sự đang tham gia dự án.
- Nhấn nút `Thêm thành viên` để thêm nhân sự từ hệ thống vào dự án và gán vai trò:
  - *Trưởng nhóm (Leader)*
  - *Lập trình viên (Developer)*
  - *Kiểm thử (Tester/QA)*
  - *Thiết kế (UI/UX)*
  - *Quan sát viên (Viewer)*
- Có nút xóa thành viên khỏi dự án khi nhân sự đã hoàn thành vai trò.

---

### 4. Quản Lý Công Việc (Tasks)
Truy cập qua menu **Quản lý Công việc** bên trái (`/tasks`):
- Danh sách công việc toàn diện trên toàn bộ các dự án trong hệ thống.
- **Bộ lọc đa chiều đồng thời**:
  - Lọc theo Dự án
  - Lọc theo Trạng thái (To Do, In Progress, Review, Done)
  - Lọc theo Mức độ ưu tiên (Thấp, Trung bình, Cao, Khẩn cấp)
  - Lọc theo Thành viên phụ trách
  - Tìm kiếm tiêu đề công việc
- **Chi tiết công việc & Trao đổi bình luận (`/tasks/:id`)**:
  - Nhấn vào tên task để xem toàn bộ mô tả chi tiết, người giao việc, người nhận việc, ngày bắt đầu và deadline.
  - **Khu vực bình luận (Discussion timeline)**: Cho phép các thành viên ghi chú tiến độ, báo cáo vướng mắc hoặc trao đổi trực tiếp dưới dạng luồng thời gian thực.

---

### 5. Quản Lý Thành Viên (Members)
Truy cập qua menu **Thành viên** bên trái (`/members`):
- Xem danh sách toàn bộ nhân sự, phòng ban, email và số lượng dự án/task họ đang đảm nhận.
- Nhấn nút `Thêm Thành Viên Mới` để tạo tài khoản nhân sự mới (yêu cầu Họ tên, Email, Mật khẩu, Vai trò hệ thống *Admin / Manager / Member*, Phòng ban).
- Có modal chỉnh sửa chức vụ hoặc xóa tài khoản nhân sự.

---

### 6. Quản Lý Dữ Liệu Qua phpMyAdmin
- Mở liên kết nhanh **phpMyAdmin (8085)** trên thanh Menu trên cùng hoặc truy cập trực tiếp `http://localhost:8085`.
- Bạn có thể:
  - Xem dữ liệu tại bảng `users`, `projects`, `project_members`, `tasks`, `task_comments`.
  - Xuất file backup `.sql` (Export) hoặc nhập dữ liệu mới (Import).
  - Viết và chạy các câu lệnh SQL kiểm tra trực tiếp.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
ProjectManager_Dtc245180055/
├── Dockerfile                  # Cấu hình đóng gói ứng dụng Node.js vào container
├── docker-compose.yml          # Điều phối 3 container: pm_app, pm_mysql, pm_phpmyadmin
├── package.json                # Danh sách thư viện và scripts npm
├── server.js                   # Cấu hình Express server, session, routes và error handler
├── .env / .env.example         # Thiết lập các biến môi trường
├── sql/
│   └── schema.sql              # Cấu trúc bảng & seed data đầy đủ
├── src/
│   ├── config/
│   │   ├── db.js               # Kết nối CSDL MySQL qua Pool connection
│   │   └── initDb.js           # Script nạp lại schema vào CSDL
│   ├── controllers/
│   │   ├── authController.js       # Xử lý đăng nhập, đăng ký, phiên làm việc
│   │   ├── dashboardController.js  # Tính toán dữ liệu thống kê bảng điều khiển
│   │   ├── projectController.js    # Nghiệp vụ dự án, bảng Kanban, thành viên dự án
│   │   ├── taskController.js       # Nghiệp vụ task, đổi trạng thái, bình luận
│   │   └── memberController.js     # Nghiệp vụ quản lý nhân sự, phòng ban
│   ├── middlewares/
│   │   └── auth.js             # Kiểm tra đăng nhập và gắn thông tin vào view
│   ├── models/
│   │   ├── User.js             # Truy vấn bảng users
│   │   ├── Project.js          # Truy vấn bảng projects & project_members
│   │   └── Task.js             # Truy vấn bảng tasks & task_comments
│   ├── routes/
│   │   ├── authRoutes.js       # Các URL liên quan đến /auth
│   │   ├── dashboardRoutes.js  # Các URL liên quan đến /dashboard
│   │   ├── projectRoutes.js    # Các URL liên quan đến /projects
│   │   ├── taskRoutes.js       # Các URL liên quan đến /tasks
│   │   └── memberRoutes.js     # Các URL liên quan đến /members
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── header.ejs      # Top bar, liên kết phpMyAdmin, user menu
│   │   │   ├── sidebar.ejs     # Cột điều hướng bên trái
│   │   │   └── footer.ejs      # Chân trang và scripts
│   │   ├── auth/
│   │   │   ├── login.ejs       # Giao diện đăng nhập kèm nút autofill demo
│   │   │   └── register.ejs    # Giao diện đăng ký tài khoản
│   │   ├── dashboard/
│   │   │   └── index.ejs       # Bảng điều khiển KPI và task của tôi
│   │   ├── projects/
│   │   │   ├── index.ejs       # Danh sách dự án
│   │   │   ├── create.ejs      # Tạo dự án mới
│   │   │   ├── edit.ejs        # Sửa dự án
│   │   │   ├── detail.ejs      # Chi tiết dự án, Kanban & thành viên
│   │   │   └── kanban_card.ejs # Thành phần thẻ task trong cột Kanban
│   │   ├── tasks/
│   │   │   ├── index.ejs       # Danh sách task đa bộ lọc
│   │   │   ├── create.ejs      # Tạo task mới
│   │   │   ├── edit.ejs        # Sửa task
│   │   │   └── detail.ejs      # Chi tiết task và khung bình luận
│   │   └── members/
│   │       └── index.ejs       # Danh sách thành viên và form tạo nhân sự
│   └── public/
│       ├── css/style.css       # Tùy biến kiểu dáng thẻ, thanh cuộn, Kanban
│       └── js/main.js          # Tự ẩn thông báo flash, xác nhận xóa, autofill
└── README.md                   # Hướng dẫn chi tiết sử dụng và triển khai Docker
```

---

## ❓ Xử Lý Sự Cố Thường Gặp (FAQ)

### 1. Bị trùng cổng (Port already in use)?
- Cổng mặc định: `5000` (Web App), `8085` (phpMyAdmin), `3306` (MySQL).
- Nếu máy bạn đã có dịch vụ khác chiếm cổng 5000 hoặc 8085, bạn có thể chỉnh sửa số cổng trong file `docker-compose.yml` (ví dụ đổi `"5001:5000"` hoặc `"8086:80"`).

### 2. Cần thiết lập lại cơ sở dữ liệu về trạng thái sạch ban đầu?
Chỉ cần thực hiện lệnh sau:
```bash
docker compose down -v
docker compose up -d --build
```
Dữ liệu sẽ được tự động xóa và nạp lại sạch sẽ theo file `sql/schema.sql`.

### 3. Không truy cập được phpMyAdmin?
Hãy đảm bảo container `pm_phpmyadmin` đã khởi động:
```bash
docker compose ps
```
Nếu chưa chạy, thực hiện: `docker compose up -d pm_phpmyadmin`.
Sau đó mở trình duyệt tại: `http://localhost:8085`.

---

🎉 **Chúc bạn có trải nghiệm quản lý dự án hiệu quả và tiện lợi cùng hệ thống!**
