// Debug route loading
require('dotenv').config();

console.log('🔍 Debugging route loading...');

try {
  console.log('✅ Loading auth route...');
  const authRoute = require('./routes/auth');
  console.log('✅ Auth route loaded successfully');
} catch (error) {
  console.error('❌ Error loading auth route:', error.message);
  console.error('Stack:', error.stack);
}

try {
  console.log('✅ Testing Supabase connection...');
  const { supabase } = require('./config/database');
  console.log('✅ Supabase loaded successfully');
} catch (error) {
  console.error('❌ Error loading Supabase:', error.message);
}

try {
  console.log('✅ Testing JWT...');
  const jwt = require('jsonwebtoken');
  console.log('✅ JWT loaded successfully');
} catch (error) {
  console.error('❌ Error loading JWT:', error.message);
}

console.log('\n📋 Environment variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);