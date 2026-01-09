# Software Requirements Specification (SRS)
# Efficient Academic Data Management System (EADMS)

## Document Information

**Project Name:** Efficient Academic Data Management System (EADMS)  
**Version:** 1.0  
**Date:** January 7, 2026  
**Status:** Production-Ready System Documentation  
**Document Type:** Software Requirements Specification

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the Efficient Academic Data Management System (EADMS). It describes the functional and non-functional requirements for the complete system, including backend APIs, frontend user interfaces, and database architecture.

### 1.2 Scope

EADMS is a web-based academic management platform designed for educational institutions to manage students, teachers, courses, marks, attendance, and related academic data. The system supports three distinct user roles (Admin, Teacher, Student) with role-based access control and provides comprehensive features for academic data management, reporting, and communication.

**Key Capabilities:**
- User authentication and authorization with JWT tokens
- Student and teacher profile management
- Course creation and assignment
- Marks entry and GPA calculation
- Attendance tracking and reporting
- Schedule management
- Support ticket system
- Real-time dashboard analytics

### 1.3 Intended Audience

This document is intended for:
- Software developers and maintainers
- System administrators
- Quality assurance teams
- Project managers
- Educational institution stakeholders
- Technical reviewers and auditors

### 1.4 Product Overview

EADMS is a full-stack web application built with:
- **Backend:** Spring Boot 3.2.1 (Java 17) with RESTful APIs
- **Frontend:** React 18 with TypeScript and Tailwind CSS
- **Database:** PostgreSQL (production) / H2 (development)
- **Security:** JWT-based authentication with BCrypt password hashing
- **Architecture:** Layered MVC architecture with clear separation of concerns

---

## 2. Glossary

### System Components

- **EADMS_System**: The complete Efficient Academic Data Management System
- **Authentication_Service**: Service responsible for user login and token management
- **User_Management_Service**: Service managing user accounts and profiles
- **Student_Service**: Service handling student-related operations
- **Teacher_Service**: Service handling teacher-related operations
- **Course_Service**: Service managing courses and assignments
- **Marks_Service**: Service for marks entry and GPA calculations
- **Attendance_Service**: Service for attendance tracking and reporting
- **Message_Service**: Service handling user-to-user messaging
- **Schedule_Service**: Service managing class schedules
- **Ticket_Service**: Service for support ticket management
- **Enrollment_Service**: Service managing student course enrollments
- **Report_Service**: Service generating analytics and reports

### User Roles

- **Admin**: System administrator with full access to all features
- **Teacher**: Faculty member with access to course management, marks entry, and attendance
- **Student**: Enrolled student with access to view marks, attendance, and profile

### Data Entities

- **User**: System user account with authentication credentials
- **Student**: Student profile with academic information
- **Teacher**: Teacher profile with department and contact information
- **Course**: Academic course with code, name, credits, and semester
- **Marks**: Student marks/grades for specific exams
- **Attendance**: Daily attendance records for students
- **Message**: Direct messages between users
- **Schedule**: Class schedule with day, time, and room information
- **Ticket**: Support ticket for user issues and complaints
- **Enrollment**: Student enrollment in specific courses

### Technical Terms

- **JWT**: JSON Web Token for stateless authentication
- **BCrypt**: Password hashing algorithm
- **REST API**: Representational State Transfer Application Programming Interface
- **CORS**: Cross-Origin Resource Sharing
- **DTO**: Data Transfer Object
- **JPA**: Java Persistence API
- **ORM**: Object-Relational Mapping

---

## 3. Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a system user, I want to securely log in to the system, so that I can access role-appropriate features and data.

#### Acceptance Criteria

