# Schedule Sync Testing Guide

This document outlines how to test the schedule synchronization between teachers and students.

## Test Scenario: Teacher Creates Schedule → Student Sees It

### Prerequisites
1. Backend server running
2. Frontend application running
3. At least one teacher and one student user
4. Student enrolled in at least one course taught by the teacher

### Test Steps

#### Step 1: Teacher Creates Schedule
1. Login as a teacher
2. Navigate to "My Schedule" page
3. Click "Create Schedule" button
4. Fill out the form:
   - Select a course you teach
   - Set title (e.g., "Introduction to Programming")
   - Set date and time
   - Add location (e.g., "Room 101")
   - Select class type (Lecture/Lab/Tutorial)
5. Click "Create Schedule"
6. Verify the schedule appears in your calendar

#### Step 2: Student Views Schedule
1. Login as a student (enrolled in the same course)
2. Navigate to "My Schedule" page
3. Verify the teacher's schedule appears in your calendar
4. Check that all details match:
   - Course name and code
   - Date and time
   - Location
   - Teacher name
   - Class type

#### Step 3: Real-time Updates
1. As teacher, edit the schedule (change time or location)
2. As student, refresh the schedule page
3. Verify changes are reflected immediately

#### Step 4: Enrollment-based Filtering
1. As admin, unenroll the student from the course
2. As student, refresh the schedule page
3. Verify the schedule no longer appears
4. Re-enroll the student
5. Verify the schedule reappears

## API Endpoints Used

### Teacher APIs
- `GET /api/teacher/schedules` - Get teacher's schedules
- `POST /api/teacher/schedules` - Create new schedule
- `PUT /api/teacher/schedules/{id}` - Update schedule
- `DELETE /api/teacher/schedules/{id}` - Delete schedule

### Student APIs
- `GET /api/student/schedules` - Get student's schedules (from enrolled courses)

## Database Queries

### Student Schedule Query
```sql
SELECT DISTINCT s.* FROM schedules s 
JOIN enrollments e ON e.course_id = s.course_id 
WHERE e.student_id = ? AND e.status = 'ACTIVE' 
ORDER BY s.start_date_time
```

This ensures students only see schedules for courses they're actively enrolled in.

## Expected Behavior

### ✅ What Should Work
- Teacher creates schedule → Student sees it immediately
- Teacher updates schedule → Changes reflect in student view
- Teacher deletes schedule → Removed from student view
- Student only sees schedules for enrolled courses
- Multiple students see the same teacher's schedules
- Schedule conflicts are prevented for teachers

### ❌ What Should NOT Work
- Student cannot create/edit/delete schedules
- Student cannot see schedules for courses they're not enrolled in
- Unenrolled students cannot see any schedules for that course
- Teachers cannot see other teachers' schedules (unless shared)

## Troubleshooting

### Student Not Seeing Schedules
1. Check if student is enrolled in the course (`enrollments` table)
2. Verify enrollment status is 'ACTIVE'
3. Check if teacher created schedules for that course
4. Verify API endpoint `/api/student/schedules` returns data

### Teacher Cannot Create Schedules
1. Check if teacher is assigned to the course (`course_teachers` table)
2. Verify teacher has TEACHER role
3. Check for schedule conflicts
4. Verify API endpoint `/api/teacher/schedules` accepts POST requests

### Schedule Not Updating
1. Check browser cache/refresh
2. Verify API calls are successful (check network tab)
3. Check database for updated data
4. Verify frontend state management

## Performance Considerations

- Student schedule queries use indexes on `course_id` and `student_id`
- Schedule queries are filtered by enrollment status to reduce data
- Frontend caches schedule data and refreshes on user actions
- Real-time updates can be implemented with WebSocket if needed

## Security Verification

- Students cannot access `/api/teacher/schedules` endpoints
- Teachers cannot access other teachers' schedules without permission
- All endpoints require proper authentication and role-based authorization
- Schedule data is filtered by enrollment relationships