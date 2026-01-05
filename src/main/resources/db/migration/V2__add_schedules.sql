-- =====================================================
-- Add Schedules Table
-- Version: 2.0
-- Date: 2026-01-04
-- Description: Adds schedule/timetable functionality
-- =====================================================

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(50),
    class_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedule_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_schedule_course ON schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_schedule_day ON schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_time ON schedules(start_time, end_time);

-- Add comment
COMMENT ON TABLE schedules IS 'Class schedules/timetables for courses';

-- =====================================================
-- End of Migration
-- =====================================================