1. WHEN a user submits valid credentials THEN THE Authentication_Service SHALL generate a JWT token and return user information
2. WHEN a user submits invalid credentials THEN THE Authentication_Service SHALL reject the login and return an appropriate error message
3. WHEN an authenticated user makes an API request THEN THE EADMS_System SHALL validate the JWT token before processing the request
4. WHEN a JWT token expires THEN THE EADMS_System SHALL reject the request and require re-authentication
5. WHEN a user logs out THEN THE EADMS_System SHALL invalidate the session on the client side
6. THE EADMS_System SHALL hash all passwords using BCrypt before storing them in the database
7. THE EADMS_System SHALL enforce role-based access control for all protected endpoints

### Requirement 2: Admin - Student Management

**User Story:** As an admin, I want to manage student records, so that I can maintain accurate student information in the system.

#### Acceptance Criteria

1. WHEN an admin creates a student THEN THE Student_Service SHALL create both a Student record and associated User account
2. WHEN an admin retrieves all students THEN THE Student_Service SHALL return a list of all students with their basic information
3. WHEN an admin retrieves a specific student THEN THE Student_Service SHALL return complete student details including user information
4. WHEN an admin updates a student THEN THE Student_Service SHALL update the student record and associated user account
5. WHEN an admin deletes a student THEN THE Student_Service SHALL remove the student and associated user account
6. THE Student_Service SHALL ensure student IDs are unique across the system
7. THE Student_Service SHALL validate all required fields before creating or updating students
8. WHEN a student is deleted THEN THE EADMS_System SHALL cascade delete all associated marks, attendance, and enrollment records

### Requirement 3: Admin - Teacher Management

**User Story:** As an admin, I want to manage teacher records, so that I can maintain accurate faculty information in the system.

#### Acceptance Criteria

1. WHEN an admin creates a teacher THEN THE Teacher_Service SHALL create both a Teacher record and associated User account
2. WHEN an admin retrieves all teachers THEN THE Teacher_Service SHALL return a list of all teachers with their basic information
3. WHEN an admin retrieves a specific teacher THEN THE Teacher_Service SHALL return complete teacher details including assigned courses
4. WHEN an admin updates a teacher THEN THE Teacher_Service SHALL update the teacher record and associated user account
5. WHEN an admin deletes a teacher THEN THE Teacher_Service SHALL remove the teacher and associated user account
6. THE Teacher_Service SHALL ensure teacher IDs and email addresses are unique across the system
7. THE Teacher_Service SHALL validate all required fields before creating or updating teachers
8. WHEN a teacher is deleted THEN THE EADMS_System SHALL unassign the teacher from all courses

### Requirement 4: Admin - Course Management

**User Story:** As an admin, I want to manage courses and assign teachers, so that I can organize the academic curriculum.

#### Acceptance Criteria

1. WHEN an admin creates a course THEN THE Course_Service SHALL create a course with unique course code
2. WHEN an admin retrieves all courses THEN THE Course_Service SHALL return a list of all courses with assigned teacher information
3. WHEN an admin updates a course THEN THE Course_Service SHALL update the course details
4. WHEN an admin assigns a teacher to a course THEN THE Course_Service SHALL create the teacher-course relationship
5. WHEN an admin deletes a course THEN THE Course_Service SHALL remove the course and all associated data
6. THE Course_Service SHALL ensure course codes are unique across the system
7. THE Course_Service SHALL validate semester and credit values are positive integers
8. THE Course_Service SHALL support multiple teachers assigned to a single course

### Requirement 5: Teacher - Marks Management

**User Story:** As a teacher, I want to enter and manage student marks, so that I can record academic performance.

#### Acceptance Criteria

1. WHEN a teacher enters marks THEN THE Marks_Service SHALL create a marks record for the specified student and course
2. WHEN a teacher updates marks THEN THE Marks_Service SHALL update the existing marks record
3. WHEN a teacher retrieves marks for a course THEN THE Marks_Service SHALL return all marks for students in that course
4. THE Marks_Service SHALL support multiple exam types (MIDTERM, FINAL, ASSIGNMENT, QUIZ)
5. THE Marks_Service SHALL validate that marks obtained do not exceed maximum marks
6. THE Marks_Service SHALL calculate percentage automatically based on marks obtained and maximum marks
7. THE Marks_Service SHALL ensure only teachers assigned to a course can enter marks for that course
8. THE Marks_Service SHALL record the exam date for each marks entry

