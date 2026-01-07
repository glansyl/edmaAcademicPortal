// Test CORS connectivity
// Run this in your browser console on https://edma-three.vercel.app

console.log('🧪 Testing CORS connectivity...');

// Test 1: Basic CORS test
fetch('https://edma-m871.onrender.com/api/cors-test', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('✅ CORS Test Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ CORS Test Success:', data);
})
.catch(error => {
  console.error('❌ CORS Test Failed:', error);
});

// Test 2: Login API test
setTimeout(() => {
  console.log('🔐 Testing login API...');
  
  fetch('https://edma-m871.onrender.com/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@eadms.com',
      password: 'Admin@123'
    })
  })
  .then(response => {
    console.log('✅ Login Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Login Test Success:', data);
  })
  .catch(error => {
    console.error('❌ Login Test Failed:', error);
  });
}, 2000);