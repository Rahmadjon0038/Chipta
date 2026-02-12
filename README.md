# Travel Ticket Backend (Express + SQLite)

Demo loyiha: sayohatlar uchun online chipta sotib olish backend API.

## Features

- Register/Login (telefon + parol)
- JWT Access Token + Refresh Token
- Public tickets list va ticket detail (`id` bo'yicha)
- Cart (savatchaga qo'shish, yangilash, o'chirish)
- Profile (`/api/users/me`)
- Admin panel API (ticket create/update/delete)
- Swagger documentation (`/api/docs`)

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

Server: `http://localhost:4000`
Swagger: `http://localhost:4000/api/docs`

## Default Admin

- phone: `+998900000000`
- password: `admin12345`

## Main Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/tickets` (public)
- `GET /api/tickets/:id` (public)
- `GET /api/users/me` (auth)
- `GET /api/cart` (auth)
- `POST /api/cart` (auth)
- `PATCH /api/cart/:id` (auth)
- `DELETE /api/cart/:id` (auth)
- `POST /api/tickets` (admin)
- `PATCH /api/tickets/:id` (admin)
- `DELETE /api/tickets/:id` (admin)