### Requirement 6: Teacher - Attendance Management

**User Story:** As a teacher, I want to mark and manage student attendance, so that I can track class participation.

#### Acceptance Criteria

1. WHEN a teacher marks attendance THEN THE Attendance_Service SHALL create an attendance record for the specified student, course, and date
2. WHEN a teacher updates attendance THEN THE Attendance_Service SHALL update the existing attendance record
3. WHEN a teacher retrieves attendance for a course THEN THE Attendance_Service SHALL return all attendance records for that course
4. THE Attendance_Service SHALL support multiple attendance statuses (PRESENT, ABSENT, LATE, EXCUSED)
5. THE Attendance_Service SHALL prevent duplicate attendance entries for the same student, course, and date
6. THE Attendance_Service SHALL ensure only teachers assigned to a course can mark attendance for that course
7. THE Attendance_Service SHALL calculate attendance percentage for students

### Requirement 7: Student - Academic Records Access

**User Story:** As a student, I want to view my marks and attendance, so that I can track my academic progress.

#### Acceptance Criteria

1. WHEN a student requests their marks THEN THE Marks_Service SHALL return all marks for that student across all courses
2. WHEN a student requests their attendance THEN THE Attendance_Service SHALL return all attendance records for that student
3. WHEN a student requests attendance statistics THEN THE Attendance_Service SHALL calculate and return attendance percentage by course
4. WHEN a student requests their GPA THEN THE Marks_Service SHALL calculate GPA based on all completed courses
5. THE EADMS_System SHALL ensure students can only access their own academic records
6. THE EADMS_System SHALL display marks with course information and exam type
7. THE EADMS_System SHALL display attendance with course information and date

### Requirement 8: Dashboard and Analytics

**User Story:** As a system user, I want to view role-appropriate dashboard statistics, so that I can get an overview of relevant information.

#### Acceptance Criteria

1. WHEN an admin accesses the dashboard THEN THE Report_Service SHALL return total counts of students, teachers, courses, and active users
2. WHEN an admin accesses the dashboard THEN THE Report_Service SHALL return distribution of students by class and teachers by department
3. WHEN a teacher accesses the dashboard THEN THE Report_Service SHALL return their assigned courses and student counts
4. WHEN a teacher accesses the dashboard THEN THE Report_Service SHALL calculate average attendance for their courses
5. WHEN a student accesses the dashboard THEN THE Report_Service SHALL return their GPA, attendance percentage, and total credits
6. WHEN a student accesses the dashboard THEN THE Report_Service SHALL return recent marks and upcoming assignments
7. THE Report_Service SHALL calculate all statistics in real-time based on current data

### Requirement 9: Messaging System

**User Story:** As a system user, I want to send and receive messages, so that I can communicate with other users.

#### Acceptance Criteria

1. WHEN a user sends a message THEN THE Message_Service SHALL create a message record with sender, receiver, subject, and content
2. WHEN a user retrieves their messages THEN THE Message_Service SHALL return all messages where they are sender or receiver
3. WHEN a user reads a message THEN THE Message_Service SHALL mark the message as read and record the read timestamp
4. THE Message_Service SHALL organize messages into conversations between two users
5. THE Message_Service SHALL validate that sender and receiver exist in the system
6. THE Message_Service SHALL record the sent timestamp for each message
7. THE Message_Service SHALL support message subjects up to 200 characters

### Requirement 11: Schedule Management

**User Story:** As a system user, I want to view class schedules, so that I can know when and where classes are held.

#### Acceptance Criteria

