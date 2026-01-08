-- =====================================================
-- Add Enrollments Table
-- Version: 3.0
-- Date: 2026-01-08
-- Description: Adds student enrollment functionality
-- =====================================================

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    semester INTEGER NOT NULL,
    academic_year INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'DROPPED', 'WITHDRAWN')),
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_date DATE,
    grade VARCHAR(5),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT uk_enrollment_record UNIQUE (student_id, course_id, semester, academic_year)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_enrollment_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_semester ON enrollments(semester);
CREATE INDEX IF NOT EXISTS idx_enrollment_year ON enrollments(academic_year);
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON enrollments(status);

-- Add comment
COMMENT ON TABLE enrollments IS 'Student course enrollments and academic records';

-- =====================================================
-- End of Migration
-- =====================================================