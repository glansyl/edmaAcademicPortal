#!/usr/bin/env python3
"""
Verify backend API is working and returning data
"""

import requests
import json

# Your backend URL (update if different)
BACKEND_URL = "https://edma-three.vercel.app/api"

print("🔍 Checking backend API...")
print(f"Backend URL: {BACKEND_URL}")
print()

# Try to get stats (this might require authentication)
try:
    response = requests.get(f"{BACKEND_URL}/admin/stats", timeout=10)
    print(f"Stats endpoint: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
    else:
        print(f"Response: {response.text[:200]}")
except Exception as e:
    print(f"❌ Error: {e}")

print()
print("💡 If you see 401/403, the backend is working but needs authentication")
print("💡 If you see connection errors, check if backend is deployed on Render")