1. WHEN an admin creates a schedule THEN THE Schedule_Service SHALL create a schedule entry with course, day, time, and room
2. WHEN a teacher retrieves their schedule THEN THE Schedule_Service SHALL return all schedules for their assigned courses
3. WHEN a student retrieves their schedule THEN THE Schedule_Service SHALL return all schedules for their enrolled courses
4. THE Schedule_Service SHALL support all days of the week (MONDAY through SUNDAY)
5. THE Schedule_Service SHALL validate that start time is before end time
6. THE Schedule_Service SHALL support class types (LECTURE, LAB, TUTORIAL)
7. THE Schedule_Service SHALL prevent scheduling conflicts for the same room at the same time

### Requirement 12: Support Ticket System

**User Story:** As a system user, I want to create and track support tickets, so that I can report issues and get help.

#### Acceptance Criteria

1. WHEN a user creates a ticket THEN THE Ticket_Service SHALL create a ticket with subject, description, and category
2. WHEN a user retrieves their tickets THEN THE Ticket_Service SHALL return all tickets created by that user
3. WHEN an admin updates a ticket THEN THE Ticket_Service SHALL update the ticket status and add admin response
4. THE Ticket_Service SHALL support ticket statuses (OPEN, IN_PROGRESS, RESOLVED)
5. THE Ticket_Service SHALL support ticket categories (LOGIN_ISSUE, PROFILE_UPDATE, ACCOUNT_CORRECTION, GENERAL_COMPLAINT, OTHER)
6. THE Ticket_Service SHALL track creation and update timestamps for each ticket
7. THE Ticket_Service SHALL allow users to view their ticket history

### Requirement 13: Course Enrollment Management

**User Story:** As an admin, I want to manage student course enrollments, so that I can track which students are enrolled in which courses.

#### Acceptance Criteria

1. WHEN an admin enrolls a student in a course THEN THE Enrollment_Service SHALL create an enrollment record with status ACTIVE
2. WHEN an admin retrieves enrollments THEN THE Enrollment_Service SHALL return enrollment records with student and course information
3. WHEN an admin updates an enrollment THEN THE Enrollment_Service SHALL update the enrollment status and grades
4. THE Enrollment_Service SHALL prevent duplicate enrollments for the same student, course, semester, and academic year
5. THE Enrollment_Service SHALL support enrollment statuses (ACTIVE, COMPLETED, DROPPED, WITHDRAWN, FAILED)
6. THE Enrollment_Service SHALL calculate letter grades and grade points based on final grade percentage
7. THE Enrollment_Service SHALL track enrollment date and completion date
8. THE Enrollment_Service SHALL validate that students cannot enroll in courses they have already completed

### Requirement 14: User Profile Management

**User Story:** As a system user, I want to view and update my profile, so that I can keep my information current.

#### Acceptance Criteria

1. WHEN a user retrieves their profile THEN THE User_Management_Service SHALL return their complete profile information
2. WHEN a student updates their profile THEN THE Student_Service SHALL update allowed fields (contact number, date of birth)
3. WHEN a teacher updates their profile THEN THE Teacher_Service SHALL update allowed fields (contact number, date of birth)
4. THE User_Management_Service SHALL allow users to change their password
5. THE User_Management_Service SHALL validate new passwords meet security requirements
6. THE User_Management_Service SHALL prevent users from changing their email or role
7. THE User_Management_Service SHALL hash new passwords using BCrypt before storing

### Requirement 15: Data Validation and Error Handling

**User Story:** As a system developer, I want comprehensive data validation and error handling, so that the system provides clear feedback and maintains data integrity.

#### Acceptance Criteria

1. WHEN invalid data is submitted THEN THE EADMS_System SHALL return a 400 Bad Request with specific validation errors
2. WHEN a resource is not found THEN THE EADMS_System SHALL return a 404 Not Found with a descriptive message
3. WHEN an unauthorized request is made THEN THE EADMS_System SHALL return a 401 Unauthorized
4. WHEN a forbidden action is attempted THEN THE EADMS_System SHALL return a 403 Forbidden
5. WHEN a unique constraint is violated THEN THE EADMS_System SHALL return a 409 Conflict
6. WHEN an internal error occurs THEN THE EADMS_System SHALL return a 500 Internal Server Error and log the error
7. THE EADMS_System SHALL validate all required fields are present before processing requests
8. THE EADMS_System SHALL validate data types and formats match expected values

