#!/usr/bin/env python3
"""
Debug script for marks display issues
This script helps identify issues with student data in marks records
"""

import psycopg2
import os
from urllib.parse import urlparse

def get_db_connection():
    """Get database connection from environment variable"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        return None
    
    # Parse the database URL
    url = urlparse(database_url)
    
    try:
        conn = psycopg2.connect(
            host=url.hostname,
            port=url.port,
            database=url.path[1:],  # Remove leading slash
            user=url.username,
            password=url.password
        )
        return conn
    except Exception as e:
        print(f"ERROR connecting to database: {e}")
        return None

def check_marks_data(course_id=None):
    """Check marks data and student relationships"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print("Checking marks data and student relationships")
    print("=" * 60)
    
    # Build query based on course_id parameter
    if course_id:
        print(f"Filtering by course ID: {course_id}")
        marks_query = """
            SELECT m.id, m.student_id, m.course_id, m.exam_type, m.marks_obtained, m.max_marks,
                   s.id as student_db_id, s.student_id as student_code, s.first_name, s.last_name,
                   c.id as course_db_id, c.course_code, c.course_name
            FROM marks m
            LEFT JOIN students s ON m.student_id = s.id
            LEFT JOIN courses c ON m.course_id = c.id
            WHERE m.course_id = %s
            ORDER BY m.id
        """
        cursor.execute(marks_query, (course_id,))
    else:
        marks_query = """
            SELECT m.id, m.student_id, m.course_id, m.exam_type, m.marks_obtained, m.max_marks,
                   s.id as student_db_id, s.student_id as student_code, s.first_name, s.last_name,
                   c.id as course_db_id, c.course_code, c.course_name
            FROM marks m
            LEFT JOIN students s ON m.student_id = s.id
            LEFT JOIN courses c ON m.course_id = c.id
            ORDER BY m.id
            LIMIT 10
        """
        cursor.execute(marks_query)
    
    marks_data = cursor.fetchall()
    
    if not marks_data:
        print("No marks data found!")
        return
    
    print(f"Found {len(marks_data)} marks records:")
    print()
    
    issues_found = 0
    
    for i, mark in enumerate(marks_data, 1):
        (marks_id, student_id_fk, course_id_fk, exam_type, marks_obtained, max_marks,
         student_db_id, student_code, first_name, last_name,
         course_db_id, course_code, course_name) = mark
        
        print(f"Record {i}:")
        print(f"  Marks ID: {marks_id}")
        print(f"  Exam Type: {exam_type}")
        print(f"  Marks: {marks_obtained}/{max_marks}")
        
        # Check student data
        if student_db_id is None:
            print(f"  ❌ ISSUE: Student not found for student_id FK: {student_id_fk}")
            issues_found += 1
        else:
            print(f"  ✅ Student: {first_name} {last_name} ({student_code}) [DB ID: {student_db_id}]")
        
        # Check course data
        if course_db_id is None:
            print(f"  ❌ ISSUE: Course not found for course_id FK: {course_id_fk}")
            issues_found += 1
        else:
            print(f"  ✅ Course: {course_code} - {course_name} [DB ID: {course_db_id}]")
        
        print()
    
    # Summary
    print("=" * 60)
    if issues_found == 0:
        print("✅ All marks records have valid student and course relationships!")
    else:
        print(f"❌ Found {issues_found} issues with marks data relationships")
    
    # Check for orphaned marks
    cursor.execute("""
        SELECT COUNT(*) FROM marks m 
        LEFT JOIN students s ON m.student_id = s.id 
        WHERE s.id IS NULL
    """)
    orphaned_student_marks = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT COUNT(*) FROM marks m 
        LEFT JOIN courses c ON m.course_id = c.id 
        WHERE c.id IS NULL
    """)
    orphaned_course_marks = cursor.fetchone()[0]
    
    print(f"\nOrphaned records:")
    print(f"  - Marks with missing students: {orphaned_student_marks}")
    print(f"  - Marks with missing courses: {orphaned_course_marks}")
    
    cursor.close()
    conn.close()

def check_specific_course_marks(course_id):
    """Check marks for a specific course"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print(f"Detailed analysis for course ID: {course_id}")
    print("=" * 60)
    
    # Check if course exists
    cursor.execute("SELECT id, course_code, course_name FROM courses WHERE id = %s", (course_id,))
    course = cursor.fetchone()
    
    if not course:
        print(f"❌ Course with ID {course_id} not found!")
        return
    
    print(f"Course: {course[1]} - {course[2]}")
    print()
    
    # Get all marks for this course with full student details
    cursor.execute("""
        SELECT 
            m.id as marks_id,
            m.exam_type,
            m.marks_obtained,
            m.max_marks,
            m.exam_date,
            s.id as student_db_id,
            s.student_id as student_code,
            s.first_name,
            s.last_name,
            u.email as student_email
        FROM marks m
        JOIN students s ON m.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE m.course_id = %s
        ORDER BY s.student_id, m.exam_date
    """, (course_id,))
    
    course_marks = cursor.fetchall()
    
    if not course_marks:
        print("No marks found for this course.")
        return
    
    print(f"Found {len(course_marks)} marks records for this course:")
    print()
    
    current_student = None
    for mark in course_marks:
        (marks_id, exam_type, marks_obtained, max_marks, exam_date,
         student_db_id, student_code, first_name, last_name, student_email) = mark
        
        if current_student != student_code:
            current_student = student_code
            print(f"Student: {first_name} {last_name} ({student_code}) - {student_email}")
        
        percentage = (marks_obtained / max_marks * 100) if max_marks > 0 else 0
        print(f"  - {exam_type}: {marks_obtained}/{max_marks} ({percentage:.1f}%) on {exam_date}")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) == 1:
        # No arguments - check general marks data
        check_marks_data()
    elif len(sys.argv) == 2:
        try:
            course_id = int(sys.argv[1])
            check_specific_course_marks(course_id)
        except ValueError:
            print("ERROR: Course ID must be a number")
            print("Usage: python debug_marks_display.py [course_id]")
            sys.exit(1)
    else:
        print("Usage: python debug_marks_display.py [course_id]")
        print("  - No arguments: Check general marks data")
        print("  - course_id: Check marks for specific course")
        sys.exit(1)