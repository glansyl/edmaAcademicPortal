-- Create admin user if not exists
-- Password: Admin@123 (BCrypt encoded)

-- First, check if admin exists
SELECT * FROM users WHERE email = 'admin@eadms.com';

-- If not exists, insert admin user
-- BCrypt hash for 'Admin@123'
INSERT INTO users (email, password, role, is_active, created_at, updated_at)
SELECT 'admin@eadms.com', 
       '$2a$10$rN8qGUpPQqZqM7L.xQxQxOYxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq',
       'ADMIN',
       true,
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@eadms.com'
);