### Requirement 16: Security and Access Control

**User Story:** As a system administrator, I want robust security measures, so that user data is protected and access is properly controlled.

#### Acceptance Criteria

1. THE EADMS_System SHALL require authentication for all endpoints except login
2. THE EADMS_System SHALL enforce role-based access control on all protected endpoints
3. THE EADMS_System SHALL use HTTPS for all communications in production
4. THE EADMS_System SHALL configure CORS to allow only trusted frontend origins
5. THE EADMS_System SHALL never expose password hashes in API responses
6. THE EADMS_System SHALL log all authentication attempts
7. THE EADMS_System SHALL implement rate limiting to prevent brute force attacks
8. THE EADMS_System SHALL validate JWT token signatures and expiration

### Requirement 17: Database Management

**User Story:** As a system administrator, I want reliable database management, so that data is stored securely and efficiently.

#### Acceptance Criteria

1. THE EADMS_System SHALL use PostgreSQL for production deployments
2. THE EADMS_System SHALL support H2 in-memory database for development and testing
3. THE EADMS_System SHALL use JPA/Hibernate for object-relational mapping
4. THE EADMS_System SHALL implement proper database indexes for frequently queried fields
5. THE EADMS_System SHALL enforce referential integrity through foreign key constraints
6. THE EADMS_System SHALL use database transactions for multi-step operations
7. THE EADMS_System SHALL implement cascade delete for dependent records
8. THE EADMS_System SHALL track creation and update timestamps for all entities

### Requirement 18: Frontend User Interface

**User Story:** As a system user, I want an intuitive and responsive user interface, so that I can easily interact with the system.

#### Acceptance Criteria

1. THE EADMS_System SHALL provide a responsive design that works on desktop, tablet, and mobile devices
2. THE EADMS_System SHALL display role-appropriate navigation based on user role
3. THE EADMS_System SHALL provide real-time form validation with clear error messages
4. THE EADMS_System SHALL display loading states during API requests
5. THE EADMS_System SHALL display empty states when no data is available
6. THE EADMS_System SHALL use toast notifications for success and error feedback
7. THE EADMS_System SHALL implement protected routes that redirect unauthenticated users to login
8. THE EADMS_System SHALL display data in tables with sorting and filtering capabilities

### Requirement 19: Performance and Scalability

**User Story:** As a system administrator, I want the system to perform efficiently, so that users have a smooth experience.

#### Acceptance Criteria

1. THE EADMS_System SHALL respond to API requests within 200 milliseconds for simple queries
2. THE EADMS_System SHALL respond to API requests within 1 second for complex queries with joins
3. THE EADMS_System SHALL use lazy loading for entity relationships to optimize query performance
4. THE EADMS_System SHALL implement pagination for list endpoints returning large datasets
5. THE EADMS_System SHALL cache frequently accessed data where appropriate
6. THE EADMS_System SHALL optimize database queries using proper indexes
7. THE EADMS_System SHALL handle concurrent requests without data corruption
8. THE EADMS_System SHALL support at least 100 concurrent users

### Requirement 20: System Configuration and Deployment

**User Story:** As a system administrator, I want flexible configuration options, so that I can deploy the system in different environments.

#### Acceptance Criteria

1. THE EADMS_System SHALL support environment-specific configuration files (dev, prod)
2. THE EADMS_System SHALL read database connection details from environment variables
3. THE EADMS_System SHALL read JWT secret key from environment variables
4. THE EADMS_System SHALL support Docker containerization for easy deployment
5. THE EADMS_System SHALL provide health check endpoints for monitoring
6. THE EADMS_System SHALL log application events at appropriate levels (INFO, WARN, ERROR)
7. THE EADMS_System SHALL support graceful shutdown to complete in-flight requests
8. THE EADMS_System SHALL initialize sample data in development mode for testing

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

