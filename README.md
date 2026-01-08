# Efficient Academic Data Management System (EADMS)

A complete, production-grade Academic Data Management System built with **Spring Boot 3.x** backend and **React 18+ with TypeScript** frontend. Features role-based access control, JWT authentication, notice board system, and a polished professional UI.

## 🎯 Project Overview

EADMS is a comprehensive web-based platform for managing academic data in educational institutions. It supports three user roles (Admin, Teacher, Student) and manages students, teachers, courses, marks, attendance records, and system-wide notices.

**✅ Latest Update (Jan 2026)**: Repository cleaned and optimized for production. Messaging system removed, documentation organized, and codebase streamlined for academic submission. System is production-ready with comprehensive validation.

### Key Features

- **Role-Based Access Control**: Three distinct user roles with specific permissions
- **JWT Authentication**: Secure token-based authentication with 24-hour expiration
- **Notice Board System**: System-wide announcements with priority levels and target audiences
- **Academic Management**: Complete student, teacher, course, marks, and attendance management
- **RESTful API**: Well-structured REST APIs following best practices
- **Professional UI**: Modern, responsive design with Tailwind CSS and Shadcn/ui
- **Data Visualization**: Interactive charts and graphs for academic analytics
- **Real-time Statistics**: Dashboard with live metrics and insights
- **Production-Ready**: Comprehensive API validation, error handling, and edge case coverage

## 🏗️ Architecture

### Backend Architecture
- **Layered Architecture**: Clear separation of concerns
- **MVC Pattern**: Model-View-Controller design
- **SOLID Principles**: Clean, maintainable code
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation
- **DTO Pattern**: Data transfer objects for API contracts

### Technology Stack

#### Backend
- **Java 17+**
- **Spring Boot 3.2.1**
- **Spring Web** (REST APIs)
- **Spring Data JPA** with Hibernate
- **Spring Security 6.x** with JWT
- **PostgreSQL** (Production) / **H2** (Development)
- **Maven** (Build tool)
- **Lombok** (Boilerplate reduction)
- **ModelMapper** (Object mapping)

#### Frontend
- **React 18+** with **Vite**
- **TypeScript** (Type safety)
- **Tailwind CSS** (Styling)
- **Shadcn/ui** (Component library)
- **React Router v6** (Routing)
- **Axios** (HTTP client)
- **React Hook Form + Zod** (Form validation)
- **Recharts** (Data visualization)
- **Lucide React** (Icons)
- **React Hot Toast** (Notifications)

## 📁 Project Structure

```
eadms/
├── docs/                           # Documentation
│   ├── API_TESTING_GUIDE.md
│   ├── DATABASE_SETUP.md
│   ├── DEPLOYMENT.md
│   ├── ENV_VARS.md
│   ├── QA_VERIFICATION_REPORT.md
│   ├── RENDER_SETUP.md
│   ├── VERCEL_SETUP.md
│   └── WEBSOCKET_IMPLEMENTATION.md
├── frontend/                       # React TypeScript Frontend
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Page components
│   │   │   ├── admin/            # Admin dashboard & management
│   │   │   ├── student/          # Student dashboard & views
│   │   │   └── teacher/          # Teacher dashboard & tools
│   │   ├── services/             # API service layer
│   │   ├── contexts/             # React contexts (Auth, etc.)
│   │   ├── types/                # TypeScript type definitions
│   │   └── lib/                  # Utilities and helpers
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── src/main/java/com/eadms/       # Spring Boot Backend
│   ├── EadmsApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── JwtTokenProvider.java
│   │   ├── CorsConfig.java
│   │   ├── WebSocketConfig.java
│   │   └── DataInitializer.java
│   ├── entity/
│   │   ├── User.java
│   │   ├── Student.java
│   │   ├── Teacher.java
│   │   ├── Course.java
│   │   ├── Marks.java
│   │   ├── Attendance.java
│   │   ├── Notice.java
│   │   ├── Ticket.java
│   │   └── BaseEntity.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── StudentRepository.java
│   │   ├── TeacherRepository.java
│   │   ├── CourseRepository.java
│   │   ├── MarksRepository.java
│   │   ├── AttendanceRepository.java
│   │   ├── NoticeRepository.java
│   │   └── TicketRepository.java
│   ├── service/
│   │   ├── AuthService.java & Impl
│   │   ├── StudentService.java & Impl
│   │   ├── TeacherService.java & Impl
│   │   ├── CourseService.java & Impl
│   │   ├── MarksService.java & Impl
│   │   ├── AttendanceService.java & Impl
│   │   ├── NoticeService.java & Impl
│   │   ├── TicketService.java & Impl
│   │   └── ReportService.java & Impl
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── AdminController.java
│   │   ├── TeacherController.java
│   │   ├── StudentController.java
│   │   ├── NoticeController.java
│   │   ├── TicketController.java
│   │   └── ReportController.java
│   ├── dto/
│   │   ├── request/ (LoginRequest, Create/Update DTOs)
│   │   └── response/ (Response DTOs, ApiResponse)
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   └── Custom exceptions
│   └── util/
│       ├── ResponseUtil.java
│       └── ValidationUtil.java
├── src/main/resources/
│   ├── application.properties
│   ├── application-dev.properties
│   ├── application-prod.properties
│   └── db/migration/
│       └── V1__initial_schema.sql
├── scripts/                        # Utility scripts
│   ├── migrate_data.py
│   ├── verify_backend.py
│   └── requirements.txt
├── pom.xml                        # Maven configuration
├── Dockerfile                     # Docker configuration
├── render.yaml                    # Render deployment config
└── vercel.json                    # Vercel deployment config
```

