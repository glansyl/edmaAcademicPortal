#!/usr/bin/env python3
import psycopg2
from urllib.parse import urlparse

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
    
    print("=== FIXING DAY_OF_WEEK CONSTRAINT ===")
    
    # Make day_of_week nullable
    cursor.execute("ALTER TABLE schedules ALTER COLUMN day_of_week DROP NOT NULL")
    print("✓ Made day_of_week nullable")
    
    # Make start_time nullable  
    cursor.execute("ALTER TABLE schedules ALTER COLUMN start_time DROP NOT NULL")
    print("✓ Made start_time nullable")
    
    # Make end_time nullable
    cursor.execute("ALTER TABLE schedules ALTER COLUMN end_time DROP NOT NULL")
    print("✓ Made end_time nullable")
    
    conn.commit()
    print("✓ All changes committed")
    
    # Test insert again
    try:
        cursor.execute("""
            INSERT INTO schedules (
                course_id, teacher_id, title, description, 
                start_date_time, end_date_time, recurrence, 
                location, class_type, created_at, updated_at
            ) VALUES (
                11, 12, 'Test Schedule 2', 'Test Description',
                '2026-01-10 09:00:00', '2026-01-10 10:00:00', 'NONE',
                'Room 101', 'LECTURE', NOW(), NOW()
            )
        """)
        
        print("✓ Test schedule insert successful!")
        
        # Clean up
        cursor.execute("DELETE FROM schedules WHERE title = 'Test Schedule 2'")
        conn.commit()
        print("✓ Test schedule deleted")
        
    except Exception as test_error:
        print(f"✗ Test insert still failed: {test_error}")
        conn.rollback()
    
    cursor.close()
    conn.close()
    
    print("\n=== CONSTRAINT FIX COMPLETE ===")
    print("The production database should now work with schedule creation!")
    
except Exception as e:
    print(f"Error: {e}")