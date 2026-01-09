Efficient Academic Data Management System (EADMS) 🎓

Course: Software Engineering II
Institution: University of Europe for Applied Sciences (UE)
Project Type: Group Course Project

Team Members

Saniya Sunny (67168510)

Ann Alex (24202804)

Glansyl Meldon Dsouza (69082142)

Sukhpreet Kaur (49495067)

A complete academic data management system developed using Spring Boot for the backend and React with TypeScript for the frontend. The application is intended to simulate a real-world academic management platform and includes features such as role-based access control, secure authentication, academic record management, and automated PDF report generation. The system is designed with production-level considerations, including validation, error handling, and deployment readiness.

Project Overview

The Efficient Academic Data Management System (EADMS) is a web-based platform created to manage academic data within an educational institution. The system supports three types of users: administrators, teachers, and students. Each user role is assigned specific permissions to ensure that access to data and system functionality is properly controlled.

The application provides functionality for managing student records, teacher profiles, course information, examination marks, and attendance records. In addition, the system supports the generation of academic reports in PDF format, allowing students to download structured report cards.

A system update completed in January 2026 introduced student report card PDF downloads with standardized academic formatting. During this update, the repository was reviewed, unnecessary components were removed, and the overall structure was optimized to improve maintainability and deployment readiness.

Key Features

The system implements role-based access control with three clearly defined roles. Secure authentication is implemented using JSON Web Tokens with a fixed expiration period. Academic data management includes support for students, teachers, courses, marks, and attendance records.

The application provides PDF report generation for student report cards and attendance summaries. The backend exposes RESTful APIs that follow established best practices. The frontend presents a responsive and professional user interface built with modern styling libraries.

The system includes interactive data visualization components for academic analytics, real-time dashboard statistics, and comprehensive validation and error handling to ensure consistent system behavior in production environments.

Architecture

Backend Architecture

The backend follows a layered architectural approach to maintain a clear separation of concerns. Controllers are responsible for handling HTTP requests and responses. The service layer contains business logic. The repository layer abstracts database operations. Data transfer objects are used to define API contracts, and utility classes support validation and response handling.

The application design follows the Model View Controller pattern and applies object-oriented design principles, including SOLID principles, to ensure clean and maintainable code.

Technology Stack

Backend

The backend is developed using Java 17 and Spring Boot version 3.2.1. It uses Spring Web for REST API development and Spring Data JPA with Hibernate for persistence. Spring Security is used to enforce authentication and authorization using JWT. PostgreSQL is used as the production database, while H2 is used for development and testing. Maven is used as the build tool. Lombok is used to reduce boilerplate code, and ModelMapper is used for object mapping.

Frontend

The frontend is developed using React 18 with Vite and TypeScript. Tailwind CSS is used for styling, and Shadcn UI is used for reusable components. Client-side routing is handled using React Router version 6. Axios is used for HTTP communication. Form validation is implemented using React Hook Form and Zod. Recharts is used for data visualization, and Lucide React is used for icons. Notifications are handled using React Hot Toast.

Project Structure

The project is organized into multiple directories to clearly separate concerns. Documentation files are stored in the docs directory. The frontend directory contains all React and TypeScript source files, including components, pages for different user roles, services, context providers, and utility functions.

eadms/
├── frontend/              # React + TypeScript frontend
├── src/main/java/         # Spring Boot backend source
├── src/main/resources/    # Configuration and database migration
├── docs/                  # Technical documentation
├── scripts/               # Utility and verification scripts
├── pom.xml                # Maven configuration
├── Dockerfile             # Container configuration

The backend source code is located under src/main/java and is organized into configuration, entity, repository, service, controller, DTO, exception, and utility packages. Application configuration files and database migration scripts are stored under src/main/resources. Additional scripts for verification and migration are stored in the scripts directory.

Getting Started

Prerequisites

To run the project, Java version 17 or higher is required along with Maven version 3.8 or higher. Node.js version 18 or higher is required for the frontend. PostgreSQL is required for production deployment, while H2 can be used for development.

Backend Setup

The repository must be cloned and the project directory opened. For development, the H2 database is preconfigured and does not require additional setup. For production, PostgreSQL connection details must be configured in the application properties file.

The backend project is built using Maven and can be run using Spring Boot with either the development or production profile. Once started, the backend API is accessible on port 8080. The H2 console is available in development mode.

Frontend Setup

The frontend setup requires navigating to the frontend directory and installing dependencies using npm. Environment variables must be configured to specify the backend API and WebSocket URLs. After configuration, the development server can be started and accessed through the browser.

Database Schema

The database schema includes entities for users, students, teachers, courses, marks, and attendance records.

The user entity handles authentication and authorization and stores encrypted passwords and role information. The student entity stores personal and academic information and maintains relationships with marks and attendance records. The teacher entity stores faculty details and is associated with courses. The course entity represents academic courses and is linked to teachers, marks, and attendance. The marks entity stores examination results, and the attendance entity stores attendance status for students in each course.

API Endpoints

Authentication endpoints provide login functionality and retrieval of the currently authenticated user.

Administrative endpoints allow administrators to create, update, retrieve, and delete students, teachers, and courses. Administrators can also assign teachers to courses and view dashboard statistics.

Teacher endpoints allow teachers to view assigned courses, record and update marks, mark attendance, view course statistics, and access dashboard metrics.

Student endpoints allow students to view their profile, marks, attendance records, attendance statistics, GPA, and dashboard summaries.

Testing

The project includes automated testing support using Maven. Tests can be executed for the entire project or for individual test classes. Code coverage reports can also be generated.

Quality Assurance

A structured quality assurance audit was conducted in January 2026. The audit verified API contract correctness, field naming consistency, enum validation, and date format handling. Error handling was reviewed to ensure appropriate HTTP status codes and user-friendly messages.

Edge cases such as empty data states, invalid inputs, and stale data scenarios were tested. Security validation confirmed that JWT authentication and role-based authorization were correctly enforced. Performance testing ensured that unnecessary API calls and rendering loops were avoided.

Configuration

JWT configuration includes a secret key and token expiration duration. CORS configuration restricts frontend origins and is defined within the backend configuration classes.

Default Credentials

Upon initial startup, the system creates a default administrator account. This account can be used to access the admin panel and create additional users such as teachers and students.

User Interface Design Principles

The frontend design follows a professional color palette, consistent typography, structured spacing, and subtle visual elevation. The layout is responsive and supports multiple screen sizes. Accessibility considerations such as keyboard navigation and readable contrast are included. Smooth transitions and animations are used to improve user experience.

Build and Deployment

The application supports development and production builds. The backend can be packaged as a standalone executable JAR file. The frontend can be built into static assets for deployment using a web server. Docker-based deployment is supported using the provided Docker configuration.

Contributing

Contributions follow a standard workflow involving repository forking, feature branch creation, commit submission, and pull request review.

License

This project is distributed under the MIT License.

Authors

Development Team, EADMS Project

Acknowledgments

The project references official documentation and learning resources from Spring Boot, React, Tailwind CSS, and Shadcn UI.

Documentation

Additional documentation is available in the docs directory, including API testing guides, database setup instructions, deployment documentation, environment variable configuration, and quality assurance reports.

Support

Support is provided through the project repository issue tracker and the available documentation.

Academic Note

This project was developed for academic purposes and demonstrates the application of full-stack development techniques, layered architecture, secure authentication, and deployment-oriented configuration in a modern web application.