- API response time: < 200ms for simple queries, < 1s for complex queries
- Database query optimization with proper indexing
- Support for 100+ concurrent users
- Frontend bundle size: < 500KB (gzipped)
- Initial page load: < 2 seconds

### 4.2 Security Requirements

- JWT-based stateless authentication
- BCrypt password hashing with salt
- HTTPS encryption for all communications
- CORS configuration for trusted origins
- Role-based access control (RBAC)
- SQL injection prevention through parameterized queries
- XSS protection through input sanitization

### 4.3 Reliability Requirements

- 99.9% uptime for production environment
- Automated database backups daily
- Transaction management for data consistency
- Graceful error handling and recovery
- Comprehensive logging for debugging

### 4.4 Usability Requirements

- Intuitive user interface with clear navigation
- Responsive design for all device sizes
- Consistent visual design language
- Accessible UI following WCAG guidelines
- Clear error messages and validation feedback

### 4.5 Maintainability Requirements

- Clean code following SOLID principles
- Comprehensive inline documentation
- Layered architecture with separation of concerns
- Consistent naming conventions
- Modular design for easy feature additions

### 4.6 Portability Requirements

- Cross-platform compatibility (Windows, Linux, macOS)
- Browser compatibility (Chrome, Firefox, Safari, Edge)
- Database portability (PostgreSQL, H2)
- Docker containerization support
- Cloud deployment ready (AWS, Azure, GCP)

### 4.7 Scalability Requirements

- Horizontal scaling support through stateless design
- Database connection pooling
- Efficient query design to minimize database load
- Caching strategy for frequently accessed data
- Load balancing support

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│              (React 18 + TypeScript)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Admin   │  │ Teacher  │  │ Student  │              │
│  │    UI    │  │    UI    │  │    UI    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                         │
                    HTTPS/REST
                         │
┌─────────────────────────────────────────────────────────┐
│                    Backend Layer                         │
│              (Spring Boot 3.2.1)                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Controller Layer (REST APIs)             │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Service Layer (Business Logic)           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │      Repository Layer (Data Access)              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                      JDBC/JPA
                         │
┌─────────────────────────────────────────────────────────┐
│                   Database Layer                         │
│            (PostgreSQL / H2)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Users   │  │ Students │  │ Teachers │              │
│  │ Courses  │  │  Marks   │  │Attendance│              │
│  │ Messages │  │ Tickets  │  │          │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Technology Stack

**Backend:**
- Java 17
- Spring Boot 3.2.1
- Spring Security 6.x with JWT
- Spring Data JPA with Hibernate
- PostgreSQL / H2 Database
- Maven build tool

**Frontend:**
- React 18.2.0
- TypeScript 5.3.3
- Vite 5.0.8
- Tailwind CSS 3.4.0
- Axios for HTTP requests
- React Router for navigation

---

## 6. Database Schema

### 6.1 Core Entities

**users**
- id (PK)
- email (unique)
- password (hashed)
- role (ADMIN/TEACHER/STUDENT)
- is_active
- created_at, updated_at

**students**
- id (PK)
- student_id (unique)
- first_name, last_name
- class_name
- gender
- contact_number
- date_of_birth
- user_id (FK → users)

**teachers**
- id (PK)
- teacher_id (unique)
- first_name, last_name
- department
- email (unique)
- contact_number
- user_id (FK → users)

**courses**
- id (PK)
- course_code (unique)
- course_name
- semester
- credits
- description

**marks**
- id (PK)
- student_id (FK → students)
- course_id (FK → courses)
- exam_type
- marks_obtained
- max_marks
- remarks
- exam_date