## 🚀 Getting Started

### Prerequisites

- **Java 17** or higher
- **Maven 3.8+**
- **Node.js 18+** and **npm/yarn**
- **PostgreSQL** (for production) or use H2 (for development)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edma
   ```

2. **Configure the database**
   
   For development (H2 - no configuration needed):
   ```bash
   # Already configured in application-dev.properties
   ```
   
   For production (PostgreSQL):
   ```properties
   # Update src/main/resources/application-prod.properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/eadmsdb
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Build the project**
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   # Development mode (H2 database)
   mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
   
   # Production mode (PostgreSQL)
   mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"
   ```

5. **Access the application**
   - Backend API: `http://localhost:8080`
   - H2 Console: `http://localhost:8080/h2-console` (dev only)
   - API Health Check: `http://localhost:8080/`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Update .env with your backend URL
   VITE_API_URL=http://localhost:8080/api
   VITE_WS_URL=http://localhost:8080
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access frontend**
   - Frontend: `http://localhost:5173` (or next available port)
   - Login with default admin credentials (see below)

## 📊 Database Schema

### Entities

1. **User** - Authentication and authorization
   - Fields: email, password (BCrypt), role (ADMIN/TEACHER/STUDENT), isActive
   - Relationships: OneToOne with Student or Teacher

2. **Student** - Student information
   - Fields: firstName, lastName, studentId, className, gender, contact, DOB
   - Relationships: OneToOne with User, OneToMany with Marks and Attendance

3. **Teacher** - Teacher information
   - Fields: firstName, lastName, teacherId, department, email, contact
   - Relationships: OneToOne with User, OneToMany with Courses

4. **Course** - Course details
   - Fields: courseCode, courseName, semester, credits, description
   - Relationships: ManyToOne with Teacher, OneToMany with Marks and Attendance

5. **Marks** - Student marks/grades
   - Fields: examType, marksObtained, maxMarks, remarks, examDate
   - Relationships: ManyToOne with Student and Course

6. **Attendance** - Attendance records
   - Fields: attendanceDate, status (PRESENT/ABSENT/LATE/EXCUSED)
   - Relationships: ManyToOne with Student and Course

7. **Notice** - System-wide announcements
   - Fields: title, content, priority (HIGH/MEDIUM/LOW), targetAudience (ALL/STUDENTS/TEACHERS)
   - Relationships: ManyToOne with User (creator)

8. **Ticket** - Support ticket system
   - Fields: subject, description, status (OPEN/IN_PROGRESS/RESOLVED/CLOSED), category
   - Relationships: ManyToOne with User (creator)

## 🔐 API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `GET /me` - Get current user

### Admin (`/api/admin`) - Requires ADMIN role
- **Students**
  - `POST /students` - Create student
  - `GET /students` - Get all students
  - `GET /students/{id}` - Get student by ID
  - `PUT /students/{id}` - Update student
  - `DELETE /students/{id}` - Delete student

- **Teachers**
  - `POST /teachers` - Create teacher
  - `GET /teachers` - Get all teachers
  - `PUT /teachers/{id}` - Update teacher
  - `DELETE /teachers/{id}` - Delete teacher

- **Courses**
  - `POST /courses` - Create course
  - `GET /courses` - Get all courses
  - `PUT /courses/{id}` - Update course
  - `PUT /courses/{courseId}/assign-teacher/{teacherId}` - Assign teacher
  - `DELETE /courses/{id}` - Delete course

- **Notices**
  - `POST /notices` - Create notice
  - `GET /notices` - Get all notices
  - `PUT /notices/{id}` - Update notice
  - `DELETE /notices/{id}` - Delete notice

- **Dashboard**
  - `GET /dashboard/stats` - Get admin dashboard statistics

### Teacher (`/api/teacher`) - Requires TEACHER role
- `GET /dashboard/stats` - Get teacher dashboard statistics
- `GET /courses` - Get teacher's courses
- `POST /marks` - Enter marks
- `PUT /marks/{id}` - Update marks
- `GET /marks/course/{courseId}` - Get marks by course
- `POST /attendance` - Mark attendance
- `PUT /attendance/{id}` - Update attendance
- `GET /attendance/course/{courseId}` - Get attendance by course
- `GET /course/{courseId}/average` - Get course average

