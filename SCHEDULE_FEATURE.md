# Schedule/Timetable Feature

## Overview
Added a comprehensive schedule/timetable feature for both students and teachers to view their class schedules.

## Backend Changes

### Database
- **Table**: `schedules`
  - `id` (BIGINT, Primary Key)
  - `course_id` (BIGINT, Foreign Key → courses)
  - `day_of_week` (VARCHAR) - MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY
  - `start_time` (TIME)
  - `end_time` (TIME)
  - `room_number` (VARCHAR)
  - `class_type` (VARCHAR) - LECTURE, LAB, TUTORIAL
  - `created_at`, `updated_at` (Audit fields)

- **Indexes**:
  - `idx_schedule_course` on `course_id`
  - `idx_schedule_day` on `day_of_week`
  - `idx_schedule_time` on `start_time`

- **Migration**: `V2__add_schedules.sql`

### Entities
- **Schedule.java**
  - JPA entity representing class schedules
  - Many-to-One relationship with Course
  - Uses Java's DayOfWeek enum and LocalTime

### Repository
- **ScheduleRepository.java**
  - `findByCourseId(Long courseId)` - Get schedules for a course
  - `findByDayOfWeek(DayOfWeek day)` - Get schedules for a specific day
  - `findByTeacherId(Long teacherId)` - Get all schedules for a teacher (joins through course.teacher)
  - `findByStudentId(Long studentId)` - Get all schedules for a student (joins through marks/enrollments)

### Service
- **ScheduleService.java**
  - CRUD operations for schedules
  - Converts entities to DTOs to prevent circular reference issues
  - Business logic for fetching schedules by teacher/student

### Controller
- **ScheduleController.java**
  - `GET /api/schedules` - Get all schedules (ADMIN only)
  - `GET /api/schedules/{id}` - Get schedule by ID
  - `GET /api/schedules/teacher/{teacherId}` - Get teacher's schedules
  - `GET /api/schedules/student/{studentId}` - Get student's schedules
  - `GET /api/schedules/day/{dayOfWeek}` - Get schedules for a specific day
  - `POST /api/schedules` - Create schedule (ADMIN only)
  - `PUT /api/schedules/{id}` - Update schedule (ADMIN only)
  - `DELETE /api/schedules/{id}` - Delete schedule (ADMIN only)

### DTO
- **ScheduleDTO.java**
  - Data transfer object with course details, teacher name, and schedule times
  - Prevents circular reference issues in JSON serialization

## Frontend Changes

### Services
- **scheduleService.ts**
  - TypeScript interface for Schedule
  - API integration methods:
    - `getAllSchedules()`
    - `getTeacherSchedules(teacherId)`
    - `getStudentSchedules(studentId)`
    - `getSchedulesByDay(day)`
    - `createSchedule(schedule)`
    - `updateSchedule(id, schedule)`
    - `deleteSchedule(id)`

### Components

#### StudentSchedule.tsx
- **Today's Classes Card**
  - Shows current day's classes
  - Time range display (12-hour format)
  - Course name, code, room number
  - Class type badge (color-coded)

- **Weekly Schedule View**
  - Day selector (Monday-Friday)
  - List of classes for selected day
  - Time formatting
  - Empty state when no classes

#### TeacherSchedule.tsx
- **Today's Classes Card**
  - Shows current day's teaching schedule
  - Time range display
  - Course details and room number
  - Class type indicators

- **Weekly Schedule View**
  - Day selector
  - Teaching schedule for selected day
  - Course information display
  - Empty state handling

### Routing
- **Student Route**: `/student/schedule` - StudentSchedule component
- **Teacher Route**: `/teacher/schedule` - TeacherSchedule component

### Navigation
- Added "Schedule" link to student sidebar (Calendar icon)
- Schedule link already present in teacher sidebar

## Data Import

### CSV File
- **schedules.csv** - 46 schedule records
  - Distribution: Monday (10), Tuesday (10), Wednesday (10), Thursday (10), Friday (6)
  - Time slots: 09:00-10:30, 11:00-12:30, 14:00-15:30, 16:00-17:30
  - All 20 courses scheduled
  - Various room assignments (101-105, 201-205, Lab 101-103)
  - Mixed class types (LECTURE, LAB, TUTORIAL)

### Import Script
- **import_schedules_from_csv.py**
  - Reads schedules.csv
  - Creates schedule records linked to existing courses
  - Validates day of week and times
  - Error handling and progress reporting

## Features

### Student Features
1. View today's schedule
2. Browse weekly schedule by day
3. See course details (name, code, teacher)
4. View class type, time, and location
5. Empty state when no classes scheduled

### Teacher Features
1. View today's teaching schedule
2. Browse weekly teaching schedule
3. See all classes they teach
4. View class details and location
5. Empty state handling

### UI/UX
- Color-coded class types:
  - Blue: LECTURE
  - Purple: LAB
  - Green: TUTORIAL
- 12-hour time format (9:00 AM, 2:00 PM)
- Responsive design
- Loading states
- Empty state messages

## Testing

### Credentials
- **Student**: aarav.sharma@college.edu / Pass@123
- **Teacher**: ramesh.kulkarni@college.edu / Teach@123
- **Admin**: admin@eadms.com / Admin@123

### Test Scenarios
1. Login as student → Navigate to Schedule → See enrolled courses
2. Login as teacher → Navigate to Schedule → See teaching schedule
3. Switch between days to see different schedules
4. Verify today's classes show current day
5. Check empty states for days with no classes

## Technical Notes

- Uses Java 17 features (LocalTime, DayOfWeek enum)
- PostgreSQL TIME data type for schedule times
- Efficient querying with indexes
- DTO pattern prevents circular reference issues
- TypeScript for type safety in frontend
- React hooks for state management
- Responsive Tailwind CSS styling

## Future Enhancements

Possible improvements:
- Calendar view with grid layout
- Export schedule to PDF/iCal
- Schedule conflict detection
- Notification before classes
- Room availability checking
- Bulk schedule import/export
- Mobile app support
