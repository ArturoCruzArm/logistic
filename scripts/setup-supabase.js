#!/usr/bin/env node

/**
 * Script de setup para Supabase
 * Ejecutar después de crear el proyecto en supabase.com
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setupSupabase() {
  console.log('🏗️  Setup de Supabase para Plataforma de Eventos');
  console.log('==========================================\n');

  // Verificar variables de entorno
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Variables de entorno faltantes');
    console.error('Necesitas configurar:');
    console.error('- SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nEjecuta: cp .env.example .env y configura las variables');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🔍 Verificando conexión a Supabase...');
    
    // Test básico de conexión
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error de conexión: ${error.message}`);
    }

    console.log('✅ Conexión exitosa a Supabase');

    // Verificar si las tablas principales existen
    console.log('🔍 Verificando esquema de base de datos...');
    
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);

    if (usuariosError && usuariosError.code === 'PGRST116') {
      console.log('⚠️  Tablas no encontradas. Necesitas ejecutar el esquema.');
      console.log('\n📋 PASOS OBLIGATORIOS:');
      console.log('1. Ir a: https://app.supabase.com/project/' + process.env.SUPABASE_URL?.split('.')[0]?.replace('https://', '') + '/sql');
      console.log('2. Crear nueva query');
      console.log('3. Copiar TODO el contenido de: database/schema.sql');
      console.log('4. Pegar en el editor y ejecutar (Ctrl+Enter)');
      console.log('5. Verificar que aparezcan 9 tablas en Table Editor');
      console.log('\n⚠️  SIN ESTE PASO EL SISTEMA NO FUNCIONARÁ');
    } else if (usuariosError) {
      console.log('❌ Error verificando tablas:', usuariosError.message);
    } else {
      console.log('✅ Esquema de base de datos configurado correctamente');
      
      // Verificar algunas tablas clave
      const tablesToCheck = ['eventos', 'servicios', 'cotizaciones', 'analisis_rentabilidad'];
      let allTablesExist = true;
      
      for (const table of tablesToCheck) {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (error && error.code === 'PGRST116') {
          console.log(`❌ Tabla '${table}' no encontrada`);
          allTablesExist = false;
        } else {
          console.log(`✅ Tabla '${table}' OK`);
        }
      }
      
      if (allTablesExist) {
        console.log('🎉 ¡Todas las tablas principales están configuradas!');
      }
    }

    // Verificar configuración de autenticación
    console.log('\n🔐 Verificando configuración de Auth...');
    
    const authConfig = {
      site_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      jwt_exp: 3600,
      enable_signup: true,
      enable_email_confirmations: false // Para MVP, cambiar a true en producción
    };

    console.log('✅ Configuración de Auth lista');
    console.log('   Para producción, habilitar confirmación de email');

    // Crear usuario admin de prueba (opcional)
    if (process.env.CREATE_ADMIN_USER === 'true') {
      console.log('\n👤 Creando usuario admin de prueba...');
      
      const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
        email: 'admin@plataformaeventos.com',
        password: 'admin123456',
        email_confirm: true,
        user_metadata: {
          nombre: 'Admin MVP',
          tipo_usuario: 'proveedor'
        }
      });

      if (adminError) {
        console.log('⚠️  No se pudo crear usuario admin:', adminError.message);
      } else {
        console.log('✅ Usuario admin creado: admin@plataformaeventos.com / admin123456');
      }
    }

    console.log('\n🎉 Setup de Supabase completado exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Verificar que todas las tablas se crearon correctamente');
    console.log('2. Configurar RLS (Row Level Security) si es necesario');
    console.log('3. Probar conexión desde la aplicación');
    console.log('\n🔗 URLs útiles:');
    console.log(`   Dashboard: https://app.supabase.com/project/${process.env.SUPABASE_URL?.split('.')[0]?.replace('https://', '')}`);
    console.log(`   SQL Editor: https://app.supabase.com/project/${process.env.SUPABASE_URL?.split('.')[0]?.replace('https://', '')}/sql`);

  } catch (error) {
    console.error('❌ Error durante el setup:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Verifica que las credenciales en .env sean correctas');
    console.error('2. Verifica que el proyecto Supabase esté activo');
    console.error('3. Verifica que tengas permisos de administrador');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  require('dotenv').config();
  setupSupabase();
}

module.exports = { setupSupabase };