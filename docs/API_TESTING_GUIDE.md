# EADMS API Testing Quick Reference

## Base URL
```
http://localhost:8080
```

## 1. Authentication

### Login (Admin)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eadms.com",
    "password": "admin123"
  }'
```

### Login (Teacher)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher1@eadms.com",
    "password": "teacher123"
  }'
```

### Login (Student)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@eadms.com",
    "password": "student123"
  }'
```

## 2. Get Current User
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 3. Admin Operations

### Get All Students
```bash
curl -X GET http://localhost:8080/api/admin/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Student
```bash
curl -X POST http://localhost:8080/api/admin/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "studentId": "S0011",
    "className": "Class A",
    "gender": "MALE",
    "contactNumber": "+1-555-1234",
    "dateOfBirth": "2003-05-15",
    "email": "john.doe@student.com",
    "password": "student123"
  }'
```

### Get All Teachers
```bash
curl -X GET http://localhost:8080/api/admin/teachers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Teacher
```bash
curl -X POST http://localhost:8080/api/admin/teachers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "teacherId": "T004",
    "department": "English",
    "email": "jane.smith@teacher.com",
    "contactNumber": "+1-555-5678",
    "password": "teacher123"
  }'
```

### Get All Courses
```bash
curl -X GET http://localhost:8080/api/admin/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Course
```bash
curl -X POST http://localhost:8080/api/admin/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "ENG101",
    "courseName": "English Literature",
    "semester": 1,
    "credits": 3,
    "description": "Introduction to English Literature",
    "teacherId": 2
  }'
```

### Admin Dashboard Stats
```bash
curl -X GET http://localhost:8080/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 4. Teacher Operations

### Get Teacher Dashboard
```bash
curl -X GET http://localhost:8080/api/teacher/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get My Courses
```bash
curl -X GET http://localhost:8080/api/teacher/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Enter Marks
```bash
curl -X POST http://localhost:8080/api/teacher/marks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "courseId": 1,
    "examType": "QUIZ",
    "marksObtained": 85.5,
    "maxMarks": 100,
    "remarks": "Good performance",
    "examDate": "2024-01-15"
  }'
```

### Mark Attendance
```bash
curl -X POST http://localhost:8080/api/teacher/attendance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "courseId": 1,
    "attendanceDate": "2024-01-20",
    "status": "PRESENT"
  }'
```

## 5. Student Operations

### Get Student Dashboard
```bash
curl -X GET http://localhost:8080/api/student/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get My Profile
```bash
curl -X GET http://localhost:8080/api/student/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get My Marks
```bash
curl -X GET http://localhost:8080/api/student/marks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get My Attendance
```bash
curl -X GET http://localhost:8080/api/student/attendance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get My Attendance Stats
```bash
curl -X GET http://localhost:8080/api/student/attendance/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get My GPA
```bash
curl -X GET http://localhost:8080/api/student/gpa \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing Workflow

1. **Login** to get JWT token
2. **Copy the token** from the response
3. **Replace** `YOUR_JWT_TOKEN` in subsequent requests
4. **Test endpoints** based on user role

## Example Complete Workflow

```bash
# Step 1: Login as Admin
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eadms.com","password":"admin123"}' \
  | jq -r '.data.token')

# Step 2: Use token to get all students
curl -X GET http://localhost:8080/api/admin/students \
  -H "Authorization: Bearer $TOKEN"
```

## Postman Collection

You can import these endpoints into Postman:
1. Create a new collection "EADMS API"
2. Add environment variable: `baseUrl = http://localhost:8080`
3. Add environment variable: `token = ` (set after login)
4. Use `{{baseUrl}}` and `{{token}}` in requests

## Common Response Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Invalid/missing token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Notes

- All authenticated endpoints require `Authorization: Bearer {token}` header
- Tokens expire after 24 hours (configurable in application.properties)
- All dates should be in `YYYY-MM-DD` format
- Enum values are case-insensitive (MALE, male, Male all work)
