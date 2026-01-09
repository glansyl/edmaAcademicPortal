#!/usr/bin/env python3
import psycopg2
from urllib.parse import urlparse
from datetime import datetime

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
    
    print("=== TESTING SCHEDULE INSERT ===")
    
    # Try to insert a schedule with the correct teacher ID (12)
    try:
        cursor.execute("""
            INSERT INTO schedules (
                course_id, teacher_id, title, description, 
                start_date_time, end_date_time, recurrence, 
                location, class_type, created_at, updated_at
            ) VALUES (
                11, 12, 'Test Schedule', 'Test Description',
                '2026-01-10 09:00:00', '2026-01-10 10:00:00', 'NONE',
                'Room 101', 'LECTURE', NOW(), NOW()
            )
        """)
        
        print("✓ Schedule insert successful!")
        
        # Get the inserted schedule
        cursor.execute("SELECT id, title, teacher_id FROM schedules WHERE title = 'Test Schedule'")
        schedule = cursor.fetchone()
        if schedule:
            print(f"Inserted schedule ID: {schedule[0]}, Title: {schedule[1]}, Teacher: {schedule[2]}")
        
        # Clean up - delete the test schedule
        cursor.execute("DELETE FROM schedules WHERE title = 'Test Schedule'")
        print("✓ Test schedule deleted")
        
        conn.commit()
        
    except Exception as insert_error:
        print(f"✗ Schedule insert failed: {insert_error}")
        conn.rollback()
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Connection error: {e}")