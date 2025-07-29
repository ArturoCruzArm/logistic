# Plataforma de Eventos Sociales - MVP

Sistema de gestión de eventos sociales con **estructura de costos transparente** como diferenciador clave.

## 🎯 Características Principales

- **Transparencia Total de Costos**: Desglose completo de todos los gastos con justificación obligatoria
- **Análisis de Rentabilidad**: Cálculo automático de viabilidad empresarial para proveedores
- **Citas de Proceso**: Inclusión de reuniones previas y costos de traslado en la cotización
- **Sistema de Depreciación**: Cálculo automático de depreciación de inversiones del proveedor

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express 4.x**
- **Supabase** (PostgreSQL + Auth + Storage)
- **Railway** para hosting gratuito

### Frontend
- **Next.js 14** con **TypeScript**
- **Tailwind CSS** para estilos
- **React 18**

### Base de Datos
- **PostgreSQL** (via Supabase)
- 9 entidades core para MVP
- Sistema de depreciación automático

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- npm o yarn  
- Cuenta en Supabase (gratuita)
- Cuenta en Railway (gratuita)
- Railway CLI: `npm install -g @railway/cli`

### Setup Rápido con CLI

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno  
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 3. Setup Railway (requiere login interactivo)
npm run setup:railway

# 4. Setup Supabase (después de crear proyecto web)
npm run setup:supabase

# 5. Desarrollo local
npm run dev

# 6. Deploy a Railway
railway up
```

### Backend Manual

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Desarrollo
npm run dev

# Producción
npm start
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## 📋 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# JWT Configuration
JWT_SECRET=tu-super-secreto-jwt-key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3002
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://tu-dominio.com
```

## 🗄️ Base de Datos

### Setup Inicial

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar el script `database/schema.sql` en el SQL Editor
3. Configurar variables de entorno

### Entidades Core (MVP)

1. **usuarios** - Clientes y proveedores
2. **eventos** - Eventos sociales a organizar
3. **categorias_servicio** - Categorías de servicios
4. **servicios** - Servicios ofrecidos por proveedores
5. **citas_proceso** - Reuniones previas obligatorias
6. **inversiones_proveedor** - Inversiones para depreciación
7. **conceptos_costo** - Conceptos detallados con justificación
8. **cotizaciones** - Cotizaciones con desglose transparente
9. **analisis_rentabilidad** - Análisis automático de viabilidad

## 🔧 APIs Implementadas

### Estado Actual: Estructura Básica Lista

- `GET /` - Info de la API
- `GET /health` - Health check
- `GET /api/test-db` - Test conexión Supabase
- `GET /api/status` - Estado de desarrollo

### Próximas APIs (Semana 2):

- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login  
- `GET /api/eventos` - Listar eventos
- `POST /api/eventos` - Crear evento
- `GET /api/servicios` - Listar servicios
- `POST /api/cotizaciones` - Crear cotización

## 🚢 Deploy

### Railway (Backend) - Método CLI

```bash
# Setup automático
npm run setup:railway

# O manual:
railway login
railway new plataforma-eventos-mvp  
railway link
railway variables set SUPABASE_URL="tu-url"
railway variables set SUPABASE_ANON_KEY="tu-key"
# ... más variables
railway up
```

### Vercel (Frontend)

```bash
cd frontend

# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 📊 Progreso del Desarrollo

Ver [SEGUIMIENTO_DESARROLLO.md](./SEGUIMIENTO_DESARROLLO.md) para el estado actual.

**Estado actual**: 25% completado (Stack técnico configurado)

### ✅ Completado
- [x] Servidor Express funcionando
- [x] Frontend Next.js con TypeScript
- [x] Esquema de base de datos diseñado
- [x] Configuración para Railway/Vercel

### 🔄 En Progreso
- [ ] Configuración final de Supabase
- [ ] Implementación de autenticación

### ⏭️ Próximo
- [ ] Sistema de costos transparentes
- [ ] Análisis de rentabilidad
- [ ] Interface de usuario para cotizaciones

## 🏗️ Estructura del Proyecto

```
/
├── README.md                    # Este archivo
├── SEGUIMIENTO_DESARROLLO.md    # Tracking de progreso
├── server-production.js         # Servidor para producción
├── server-simple.js            # Servidor para desarrollo
├── package.json
├── Dockerfile                  # Configuración Railway
├── database/
│   └── schema.sql              # Esquema de BD completo
├── config/
│   └── database.js             # Configuración Supabase
├── routes/                     # Rutas de la API
│   ├── auth.js
│   ├── eventos.js
│   ├── servicios.js
│   ├── cotizaciones.js
│   └── proveedores.js
└── frontend/                   # Frontend Next.js
    ├── src/
    │   ├── app/
    │   ├── components/
    │   └── lib/
    └── package.json
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para reportar bugs o solicitar features:
- Abrir issue en GitHub
- Contactar al equipo de desarrollo

---

**Nota**: Este es un MVP (Producto Mínimo Viable) enfocado en demostrar la funcionalidad core de transparencia de costos. Funcionalidades adicionales se implementarán en versiones futuras.