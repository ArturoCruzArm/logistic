# 🚀 SETUP PASO A PASO - 15 MINUTOS

## ✅ **PRE-REQUISITOS (YA TIENES)**
- [x] Node.js instalado
- [x] GitHub account creado
- [x] Código del proyecto listo
- [x] Servidores locales funcionando

---

## 1️⃣ **CREAR PROYECTO SUPABASE** (5 min)

### Paso 1.1: Ir a Supabase
1. Abrir: https://supabase.com
2. Click en "Start your project"
3. Sign up con GitHub (recomendado) o email

### Paso 1.2: Crear Proyecto
1. Click "Create a new project"
2. Seleccionar tu organización
3. Configurar:
   - **Project name**: `plataforma-eventos-mvp`
   - **Database Password**: Generar una fuerte y **guardarla**
   - **Region**: Seleccionar la más cercana
4. Click "Create new project"
5. **Esperar 2-3 minutos** a que se configure

### Paso 1.3: Obtener Credenciales  
1. Una vez listo, ir a **Settings** (engrane) → **API**
2. Copiar y guardar:
   - **Project URL** (ej: `https://abcdefgh.supabase.co`)
   - **anon public** key (muy largo, empieza con `eyJhbGciOiJIUzI1NiIs`)
   - **service_role** key (muy largo, empieza con `eyJhbGciOiJIUzI1NiIs`)

---

## 2️⃣ **CONFIGURAR CREDENCIALES** (2 min)

### Opción A: Script Automático (Recomendado)
```bash
npm run setup:env
# Seguir las instrucciones en pantalla
# Pegar las credenciales cuando se soliciten
```

### Opción B: Manual
1. Abrir archivo `.env` en el editor
2. Reemplazar las líneas:
```env
SUPABASE_URL=https://tu-proyecto-real.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-real-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-real-aqui
```

---

## 3️⃣ **CONFIGURAR SUPABASE** (3 min)

### Paso 3.1: Verificar Conexión
```bash
npm run setup:supabase
```
**Esperado**: Mensaje de "✅ Conexión exitosa a Supabase"

### Paso 3.2: Crear Esquema de Base de Datos
1. Ir a Supabase dashboard
2. Click en **SQL Editor** (en el sidebar)
3. Click **New query**
4. Copiar TODO el contenido de: `database/schema.sql`
5. Pegar en el editor
6. Click **Run** (Ctrl+Enter)
7. **Verificar**: Debe mostrar "Success. No rows returned" al final

### Paso 3.3: Verificar Tablas Creadas
1. Ir a **Table Editor**
2. **Verificar** que aparezcan las tablas:
   - usuarios
   - eventos  
   - servicios
   - cotizaciones
   - y 5 más

---

## 4️⃣ **DEPLOY RENDER** (5 min)  

### Paso 4.1: Crear archivo render.yaml
**Crear archivo `render.yaml` en la raíz del proyecto:**
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

### Paso 4.2: Subir a GitHub
```bash
git add .
git commit -m "Setup para Render deploy"
git push origin main
```

### Paso 4.3: Configurar en Render.com
1. Ir a **https://render.com**
2. Crear cuenta gratuita (usar GitHub)
3. Click **"New"** > **"Web Service"**
4. Conectar tu repositorio GitHub
5. Configurar:
   - **Name**: `plataforma-eventos-mvp`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### Paso 4.4: Configurar Variables de Entorno
**En Render Dashboard > Environment Variables, agregar:**
- `SUPABASE_URL` = `https://tu-proyecto.supabase.co`
- `SUPABASE_ANON_KEY` = `tu-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY` = `tu-service-role-key`
- `JWT_SECRET` = `366295224451ff8dd4baea37554426b2d3ffd6c7b9d217068ba9397e5800a46f10baebd4cc4796dc437e4b67075ca4bb04f8ac92cd18fc3161f1d727c2fb6d7c`
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `ALLOWED_ORIGINS` = `https://plataforma-eventos-mvp.onrender.com`

### Paso 4.5: Deploy Automático
**Render hace deploy automático:**
- Monitorear en Dashboard > Events
- URL final: `https://plataforma-eventos-mvp.onrender.com`
- **Primer deploy tarda 5-10 minutos**

---

## 5️⃣ **VERIFICAR FUNCIONAMIENTO** (2 min)

### Test 1: Backend Local + Supabase
```bash
curl http://localhost:3003/api/test-db
```
**Esperado**: `{"message": "Conexión a Supabase exitosa", "database": "Connected"}`

### Test 2: Backend en Render
```bash
curl https://plataforma-eventos-mvp.onrender.com/health
```
**Esperado**: `{"status": "healthy", ...}`

### Test 3: Conexión Completa Render + Supabase
```bash
curl https://plataforma-eventos-mvp.onrender.com/api/test-db
```
**Esperado**: `{"message": "Conexión a Supabase exitosa", "database": "Connected"}`

### Test 4: Frontend Local → Backend Render
1. Ir a: http://localhost:3000
2. **Verificar**: Debe mostrar "✅ API Conectada" 
3. **Ver**: Estado del sistema en verde

---

## ✅ **RESULTADO FINAL**

Si todos los tests pasan, tendrás:

🎯 **Backend completo funcionando en Render (GRATIS)**
🎯 **Base de datos PostgreSQL en Supabase**  
🎯 **Frontend local conectado**
🎯 **Sistema de costos transparentes listo para implementar**

---

## 🆘 **TROUBLESHOOTING**

### Error: "connection failed"
- Verificar credenciales en .env
- Verificar que el proyecto Supabase esté activo

### Error: "Service sleeping" en Render
- Render free tier "duerme" tras 15 min inactividad
- Se "despierta" automáticamente con el primer request
- Es normal, no es un error

### Error: "table doesn't exist"
- Ejecutar completamente el archivo `database/schema.sql`
- Verificar en Table Editor que las tablas se crearon

### Error: "build failed" en Render
- Verificar que `package.json` tenga script `"start": "node server.js"`
- Verificar que todas las variables estén configuradas
- Ver logs en Dashboard > Events
- Verificar que `PORT=10000` (requerido por Render)

---

## 📞 **SIGUIENTE PASO**

Una vez completado, el MVP estará **45% completo** y listo para implementar:
1. **Autenticación** de usuarios
2. **Sistema de costos** transparentes  
3. **Análisis de rentabilidad**
4. **Interface de cotizaciones**

**Tiempo estimado para MVP completo**: 4-5 semanas adicionales