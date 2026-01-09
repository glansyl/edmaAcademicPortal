#!/usr/bin/env python3
"""
Quick check of schedule table schema in PostgreSQL
"""

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
    
    print("\n" + "=" * 60)
    print("Schedule Table Schema Check")
    print("=" * 60)
    
    # Get all columns
    cursor.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'schedules'
        ORDER BY ordinal_position
    """)
    
    columns = cursor.fetchall()
    
    if not columns:
        print("\n✗ Table 'schedules' does not exist!")
    else:
        print(f"\nFound {len(columns)} columns:\n")
        for col in columns:
            nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
            default = f" DEFAULT {col[3]}" if col[3] else ""
            print(f"  • {col[0]:<20} {col[1]:<20} {nullable}{default}")
    
    # Check for required columns
    print("\n" + "-" * 60)
    print("Required Columns Check:")
    print("-" * 60)
    
    required = {
        'teacher_id': 'bigint',
        'title': 'character varying',
        'start_date_time': 'timestamp without time zone',
        'end_date_time': 'timestamp without time zone'
    }
    
    column_names = {col[0]: col[1] for col in columns}
    
    all_good = True
    for col_name, expected_type in required.items():
        if col_name in column_names:
            print(f"  ✓ {col_name:<20} EXISTS ({column_names[col_name]})")
        else:
            print(f"  ✗ {col_name:<20} MISSING")
            all_good = False
    
    # Get schedule count
    cursor.execute("SELECT COUNT(*) FROM schedules")
    count = cursor.fetchone()[0]
    
    print(f"\nTotal schedules: {count}")
    
    if count > 0:
        cursor.execute("""
            SELECT id, title, teacher_id, start_date_time, end_date_time
            FROM schedules
            ORDER BY start_date_time
            LIMIT 5
        """)
        schedules = cursor.fetchall()
        print("\nSample schedules:")
        for s in schedules:
            print(f"  ID: {s[0]}, Title: {s[1]}, Teacher: {s[2]}, Start: {s[3]}")
    
    print("\n" + "=" * 60)
    if all_good:
        print("✓ Schema is correct!")
    else:
        print("✗ Schema needs to be fixed!")
        print("\nRun: python scripts/fix_schedule_schema.py")
    print("=" * 60 + "\n")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"\n✗ Error: {e}\n")
