// Test de autenticación local
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3003';

async function testAuth() {
  console.log('🔐 Testing Authentication System...\n');
  
  try {
    // Test 1: Register new user
    console.log('1️⃣ Testing user registration...');
    const userData = {
      email: 'test@plataformaeventos.com',
      password: 'password123',
      nombre: 'Usuario Test',
      telefono: '1234567890',
      tipo_usuario: 'cliente'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, userData);
    console.log('✅ Registration successful:', registerResponse.data.message);
    
    const token = registerResponse.data.token;
    console.log('🔑 Token received:', token.substring(0, 20) + '...\n');
    
    // Test 2: Login with same user
    console.log('2️⃣ Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: userData.email,
      password: userData.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('👤 User:', loginResponse.data.user.nombre, '-', loginResponse.data.user.tipo_usuario);
    
    const loginToken = loginResponse.data.token;
    console.log('🔑 Login token:', loginToken.substring(0, 20) + '...\n');
    
    // Test 3: Get user profile
    console.log('3️⃣ Testing get profile...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${loginToken}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.user.nombre);
    console.log('📧 Email:', profileResponse.data.user.email);
    console.log('📞 Telefono:', profileResponse.data.user.telefono);
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Install axios if not present
try {
  require('axios');
  testAuth();
} catch (e) {
  console.log('📦 Installing axios for testing...');
  const { execSync } = require('child_process');
  execSync('npm install axios', { stdio: 'inherit' });
  console.log('✅ Axios installed, running tests...\n');
  testAuth();
}