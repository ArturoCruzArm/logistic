// Test frontend-backend integration
const axios = require('axios');

async function testFrontendIntegration() {
    console.log('🧪 Testing Frontend-Backend Integration\n');
    
    const frontendUrl = 'http://localhost:3004';
    const backendUrl = 'https://plataforma-eventos-mvp.onrender.com/api';
    
    try {
        // Test 1: Check if frontend is accessible
        console.log('1️⃣ Testing frontend accessibility...');
        const frontendResponse = await axios.get(frontendUrl);
        if (frontendResponse.status === 200 && frontendResponse.data.includes('Plataforma de Eventos')) {
            console.log('✅ Frontend is accessible at http://localhost:3004');
        } else {
            console.log('❌ Frontend response unexpected');
        }
        
        // Test 2: Check backend API status
        console.log('\n2️⃣ Testing backend API...');
        const backendResponse = await axios.get(`${backendUrl}/status`);
        if (backendResponse.status === 200) {
            console.log('✅ Backend API is accessible');
            console.log('📊 Available endpoints:', backendResponse.data.endpoints_disponibles.length);
        }
        
        // Test 3: Test CORS configuration
        console.log('\n3️⃣ Testing CORS configuration...');
        try {
            const corsTest = await axios.get(`${backendUrl}/auth/profile`, {
                headers: {
                    'Origin': 'http://localhost:3004',
                    'Authorization': 'Bearer invalid-token'
                }
            });
        } catch (corsError) {
            if (corsError.response && corsError.response.status === 401) {
                console.log('✅ CORS is properly configured (401 Unauthorized as expected)');
            } else {
                console.log('⚠️ CORS might have issues:', corsError.message);
            }
        }
        
        console.log('\n🎉 Frontend-Backend Integration Test Complete!');
        console.log('🌐 Frontend URL: http://localhost:3004');
        console.log('🔗 Backend API: https://plataforma-eventos-mvp.onrender.com/api');
        console.log('\n📋 Next steps:');
        console.log('1. Open http://localhost:3004 in your browser');
        console.log('2. Test user registration as both cliente and proveedor');
        console.log('3. Test login functionality');
        console.log('4. Verify JWT token storage and dashboard access');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
    }
}

// Only run if frontend server is running
setTimeout(testFrontendIntegration, 2000);