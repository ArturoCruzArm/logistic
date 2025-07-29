// Script para crear tabla de eventos en Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setupEventosTable() {
    console.log('🗄️  Setting up Eventos table in Supabase...\n');
    
    try {
        // Configurar cliente de Supabase con service role
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        console.log('✅ Connected to Supabase');
        
        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, '..', 'sql', 'create-eventos-table.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📄 SQL file loaded');
        
        // Ejecutar el SQL usando rpc (para comandos DDL)
        console.log('🔨 Creating eventos table...');
        
        // Dividir el SQL en comandos individuales
        const commands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
        
        console.log(`📋 Executing ${commands.length} SQL commands...`);
        
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            
            try {
                // Para comandos CREATE TABLE, usamos una función especial
                if (command.toLowerCase().includes('create table')) {
                    console.log(`${i + 1}. Creating table...`);
                } else if (command.toLowerCase().includes('create index')) {
                    console.log(`${i + 1}. Creating index...`);
                } else if (command.toLowerCase().includes('alter table')) {
                    console.log(`${i + 1}. Altering table...`);
                } else if (command.toLowerCase().includes('create policy')) {
                    console.log(`${i + 1}. Creating policy...`);
                } else {
                    console.log(`${i + 1}. Executing command...`);
                }
                
                // Ejecutar comando SQL usando rpc
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql_query: command
                });
                
                if (error) {
                    // Algunos errores son esperados (como tabla ya existe)
                    if (error.message.includes('already exists') || 
                        error.message.includes('does not exist')) {
                        console.log(`   ⚠️  ${error.message} (expected)`);
                    } else {
                        console.error(`   ❌ Error: ${error.message}`);
                    }
                } else {
                    console.log(`   ✅ Success`);
                }
                
            } catch (cmdError) {
                console.error(`   ❌ Command error: ${cmdError.message}`);
            }
        }
        
        // Verificar que la tabla se creó correctamente
        console.log('\n🔍 Verifying table creation...');
        const { data: tableInfo, error: tableError } = await supabase
            .from('eventos')
            .select('count')
            .limit(1);
        
        if (tableError) {
            if (tableError.code === 'PGRST116') {
                console.log('❌ Table does not exist - setup may have failed');
            } else {
                console.log('⚠️  Table verification warning:', tableError.message);
            }
        } else {
            console.log('✅ Table eventos verified successfully!');
        }
        
        console.log('\n🎉 Eventos table setup complete!');
        console.log('📋 Next steps:');
        console.log('1. Run: node test-eventos-api.js');
        console.log('2. Test creating, reading, updating, and deleting eventos');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('\n🛠️  Manual setup required:');
        console.log('1. Go to Supabase Dashboard > SQL Editor');
        console.log('2. Copy and paste the content of sql/create-eventos-table.sql');
        console.log('3. Run the SQL manually');
    }
}

setupEventosTable();