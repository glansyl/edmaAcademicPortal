#!/usr/bin/env python3
"""
Debug script for student deletion issues in production
This script helps identify foreign key constraints and related data
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

def check_student_references(student_id):
    """Check all tables that reference the student"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print(f"Checking references for student ID: {student_id}")
    print("=" * 50)
    
    # Check if student exists
    cursor.execute("SELECT id, first_name, last_name, student_id, class_name FROM students WHERE id = %s", (student_id,))
    student = cursor.fetchone()
    if not student:
        print(f"Student with ID {student_id} not found!")
        return
    
    print(f"Student: {student[1]} {student[2]} ({student[3]}) - Class: {student[4]}")
    print()
    
    # Check marks
    cursor.execute("SELECT COUNT(*) FROM marks WHERE student_id = %s", (student_id,))
    marks_count = cursor.fetchone()[0]
    print(f"Marks records: {marks_count}")
    if marks_count > 0:
        cursor.execute("""
            SELECT c.course_code, c.course_name, m.exam_type, m.marks_obtained, m.max_marks, m.exam_date 
            FROM marks m 
            JOIN courses c ON m.course_id = c.id 
            WHERE m.student_id = %s 
            ORDER BY m.exam_date DESC 
            LIMIT 5
        """, (student_id,))
        recent_marks = cursor.fetchall()
        print("  Recent marks:")
        for mark in recent_marks:
            print(f"    - {mark[0]} ({mark[1]}): {mark[2]} - {mark[3]}/{mark[4]} on {mark[5]}")
    print()
    
    # Check attendance
    cursor.execute("SELECT COUNT(*) FROM attendance WHERE student_id = %s", (student_id,))
    attendance_count = cursor.fetchone()[0]
    print(f"Attendance records: {attendance_count}")
    if attendance_count > 0:
        cursor.execute("""
            SELECT status, COUNT(*) 
            FROM attendance 
            WHERE student_id = %s 
            GROUP BY status
        """, (student_id,))
        attendance_stats = cursor.fetchall()
        print("  Attendance breakdown:")
        for stat in attendance_stats:
            print(f"    - {stat[0]}: {stat[1]} records")
    print()
    
    # Check enrollments
    cursor.execute("SELECT COUNT(*) FROM enrollments WHERE student_id = %s", (student_id,))
    enrollment_count = cursor.fetchone()[0]
    print(f"Enrollment records: {enrollment_count}")
    if enrollment_count > 0:
        cursor.execute("""
            SELECT c.course_code, c.course_name, e.status, e.semester, e.academic_year 
            FROM enrollments e 
            JOIN courses c ON e.course_id = c.id 
            WHERE e.student_id = %s 
            ORDER BY e.academic_year DESC, e.semester DESC
        """, (student_id,))
        enrollments = cursor.fetchall()
        print("  Enrollments:")
        for enrollment in enrollments:
            print(f"    - {enrollment[0]} ({enrollment[1]}): {enrollment[2]} - Sem {enrollment[3]}, Year {enrollment[4]}")
    print()
    
    # Check user relationship
    cursor.execute("SELECT user_id FROM students WHERE id = %s", (student_id,))
    user_result = cursor.fetchone()
    if user_result:
        user_id = user_result[0]
        cursor.execute("SELECT id, email, role FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        print(f"Associated user: {user[1]} (Role: {user[2]})")
    print()
    
    # Check for any other foreign key constraints
    cursor.execute("""
        SELECT 
            tc.table_name, 
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'students'
    """)
    
    fk_constraints = cursor.fetchall()
    print("Foreign key constraints referencing students table:")
    for constraint in fk_constraints:
        table_name, column_name, foreign_table, foreign_column = constraint
        print(f"  - {table_name}.{column_name} -> {foreign_table}.{foreign_column}")
        
        # Check if there are any records in this table referencing our student
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table_name} WHERE {column_name} = %s", (student_id,))
            count = cursor.fetchone()[0]
            if count > 0:
                print(f"    WARNING: {count} records in {table_name} reference this student!")
        except Exception as e:
            print(f"    Error checking {table_name}: {e}")
    
    cursor.close()
    conn.close()

def simulate_deletion_order(student_id):
    """Simulate the deletion order to identify issues"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print(f"\nSimulating deletion order for student ID: {student_id}")
    print("=" * 50)
    
    try:
        # Step 1: Count marks
        cursor.execute("SELECT COUNT(*) FROM marks WHERE student_id = %s", (student_id,))
        marks_count = cursor.fetchone()[0]
        print(f"Step 1: Would delete {marks_count} marks records")
        
        # Step 2: Count attendance
        cursor.execute("SELECT COUNT(*) FROM attendance WHERE student_id = %s", (student_id,))
        attendance_count = cursor.fetchone()[0]
        print(f"Step 2: Would delete {attendance_count} attendance records")
        
        # Step 3: Count enrollments
        cursor.execute("SELECT COUNT(*) FROM enrollments WHERE student_id = %s", (student_id,))
        enrollment_count = cursor.fetchone()[0]
        print(f"Step 3: Would delete {enrollment_count} enrollment records")
        
        # Step 4: Check if student can be deleted
        cursor.execute("SELECT user_id FROM students WHERE id = %s", (student_id,))
        user_result = cursor.fetchone()
        user_id = user_result[0] if user_result else None
        print(f"Step 4: Would delete student (associated user ID: {user_id})")
        
        # Step 5: Check if user can be deleted
        if user_id:
            print(f"Step 5: Would delete user ID: {user_id}")
        
        print("\nDeletion simulation completed successfully!")
        
    except Exception as e:
        print(f"ERROR during simulation: {e}")
    
    cursor.close()
    conn.close()

def check_cascade_settings():
    """Check if cascade delete is properly configured"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print("\nChecking CASCADE DELETE settings:")
    print("=" * 50)
    
    try:
        # Check foreign key constraints and their cascade settings
        cursor.execute("""
            SELECT 
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                rc.delete_rule
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
                JOIN information_schema.referential_constraints AS rc
                  ON tc.constraint_name = rc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name = 'students'
        """)
        
        constraints = cursor.fetchall()
        for constraint in constraints:
            table_name, column_name, foreign_table, foreign_column, delete_rule = constraint
            print(f"  - {table_name}.{column_name} -> {foreign_table}.{foreign_column}")
            print(f"    Delete Rule: {delete_rule}")
            if delete_rule != 'CASCADE':
                print(f"    ⚠️  WARNING: Not set to CASCADE DELETE!")
            print()
        
    except Exception as e:
        print(f"ERROR checking cascade settings: {e}")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python debug_student_deletion.py <student_id>")
        sys.exit(1)
    
    try:
        student_id = int(sys.argv[1])
        check_student_references(student_id)
        simulate_deletion_order(student_id)
        check_cascade_settings()
    except ValueError:
        print("ERROR: Student ID must be a number")
        sys.exit(1)