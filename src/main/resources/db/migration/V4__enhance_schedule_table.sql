-- Add new columns to schedules table for Google Calendar-like functionality
ALTER TABLE schedules ADD COLUMN teacher_id BIGINT;
ALTER TABLE schedules ADD COLUMN title VARCHAR(200);
ALTER TABLE schedules ADD COLUMN description VARCHAR(1000);
ALTER TABLE schedules ADD COLUMN start_date_time TIMESTAMP;
ALTER TABLE schedules ADD COLUMN end_date_time TIMESTAMP;
ALTER TABLE schedules ADD COLUMN recurrence VARCHAR(20) DEFAULT 'NONE';
ALTER TABLE schedules ADD COLUMN location VARCHAR(100);

-- Add foreign key constraint for teacher
ALTER TABLE schedules ADD CONSTRAINT fk_schedule_teacher 
    FOREIGN KEY (teacher_id) REFERENCES teachers(id);

-- Add indexes for performance
CREATE INDEX idx_schedule_teacher ON schedules(teacher_id);
CREATE INDEX idx_schedule_datetime ON schedules(start_date_time);

-- Make day_of_week and start_time/end_time nullable for backward compatibility
ALTER TABLE schedules ALTER COLUMN day_of_week DROP NOT NULL;
ALTER TABLE schedules ALTER COLUMN start_time DROP NOT NULL;
ALTER TABLE schedules ALTER COLUMN end_time DROP NOT NULL;

-- Update existing records to have teacher_id from course assignments
UPDATE schedules 
SET teacher_id = (
    SELECT ct.teacher_id 
    FROM course_teachers ct 
    WHERE ct.course_id = schedules.course_id 
    LIMIT 1
)
WHERE teacher_id IS NULL;

-- Set title from course name for existing records
UPDATE schedules 
SET title = (
    SELECT c.course_name 
    FROM courses c 
    WHERE c.id = schedules.course_id
)
WHERE title IS NULL;

-- Set location from room_number for existing records
UPDATE schedules 
SET location = room_number
WHERE location IS NULL AND room_number IS NOT NULL;

-- Make teacher_id and title NOT NULL after data migration
ALTER TABLE schedules ALTER COLUMN teacher_id SET NOT NULL;
ALTER TABLE schedules ALTER COLUMN title SET NOT NULL;