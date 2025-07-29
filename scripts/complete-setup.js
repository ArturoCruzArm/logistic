#!/usr/bin/env node

/**
 * Script completo de setup - Guía interactiva
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`✅ ${description} completado`);
    return true;
  } catch (error) {
    console.log(`❌ Error en: ${description}`);
    console.log(`   Comando: ${command}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}`);
  return exists;
}

async function completeSetup() {
  console.log('🚀 SETUP COMPLETO - PLATAFORMA DE EVENTOS MVP');
  console.log('==============================================\n');

  // Verificar prerequisitos
  console.log('📋 Verificando prerequisitos...');
  checkFile('.env', 'Archivo .env existe');
  checkFile('database/schema.sql', 'Esquema de base de datos');
  checkFile('Dockerfile', 'Configuración Docker');
  checkFile('frontend/package.json', 'Frontend configurado');

  // Verificar Railway CLI
  try {
    execSync('railway version', { stdio: 'ignore' });
    console.log('✅ Railway CLI instalado');
  } catch {
    console.log('❌ Railway CLI no encontrado');
    console.log('   Instalar con: npm install -g @railway/cli');
    return;
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎯 PASOS A SEGUIR:');
  console.log('='.repeat(50));

  console.log('\n1️⃣  SUPABASE SETUP');
  console.log('   📍 Crear proyecto en: https://supabase.com');
  console.log('   📝 Nombre: plataforma-eventos-mvp');
  console.log('   🔑 Obtener credenciales de Settings → API');
  console.log('   💾 Ejecutar: npm run setup:env (para configurar .env)');
  console.log('   🗄️  Ejecutar schema SQL en Supabase SQL Editor');
  
  console.log('\n2️⃣  RAILWAY SETUP');
  console.log('   🚂 railway login');
  console.log('   📦 railway new plataforma-eventos-mvp');
  console.log('   🔗 railway link');
  console.log('   ⚙️  Configurar variables (ver output de setup:railway)');
  console.log('   🚀 railway up');

  console.log('\n3️⃣  VERIFICACIÓN');
  console.log('   🔍 curl http://localhost:3003/api/test-db');
  console.log('   🌐 curl https://tu-app.railway.app/health');
  console.log('   ✨ Abrir frontend: http://localhost:3000');

  console.log('\n' + '='.repeat(50));
  console.log('📁 ARCHIVOS IMPORTANTES:');
  console.log('='.repeat(50));
  console.log('   📋 SETUP_STEP_BY_STEP.md - Guía detallada');
  console.log('   📊 STATUS_ATUAL.md - Estado del proyecto');
  console.log('   🗄️  database/schema.sql - Esquema completo BD');
  console.log('   ⚙️  .env - Variables de entorno');

  console.log('\n' + '='.repeat(50));
  console.log('🛠️  COMANDOS ÚTILES:');
  console.log('='.repeat(50));
  console.log('   npm run setup:env        - Configurar credenciales');
  console.log('   npm run setup:supabase   - Verificar Supabase');
  console.log('   npm run setup:railway    - Comandos Railway');
  console.log('   npm run dev              - Servidor desarrollo');
  console.log('   cd frontend && npm run dev - Frontend desarrollo');

  console.log('\n' + '='.repeat(50));
  console.log('🎯 SIGUIENTES FUNCIONALIDADES (Semana 2):');
  console.log('='.repeat(50));
  console.log('   🔐 Sistema de autenticación');
  console.log('   💰 Costos transparentes (diferenciador clave)');
  console.log('   📊 Análisis de rentabilidad automático');
  console.log('   📝 Interface de cotizaciones');

  console.log('\n🏁 ESTADO ACTUAL: 35% completado');
  console.log('⏱️  TIEMPO ESTIMADO SETUP: 15 minutos');
  console.log('🎯 META: MVP completo en 6 semanas');

  console.log('\n💡 TIP: Ejecuta los pasos en orden. ¡El stack técnico está listo!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  completeSetup();
}

module.exports = { completeSetup };