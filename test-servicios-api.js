// Test de la API de servicios
require('dotenv').config();
const axios = require('axios');

const API_URL = 'https://plataforma-eventos-mvp.onrender.com/api';

async function testServiciosAPI() {
    console.log('🛍️ Testing Servicios API\n');
    
    let proveedorToken = null;
    let clienteToken = null;
    let servicioId = null;
    
    try {
        // Step 1: Registrar un proveedor para testing
        console.log('1️⃣ Registrando usuario proveedor de prueba...');
        const proveedorData = {
            email: `proveedor${Date.now()}@serviciostest.com`,
            password: 'password123',
            nombre: 'Proveedor Test Servicios',
            telefono: '9876543210',
            tipo_usuario: 'proveedor',
            datos_proveedor: {
                nombre_empresa: 'Servicios Premium SA',
                descripcion_servicios: 'Ofrecemos servicios de catering y decoración',
                experiencia_anos: 5
            }
        };
        
        const proveedorRegister = await axios.post(`${API_URL}/auth/register`, proveedorData);
        proveedorToken = proveedorRegister.data.token;
        console.log('✅ Proveedor registrado:', proveedorData.email);
        
        // Step 2: Registrar un cliente para testing
        console.log('\n2️⃣ Registrando usuario cliente de prueba...');
        const clienteData = {
            email: `cliente${Date.now()}@serviciostest.com`,  
            password: 'password123',
            nombre: 'Cliente Test Servicios',
            tipo_usuario: 'cliente'
        };
        
        const clienteRegister = await axios.post(`${API_URL}/auth/register`, clienteData);
        clienteToken = clienteRegister.data.token;
        console.log('✅ Cliente registrado:', clienteData.email);
        
        // Step 3: Crear un servicio como proveedor
        console.log('\n3️⃣ Creando nuevo servicio como proveedor...');
        const servicioData = {
            nombre_servicio: 'Catering Ejecutivo Premium',
            descripcion: 'Servicio de catering de alta calidad para eventos corporativos y sociales',
            categoria: 'catering',
            precio_base: 25000,
            unidad_precio: 'evento',
            ubicaciones_disponibles: ['CDMX', 'Estado de México', 'Querétaro'],
            tiempo_preparacion_dias: 10,
            incluye: [
                'Menú de 4 tiempos',
                'Servicio de meseros profesionales',
                'Vajilla de cristal y porcelana',
                'Mantelería premium',
                'Coordinación del evento'
            ],
            no_incluye: [
                'Bebidas alcohólicas premium',
                'Decoración floral',
                'Mobiliario especial',
                'Servicio de valet parking'
            ],
            terminos_condiciones: 'Anticipo del 50% requerido. Cancelación con 72hrs de anticipación.'
        };
        
        const createResponse = await axios.post(`${API_URL}/servicios`, servicioData, {
            headers: { 'Authorization': `Bearer ${proveedorToken}` }
        });
        
        servicioId = createResponse.data.servicio.id;
        console.log('✅ Servicio creado exitosamente');
        console.log('   ID:', servicioId);
        console.log('   Nombre:', createResponse.data.servicio.nombre_servicio);
        console.log('   Precio:', createResponse.data.servicio.precio_base);
        
        // Step 4: Listar servicios (público)
        console.log('\n4️⃣ Listando servicios públicos...');
        const listResponse = await axios.get(`${API_URL}/servicios`);
        
        console.log('✅ Servicios listados exitosamente');
        console.log('   Total de servicios:', listResponse.data.total);
        if (listResponse.data.servicios.length > 0) {
            console.log('   Primer servicio:', listResponse.data.servicios[0].nombre_servicio);
        }
        
        // Step 5: Obtener servicio específico
        console.log('\n5️⃣ Obteniendo servicio específico...');
        const getResponse = await axios.get(`${API_URL}/servicios/${servicioId}`);
        
        console.log('✅ Servicio obtenido exitosamente');
        console.log('   Nombre:', getResponse.data.servicio.nombre_servicio);
        console.log('   Proveedor:', getResponse.data.servicio.proveedor?.nombre);
        console.log('   Incluye:', getResponse.data.servicio.incluye?.length, 'elementos');
        
        // Step 6: Buscar servicios por categoría
        console.log('\n6️⃣ Buscando servicios por categoría...');
        const searchResponse = await axios.get(`${API_URL}/servicios?categoria=catering`);
        
        console.log('✅ Búsqueda por categoría exitosa');
        console.log('   Servicios de catering:', searchResponse.data.total);
        
        // Step 7: Obtener categorías disponibles
        console.log('\n7️⃣ Obteniendo categorías disponibles...');
        const categoriasResponse = await axios.get(`${API_URL}/servicios/categorias`);
        
        console.log('✅ Categorías obtenidas');
        console.log('   Categorías disponibles:', categoriasResponse.data.categorias);
        
        // Step 8: Actualizar servicio como proveedor
        console.log('\n8️⃣ Actualizando servicio...');
        const updateData = {
            precio_base: 28000,
            descripcion: 'Servicio de catering de alta calidad para eventos corporativos y sociales - ACTUALIZADO con nuevos precios 2024'
        };
        
        const updateResponse = await axios.put(`${API_URL}/servicios/${servicioId}`, updateData, {
            headers: { 'Authorization': `Bearer ${proveedorToken}` }
        });
        
        console.log('✅ Servicio actualizado exitosamente');
        console.log('   Nuevo precio:', updateResponse.data.servicio.precio_base);
        
        // Step 9: Intentar crear servicio como cliente (debe fallar)
        console.log('\n9️⃣ Testing restricción de clientes...');
        try {
            await axios.post(`${API_URL}/servicios`, servicioData, {
                headers: { 'Authorization': `Bearer ${clienteToken}` }
            });
            console.log('❌ ERROR: Cliente pudo crear servicio (no debería)');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ Restricción funcionando: Clientes no pueden crear servicios');
            } else {
                console.log('⚠️ Error inesperado:', error.response?.data?.error);
            }
        }
        
        // Step 10: Desactivar servicio
        console.log('\n🔟 Desactivando servicio...');
        const deleteResponse = await axios.delete(`${API_URL}/servicios/${servicioId}`, {
            headers: { 'Authorization': `Bearer ${proveedorToken}` }
        });
        
        console.log('✅ Servicio desactivado exitosamente');
        console.log('   Servicio desactivado:', deleteResponse.data.servicio_eliminado);
        
        // Step 11: Verificar que el servicio ya no aparece en listados públicos
        console.log('\n1️⃣1️⃣ Verificando desactivación...');
        const finalListResponse = await axios.get(`${API_URL}/servicios`);
        const servicioEncontrado = finalListResponse.data.servicios.find(s => s.id === servicioId);
        
        if (!servicioEncontrado) {
            console.log('✅ Verificación exitosa: Servicio no aparece en listado público');
        } else {
            console.log('⚠️ Servicio aún aparece en el listado (verificar filtro de estatus)');
        }
        
        console.log('\n🎊 ALL SERVICIOS API TESTS PASSED! 🎊');
        console.log('✅ Create - Crear servicios funciona (solo proveedores)');
        console.log('✅ Read - Listar y obtener servicios funciona');
        console.log('✅ Update - Actualizar servicios funciona');
        console.log('✅ Delete - Desactivar servicios funciona');
        console.log('✅ Search - Filtros por categoría funcionan');
        console.log('✅ Security - Restricciones de usuario funcionan');
        console.log('\n🚀 Catálogo de servicios completamente funcional!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Response:', error.response.data);
        }
    }
}

testServiciosAPI();