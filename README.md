# BeatStore — Punto de venta para tienda de instrumentos musicales

Sistema POS completo: dos backends independientes que se comunican por HTTP REST,
un frontend en React con paleta propia, y MongoDB como única base de datos.

```
React (frontend)
      │  HTTP/Axios
      ▼
NestJS (main-api)
      │  HTTP REST interno
      ▼
FastAPI (inventory-api)
      │
      ▼
   MongoDB
```

## Arquitectura y responsabilidades

| Servicio | Tecnología | Responsable de |
|---|---|---|
| `frontend` | React 19 + Vite + TS + Bootstrap | Interfaz de usuario (login, dashboard, POS, catálogo, caja, clientes, devoluciones, alquileres, fidelidad, reportes, usuarios) |
| `services/main-api` | NestJS 11 + Mongoose + JWT | Auth, usuarios, clientes, caja, ventas, pagos, devoluciones, alquileres, fidelidad, reportes, y **proxy de catálogo** hacia inventory-api |
| `services/inventory-api` | FastAPI + PyMongo | Productos, categorías, marcas, proveedores, stock, movimientos, reservas |
| `mongodb` | MongoDB 8.0 | Única base de datos (`beatstore` y `beatstore_inventory`) |

El frontend **nunca** consume `inventory-api` directamente: todo pasa por `main-api`
(incluido el catálogo, a través del módulo `catalog` que actúa como proxy).

## Paleta de color

Inspirada en un escenario musical: violeta profundo de telón/luces + dorado ámbar de
latón y madera de instrumentos.

| Color | Uso | Hex |
|---|---|---|
| Violeta primario | Marca, botones principales, sidebar | `#3B2C6E` |
| Violeta oscuro | Sidebar, hover | `#1B1030` |
| Ámbar (acento) | Acciones destacadas, alertas positivas | `#F2A93B` |
| Fondo | Fondo general de la app | `#F6F4FB` |

Definida en `frontend/src/styles/theme.css`.

## Flujo de una venta (demostración de comunicación entre servidores)

1. React envía la venta a `POST /api/v1/sales` en NestJS.
2. NestJS valida que haya una caja abierta.
3. NestJS pide a FastAPI **reservar** el stock de cada producto.
4. NestJS registra la venta como `PENDING`.
5. NestJS pide a FastAPI **confirmar** la reserva → FastAPI descuenta el stock real.
6. NestJS marca la venta como `COMPLETED`, actualiza el arqueo de caja y otorga puntos de fidelidad.
7. Si el paso 5 falla, NestJS libera la reserva y marca la venta como `CANCELLED`.

```bash
docker compose logs -f main-api inventory-api
```

## Cómo levantar el proyecto

Requisitos: Docker Desktop.

```bash
git clone https://github.com/Mav3rick072/BeatStore.git
cd BeatStore
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| main-api (Swagger) | http://localhost:3000/api/docs |
| inventory-api (Swagger) | http://localhost:8001/docs |
| Mongo Express | http://localhost:8081 (admin / admin123) |

## Datos de prueba

```bash
docker compose exec main-api npm run seed
docker compose exec inventory-api python scripts/seed.py
```

| Correo | Contraseña | Rol |
|---|---|---|
| admin@beatstore.com | BeatStore123 | ADMIN |
| gerente@beatstore.com | BeatStore123 | MANAGER |
| cajero@beatstore.com | BeatStore123 | CASHIER |

## Pantallas del frontend

- **Login** — autenticación JWT real contra `main-api`.
- **Dashboard** — estado de caja, ventas del día, stock bajo, accesos rápidos.
- **Punto de venta (POS)** — búsqueda de productos, carrito, cliente opcional, pago efectivo/tarjeta.
- **Historial de ventas**, **Productos**, **Inventario bajo**, **Clientes**, **Caja registradora**,
  **Devoluciones**, **Alquileres**, **Programa de fidelidad**.
- **Reportes** (ADMIN/MANAGER) y **Usuarios** (solo ADMIN) — protegidos por rol con `ProtectedRoute`.

## Pruebas

```bash
# main-api
docker compose exec main-api npm run test

# inventory-api
docker compose exec inventory-api pytest
```

Verificado en este entorno: `tsc --noEmit`, `nest build`, `npm run test` (13/13 ✅) en
main-api; `vite build` y `tsc -b` sin errores en frontend; inventory-api importa con
sus 30 rutas registradas.

## Estado del proyecto

Backend completo (ambos servicios) + frontend completo integrado para el alcance
original: autenticación con roles, catálogo, inventario con reservas idempotentes,
caja, ventas, devoluciones, alquileres, programa de fidelidad, reportes y usuarios.
