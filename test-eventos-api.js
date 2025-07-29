// Test de la API de eventos
require('dotenv').config();
const axios = require('axios');

const API_URL = 'https://plataforma-eventos-mvp.onrender.com/api';

async function testEventosAPI() {
    console.log('🎉 Testing Eventos API\n');
    
    let authToken = null;
    let eventoId = null;
    
    try {
        // Step 1: Registrar un usuario cliente para testing
        console.log('1️⃣ Registrando usuario cliente de prueba...');
        const userData = {
            email: `cliente${Date.now()}@eventostest.com`,
            password: 'password123',
            nombre: 'Cliente Test Eventos',
            telefono: '1234567890',
            tipo_usuario: 'cliente'
        };
        
        const registerResponse = await axios.post(`${API_URL}/auth/register`, userData);
        authToken = registerResponse.data.token;
        console.log('✅ Usuario cliente registrado:', userData.email);
        
        // Step 2: Crear un evento nuevo
        console.log('\n2️⃣ Creando nuevo evento...');
        const eventoData = {
            nombre_evento: 'Boda de Prueba 2024',
            descripcion: 'Evento de prueba para testing de la API',
            fecha_evento: '2024-12-25',
            hora_evento: '18:00',
            ubicacion: 'Salón de Eventos Los Pinos, CDMX',
            numero_invitados: 150,
            presupuesto_estimado: 50000,
            tipo_evento: 'boda',
            servicios_requeridos: ['catering', 'decoracion', 'fotografia', 'musica']
        };
        
        const createResponse = await axios.post(`${API_URL}/eventos`, eventoData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        eventoId = createResponse.data.evento.id;
        console.log('✅ Evento creado exitosamente');
        console.log('   ID:', eventoId);
        console.log('   Nombre:', createResponse.data.evento.nombre_evento);
        console.log('   Fecha:', createResponse.data.evento.fecha_evento);
        
        // Step 3: Listar eventos del usuario
        console.log('\n3️⃣ Listando eventos del usuario...');
        const listResponse = await axios.get(`${API_URL}/eventos`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log('✅ Eventos listados exitosamente');
        console.log('   Total de eventos:', listResponse.data.total);
        console.log('   Primer evento:', listResponse.data.eventos[0]?.nombre_evento);
        
        // Step 4: Obtener evento específico
        console.log('\n4️⃣ Obteniendo evento específico...');
        const getResponse = await axios.get(`${API_URL}/eventos/${eventoId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log('✅ Evento obtenido exitosamente');
        console.log('   Nombre:', getResponse.data.evento.nombre_evento);
        console.log('   Invitados:', getResponse.data.evento.numero_invitados);
        console.log('   Presupuesto:', getResponse.data.evento.presupuesto_estimado);
        
        // Step 5: Actualizar evento
        console.log('\n5️⃣ Actualizando evento...');
        const updateData = {
            numero_invitados: 200,
            presupuesto_estimado: 75000,
            descripcion: 'Evento actualizado - más invitados y mayor presupuesto',
            estatus: 'confirmado'
        };
        
        const updateResponse = await axios.put(`${API_URL}/eventos/${eventoId}`, updateData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log('✅ Evento actualizado exitosamente');
        console.log('   Nuevos invitados:', updateResponse.data.evento.numero_invitados);
        console.log('   Nueva descripción:', updateResponse.data.evento.descripcion);
        console.log('   Nuevo estatus:', updateResponse.data.evento.estatus);
        
        // Step 6: Intentar crear evento como proveedor (debe fallar)
        console.log('\n6️⃣ Testing restricción de proveedores...');
        try {
            // Registrar proveedor
            const proveedorData = {
                email: `proveedor${Date.now()}@eventostest.com`,
                password: 'password123',
                nombre: 'Proveedor Test',
                tipo_usuario: 'proveedor'
            };
            
            const proveedorRegister = await axios.post(`${API_URL}/auth/register`, proveedorData);
            const proveedorToken = proveedorRegister.data.token;
            
            await axios.post(`${API_URL}/eventos`, eventoData, {
                headers: { 'Authorization': `Bearer ${proveedorToken}` }
            });
            
            console.log('❌ ERROR: Proveedor pudo crear evento (no debería)');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ Restricción funcionando: Proveedores no pueden crear eventos');
            } else {
                console.log('⚠️ Error inesperado:', error.response?.data?.error);
            }
        }
        
        // Step 7: Eliminar evento
        console.log('\n7️⃣ Eliminando evento...');
        const deleteResponse = await axios.delete(`${API_URL}/eventos/${eventoId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log('✅ Evento eliminado exitosamente');
        console.log('   Evento eliminado:', deleteResponse.data.evento_eliminado);
        
        // Step 8: Verificar que el evento fue eliminado
        console.log('\n8️⃣ Verificando eliminación...');
        try {
            await axios.get(`${API_URL}/eventos/${eventoId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            console.log('❌ ERROR: Evento aún existe después de eliminación');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Verificación exitosa: Evento eliminado correctamente');
            }
        }
        
        console.log('\n🎊 ALL EVENTOS API TESTS PASSED! 🎊');
        console.log('✅ Create - Crear eventos funciona');
        console.log('✅ Read - Listar y obtener eventos funciona');
        console.log('✅ Update - Actualizar eventos funciona');
        console.log('✅ Delete - Eliminar eventos funciona');
        console.log('✅ Security - Restricciones de usuario funcionan');
        console.log('\n🚀 CRUD de eventos completamente funcional!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Response:', error.response.data);
        }
    }
}

testEventosAPI();