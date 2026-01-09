-- Migration Script: Update Departments from CSE/ECE/etc to TECH/IT
-- Date: January 2026
-- Purpose: Consolidate all departments into TECH and IT only

-- IMPORTANT: Backup your database before running this script!
-- pg_dump -h localhost -U eadms -d eadms > backup_before_migration.sql

-- ============================================================================
-- STEP 1: Update Teachers - Map old departments to TECH or IT
-- ============================================================================

-- Map technical/engineering departments to TECH
UPDATE teachers 
SET department = 'TECH' 
WHERE department IN (
    'Computer Science', 
    'CSE', 
    'Mechanical Engineering', 
    'MECH', 
    'Robotics and Automation', 
    'RA',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology'
);

-- Map IT/Information Science departments to IT
UPDATE teachers 
SET department = 'IT' 
WHERE department IN (
    'Information Science', 
    'ISE', 
    'Electronics and Communication', 
    'ECE',
    'AIML',
    'Artificial Intelligence and Machine Learning',
    'Information Technology'
);

-- Check for any remaining unmapped departments
SELECT DISTINCT department, COUNT(*) as count
FROM teachers
WHERE department NOT IN ('TECH', 'IT')
GROUP BY department;

-- ============================================================================
-- STEP 2: Update Students - Map old classes to TECH or IT
-- ============================================================================

-- Map technical/engineering classes to TECH
UPDATE students 
SET class_name = 'TECH' 
WHERE class_name IN (
    'Computer Science Engineering', 
    'CSE', 
    'Mechanical Engineering', 
    'MECH',
    'Robotics and Automation',
    'RA',
    'Computer Science'
);

-- Map IT/Information Science classes to IT
UPDATE students 
SET class_name = 'IT' 
WHERE class_name IN (
    'Information Science Engineering', 
    'ISE', 
    'Electronics and Communication Engineering', 
    'ECE',
    'AIML',
    'Artificial Intelligence and Machine Learning',
    'Information Technology'
);

-- Check for any remaining unmapped classes
SELECT DISTINCT class_name, COUNT(*) as count
FROM students
WHERE class_name NOT IN ('TECH', 'IT')
GROUP BY class_name;

-- ============================================================================
-- STEP 3: Verification Queries
-- ============================================================================

-- Verify teacher departments
SELECT department, COUNT(*) as teacher_count
FROM teachers
GROUP BY department
ORDER BY department;

-- Verify student classes
SELECT class_name, COUNT(*) as student_count
FROM students
GROUP BY class_name
ORDER BY class_name;

-- ============================================================================
-- STEP 4: Optional - Update IDs (CAUTION: This is complex!)
-- ============================================================================

-- WARNING: Updating student_id and teacher_id is complex because:
-- 1. They are referenced in multiple tables (marks, attendance, enrollments)
-- 2. They may be used in reports or external systems
-- 3. Historical data integrity must be maintained

-- If you MUST update IDs, consider:
-- Option A: Leave existing IDs as-is (recommended)
-- Option B: Create a mapping table for old ID to new ID
-- Option C: Full data migration with new IDs (requires careful planning)

-- Example mapping table (if needed):
CREATE TABLE IF NOT EXISTS id_migration_log (
    old_id VARCHAR(50),
    new_id VARCHAR(50),
    entity_type VARCHAR(20), -- 'STUDENT' or 'TEACHER'
    migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- STEP 5: Post-Migration Checks
-- ============================================================================

-- Check for any data integrity issues
SELECT 
    'Teachers with NULL department' as issue,
    COUNT(*) as count
FROM teachers
WHERE department IS NULL

UNION ALL

SELECT 
    'Students with NULL class_name' as issue,
    COUNT(*) as count
FROM students
WHERE class_name IS NULL

UNION ALL

SELECT 
    'Teachers not in TECH or IT' as issue,
    COUNT(*) as count
FROM teachers
WHERE department NOT IN ('TECH', 'IT')

UNION ALL

SELECT 
    'Students not in TECH or IT' as issue,
    COUNT(*) as count
FROM students
WHERE class_name NOT IN ('TECH', 'IT');

-- ============================================================================
-- ROLLBACK SCRIPT (Save this separately!)
-- ============================================================================

-- If you need to rollback, you'll need your backup:
-- psql -h localhost -U eadms -d eadms < backup_before_migration.sql

-- ============================================================================
-- Notes:
-- ============================================================================
-- 1. This script updates department and class names only
-- 2. Student IDs and Teacher IDs are NOT updated to avoid breaking references
-- 3. New students/teachers will get TECH-XXX or IT-XXX IDs automatically
-- 4. Existing IDs (CSE-001, ECE-002, etc.) will remain unchanged
-- 5. This maintains data integrity while updating the classification system
-- 6. Always test on a development database first!
-- ============================================================================
