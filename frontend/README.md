# Frontend - Plataforma de Eventos

## Descripción
Interfaz de usuario para el sistema de autenticación de la Plataforma de Eventos MVP.

## Características
- ✅ **Registro de usuarios** (Clientes y Proveedores)
- ✅ **Login con JWT**  
- ✅ **Dashboard básico**
- ✅ **Información de perfil**
- ✅ **Campos específicos para proveedores**
- ✅ **Responsive design**

## Cómo usar

### 1. Iniciar el servidor frontend
```bash
npm run frontend
```

### 2. Abrir en el navegador
- Frontend: http://localhost:3001
- Backend API: https://plataforma-eventos-mvp.onrender.com/api

### 3. Probar la autenticación

#### Como Cliente:
1. Clic en "Regístrate aquí"
2. Llenar los campos básicos
3. Seleccionar "Cliente" como tipo de usuario
4. Registrarse y automáticamente hacer login

#### Como Proveedor:
1. Clic en "Regístrate aquí"  
2. Llenar los campos básicos
3. Seleccionar "Proveedor" como tipo de usuario
4. Llenar información adicional de la empresa
5. Registrarse y automáticamente hacer login

## Funcionalidades

### Registro
- Validación de campos requeridos
- Verificación de email único
- Hash seguro de contraseñas
- Campos específicos para proveedores
- Generación automática de JWT

### Login
- Verificación de credenciales
- Generación de JWT con expiración de 7 días
- Redirección automática al dashboard

### Dashboard
- Información del usuario logueado
- Datos específicos según tipo de usuario
- Opción de cerrar sesión

### Seguridad
- JWT almacenado en localStorage
- Verificación automática de tokens
- Logout automático en tokens expirados
- Headers de autorización para requests protegidos

## Próximos pasos
- [ ] Crear página de gestión de eventos
- [ ] Implementar catálogo de servicios  
- [ ] Sistema de cotizaciones
- [ ] Dashboard de rentabilidad para proveedores