// Test directo de conexión Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  console.log('Port:', process.env.PORT);
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Connection successful!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

testConnection();