// Script para verificar la tabla de eventos en Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkEventosTable() {
    console.log('🔍 Checking Eventos table in Supabase...\n');
    
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        console.log('✅ Connected to Supabase');
        
        // Intentar consultar la tabla eventos
        const { data, error } = await supabase
            .from('eventos')
            .select('count')
            .limit(1);
        
        if (error) {
            console.log('❌ Eventos table does NOT exist');
            console.log('Error:', error.message);
            console.log('\n🛠️  Please create the table manually:');
            console.log('1. Go to: https://app.supabase.com/project/kpfpocesvtgjfrjwedmb/sql');
            console.log('2. Copy and paste the SQL from: sql/create-eventos-table.sql');
            console.log('3. Click "Run" to execute the SQL');
            console.log('4. Then run: node test-eventos-api.js');
            return false;
        }
        
        console.log('✅ Eventos table exists and is accessible!');
        
        // Verificar estructura básica
        console.log('\n📋 Checking table structure...');
        const { data: sampleData, error: sampleError } = await supabase
            .from('eventos')
            .select('*')
            .limit(0); // Solo queremos ver la estructura
        
        if (sampleError) {
            console.log('⚠️  Could not verify table structure:', sampleError.message);
        } else {
            console.log('✅ Table structure looks good!');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Check failed:', error.message);
        return false;
    }
}

checkEventosTable().then(success => {
    if (success) {
        console.log('\n🎉 Ready to test eventos API!');
        console.log('Run: node test-eventos-api.js');
    }
});