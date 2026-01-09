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
    
    # Check all teachers
    cursor.execute("SELECT id, first_name, last_name, user_id FROM teachers ORDER BY id")
    teachers = cursor.fetchall()
    
    print("=== TEACHERS IN PRODUCTION ===")
    if teachers:
        for t in teachers:
            print(f"ID: {t[0]}, Name: {t[1]} {t[2]}, User ID: {t[3]}")
    else:
        print("No teachers found!")
    
    # Check users with TEACHER role
    cursor.execute("SELECT id, email, role FROM users WHERE role = 'TEACHER' ORDER BY id")
    teacher_users = cursor.fetchall()
    
    print("\n=== TEACHER USERS ===")
    if teacher_users:
        for u in teacher_users:
            print(f"User ID: {u[0]}, Email: {u[1]}, Role: {u[2]}")
    else:
        print("No teacher users found!")
    
    # Check the specific user john.smith@eadms.eu
    cursor.execute("SELECT id, email, role FROM users WHERE email = 'john.smith@eadms.eu'")
    john = cursor.fetchone()
    
    print("\n=== JOHN SMITH USER ===")
    if john:
        print(f"User ID: {john[0]}, Email: {john[1]}, Role: {john[2]}")
        
        # Check if there's a teacher record for this user
        cursor.execute("SELECT id FROM teachers WHERE user_id = %s", (john[0],))
        teacher_record = cursor.fetchone()
        
        if teacher_record:
            print(f"Teacher record ID: {teacher_record[0]}")
        else:
            print("No teacher record found for this user!")
    else:
        print("john.smith@eadms.eu user not found!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")