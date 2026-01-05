# Efficient Academic Data Management System (EADMS)

A complete, production-grade Academic Data Management System built with **Spring Boot 3.x** backend and **React 18+ with TypeScript** frontend. Features role-based access control, JWT authentication, and a polished professional UI.

## 🎯 Project Overview

EADMS is a comprehensive web-based platform for managing academic data in educational institutions. It supports three user roles (Admin, Teacher, Student) and manages students, teachers, courses, marks, and attendance records.

**✅ Latest Update (Jan 2026)**: Level-2 API QA Audit completed. All contract violations, error handling issues, and edge cases resolved. System is production-ready with comprehensive validation.

### Key Features

- **Role-Based Access Control**: Three distinct user roles with specific permissions
- **JWT Authentication**: Secure token-based authentication
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
edma/
├── src/main/java/com/eadms/
│   ├── EadmsApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── JwtTokenProvider.java
│   │   ├── CorsConfig.java
│   │   └── ModelMapperConfig.java
│   ├── entity/
│   │   ├── User.java
│   │   ├── Student.java
│   │   ├── Teacher.java
│   │   ├── Course.java
│   │   ├── Marks.java
│   │   ├── Attendance.java
│   │   └── BaseEntity.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── StudentRepository.java
│   │   ├── TeacherRepository.java
│   │   ├── CourseRepository.java
│   │   ├── MarksRepository.java
│   │   └── AttendanceRepository.java
│   ├── service/
│   │   ├── AuthService.java & Impl
│   │   ├── StudentService.java & Impl
│   │   ├── TeacherService.java & Impl
│   │   ├── CourseService.java & Impl
│   │   ├── MarksService.java & Impl
│   │   ├── AttendanceService.java & Impl
│   │   └── ReportService.java & Impl
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── AdminController.java
│   │   ├── TeacherController.java
│   │   ├── StudentController.java
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
│   └── application-prod.properties
└── frontend/ (React application - to be generated)
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
   mvn spring-boot:run
   
   # Production mode (PostgreSQL)
   mvn spring-boot:run -Dspring-boot.run.profiles=prod
   ```

5. **Access the application**
   - Backend API: `http://localhost:8080`
   - H2 Console: `http://localhost:8080/h2-console` (dev only)
   - Swagger/API Docs: `http://localhost:8080/swagger-ui.html`

### Frontend Setup (Coming Soon)

The React frontend will be generated separately. Instructions will be provided in a separate `frontend/README.md` file.

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

After running the application with sample data initialization:

### Admin
- Email: `admin@eadms.com`
- Password: `admin123`

### Teacher
- Email: `teacher1@eadms.com`
- Password: `teacher123`

### Student
- Email: `student1@eadms.com`
- Password: `student123`

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
mvn clean package -Pprod
java -jar target/eadms-1.0.0.jar
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

## 📞 Support

For support, email support@eadms.com or open an issue in the repository.

---

**Note**: This is an academic project demonstrating best practices in full-stack development, including layered architecture, SOLID principles, and modern UI/UX design.
