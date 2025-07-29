# Dockerfile para Plataforma de Eventos - MVP
FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Cambiar permisos
RUN chown -R nodeuser:nodejs /usr/src/app
USER nodeuser

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto (Railway usa $PORT dinámico)
EXPOSE $PORT

# Comando para iniciar la aplicación
CMD ["npm", "start"]