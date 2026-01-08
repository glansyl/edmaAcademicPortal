-- =====================================================
-- Additional Tables for EADMS System
-- =====================================================

-- =====================================================
-- Table: enrollments
-- Description: Student course enrollments
-- =====================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    semester INTEGER NOT NULL,
    academic_year INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'DROPPED', 'WITHDRAWN', 'FAILED')),
    enrollment_date DATE NOT NULL,
    completion_date DATE,
    final_grade DOUBLE PRECISION,
    letter_grade VARCHAR(2),
    grade_points DOUBLE PRECISION,
    remarks VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT uk_enrollment_unique UNIQUE (student_id, course_id, semester, academic_year)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_semester ON enrollments(semester);
CREATE INDEX IF NOT EXISTS idx_enrollments_academic_year ON enrollments(academic_year);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- =====================================================
-- Table: notices
-- Description: System-wide announcements
-- =====================================================
CREATE TABLE IF NOT EXISTS notices (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    target_audience VARCHAR(20) NOT NULL DEFAULT 'ALL' CHECK (target_audience IN ('ALL', 'STUDENTS', 'TEACHERS', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notice_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notices_target_audience ON notices(target_audience);
CREATE INDEX IF NOT EXISTS idx_notices_priority ON notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_is_active ON notices(is_active);
CREATE INDEX IF NOT EXISTS idx_notices_created_by ON notices(created_by);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE enrollments IS 'Student course enrollments and academic progress';
COMMENT ON TABLE notices IS 'System-wide announcements and notices';