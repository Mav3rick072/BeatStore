# Imagen base de Python
FROM python:3.13-slim

# Evita que Python genere archivos .pyc
ENV PYTHONDONTWRITEBYTECODE=1

# Muestra los logs inmediatamente
ENV PYTHONUNBUFFERED=1

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar dependencias
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto
EXPOSE 8001

# Ejecutar FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]