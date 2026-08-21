# ============================================================
# AutoMatch - Deploy en Render.com (contenedor combinado)
# Nginx sirve el frontend y hace proxy al backend Django
# ============================================================

# ---- Etapa 1: Build del frontend React ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ARG VITE_API_URL=/car-store/api/v1/
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_AUTH_DISABLED=true
ENV VITE_AUTH_DISABLED=$VITE_AUTH_DISABLED
RUN npm run build

# ---- Etapa 2: Runtime combinado (Nginx + Django) ----
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt gunicorn

COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY start.sh /start.sh

RUN chmod +x /start.sh && mkdir -p /app/backend/static

CMD ["/start.sh"]