**attendance**
- id (PK)
- student_id (FK → students)
- course_id (FK → courses)
- attendance_date
- status

**enrollments**
- id (PK)
- student_id (FK → students)
- course_id (FK → courses)
- semester
- academic_year
- status
- enrollment_date
- final_grade, letter_grade, grade_points

**messages**
- id (PK)
- sender_id (FK → users)
- receiver_id (FK → users)
- subject, content
- is_read
- sent_at, read_at

**schedules**
- id (PK)
- course_id (FK → courses)
- day_of_week
- start_time, end_time
- room_number
- class_type

**tickets**
- id (PK)
- user_id (FK → users)
- subject, description
- category
- status
- admin_response
- created_at, updated_at

---

## 7. API Endpoints Summary

### Authentication
- POST /api/auth/login
- GET /api/auth/me

### Admin Endpoints
- GET /api/admin/dashboard/stats
- GET/POST/PUT/DELETE /api/admin/students
- GET/POST/PUT/DELETE /api/admin/teachers
- GET/POST/PUT/DELETE /api/admin/courses
- PUT /api/admin/courses/{courseId}/assign-teacher/{teacherId}
- GET/POST/PUT /api/admin/enrollments

### Teacher Endpoints
- GET /api/teacher/dashboard/stats
- GET /api/teacher/courses
- GET/POST/PUT /api/teacher/marks
- GET/POST/PUT /api/teacher/attendance
- GET /api/teacher/course/{courseId}/average

### Student Endpoints
- GET /api/student/dashboard/stats
- GET /api/student/profile
- GET /api/student/marks
- GET /api/student/attendance
- GET /api/student/attendance/stats
- GET /api/student/gpa

### Shared Endpoints
- GET/POST /api/messages
- GET/POST/PUT /api/tickets
- GET /api/schedules

---

## 8. Constraints and Assumptions

### 8.1 Constraints

- System requires Java 17 or higher
- Database must support ACID transactions
- Frontend requires modern browser with JavaScript enabled
- Network connectivity required for all operations
- JWT tokens expire after 24 hours

### 8.2 Assumptions

- Users have basic computer literacy
- Institution has reliable internet connectivity
- Database backups are managed externally
- System administrators handle user account creation
- Academic year follows standard semester system
- Grading scale follows standard percentage-based system

---

## 9. Dependencies

### 9.1 External Dependencies

**Backend:**
- Spring Boot Starter Web
- Spring Boot Starter Security
- Spring Boot Starter Data JPA
- JWT libraries (jjwt-api, jjwt-impl, jjwt-jackson)
- PostgreSQL JDBC Driver
- H2 Database
- Lombok
- ModelMapper

**Frontend:**
- React and React DOM
- React Router DOM
- Axios
- Tailwind CSS
- Recharts
- React Hook Form
- Zod validation
- Lucide React icons

---

## 10. Appendices

### 10.1 Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | January 7, 2026 | Development Team | Initial SRS document based on implemented system |

### 10.2 References

- Spring Boot Documentation: https://spring.io/projects/spring-boot
- React Documentation: https://react.dev
- JWT Specification: https://jwt.io
- PostgreSQL Documentation: https://www.postgresql.org/docs/

### 10.3 Acronyms

- API: Application Programming Interface
- CORS: Cross-Origin Resource Sharing
- CRUD: Create, Read, Update, Delete
- DTO: Data Transfer Object
- GPA: Grade Point Average
- HTTP: Hypertext Transfer Protocol
- HTTPS: HTTP Secure
- JDBC: Java Database Connectivity
- JPA: Java Persistence API
- JSON: JavaScript Object Notation
- JWT: JSON Web Token
- MVC: Model-View-Controller
- ORM: Object-Relational Mapping
- REST: Representational State Transfer
- SRS: Software Requirements Specification
- UI: User Interface
- URL: Uniform Resource Locator

---

**End of Software Requirements Specification**
