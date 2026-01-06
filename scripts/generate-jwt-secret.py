#!/usr/bin/env python3
"""
JWT Secret Generator
Generates a cryptographically secure JWT secret key
"""

import secrets
import string
import base64
import hashlib

def generate_jwt_secret():
    """Generate a secure JWT secret key"""
    
    print("🔐 JWT Secret Key Generator")
    print("=" * 50)
    
    # Method 1: Random string (recommended)
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    secret1 = ''.join(secrets.choice(alphabet) for _ in range(64))
    
    # Method 2: Base64 encoded random bytes
    random_bytes = secrets.token_bytes(48)
    secret2 = base64.b64encode(random_bytes).decode('utf-8')
    
    # Method 3: Hex encoded random bytes
    secret3 = secrets.token_hex(32)
    
    print("Option 1 (Alphanumeric + Special chars):")
    print(f"JWT_SECRET={secret1}")
    print()
    
    print("Option 2 (Base64 encoded):")
    print(f"JWT_SECRET={secret2}")
    print()
    
    print("Option 3 (Hex encoded):")
    print(f"JWT_SECRET={secret3}")
    print()
    
    print("🚨 SECURITY NOTES:")
    print("- Never commit these secrets to version control")
    print("- Use different secrets for development and production")
    print("- Store in environment variables only")
    print("- Minimum length should be 32 characters")
    print()
    
    print("📝 USAGE:")
    print("1. Copy one of the secrets above")
    print("2. Add to Render.com environment variables")
    print("3. Add to local .env file for development")
    
    return secret1

if __name__ == "__main__":
    generate_jwt_secret()