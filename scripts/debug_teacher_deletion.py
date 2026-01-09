#!/usr/bin/env python3
"""
Debug script for teacher deletion issues in production
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

def check_teacher_references(teacher_id):
    """Check all tables that reference the teacher"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print(f"Checking references for teacher ID: {teacher_id}")
    print("=" * 50)
    
    # Check if teacher exists
    cursor.execute("SELECT id, first_name, last_name, teacher_id, email FROM teachers WHERE id = %s", (teacher_id,))
    teacher = cursor.fetchone()
    if not teacher:
        print(f"Teacher with ID {teacher_id} not found!")
        return
    
    print(f"Teacher: {teacher[1]} {teacher[2]} ({teacher[3]}) - {teacher[4]}")
    print()
    
    # Check course_teachers (many-to-many relationship)
    cursor.execute("SELECT course_id FROM course_teachers WHERE teacher_id = %s", (teacher_id,))
    course_assignments = cursor.fetchall()
    print(f"Course assignments: {len(course_assignments)}")
    if course_assignments:
        for assignment in course_assignments:
            cursor.execute("SELECT course_code, course_name FROM courses WHERE id = %s", (assignment[0],))
            course = cursor.fetchone()
            print(f"  - Course: {course[0]} - {course[1]}")
    print()
    
    # Check schedules
    cursor.execute("SELECT id, title, start_date_time FROM schedules WHERE teacher_id = %s", (teacher_id,))
    schedules = cursor.fetchall()
    print(f"Schedules: {len(schedules)}")
    if schedules:
        for schedule in schedules:
            print(f"  - Schedule: {schedule[1]} at {schedule[2]}")
    print()
    
    # Check user relationship
    cursor.execute("SELECT user_id FROM teachers WHERE id = %s", (teacher_id,))
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
        AND ccu.table_name = 'teachers'
    """)
    
    fk_constraints = cursor.fetchall()
    print("Foreign key constraints referencing teachers table:")
    for constraint in fk_constraints:
        table_name, column_name, foreign_table, foreign_column = constraint
        print(f"  - {table_name}.{column_name} -> {foreign_table}.{foreign_column}")
        
        # Check if there are any records in this table referencing our teacher
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table_name} WHERE {column_name} = %s", (teacher_id,))
            count = cursor.fetchone()[0]
            if count > 0:
                print(f"    WARNING: {count} records in {table_name} reference this teacher!")
        except Exception as e:
            print(f"    Error checking {table_name}: {e}")
    
    cursor.close()
    conn.close()

def simulate_deletion_order(teacher_id):
    """Simulate the deletion order to identify issues"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print(f"\nSimulating deletion order for teacher ID: {teacher_id}")
    print("=" * 50)
    
    try:
        # Step 1: Delete schedules
        cursor.execute("SELECT COUNT(*) FROM schedules WHERE teacher_id = %s", (teacher_id,))
        schedule_count = cursor.fetchone()[0]
        print(f"Step 1: Would delete {schedule_count} schedules")
        
        # Step 2: Remove from course_teachers
        cursor.execute("SELECT COUNT(*) FROM course_teachers WHERE teacher_id = %s", (teacher_id,))
        course_assignment_count = cursor.fetchone()[0]
        print(f"Step 2: Would remove {course_assignment_count} course assignments")
        
        # Step 3: Check if teacher can be deleted
        cursor.execute("SELECT user_id FROM teachers WHERE id = %s", (teacher_id,))
        user_result = cursor.fetchone()
        user_id = user_result[0] if user_result else None
        print(f"Step 3: Would delete teacher (associated user ID: {user_id})")
        
        # Step 4: Check if user can be deleted
        if user_id:
            print(f"Step 4: Would delete user ID: {user_id}")
        
        print("\nDeletion simulation completed successfully!")
        
    except Exception as e:
        print(f"ERROR during simulation: {e}")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python debug_teacher_deletion.py <teacher_id>")
        sys.exit(1)
    
    try:
        teacher_id = int(sys.argv[1])
        check_teacher_references(teacher_id)
        simulate_deletion_order(teacher_id)
    except ValueError:
        print("ERROR: Teacher ID must be a number")
        sys.exit(1)