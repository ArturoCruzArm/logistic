// Test de autenticación en Render
const axios = require('axios');

const BASE_URL = 'https://plataforma-eventos-mvp.onrender.com';

async function testAuthRender() {
  console.log('🔐 Testing Authentication on Render...\n');
  console.log('🌐 URL:', BASE_URL);
  
  try {
    // Test 1: Check API status first
    console.log('1️⃣ Testing API status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/status`);
    console.log('✅ API Status:', statusResponse.data.message);
    console.log('📋 Available endpoints:', statusResponse.data.endpoints_disponibles);
    
    // Test 2: Register new user
    console.log('\n2️⃣ Testing user registration...');
    const userData = {
      email: `test${Date.now()}@plataformaeventos.com`, // Unique email
      password: 'password123',
      nombre: 'Usuario Test Render',
      telefono: '1234567890',
      tipo_usuario: 'cliente'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, userData);
    console.log('✅ Registration successful:', registerResponse.data.message);
    
    const token = registerResponse.data.token;
    console.log('🔑 Token received:', token.substring(0, 30) + '...');
    console.log('👤 User created:', registerResponse.data.user.nombre);
    
    // Test 3: Login with same user
    console.log('\n3️⃣ Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: userData.email,
      password: userData.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('👤 User:', loginResponse.data.user.nombre, '-', loginResponse.data.user.tipo_usuario);
    
    const loginToken = loginResponse.data.token;
    
    // Test 4: Get user profile
    console.log('\n4️⃣ Testing get profile...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${loginToken}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.user.nombre);
    console.log('📧 Email:', profileResponse.data.user.email);
    console.log('🏷️  Tipo:', profileResponse.data.user.tipo_usuario);
    
    console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED!');
    console.log('🚀 Authentication system is fully functional on Render!');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Message:', error.message);
    }
  }
}

testAuthRender();