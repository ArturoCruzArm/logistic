# INSTRUCCIONES DE SETUP - CLI

## 🎨 Render Setup (Gratis)

### 1. Preparar el proyecto
**Crear archivo `render.yaml` en la raíz:**
```yaml
services:
  - type: web
    name: plataforma-eventos-mvp
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### 2. Subir a GitHub
```bash
git add .
git commit -m "Setup inicial para Render"
git push origin main
```

### 3. Configurar en Render.com
1. Ir a **https://render.com**
2. Crear cuenta gratuita
3. **"New"** > **"Web Service"**
4. Conectar repositorio GitHub
5. Configurar:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### 4. Configurar variables de entorno
**En Render Dashboard > Environment Variables:**
- `SUPABASE_URL` = `https://tu-proyecto.supabase.co`
- `SUPABASE_ANON_KEY` = `tu-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY` = `tu-service-role-key`
- `JWT_SECRET` = `un-secreto-muy-seguro-aqui`
- `NODE_ENV` = `production`
- `PORT` = `10000`

### 5. Deploy automático
**Render hace deploy automático desde GitHub**
- URL final: `https://plataforma-eventos-mvp.onrender.com`

## 🏗️ Supabase Setup

### 1. Crear proyecto manualmente
1. Ir a https://supabase.com
2. Sign up/Login
3. Create new project
4. Nombre: "plataforma-eventos-mvp"
5. Database password: generar una segura
6. Region: seleccionar la más cercana

### 2. Obtener credenciales
En el dashboard de Supabase:
- Settings → API
- Copiar:
  - Project URL
  - anon public key
  - service_role key (secret)

### 3. Ejecutar esquema de base de datos
```sql
-- En Supabase SQL Editor, ejecutar el contenido de:
-- database/schema.sql
```

### 4. Configurar RLS (Row Level Security)
```sql
-- Habilitar RLS en tablas necesarias
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas (ejemplo para usuarios)
CREATE POLICY "Users can view own profile" ON usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON usuarios
    FOR UPDATE USING (auth.uid() = id);
```

## 🔧 Variables de Entorno Locales

Actualizar `.env` con las credenciales obtenidas:

```env
# Supabase Configuration (obtener del dashboard)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET=tu-super-secreto-jwt-muy-largo-y-seguro-aqui
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3002
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://tu-app.onrender.com
```

## ✅ Verificación del Setup

### 1. Test local
```bash
# Backend
npm run dev
# Abrir: http://localhost:3002/health

# Frontend (en otra terminal)
cd frontend
npm run dev
# Abrir: http://localhost:3000
```

### 2. Test conexión a Supabase
```bash
curl http://localhost:3002/api/test-db
# Debe devolver: {"message": "Conexión a Supabase exitosa"}
```

### 3. Test deploy Render
**Ver logs en Render Dashboard > Events**

## 🔄 Comandos Útiles

### Render
**Comandos disponibles en Dashboard web:**
- **Events**: Ver logs de deploy
- **Environment**: Gestionar variables
- **Settings**: Configuración del servicio
- **Connect**: URL del proyecto

### Testing Local
```bash
# Backend
npm run dev              # Desarrollo con nodemon
npm start               # Producción
npm run dev:full        # Desarrollo con todas las rutas

# Frontend
cd frontend
npm run dev             # Next.js desarrollo
npm run build           # Build para producción
npm run start           # Servir build de producción
```

## 🚨 Troubleshooting

### Error de conexión a Supabase
1. Verificar que las URLs no tengan espacios extra
2. Verificar que las keys estén completas
3. Verificar que el proyecto Supabase esté activo

### Error de deploy en Render
1. Verificar que `package.json` tenga script `"start"`
2. Verificar que todas las variables estén configuradas
3. Ver logs en Dashboard > Events
4. Verificar que `PORT=10000` (requerido por Render)

### Error de CORS
1. Agregar el dominio de Render a ALLOWED_ORIGINS
2. Verificar que el frontend apunte a la URL correcta del backend
3. URL típica: `https://nombre-proyecto.onrender.com`