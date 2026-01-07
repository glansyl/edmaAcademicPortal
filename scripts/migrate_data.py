#!/usr/bin/env python3
"""
EADMS Data Migration Script for Render PostgreSQL

This script migrates sample data (users, teachers, students, courses, enrollments)
to your Render PostgreSQL database.

Usage:
    python migrate_data.py --database-url "postgresql://user:pass@host:port/db"
    
Or set DATABASE_URL environment variable:
    export DATABASE_URL="postgresql://user:pass@host:port/db"
    python migrate_data.py
"""

import os
import sys
import argparse
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EADMSDataMigrator:
    def __init__(self, database_url):
        self.database_url = database_url
        self.conn = None
        
    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            self.conn = psycopg2.connect(self.database_url)
            self.conn.autocommit = True
            logger.info("✅ Connected to PostgreSQL database")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to database: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("🔌 Database connection closed")
    
    def hash_password(self, password):
        """Hash password using bcrypt (compatible with Spring Security)"""
        # Spring Security uses bcrypt with $2a$ prefix
        salt = bcrypt.gensalt(rounds=10, prefix=b"2a")
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def user_exists(self, email):
        """Check if user already exists"""
        with self.conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            return cursor.fetchone() is not None
    
    def create_user(self, email, password, role, is_active=True):
        """Create a user and return the user ID"""
        if self.user_exists(email):
            logger.info(f"👤 User {email} already exists, skipping...")
            with self.conn.cursor() as cursor:
                cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
                return cursor.fetchone()[0]
        
        hashed_password = self.hash_password(password)
        
        with self.conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO users (email, password, role, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (email, hashed_password, role, is_active, datetime.now(), datetime.now()))
            
            user_id = cursor.fetchone()[0]
            logger.info(f"✅ Created user: {email} (ID: {user_id})")
            return user_id
    
    def create_teacher(self, user_id, first_name, last_name, teacher_id_str, department, email, contact_number):
        """Create a teacher profile"""
        with self.conn.cursor() as cursor:
            # Check if teacher already exists
            cursor.execute("SELECT id FROM teachers WHERE user_id = %s OR teacher_id = %s OR email = %s", 
                          (user_id, teacher_id_str, email))
            existing = cursor.fetchone()
            if existing:
                logger.info(f"👨‍🏫 Teacher profile for user {user_id} already exists, skipping...")
                return existing[0]
            
            cursor.execute("""
                INSERT INTO teachers (user_id, first_name, last_name, teacher_id, department, email, contact_number, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (user_id, first_name, last_name, teacher_id_str, department, email, contact_number, datetime.now(), datetime.now()))
            
            teacher_db_id = cursor.fetchone()[0]
            logger.info(f"✅ Created teacher: {first_name} {last_name} - {teacher_id_str} (ID: {teacher_db_id})")
            return teacher_db_id
    
    def create_student(self, user_id, first_name, last_name, student_id, class_name, gender, contact_number, date_of_birth=None):
        """Create a student profile"""
        with self.conn.cursor() as cursor:
            # Check if student already exists
            cursor.execute("SELECT id FROM students WHERE user_id = %s OR student_id = %s", (user_id, student_id))
            existing = cursor.fetchone()
            if existing:
                logger.info(f"👨‍🎓 Student profile for user {user_id} or student ID {student_id} already exists, skipping...")
                return existing[0]
            
            cursor.execute("""
                INSERT INTO students (user_id, first_name, last_name, student_id, class_name, gender, contact_number, date_of_birth, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (user_id, first_name, last_name, student_id, class_name, gender, contact_number, date_of_birth, datetime.now(), datetime.now()))
            
            student_db_id = cursor.fetchone()[0]
            logger.info(f"✅ Created student: {first_name} {last_name} - {student_id} (ID: {student_db_id})")
            return student_db_id
    
    def create_course(self, course_code, course_name, semester, credits, description):
        """Create a course"""
        with self.conn.cursor() as cursor:
            # Check if course already exists
            cursor.execute("SELECT id FROM courses WHERE course_code = %s", (course_code,))
            existing = cursor.fetchone()
            if existing:
                logger.info(f"📚 Course {course_code} already exists, skipping...")
                return existing[0]
            
            cursor.execute("""
                INSERT INTO courses (course_code, course_name, semester, credits, description, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (course_code, course_name, semester, credits, description, datetime.now(), datetime.now()))
            
            course_id = cursor.fetchone()[0]
            logger.info(f"✅ Created course: {course_code} - {course_name} (ID: {course_id})")
            return course_id
    
    def assign_teacher_to_course(self, teacher_id, course_id):
        """Assign a teacher to a course (many-to-many relationship)"""
        with self.conn.cursor() as cursor:
            # Check if assignment already exists
            cursor.execute("SELECT 1 FROM course_teachers WHERE teacher_id = %s AND course_id = %s", (teacher_id, course_id))
            if cursor.fetchone():
                logger.info(f"👨‍🏫 Teacher {teacher_id} already assigned to course {course_id}, skipping...")
                return
            
            cursor.execute("""
                INSERT INTO course_teachers (teacher_id, course_id)
                VALUES (%s, %s)
            """, (teacher_id, course_id))
            
            logger.info(f"✅ Assigned teacher {teacher_id} to course {course_id}")
    
    def create_enrollment(self, student_id, course_id, semester, academic_year):
        """Create an enrollment"""
        with self.conn.cursor() as cursor:
            # Check if enrollment already exists
            cursor.execute("SELECT id FROM enrollments WHERE student_id = %s AND course_id = %s AND semester = %s AND academic_year = %s", 
                          (student_id, course_id, semester, academic_year))
            if cursor.fetchone():
                logger.info(f"📝 Enrollment for student {student_id} in course {course_id} (S{semester}, {academic_year}) already exists, skipping...")
                return
            
            cursor.execute("""
                INSERT INTO enrollments (student_id, course_id, semester, academic_year, status, enrollment_date, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (student_id, course_id, semester, academic_year, 'ACTIVE', datetime.now().date(), datetime.now(), datetime.now()))
            
            enrollment_id = cursor.fetchone()[0]
            logger.info(f"✅ Created enrollment: Student {student_id} -> Course {course_id} (S{semester}, {academic_year}) (ID: {enrollment_id})")
            return enrollment_id
    
    def migrate_sample_data(self):
        """Migrate all sample data"""
        logger.info("🌱 Starting data migration...")
        
        # Create Admin User
        logger.info("👨‍💼 Creating admin user...")
        admin_user_id = self.create_user("admin@eadms.com", "Admin@123", "ADMIN")
        
        # Create Teachers
        logger.info("👨‍🏫 Creating teachers...")
        teacher_data = [
            ("luca.bernardi@eadms.eu", "Luca", "Bernardi", "TCH101", "Computer Engineering", "luca.bernardi@eadms.eu", "+39-347-552-9812"),   # Italy
            ("anna.kowalska@eadms.eu", "Anna", "Kowalska", "TCH102", "Applied Mathematics", "anna.kowalska@eadms.eu", "+48-602-445-198"),    # Poland
            ("marc.dubois@eadms.eu", "Marc", "Dubois", "TCH103", "Data Science", "marc.dubois@eadms.eu", "+33-651-992-184"),                # France
            ("sofia.papadopoulos@eadms.eu", "Sofia", "Papadopoulos", "TCH104", "Physics Engineering", "sofia.p@eadms.eu", "+30-694-881-220"),# Greece
            ("johan.lindstrom@eadms.eu", "Johan", "Lindström", "TCH105", "Embedded Systems", "johan.l@eadms.eu", "+46-708-112-909"),         # Sweden
            ("carlos.mendez@eadms.eu", "Carlos", "Méndez", "TCH106", "Robotics", "carlos.m@eadms.eu", "+34-612-883-771"),                  # Spain
            ("fatima.elhassan@eadms.eu", "Fatima", "El Hassan", "TCH107", "Environmental Engineering", "fatima.e@eadms.eu", "+212-661-908-332"), # Morocco
            ("nikola.petrovic@eadms.eu", "Nikola", "Petrović", "TCH108", "Control Systems", "nikola.p@eadms.eu", "+381-64-551-3302"),        # Serbia
            ("wei.zhang@eadms.eu", "Wei", "Zhang", "TCH109", "AI & Machine Learning", "wei.z@eadms.eu", "+86-138-7712-9921"),               # China
            ("amina.khan@eadms.eu", "Amina", "Khan", "TCH110", "Cyber-Physical Systems", "amina.k@eadms.eu", "+44-7700-900812"),             # UK
        ]
        
        teacher_ids = []
        for email, first_name, last_name, teacher_id_str, department, teacher_email, contact in teacher_data:
            user_id = self.create_user(email, "Teacher@123", "TEACHER")
            teacher_db_id = self.create_teacher(user_id, first_name, last_name, teacher_id_str, department, teacher_email, contact)
            teacher_ids.append(teacher_db_id)
        
        # Create Students
        logger.info("👨‍🎓 Creating students...")
        student_data = [
            # Europe
            ("mateo.rossi@student.eu", "Mateo", "Rossi", "EU001", "BSc-AS-1", "MALE", "+39-320-771-8812"),
            ("elena.garcia@student.eu", "Elena", "García", "EU002", "BSc-AS-1", "FEMALE", "+34-611-229-880"),
            ("noah.muller@student.eu", "Noah", "Müller", "EU003", "BSc-AS-1", "MALE", "+49-176-445-8819"),
            ("anna.nowak@student.eu", "Anna", "Nowak", "EU004", "BSc-AS-2", "FEMALE", "+48-789-440-998"),
            ("louis.moreau@student.eu", "Louis", "Moreau", "EU005", "BSc-AS-2", "MALE", "+33-689-774-221"),
            # Asia
            ("arjun.patel@student.eu", "Arjun", "Patel", "AS006", "BSc-AS-1", "MALE", "+91-9823345567"),
            ("mei.lin@student.eu", "Mei", "Lin", "AS007", "BSc-AS-2", "FEMALE", "+86-139-8812-7744"),
            ("hiro.tanaka@student.eu", "Hiro", "Tanaka", "AS008", "BSc-AS-3", "MALE", "+81-90-5544-8821"),
            ("siti.aminah@student.eu", "Siti", "Aminah", "AS009", "BSc-AS-1", "FEMALE", "+60-12-778-3321"),
            ("minh.nguyen@student.eu", "Minh", "Nguyen", "AS010", "BSc-AS-3", "MALE", "+84-91-223-8821"),
            # Middle East 
            ("omar.hassan@student.eu", "Omar", "Hassan", "ME011", "BSc-AS-2", "MALE", "+20-109-882-991"),
            ("layla.nasser@student.eu", "Layla", "Nasser", "ME012", "BSc-AS-1", "FEMALE", "+971-50-881-9921"),
            ("youssef.benali@student.eu", "Youssef", "Ben Ali", "AF013", "BSc-AS-3", "MALE", "+216-22-881-009"),
            ("amina.diop@student.eu", "Amina", "Diop", "AF014", "BSc-AS-2", "FEMALE", "+221-77-889-221"),
            # Americas
            ("lucas.silva@student.eu", "Lucas", "Silva", "AM015", "BSc-AS-1", "MALE", "+55-11-99881-221"),
            ("camila.rojas@student.eu", "Camila", "Rojas", "AM016", "BSc-AS-2", "FEMALE", "+56-9-8811-229"),
            ("daniel.martinez@student.eu", "Daniel", "Martínez", "AM017", "BSc-AS-3", "MALE", "+52-55-8899-2231"),
        ]
        
        student_ids = []
        for email, first_name, last_name, student_id, class_name, gender, contact in student_data:
            user_id = self.create_user(email, "Student@123", "STUDENT")
            student_db_id = self.create_student(user_id, first_name, last_name, student_id, class_name, gender, contact)
            student_ids.append(student_db_id)
        
        # Create Courses
        logger.info("📚 Creating courses...")
        course_data = [
            ("AS101", "Applied Mathematics for Engineers", 1, 6, "Mathematical modeling and numerical methods"),
            ("AS102", "Programming for Applied Sciences", 1, 6, "Python and C for scientific computing"),
            ("AS201", "Data Science & Statistical Analysis", 2, 6, "Data-driven decision making"),
            ("AS202", "Embedded Systems Engineering", 2, 6, "Microcontrollers and real-time systems"),
            ("AS301", "Artificial Intelligence Systems", 3, 6, "Machine learning and intelligent systems"),
            ("AS302", "Robotics & Automation", 3, 6, "Industrial robotics and control"),
            ("AS303", "Cyber-Physical Systems", 3, 6, "Integration of computation and physical processes"),
            ("AS304", "Renewable Energy Technologies", 3, 6, "Solar, wind, and sustainable systems"),
            ("AS401", "Applied Research Project", 4, 12, "Capstone industry-oriented project"),
            ("AS402", "Engineering Ethics & EU Regulations", 4, 3, "Professional ethics and EU standards"),
        ]
        
        course_ids = []
        for course_code, course_name, semester, credits, description in course_data:
            course_id = self.create_course(course_code, course_name, semester, credits, description)
            course_ids.append(course_id)
        
        # Assign teachers to courses
        logger.info("👨‍🏫 Assigning teachers to courses...")
        teacher_course_assignments = [
            (teacher_ids[1], course_ids[0]),  # Anna Kowalska -> Applied Mathematics for Engineers
            (teacher_ids[0], course_ids[1]),  # Luca Bernardi -> Programming for Applied Sciences
            (teacher_ids[2], course_ids[2]),  # Marc Dubois -> Data Science & Statistical Analysis
            (teacher_ids[4], course_ids[3]),  # Johan Lindström -> Embedded Systems Engineering
            (teacher_ids[8], course_ids[4]),  # Wei Zhang -> Artificial Intelligence Systems
            (teacher_ids[5], course_ids[5]),  # Carlos Méndez -> Robotics & Automation
            (teacher_ids[9], course_ids[6]),  # Amina Khan -> Cyber-Physical Systems
            (teacher_ids[6], course_ids[7]),  # Fatima El Hassan -> Renewable Energy Technologies
            (teacher_ids[3], course_ids[8]),  # Sofia Papadopoulos -> Applied Research Project
            (teacher_ids[7], course_ids[9]),  # Nikola Petrović -> Engineering Ethics & EU Regulations
        ]
        
        for teacher_id, course_id in teacher_course_assignments:
            if teacher_id and course_id:
                self.assign_teacher_to_course(teacher_id, course_id)
        
        # Create Enrollments
        logger.info("📝 Creating enrollments...")
        current_year = datetime.now().year
        enrollments = [
            # Year 1 students (BSc-AS-1) - Semester 1 courses
            (student_ids[0], course_ids[0], 1, current_year),   # Mateo -> Applied Mathematics
            (student_ids[0], course_ids[1], 1, current_year),   # Mateo -> Programming
            (student_ids[1], course_ids[0], 1, current_year),   # Elena -> Applied Mathematics
            (student_ids[1], course_ids[1], 1, current_year),   # Elena -> Programming
            (student_ids[2], course_ids[0], 1, current_year),   # Noah -> Applied Mathematics
            (student_ids[2], course_ids[1], 1, current_year),   # Noah -> Programming
            (student_ids[5], course_ids[0], 1, current_year),   # Arjun -> Applied Mathematics
            (student_ids[5], course_ids[1], 1, current_year),   # Arjun -> Programming
            (student_ids[8], course_ids[0], 1, current_year),   # Siti -> Applied Mathematics
            (student_ids[11], course_ids[0], 1, current_year),  # Layla -> Applied Mathematics
            (student_ids[14], course_ids[1], 1, current_year),  # Lucas -> Programming
            
            # Year 2 students (BSc-AS-2) - Semester 2 courses
            (student_ids[3], course_ids[2], 2, current_year),   # Anna -> Data Science
            (student_ids[3], course_ids[3], 2, current_year),   # Anna -> Embedded Systems
            (student_ids[4], course_ids[2], 2, current_year),   # Louis -> Data Science
            (student_ids[4], course_ids[3], 2, current_year),   # Louis -> Embedded Systems
            (student_ids[6], course_ids[2], 2, current_year),   # Mei -> Data Science
            (student_ids[10], course_ids[3], 2, current_year),  # Omar -> Embedded Systems
            (student_ids[13], course_ids[2], 2, current_year),  # Amina -> Data Science
            (student_ids[15], course_ids[3], 2, current_year),  # Camila -> Embedded Systems
            
            # Year 3 students (BSc-AS-3) - Semester 3 courses
            (student_ids[7], course_ids[4], 3, current_year),   # Hiro -> AI Systems
            (student_ids[7], course_ids[5], 3, current_year),   # Hiro -> Robotics
            (student_ids[7], course_ids[6], 3, current_year),   # Hiro -> Cyber-Physical Systems
            (student_ids[9], course_ids[4], 3, current_year),   # Minh -> AI Systems
            (student_ids[9], course_ids[7], 3, current_year),   # Minh -> Renewable Energy
            (student_ids[12], course_ids[5], 3, current_year),  # Youssef -> Robotics
            (student_ids[12], course_ids[6], 3, current_year),  # Youssef -> Cyber-Physical Systems
            (student_ids[16], course_ids[7], 3, current_year),  # Daniel -> Renewable Energy
        ]
        
        for student_id, course_id, semester, academic_year in enrollments:
            if student_id and course_id:  # Only create if both IDs exist
                self.create_enrollment(student_id, course_id, semester, academic_year)
        
        logger.info("🎉 Data migration completed successfully!")
        self.print_summary()
    
    def print_summary(self):
        """Print migration summary"""
        logger.info("\n" + "="*60)
        logger.info("📊 EUROPEAN APPLIED SCIENCES UNIVERSITY - MIGRATION SUMMARY")
        logger.info("="*60)
        logger.info("👨‍💼 Admin: admin@eadms.com / Admin@123")
        logger.info("")
        logger.info("👨‍🏫 International Faculty (10 Teachers):")
        logger.info("  🇮🇹 Luca Bernardi (TCH101) - Computer Engineering")
        logger.info("  🇵🇱 Anna Kowalska (TCH102) - Applied Mathematics") 
        logger.info("  �🇷 Maerc Dubois (TCH103) - Data Science")
        logger.info("  🇬🇷 Sofia Papadopoulos (TCH104) - Physics Engineering")
        logger.info("  🇸🇪 Johan Lindström (TCH105) - Embedded Systems")
        logger.info("  🇪🇸 Carlos Méndez (TCH106) - Robotics")
        logger.info("  🇲🇦 Fatima El Hassan (TCH107) - Environmental Engineering")
        logger.info("  🇷🇸 Nikola Petrović (TCH108) - Control Systems")
        logger.info("  🇨🇳 Wei Zhang (TCH109) - AI & Machine Learning")
        logger.info("  🇬🇧 Amina Khan (TCH110) - Cyber-Physical Systems")
        logger.info("")
        logger.info("�‍🎓 oInternational Students (17 Students):")
        logger.info("  Year 1 (BSc-AS-1): Mateo🇮🇹, Elena🇪🇸, Noah🇩🇪, Arjun🇮🇳, Siti🇲🇾, Layla🇦🇪, Lucas🇧🇷")
        logger.info("  Year 2 (BSc-AS-2): Anna🇵🇱, Louis🇫🇷, Mei🇨🇳, Omar🇪🇬, Amina🇸🇳, Camila🇨🇱")
        logger.info("  Year 3 (BSc-AS-3): Hiro🇯🇵, Minh🇻🇳, Youssef🇹🇳, Daniel🇲🇽")
        logger.info("")
        logger.info("📚 Applied Sciences Curriculum (10 Courses):")
        logger.info("  Semester 1: AS101 (Math), AS102 (Programming)")
        logger.info("  Semester 2: AS201 (Data Science), AS202 (Embedded Systems)")
        logger.info("  Semester 3: AS301 (AI), AS302 (Robotics), AS303 (Cyber-Physical), AS304 (Renewable Energy)")
        logger.info("  Semester 4: AS401 (Research Project), AS402 (Ethics & EU Regulations)")
        logger.info("")
        logger.info("📝 Enrollments: 26+ international student enrollments across all academic years")
        logger.info("🌍 Representing: Europe, Asia, Middle East, Africa, Americas")
        logger.info("="*60)

def main():
    parser = argparse.ArgumentParser(description='Migrate sample data to EADMS PostgreSQL database')
    parser.add_argument('--database-url', help='PostgreSQL database URL')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be migrated without actually doing it')
    
    args = parser.parse_args()
    
    # Get database URL
    database_url = args.database_url or os.getenv('DATABASE_URL')
    
    if not database_url:
        logger.error("❌ Database URL not provided. Use --database-url or set DATABASE_URL environment variable")
        sys.exit(1)
    
    if args.dry_run:
        logger.info("🔍 DRY RUN MODE - No changes will be made")
        logger.info(f"Would connect to: {database_url.split('@')[1] if '@' in database_url else 'hidden'}")
        logger.info("Would create:")
        logger.info("  - 1 Admin user")
        logger.info("  - 10 Teachers (TCH101-TCH110) from Europe, Asia, Africa, Americas")
        logger.info("  - 17 Students (EU001-AM017) from diverse international backgrounds")
        logger.info("  - 10 Applied Sciences courses (AS101-AS402)")
        logger.info("  - 26+ Enrollments across different academic years")
        return
    
    # Create migrator and run migration
    migrator = EADMSDataMigrator(database_url)
    
    try:
        if migrator.connect():
            migrator.migrate_sample_data()
        else:
            sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        sys.exit(1)
    finally:
        migrator.close()

if __name__ == "__main__":
    main()