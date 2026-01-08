# Production Deployment Guide

## Overview
This document outlines the deployment process for the Academic Management System (EADMS) to production.

## Features Included
- ✅ Student Report Card PDF Download
- ✅ Teacher Attendance PDF Download  
- ✅ Complete Academic Management System
- ✅ Authentication & Authorization
- ✅ Real-time Dashboard
- ✅ Course Management
- ✅ Marks & Attendance Tracking

## Architecture
- **Backend**: Spring Boot 3.2.1 with Java 21
- **Frontend**: React 18 with TypeScript and Vite
- **Database**: PostgreSQL (Production) / H2 (Development)
- **Authentication**: JWT-based
- **PDF Generation**: jsPDF with professional formatting

## Deployment Platforms

### Render.com (Recommended)
The application is configured for Render.com deployment:

1. **Backend Deployment**:
   ```bash
   # Automatic deployment via render.yaml
   # Environment: Java 21
   # Build: mvn clean package -DskipTests
   # Start: java -jar target/eadms-1.0.0.jar
   ```

2. **Frontend Deployment**:
   ```bash
   # Build command: npm run build
   # Publish directory: frontend/dist
   # Environment: Node.js 18+
   ```

### Environment Variables (Production)

#### Backend (.env or Render environment)
```bash
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secure-jwt-secret-key-minimum-32-characters
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

#### Frontend (.env.production)
```bash
VITE_API_URL=https://your-backend-url.com/api
VITE_WS_URL=https://your-backend-url.com
```

## Database Setup

### PostgreSQL Production Database
```sql
-- Create database
CREATE DATABASE eadms;

-- Create user (if needed)
CREATE USER eadms_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE eadms TO eadms_user;
```

### Database Migration
The application uses Hibernate with `ddl-auto=validate` in production. 
Run database migrations manually or use Flyway for production deployments.

## Security Configuration

### JWT Security
- Use a strong, unique JWT secret (minimum 32 characters)
- Set appropriate token expiration (24 hours recommended)
- Rotate JWT secrets regularly in production

### CORS Configuration
- Configure allowed origins for your frontend domain
- Avoid using wildcards (*) in production
- Use HTTPS for all production URLs

## Performance Optimization

### Backend
- Connection pooling configured (HikariCP)
- JPA batch processing enabled
- Compression enabled for responses
- Actuator endpoints for monitoring

### Frontend
- Production build with Vite optimization
- Code splitting and lazy loading
- Compressed assets (gzip)
- Optimized bundle sizes

## Monitoring & Health Checks

### Health Endpoints
- `/actuator/health` - Application health status
- `/actuator/info` - Application information
- `/actuator/metrics` - Application metrics

### Logging
- Structured logging in production
- Log levels configured appropriately
- Error tracking and monitoring recommended

## PDF Generation Features

### Student Report Card
- Professional academic formatting
- Comprehensive student information
- Subject-wise performance breakdown
- GPA and credit calculations
- Multi-page support with pagination

### Teacher Attendance Reports
- Course-wise attendance tracking
- Student attendance status
- Date range filtering
- Professional formatting for official use

## Deployment Checklist

### Pre-deployment
- [ ] Update environment variables
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure domain names
- [ ] Test PDF generation functionality

### Post-deployment
- [ ] Verify health endpoints
- [ ] Test authentication flow
- [ ] Validate PDF downloads
- [ ] Check database connections
- [ ] Monitor application logs
- [ ] Test all user roles (Admin, Teacher, Student)

## Backup & Recovery

### Database Backups
- Set up automated PostgreSQL backups
- Test backup restoration procedures
- Store backups in secure, separate location

### Application Backups
- Version control with Git
- Tagged releases for rollback capability
- Environment configuration backups

## Support & Maintenance

### Regular Maintenance
- Monitor application performance
- Update dependencies regularly
- Review and rotate security keys
- Monitor disk space and database size

### Troubleshooting
- Check application logs for errors
- Verify database connectivity
- Test PDF generation with sample data
- Validate authentication tokens

## Contact Information
For deployment support or issues, refer to the main README.md or contact the development team.