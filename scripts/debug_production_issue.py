#!/usr/bin/env python3
import psycopg2
from urllib.parse import urlparse
import json

DATABASE_URL = "postgresql://glansyldsouza:Zv1Dt7YUOM1ksUnIoA2OEyzD3L3EIAIh@dpg-d5fn7dpr0fns73busteg-a.oregon-postgres.render.com/edmadb_vwl0"

def parse_database_url(url):
    result = urlparse(url)
    return {
        'host': result.hostname,
        'port': result.port or 5432,
        'database': result.path[1:],
        'user': result.username,
        'password': result.password
    }

try:
    db_params = parse_database_url(DATABASE_URL)
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    
    print("=== PRODUCTION DEBUG ===")
    
    # Check if there are any schedules for teacher ID 1 (likely john.smith)
    cursor.execute("SELECT COUNT(*) FROM schedules WHERE teacher_id = 1")
    count = cursor.fetchone()[0]
    print(f"Schedules for teacher_id=1: {count}")
    
    # Check all schedules
    cursor.execute("SELECT COUNT(*) FROM schedules")
    total = cursor.fetchone()[0]
    print(f"Total schedules: {total}")
    
    if total > 0:
        cursor.execute("""
            SELECT id, title, teacher_id, start_date_time, end_date_time, course_id
            FROM schedules 
            ORDER BY created_at DESC 
            LIMIT 10
        """)
        schedules = cursor.fetchall()
        print("\nRecent schedules:")
        for s in schedules:
            print(f"  ID: {s[0]}, Title: {s[1]}, Teacher: {s[2]}, Course: {s[5]}")
            print(f"      Start: {s[3]}, End: {s[4]}")
    
    # Check for any unique constraints that might cause conflicts
    cursor.execute("""
        SELECT con.conname, pg_get_constraintdef(con.oid)
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'schedules' AND con.contype = 'u'
    """)
    unique_constraints = cursor.fetchall()
    
    if unique_constraints:
        print("\nUnique constraints:")
        for uc in unique_constraints:
            print(f"  {uc[0]}: {uc[1]}")
    else:
        print("\nNo unique constraints found")
    
    # Check teachers table
    cursor.execute("SELECT id, first_name, last_name FROM teachers WHERE id = 1")
    teacher = cursor.fetchone()
    if teacher:
        print(f"\nTeacher ID 1: {teacher[1]} {teacher[2]}")
    else:
        print("\nNo teacher with ID 1 found!")
    
    # Check courses table
    cursor.execute("SELECT id, course_name, course_code FROM courses WHERE id = 11")
    course = cursor.fetchone()
    if course:
        print(f"Course ID 11: {course[1]} ({course[2]})")
    else:
        print("No course with ID 11 found!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")