# BeatStore - Inventory API

Microservicio encargado de la administración del inventario para el sistema BeatStore.

## Descripción

Inventory API es un microservicio desarrollado con **FastAPI** y **MongoDB**, encargado de administrar el catálogo de productos, categorías, marcas, proveedores, inventario, movimientos y reservas de stock.

Este servicio forma parte de la arquitectura de microservicios del proyecto BeatStore y se comunica con el Backend Principal desarrollado en NestJS mediante una API REST.

---

## Tecnologías

- Python 3.13
- FastAPI
- MongoDB
- PyMongo
- Pydantic
- Docker
- Docker Compose
- Git
- GitHub

---

## Arquitectura

React (Frontend)
↓
NestJS (Main API)
↓
FastAPI (Inventory API)
↓
MongoDB

---

## Estructura del proyecto

inventory-api/

├── app/

│ ├── api/

│ ├── core/

│ ├── database/

│ ├── models/

│ ├── repositories/

│ ├── schemas/

│ ├── services/

│ ├── utils/

│ └── main.py

├── tests/

├── requirements.txt

├── Dockerfile

├── .env.example

└── README.md

---

## Instalación

Instalar las dependencias:

```bash
pip install -r requirements.txt
```

---

## Variables de entorno

Crear un archivo `.env` a partir de `.env.example`.

---

## Ejecutar el proyecto

Más adelante el proyecto podrá ejecutarse mediante Docker Compose:

```bash
docker compose up --build
```

Durante el desarrollo también podrá ejecutarse con Uvicorn.

---

## Documentación

Cuando el proyecto esté ejecutándose, la documentación estará disponible en:

Swagger UI

http://localhost:8001/docs

ReDoc

http://localhost:8001/redoc

---

## Equipo

Proyecto desarrollado para la materia correspondiente.

Backend Principal
Carlos

Frontend
Daphne

Inventory API
Abraham

---

## Estado

Sprint 0A - Infraestructura