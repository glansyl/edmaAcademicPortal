#!/bin/bash
# Test Backend API Script

BACKEND_URL="https://edma-m87i.onrender.com"

echo "=================================="
echo "EADMS Backend API Test"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s "${BACKEND_URL}/actuator/health" | python3 -m json.tool 2>/dev/null || echo "❌ Health check failed"
echo ""
echo ""

# Test 2: Database Diagnostic (no auth required)
echo "2️⃣  Testing Database Diagnostic..."
curl -s "${BACKEND_URL}/api/diagnostic/database-info" | python3 -m json.tool 2>/dev/null || echo "❌ Diagnostic endpoint failed"
echo ""
echo ""

# Test 3: Login as Admin
echo "3️⃣  Testing Admin Login..."
LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eadms.com",
    "password": "Admin@123"
  }')

echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "❌ Login failed"

# Extract JWT token
JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ Failed to get JWT token"
    exit 1
fi

echo ""
echo "✅ JWT Token obtained"
echo ""

# Test 4: Get Dashboard Stats
echo "4️⃣  Testing Admin Dashboard Stats..."
curl -s "${BACKEND_URL}/api/admin/dashboard/stats" \
  -H "Authorization: Bearer ${JWT_TOKEN}" | python3 -m json.tool 2>/dev/null || echo "❌ Dashboard stats failed"
echo ""
echo ""

# Test 5: Get All Teachers
echo "5️⃣  Testing Get All Teachers..."
TEACHERS=$(curl -s "${BACKEND_URL}/api/admin/teachers" \
  -H "Authorization: Bearer ${JWT_TOKEN}")
echo "$TEACHERS" | python3 -m json.tool 2>/dev/null || echo "❌ Get teachers failed"

TEACHER_COUNT=$(echo "$TEACHERS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo ""
echo "📊 Teacher Count: ${TEACHER_COUNT:-0}"
echo ""

# Test 6: Get All Students
echo "6️⃣  Testing Get All Students..."
STUDENTS=$(curl -s "${BACKEND_URL}/api/admin/students" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

STUDENT_COUNT=$(echo "$STUDENTS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "📊 Student Count: ${STUDENT_COUNT:-0}"
echo ""

# Test 7: Get All Courses
echo "7️⃣  Testing Get All Courses..."
COURSES=$(curl -s "${BACKEND_URL}/api/admin/courses" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

COURSE_COUNT=$(echo "$COURSES" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "📊 Course Count: ${COURSE_COUNT:-0}"
echo ""

echo "=================================="
echo "Test Summary"
echo "=================================="
echo "Teachers: ${TEACHER_COUNT:-0} (Expected: 10)"
echo "Students: ${STUDENT_COUNT:-0} (Expected: 17)"
echo "Courses: ${COURSE_COUNT:-0} (Expected: 10)"
echo ""

if [ "${TEACHER_COUNT:-0}" -eq 10 ] && [ "${STUDENT_COUNT:-0}" -eq 17 ] && [ "${COURSE_COUNT:-0}" -eq 10 ]; then
    echo "✅ ALL TESTS PASSED! Backend is working correctly!"
else
    echo "❌ TESTS FAILED! Backend is not returning correct data."
    echo ""
    echo "Troubleshooting:"
    echo "1. Check Render environment variables (DATABASE_URL, SPRING_PROFILES_ACTIVE)"
    echo "2. Check Render logs for database connection errors"
    echo "3. Verify DATABASE_URL matches: postgresql://glansyldsouza:...@dpg-d5e9bsh5pdvs73f7pkl0-a.oregon-postgres.render.com/edmadb"
fi
