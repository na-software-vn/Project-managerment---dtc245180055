-- Database schema for Project Management System (PostgreSQL 16)

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  department VARCHAR(100) DEFAULT 'Engineering',
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE NULL,
  end_date DATE NULL,
  budget NUMERIC(15, 2) DEFAULT 0.00,
  created_by INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Project Members table
CREATE TABLE IF NOT EXISTS project_members (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_project VARCHAR(20) NOT NULL DEFAULT 'developer' CHECK (role_in_project IN ('leader', 'developer', 'tester', 'designer', 'viewer')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_project_user UNIQUE (project_id, user_id)
);

-- 4. Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to INT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_by INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_date DATE NULL,
  due_date DATE NULL,
  progress INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Task Comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id SERIAL PRIMARY KEY,
  task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- SEED DATA (Mật khẩu mặc định: 123456)
-- Hash: $2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G
-- ========================================================

-- 1. Users
INSERT INTO users (id, name, email, password, role, department) VALUES
(1, 'Nguyễn Quản Trị', 'admin@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'admin', 'Ban Giám Đốc'),
(2, 'Trần Quản Lý', 'manager@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'manager', 'Quản Lý Dự Án'),
(3, 'Lê Văn Lập Trình', 'dev1@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'member', 'Kỹ Thuật Backend'),
(4, 'Phạm Thị Kiểm Thử', 'tester@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'member', 'Đảm Bảo Chất Lượng QA'),
(5, 'Hoàng Minh Thiết Kế', 'designer@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'member', 'UI/UX Design'),
(6, 'Đặng Thu Hà', 'ha.dang@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'manager', 'Quản Lý Sản Phẩm (PO)'),
(7, 'Vũ Quang Huy', 'huy.vu@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'member', 'Kỹ Thuật Frontend'),
(8, 'Bùi Thị Mai', 'mai.bui@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'member', 'Hạ Tầng DevOps & Cloud'),
(9, 'Đỗ Quốc Anh', 'anh.do@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'member', 'Lập Trình Mobile (Flutter)'),
(10, 'Ngô Bảo Trâm', 'tram.ngo@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'member', 'Phân Tích Nghiệp Vụ (BA)'),
(11, 'Trịnh Công Sơn', 'son.trinh@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'member', 'Kỹ Sư Dữ Liệu (Data)'),
(12, 'Lâm Khánh Chi', 'chi.lam@example.com', '$2a$10$aebvSfgdeA8PocowhILmNefumffIxn/DW5EPz7fpTNHBVFlw1FM6G', 'member', 'Kiểm Thử Tự Động (QC)')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  email = EXCLUDED.email, 
  department = EXCLUDED.department, 
  role = EXCLUDED.role;

-- 2. Projects
INSERT INTO projects (id, code, name, description, status, priority, start_date, end_date, budget, created_by) VALUES
(1, 'PRJ-PORTAL', 'Cổng Thông Tin & Intranet Doanh Nghiệp', 'Xây dựng hệ thống quản lý tin tức, chấm công, bảng tin nội bộ và chia sẻ tài liệu công ty', 'in_progress', 'high', '2026-10-01', '2026-12-31', 150000000, 1),
(2, 'PRJ-CRM', 'Hệ Thống CRM & Chăm Sóc Khách Hàng', 'Phần mềm quản lý quan hệ khách hàng, phân tích phễu bán hàng và chăm sóc đơn hàng đa kênh', 'planning', 'urgent', '2026-11-01', '2027-03-30', 280000000, 2),
(3, 'PRJ-MOBILE', 'Ứng Dụng Khách Hàng Thân Thiết (Loyalty App)', 'App mobile trên iOS & Android cho khách hàng tích điểm, đổi voucher và thanh toán quét mã QR', 'in_progress', 'medium', '2026-09-15', '2026-11-20', 180000000, 6),
(4, 'PRJ-ECOMMERCE', 'Sàn Thương Mại Điện Tử B2B', 'Nền tảng giao dịch trực tuyến kết nối nhà sản xuất với đại lý bán sỉ, hỗ trợ công nợ và báo giá', 'in_progress', 'urgent', '2026-08-01', '2026-12-15', 450000000, 2),
(5, 'PRJ-DEVOPS', 'Hiện Đại Hóa Hạ Tầng Cloud & CI/CD', 'Chuyển đổi toàn bộ hệ thống sang cụm Kubernetes, thiết lập pipeline tự động kiểm thử và deploy', 'completed', 'high', '2026-07-01', '2026-09-30', 120000000, 1),
(6, 'PRJ-AI-CHATBOT', 'Trợ Lý AI Tự Động Trả Lời Khách Hàng', 'Nghiên cứu tích hợp LLM hỗ trợ giải đáp thắc mắc và xử lý khiếu nại khách hàng 24/7', 'planning', 'medium', '2026-12-01', '2027-04-30', 200000000, 6),
(7, 'PRJ-PAYMENT', 'Tích Hợp Cổng Thanh Toán & Ví Điện Tử', 'Kết nối các cổng Napas, VNPay, Momo, ZaloPay và thẻ thanh toán quốc tế Visa/Mastercard', 'on_hold', 'medium', '2026-08-15', '2026-11-30', 160000000, 2)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  description = EXCLUDED.description, 
  status = EXCLUDED.status, 
  priority = EXCLUDED.priority;

-- 3. Project Members
INSERT INTO project_members (project_id, user_id, role_in_project) VALUES
(1, 1, 'leader'),
(1, 2, 'leader'),
(1, 3, 'developer'),
(1, 4, 'tester'),
(1, 7, 'developer'),
(2, 2, 'leader'),
(2, 3, 'developer'),
(2, 10, 'developer'),
(2, 4, 'tester'),
(3, 6, 'leader'),
(3, 5, 'designer'),
(3, 9, 'developer'),
(3, 12, 'tester'),
(4, 2, 'leader'),
(4, 3, 'developer'),
(4, 7, 'developer'),
(4, 5, 'designer'),
(4, 4, 'tester'),
(5, 1, 'leader'),
(5, 8, 'developer'),
(5, 3, 'developer'),
(6, 6, 'leader'),
(6, 11, 'developer'),
(6, 10, 'developer'),
(7, 2, 'leader'),
(7, 3, 'developer'),
(7, 12, 'tester')
ON CONFLICT (project_id, user_id) DO UPDATE SET 
  role_in_project = EXCLUDED.role_in_project;

-- 4. Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, created_by, start_date, due_date, progress) VALUES
(1, 1, 'Thiết kế cơ sở dữ liệu PostgreSQL', 'Phân tích thực thể ERD, thiết lập quan hệ và chuẩn hóa các bảng users, roles, projects', 'done', 'high', 3, 1, '2026-10-01', '2026-10-05', 100),
(2, 1, 'Xây dựng API Xác thực và Phân quyền RBAC', 'Cài đặt middleware bảo vệ route, mã hóa bcrypt và kiểm tra phiên làm việc session', 'in_progress', 'urgent', 3, 1, '2026-10-06', '2026-10-25', 75),
(3, 1, 'Thiết kế giao diện Dashboard quản trị', 'Dựng layout Bootstrap 5 responsive, các thẻ thống kê KPI và biểu đồ tiến độ', 'review', 'medium', 5, 2, '2026-10-10', '2026-10-22', 90),
(4, 1, 'Lập kịch bản kiểm thử tích hợp (Test Cases)', 'Viết tài liệu kiểm thử cho các chức năng đăng nhập, tạo việc và phân quyền', 'todo', 'medium', 4, 2, '2026-10-22', '2026-10-30', 0),
(5, 1, 'Xây dựng module thông báo nội bộ qua Email', 'Tích hợp SMTP gửi thông báo tự động khi thành viên được gán công việc mới', 'todo', 'low', 7, 1, '2026-10-25', '2026-11-05', 0),
(6, 2, 'Khảo sát yêu cầu nghiệp vụ phòng kinh doanh', 'Phỏng vấn các trưởng nhóm kinh doanh để chốt các trường dữ liệu khách hàng và quy trình sales', 'done', 'high', 10, 2, '2026-10-05', '2026-10-15', 100),
(7, 2, 'Thiết kế mô hình cơ sở dữ liệu CRM', 'Lập mô hình dữ liệu quan hệ khách hàng, cơ hội bán hàng (deals) và lịch sử tương tác', 'in_progress', 'high', 3, 2, '2026-10-16', '2026-10-28', 60),
(8, 2, 'Xây dựng API quản lý khách hàng tiềm năng (Leads)', 'Viết các endpoint CRUD khách hàng, gán nhãn phân loại và gán nhân viên phụ trách', 'todo', 'medium', 3, 2, '2026-10-29', '2026-11-10', 0),
(9, 2, 'Kiểm thử hộp đen các luồng nhập liệu CRM', 'Thực hiện kiểm thử các kịch bản người dùng nhập sai định dạng số điện thoại, email trùng', 'todo', 'low', 4, 2, '2026-11-12', '2026-11-20', 0),
(10, 3, 'Thiết kế UI/UX ứng dụng Mobile trên Figma', 'Hoàn thiện bộ Design System, wireframe và luồng trải nghiệm người dùng mobile', 'done', 'urgent', 5, 6, '2026-09-15', '2026-09-30', 100),
(11, 3, 'Xây dựng màn hình Đăng ký/Đăng nhập và Tích điểm', 'Lập trình frontend Flutter kết nối API backend, xử lý lưu token an toàn trong Secure Storage', 'in_progress', 'high', 9, 6, '2026-10-01', '2026-10-25', 80),
(12, 3, 'Tích hợp tính năng Quét mã QR nhận Voucher', 'Sử dụng camera device quét mã QR tại quầy thu ngân để áp dụng mã giảm giá tự động', 'in_progress', 'medium', 9, 6, '2026-10-10', '2026-11-05', 50),
(13, 3, 'Kiểm thử ứng dụng trên đa thiết bị iOS & Android', 'Test tính tương thích trên các dòng iPhone, Samsung, Xiaomi với các kích thước màn hình khác nhau', 'review', 'high', 12, 6, '2026-10-20', '2026-11-15', 85),
(14, 4, 'Thiết kế luồng thanh toán và bảng giá sỉ B2B', 'Cấu hình chiết khấu theo số lượng lớn (MOQ), bảng giá sỉ linh hoạt theo cấp bậc đại lý', 'done', 'high', 3, 2, '2026-08-10', '2026-08-25', 100),
(15, 4, 'Xây dựng phân hệ Quản lý Kho và Xuất nhập tồn', 'Theo dõi tồn kho theo thời gian thực tại các kho khu vực Bắc - Trung - Nam', 'in_progress', 'urgent', 3, 2, '2026-09-01', '2026-10-30', 70),
(16, 4, 'Tối ưu tốc độ tải trang Catalog sản phẩm', 'Áp dụng Redis caching và lazy load hình ảnh giúp danh mục 10,000 sản phẩm tải dưới 1 giây', 'done', 'medium', 7, 2, '2026-09-15', '2026-10-05', 100),
(17, 4, 'Kiểm thử bảo mật chống lỗ hổng SQLi và XSS', 'Rà quét mã nguồn và kiểm thử thâm nhập đối với luồng đặt hàng và thanh toán', 'review', 'urgent', 4, 2, '2026-10-15', '2026-10-26', 90),
(18, 4, 'Xây dựng tính năng xuất hóa đơn VAT điện tử', 'Kết nối API với nhà cung cấp hóa đơn điện tử VNPT/Viettel sau khi đơn hàng hoàn tất', 'todo', 'high', 7, 2, '2026-11-01', '2026-11-15', 0),
(19, 5, 'Container hóa toàn bộ các microservices bằng Docker', 'Tối ưu Dockerfile nhiều giai đoạn (Multi-stage build) để giảm kích thước image', 'done', 'high', 8, 1, '2026-07-01', '2026-07-20', 100),
(20, 5, 'Cài đặt cụm Kubernetes (K8s) trên Cloud', 'Triển khai cụm K8s có tính năng tự động scale (HPA) khi lượng truy cập tăng vọt', 'done', 'urgent', 8, 1, '2026-07-25', '2026-08-30', 100),
(21, 5, 'Thiết lập hệ thống Giám sát Prometheus & Grafana', 'Cấu hình cảnh báo qua Telegram khi CPU/RAM vượt 85% hoặc có lỗi 5xx trên server', 'done', 'high', 8, 1, '2026-09-01', '2026-09-25', 100),
(22, 6, 'Thu thập và làm sạch dữ liệu câu hỏi thường gặp FAQ', 'Tổng hợp 500 câu hỏi và câu trả lời thực tế từ bộ phận chăm sóc khách hàng', 'done', 'medium', 10, 6, '2026-12-01', '2026-12-10', 100),
(23, 6, 'Xây dựng pipeline RAG (Retrieval-Augmented Generation)', 'Sử dụng Vector Database để truy xuất tài liệu nội bộ chính xác trước khi sinh câu trả lời', 'in_progress', 'high', 11, 6, '2026-12-15', '2027-01-20', 40),
(24, 6, 'Đánh giá độ chính xác của phản hồi AI (Benchmark)', 'Thiết lập bộ test kiểm thử để tránh hiện tượng ảo giác (hallucination) của AI', 'todo', 'medium', 12, 6, '2027-01-25', '2027-02-15', 0),
(25, 7, 'Nghiên cứu tài liệu kỹ thuật API cổng VNPay & MoMo', 'Tìm hiểu luồng mã hóa chữ ký số RSA/SHA256 và IPN webhook xác nhận thanh toán', 'done', 'high', 3, 2, '2026-08-15', '2026-08-30', 100),
(26, 7, 'Xây dựng môi trường Sandbox giả lập thanh toán', 'Tạo môi trường test để thử nghiệm các ca thanh toán thành công, thất bại và hoàn tiền', 'in_progress', 'medium', 3, 2, '2026-09-01', '2026-10-15', 50)
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, 
  description = EXCLUDED.description, 
  status = EXCLUDED.status, 
  priority = EXCLUDED.priority, 
  assigned_to = EXCLUDED.assigned_to, 
  progress = EXCLUDED.progress;

-- 5. Task Comments
INSERT INTO task_comments (id, task_id, user_id, content) VALUES
(1, 1, 3, 'Đã hoàn thành thiết kế các bảng và index dữ liệu, đã kiểm tra tối ưu query.'),
(2, 2, 3, 'Đang hoàn thiện middleware xác thực RBAC, đã phân chia quyền hạn chặt chẽ giữa Admin, Manager và Member.'),
(3, 2, 1, 'Chú ý bổ sung kiểm tra session timeout và bảo vệ chống brute-force đăng nhập nhé em.'),
(4, 3, 5, 'Giao diện Dashboard đã chuyển qua trạng thái Review, đã kiểm tra hiển thị tốt trên cả màn hình di động.'),
(5, 7, 3, 'Mô hình dữ liệu CRM đang được chốt với team BA, dự kiến ngày mai sẽ hoàn thành script tạo bảng.'),
(6, 11, 9, 'Tính năng quét mã QR trên Flutter đã test mượt mà trên iPhone 15 Pro, tốc độ phản hồi dưới 200ms.'),
(7, 13, 12, 'Đã tìm thấy 1 lỗi nhỏ về căn lề hiển thị trên màn hình gập Samsung Fold, dev đang xử lý.'),
(8, 15, 3, 'Tính năng xuất nhập kho B2B đã hỗ trợ quét mã vạch Barcode sản phẩm.'),
(9, 17, 4, 'Đã quét qua công cụ OWASP ZAP, hệ thống hiện không có cảnh báo lỗ hổng nghiêm trọng nào.'),
(10, 20, 8, 'Cụm Kubernetes đã chạy ổn định 2 tháng qua với uptime đạt 99.98%.'),
(11, 23, 11, 'Đã nhúng (embedded) thành công 500 bài viết tài liệu vào vector database Milvus.')
ON CONFLICT (id) DO UPDATE SET 
  content = EXCLUDED.content;

-- Update sequence values for auto-increment in PostgreSQL
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 1));
SELECT setval('project_members_id_seq', COALESCE((SELECT MAX(id) FROM project_members), 1));
SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 1));
SELECT setval('task_comments_id_seq', COALESCE((SELECT MAX(id) FROM task_comments), 1));
