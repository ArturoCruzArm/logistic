#!/usr/bin/env node

/**
 * Helper para actualizar credenciales de Supabase en .env
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateEnvCredentials() {
  console.log('🔧 Actualizador de credenciales Supabase');
  console.log('==========================================\n');

  try {
    console.log('Ingresa las credenciales de tu proyecto Supabase:');
    console.log('(Puedes encontrarlas en: Settings → API)\n');

    const supabaseUrl = await question('📍 Project URL (https://xxxxx.supabase.co): ');
    const anonKey = await question('🔑 anon public key (eyJhbGciOiJIUzI1NiIs...): ');
    const serviceKey = await question('🔐 service_role key (eyJhbGciOiJIUzI1NiIs...): ');

    if (!supabaseUrl || !anonKey || !serviceKey) {
      console.log('❌ Error: Todas las credenciales son requeridas');
      process.exit(1);
    }

    // Leer archivo .env actual
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Actualizar credenciales
    envContent = envContent
      .replace(/SUPABASE_URL=.*/, `SUPABASE_URL=${supabaseUrl}`)
      .replace(/SUPABASE_ANON_KEY=.*/, `SUPABASE_ANON_KEY=${anonKey}`)
      .replace(/SUPABASE_SERVICE_ROLE_KEY=.*/, `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`)
      .replace(/# DEMO CREDENTIALS.*\n/, '# CREDENCIALES REALES\n');

    // Escribir archivo actualizado
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Credenciales actualizadas en .env');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Ejecutar: npm run setup:supabase');
    console.log('2. Ir a Supabase SQL Editor y ejecutar database/schema.sql');
    console.log('3. Probar conexión: curl http://localhost:3003/api/test-db');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateEnvCredentials();
}

module.exports = { updateEnvCredentials };