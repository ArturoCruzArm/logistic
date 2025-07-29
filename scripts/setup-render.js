#!/usr/bin/env node

/**
 * Script de setup para Render
 */

const fs = require('fs');
const path = require('path');

function generateRenderSetup() {
  console.log('🎨 SETUP RENDER - PLATAFORMA DE EVENTOS');
  console.log('=====================================\n');

  // Verificar archivos necesarios
  console.log('🔍 Verificando archivos necesarios:');
  const requiredFiles = [
    'render.yaml',
    'package.json',
    'server-production.js',
    '.env'
  ];

  let allFilesExist = true;
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, '..', file));
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  });

  if (!allFilesExist) {
    console.log('\n❌ Faltan archivos necesarios. Ejecuta primero los otros scripts de setup.');
    return;
  }

  console.log('\n✅ Todos los archivos necesarios están presentes');

  // Leer variables de entorno para mostrar configuración
  const envPath = path.join(__dirname, '..', '.env');
  let envVars = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        envVars[key.trim()] = value.trim();
      }
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log('🚀 PASOS PARA DEPLOY EN RENDER');
  console.log('='.repeat(50));

  console.log('\n1️⃣  PREPARAR REPOSITORIO GITHUB');
  console.log('   📁 El código ya está listo con render.yaml');
  console.log('   🔧 Subir a GitHub:');
  console.log('   git add .');
  console.log('   git commit -m "Setup para Render deploy"');
  console.log('   git push origin main');

  console.log('\n2️⃣  CREAR SERVICIO EN RENDER');
  console.log('   🌐 Ir a: https://render.com');
  console.log('   👤 Crear cuenta gratuita (usar GitHub)');
  console.log('   ➕ Click "New" > "Web Service"');
  console.log('   🔗 Conectar tu repositorio GitHub');
  console.log('   ⚙️  Configurar:');
  console.log('      - Name: plataforma-eventos-mvp');
  console.log('      - Environment: Node');
  console.log('      - Build Command: npm install');
  console.log('      - Start Command: npm start');
  console.log('      - Plan: Free');

  console.log('\n3️⃣  CONFIGURAR VARIABLES DE ENTORNO');
  console.log('   📊 En Render Dashboard > Environment Variables, agregar:');
  console.log('');
  
  const renderVars = [
    { key: 'SUPABASE_URL', value: envVars.SUPABASE_URL || 'https://tu-proyecto.supabase.co' },
    { key: 'SUPABASE_ANON_KEY', value: envVars.SUPABASE_ANON_KEY || 'tu-anon-key' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: envVars.SUPABASE_SERVICE_ROLE_KEY || 'tu-service-role-key' },
    { key: 'JWT_SECRET', value: envVars.JWT_SECRET || 'tu-jwt-secret' },
    { key: 'NODE_ENV', value: 'production' },
    { key: 'PORT', value: '10000' },
    { key: 'ALLOWED_ORIGINS', value: 'https://plataforma-eventos-mvp.onrender.com' }
  ];

  renderVars.forEach(({ key, value }) => {
    const displayValue = key.includes('KEY') || key.includes('SECRET') 
      ? '[CONFIGURAR_EN_RENDER]' 
      : value;
    console.log(`   ${key} = ${displayValue}`);
  });

  console.log('\n4️⃣  DEPLOY AUTOMÁTICO');
  console.log('   ⏱️  Render hace deploy automático (5-10 minutos)');
  console.log('   📊 Monitorear en Dashboard > Events');
  console.log('   🌐 URL final: https://plataforma-eventos-mvp.onrender.com');

  console.log('\n' + '='.repeat(50));
  console.log('🧪 COMANDOS DE VERIFICACIÓN');
  console.log('='.repeat(50));

  console.log('\n# Test 1: Health check');
  console.log('curl https://plataforma-eventos-mvp.onrender.com/health');
  
  console.log('\n# Test 2: Conexión Supabase');
  console.log('curl https://plataforma-eventos-mvp.onrender.com/api/test-db');
  
  console.log('\n# Test 3: API status');
  console.log('curl https://plataforma-eventos-mvp.onrender.com/api/status');

  console.log('\n' + '='.repeat(50));
  console.log('🎯 VENTAJAS RENDER');
  console.log('='.repeat(50));
  console.log('✅ 750 horas gratis/mes');
  console.log('✅ Deploy automático desde GitHub');
  console.log('✅ SSL certificado incluido');
  console.log('✅ No requiere tarjeta de crédito');
  console.log('✅ Mejor uptime que alternativas gratuitas');

  console.log('\n⚠️  NOTAS IMPORTANTES:');
  console.log('- El primer deploy puede tardar 5-10 minutos');
  console.log('- Render "duerme" el servicio tras 15 min de inactividad');
  console.log('- Se "despierta" automáticamente con el primer request');
  console.log('- PORT debe ser 10000 (requerido por Render)');

  console.log('\n🎉 Una vez deployado, tendrás el MVP al 50% completado!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateRenderSetup();
}

module.exports = { generateRenderSetup };