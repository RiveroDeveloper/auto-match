# Stage 1: Build de la aplicación React
FROM node:20-alpine as builder

WORKDIR /app

# Argumento de build para VITE_API_URL
ARG VITE_API_URL=http://localhost:8000/car-store/api/v1/
ENV VITE_API_URL=$VITE_API_URL

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Stage 2: Servidor Nginx
FROM nginx:alpine

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos build desde el stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando por defecto (nginx ya está configurado para iniciar automáticamente)
CMD ["nginx", "-g", "daemon off;"]

