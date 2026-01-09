-- =====================================================
-- Fix Schedule Table for PostgreSQL
-- Description: Adds missing columns for schedule functionality
-- =====================================================

-- Check if columns exist and add them if missing
DO $$ 
BEGIN
    -- Add teacher_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schedules' AND column_name='teacher_id') THEN
        ALTER TABLE schedules ADD COLUMN teacher_id BIGINT;
        RAISE NOTICE 'Added teacher_id column';
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schedules' AND column_name='title') THEN
        ALTER TABLE schedules ADD COLUMN title VARCHAR(200);
        RAISE NOTICE 'Added title column';
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schedules' AND column_name='description') THEN
        ALTER TABLE schedules ADD COLUMN description VARCHAR(1000);
        RAISE NOTICE 'Added description column';
    END IF;

    -- Add start_date_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schedules' AND column_name='start_date_time') THEN
        ALTER TABLE schedules ADD COLUMN start_date_time TIMESTAMP;
        RAISE NOTICE 'Added start_date_time column';
    END IF;

    -- Add end_date_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schedules' AND column_name='end_date_time') THEN
        ALTER TABLE schedules ADD COLUMN end_date_time TIMESTAMP;
        RAISE NOTICE 'Added end_date_time column';
    END IF;

    -- Add recurrence column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schedules' AND column_name='recurrence') THEN
        ALTER TABLE schedules ADD COLUMN recurrence VARCHAR(20) DEFAULT 'NONE';
        RAISE NOTICE 'Added recurrence column';
    END IF;

    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schedules' AND column_name='location') THEN
        ALTER TABLE schedules ADD COLUMN location VARCHAR(100);
        RAISE NOTICE 'Added location column';
    END IF;
END $$;

-- Add foreign key constraint for teacher if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='fk_schedule_teacher' AND table_name='schedules') THEN
        ALTER TABLE schedules ADD CONSTRAINT fk_schedule_teacher 
            FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for teacher';
    END IF;
END $$;

-- Add indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_schedule_teacher ON schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedule_datetime ON schedules(start_date_time);

-- Make day_of_week and start_time/end_time nullable for backward compatibility
ALTER TABLE schedules ALTER COLUMN day_of_week DROP NOT NULL;
ALTER TABLE schedules ALTER COLUMN start_time DROP NOT NULL;
ALTER TABLE schedules ALTER COLUMN end_time DROP NOT NULL;

-- Update existing records to have teacher_id from course assignments
UPDATE schedules 
SET teacher_id = (
    SELECT teacher_id 
    FROM courses 
    WHERE courses.id = schedules.course_id 
    LIMIT 1
)
WHERE teacher_id IS NULL;

-- Set title from course name for existing records
UPDATE schedules 
SET title = (
    SELECT CONCAT(course_name, ' - ', course_code)
    FROM courses 
    WHERE courses.id = schedules.course_id
)
WHERE title IS NULL;

-- Set location from room_number for existing records
UPDATE schedules 
SET location = room_number
WHERE location IS NULL AND room_number IS NOT NULL;

-- Make teacher_id and title NOT NULL after data migration
ALTER TABLE schedules ALTER COLUMN teacher_id SET NOT NULL;
ALTER TABLE schedules ALTER COLUMN title SET NOT NULL;
ALTER TABLE schedules ALTER COLUMN start_date_time SET NOT NULL;
ALTER TABLE schedules ALTER COLUMN end_date_time SET NOT NULL;

-- Display summary
DO $$ 
DECLARE
    schedule_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO schedule_count FROM schedules;
    RAISE NOTICE 'Schedule table updated successfully. Total schedules: %', schedule_count;
END $$;

-- =====================================================
-- End of Script
-- =====================================================
