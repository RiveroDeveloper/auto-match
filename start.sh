#!/bin/bash
set -e

echo "==> Aplicando migraciones..."
cd /app/backend
python manage.py migrate --noinput

echo "==> Recopilando estáticos..."
python manage.py collectstatic --noinput || true

echo "==> Iniciando Nginx..."
nginx -g 'daemon off;' &

echo "==> Iniciando Gunicorn (Django)..."
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
