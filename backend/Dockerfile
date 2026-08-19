# Multi-stage build para optimizar tamaño de imagen
FROM python:3.12-slim as builder

# Instalar dependencias del sistema necesarias para compilar paquetes Python
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar requirements y instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage final: imagen de producción
FROM python:3.12-slim

# Instalar dependencias del sistema para runtime
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario no-root para seguridad
RUN useradd -m -u 1000 django && \
    mkdir -p /app /app/static /app/media && \
    chown -R django:django /app

# Copiar dependencias instaladas desde builder
COPY --from=builder /root/.local /home/django/.local

# Establecer variables de entorno
ENV PATH=/home/django/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Establecer directorio de trabajo
WORKDIR /app

# Copiar código de la aplicación
COPY --chown=django:django . .

# Cambiar a usuario no-root
USER django

# Exponer puerto
EXPOSE 8000

# Comando por defecto
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]





