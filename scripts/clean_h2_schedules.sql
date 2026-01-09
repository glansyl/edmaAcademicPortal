-- Clean H2 Database Schedules
-- Run this in H2 Console: http://localhost:8080/h2-console
-- JDBC URL: jdbc:h2:file:./data/eadmsdb
-- Username: sa
-- Password: (leave empty)

-- Check current schedules
SELECT COUNT(*) as total_schedules FROM schedules;

-- View all schedules
SELECT id, title, teacher_id, start_date_time, end_date_time, course_id
FROM schedules
ORDER BY start_date_time;

-- Delete all schedules (UNCOMMENT TO RUN)
-- DELETE FROM schedules;

-- Verify deletion
-- SELECT COUNT(*) as total_schedules FROM schedules;
