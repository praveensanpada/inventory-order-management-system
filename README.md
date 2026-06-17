# Inventory and Order Management System

This is a full stack Inventory and Order Management System built for the Ethara AI Software Engineer assessment.

The app helps manage products, customers, orders, and inventory stock. When an order is created, the backend checks available stock, calculates the total amount, and reduces product quantity automatically.

## Tech Stack

- Frontend: React, Vite, Material UI
- Backend: FastAPI, Python, SQLAlchemy, Alembic
- Database: PostgreSQL
- Auth: JWT login with protected APIs
- DevOps: Docker and Docker Compose

## Features

- Admin login
- Add, view, update, and delete products
- Add, view, and delete customers
- Create orders
- View orders and order details
- Stock validation before order creation
- Automatic stock reduction after order creation
- Dashboard with product, customer, order, low stock, and inventory value summary
- Responsive UI for desktop and mobile

## Default Login

```text
Email: admin@ethara.ai
Password: Ethara@12345
```

The password is not stored directly in the database. The backend stores a hashed password.

## Project Structure

```text
inventory-order-system/
  backend/
  frontend/
  docs/
  docker-compose.yml
  dockerhub.txt
  data.txt
```

## Backend Setup

Go to backend folder:

```bash
cd backend
```

Create and update `.env`:

```bash
cp .env.example .env
```

Run backend:

```bash
./setup_and_run.sh
```

Backend will run on:

```text
http://localhost:5000
```

Swagger API docs:

```text
http://localhost:5000/docs
```

Health check:

```text
http://localhost:5000/health
```

## Frontend Setup

Go to frontend folder:

```bash
cd frontend
```

Create and update `.env`:

```bash
cp .env.example .env
```

Run frontend:

```bash
./setup_and_run.sh
```

Frontend will run on:

```text
http://localhost:3000
```

## Docker Setup

From the project root:

```bash
docker compose up --build
```

This starts:

- Frontend
- Backend
- PostgreSQL database

## Main API Routes

Products:

```text
POST /products
GET /products
GET /products/{id}
PUT /products/{id}
DELETE /products/{id}
```

Customers:

```text
POST /customers
GET /customers
GET /customers/{id}
DELETE /customers/{id}
```

Orders:

```text
POST /orders
GET /orders
GET /orders/{id}
DELETE /orders/{id}
```

Dashboard:

```text
GET /dashboard/summary
```

Versioned routes are also available with `/api/v1`, for example:

```text
/api/v1/products
```

## Sample Product Data

I added a `data.txt` file with 50 sample products. It can be used to quickly add products while testing the app.

## Docker Hub

Docker Hub push steps are written in:

```text
dockerhub.txt
```

## Deployment Plan

- Backend: Render
- Frontend: Vercel
- Database: Neon PostgreSQL
- Backend Docker image: Docker Hub

Required final submission items:

- GitHub repository link
- Backend Docker Hub image link
- Frontend hosted URL
- Backend API hosted URL

## Notes

- Database credentials are loaded from environment variables.
- Product SKU is unique.
- Customer email is unique.
- Product stock cannot go below zero.
- Orders cannot be created if stock is not enough.
- Backend calculates order total amount, not the frontend.
