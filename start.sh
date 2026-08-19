#!/bin/bash
set -e

echo "==> Aplicando migraciones..."
cd /app/backend
python manage.py migrate --noinput

echo "==> Recopilando estáticos..."
python manage.py collectstatic --noinput || true

# Render asigna el puerto de escucha en $PORT (default 10000)
# Inyectar ${PORT} en el config de nginx
export PORT="${PORT:-10000}"
echo "==> Puerto de escucha: $PORT"
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf > /tmp/nginx-render.conf
cp /tmp/nginx-render.conf /etc/nginx/conf.d/default.conf

echo "==> Iniciando Nginx..."
nginx -g 'daemon off;' &

echo "==> Iniciando Gunicorn (Django) en 127.0.0.1:8000 (solo interno)..."
exec gunicorn backend.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