### Student (`/api/student`) - Requires STUDENT role
- `GET /dashboard/stats` - Get student dashboard statistics
- `GET /profile` - Get student profile
- `GET /marks` - Get student marks
- `GET /attendance` - Get student attendance
- `GET /attendance/stats` - Get attendance statistics
- `GET /gpa` - Get student GPA

### Notices (`/api/notices`) - All authenticated users
- `GET /notices` - Get notices for current user's role
- `GET /notices/{id}` - Get specific notice

### Tickets (`/api/tickets`) - All authenticated users
- `POST /tickets` - Create support ticket
- `GET /tickets` - Get user's tickets
- `PUT /tickets/{id}` - Update ticket (admin/creator only)

## 🧪 Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=StudentServiceTest

# Run with coverage
mvn clean test jacoco:report
```

## ✅ Quality Assurance

### API Contract Validation (Jan 2026)
A comprehensive Level-2 API QA audit was conducted covering:

**Contract Correctness**
- ✅ All TypeScript interfaces match backend DTOs exactly
- ✅ Field naming consistency (`contactNumber` not `contact`)
- ✅ Enum values validated (MALE|FEMALE|OTHER, exam types, statuses)
- ✅ Date formats verified (ISO strings, proper parsing)

**Error Handling**
- ✅ HTTP status codes properly differentiated (400/401/403/404/409/500)
- ✅ User-friendly error messages for all failure scenarios
- ✅ Referential integrity violations detected (409 on delete)
- ✅ Validation errors with specific field feedback

**Edge Cases**
- ✅ Empty data states handled with proper UI
- ✅ Null/undefined field handling with optional chaining
- ✅ Invalid inputs validated before submission
- ✅ Stale data refresh on 404 errors

**Security & Authorization**
- ✅ JWT token validation on all protected endpoints
- ✅ Role-based access control enforced
- ✅ 401 auto-redirects to login with token cleanup
- ✅ 403 forbidden access properly communicated

**Performance**
- ✅ No infinite render loops
- ✅ No duplicate API calls
- ✅ Minimal network chatter
- ✅ Efficient useEffect dependencies

### Fixed Issues
1. **Critical**: Field name mismatch (`contact` vs `contactNumber`) causing data loss
2. **High**: Generic error messages - now status-specific
3. **Medium**: Missing empty state handling
4. **Medium**: TypeScript type safety improvements

## 🔧 Configuration

### JWT Configuration
```properties
jwt.secret=your-secret-key-minimum-32-characters
jwt.expiration=86400000  # 24 hours in milliseconds
```

### CORS Configuration
Frontend origins are configured in `CorsConfig.java`:
```java
configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
```

## 📝 Default Credentials

After running the application, the system automatically creates a default admin user:

### Admin
- Email: `admin@eadms.com`
- Password: `Admin@123`

**Note**: Additional users (teachers and students) can be created through the admin panel or by running the data migration script in the `scripts/` directory.

## 🎨 UI/UX Design Principles

The frontend follows these design principles:
- **Modern Color Palette**: Professional blue (#2563eb) primary, warm accents
- **Typography**: Clear hierarchy with Inter font family
- **Spacing**: Consistent spacing scale (4px, 8px, 16px, 24px, 32px)
- **Shadows & Borders**: Subtle elevation with rounded corners
- **Responsive**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: WCAG AA compliant, keyboard navigation support
- **Micro-interactions**: Smooth animations and transitions

## 📦 Build & Deployment

### Development Build
```bash
mvn spring-boot:run
```

### Production Build
```bash
# Backend
mvn clean package -DskipTests
java -jar target/eadms-1.0.0.jar --spring.profiles.active=prod

# Frontend
cd frontend
npm run build
# Serve dist/ folder with your preferred web server
```

### Docker Deployment
```bash
# Build Docker image
docker build -t eadms-backend .

# Run container
docker run -p 8080:8080 eadms-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Development Team - EADMS Project

## 🙏 Acknowledgments

- Spring Boot Documentation
- React Documentation
- Tailwind CSS
- Shadcn/ui Component Library

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **API_TESTING_GUIDE.md** - Complete API testing instructions
- **DATABASE_SETUP.md** - Database configuration and schema details
- **DEPLOYMENT.md** - Production deployment guide
- **ENV_VARS.md** - Environment variables configuration
- **QA_VERIFICATION_REPORT.md** - Quality assurance test results
- **RENDER_SETUP.md** - Render.com deployment instructions
- **VERCEL_SETUP.md** - Vercel deployment instructions

## 📞 Support

For support, open an issue in the repository or refer to the documentation in the `docs/` directory.

---

**Note**: This is an academic project demonstrating best practices in full-stack development, including layered architecture, SOLID principles, modern UI/UX design, and production-ready deployment configurations.
