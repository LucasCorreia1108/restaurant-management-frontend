# Restaurant Management Frontend

Frontend React para o backend NestJS `restaurant-management-api`.

## Stack

- React 19 + TypeScript + Vite
- Material UI 6
- React Router · TanStack Query · Zustand
- Socket.IO Client (`/realtime`)
- React Hook Form · Recharts · Notistack

## Pré-requisitos

1. API rodando em `http://localhost:3000`
2. Banco seedado (`npm run db:seed` na API)

## Como rodar

```bash
npm install
npm run dev
```

App: http://localhost:5173  
Swagger API: http://localhost:3000/docs

## Credenciais (seed da API)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin | admin@restaurant.com | Admin@123 |
| Garçom | waiter@restaurant.com | Waiter@123 |
| Cozinha | kitchen@restaurant.com | Kitchen@123 |
| Caixa | cashier@restaurant.com | Cashier@123 |

## Integração com a API

Variáveis em `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### Endpoints usados

| Módulo | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login` |
| Mesas | `GET /tables`, `POST /tables/:id/open`, `POST /tables/:id/request-bill` |
| Cardápio | `GET /menu?availableOnly=true` |
| Pedidos | `POST /orders`, `POST /orders/:id/send-to-kitchen`, `GET /orders` |
| Cozinha | `GET /kitchen/queue`, `POST /kitchen/orders/:id/preparing\|ready` |
| Caixa | `GET /payments/table/:id/bill`, `POST /payments/table` |
| Relatórios | `/reports/sales`, `top-menu-items`, `waiter-performance`, `orders-by-status`, `table-occupancy` |
| Garçons | `GET /waiters` (admin ao abrir mesa) |

### Socket.IO

Namespace: `/realtime`

Eventos: `order.created`, `order.sent`, `order.preparing`, `order.ready`, `order.delivered`, `order.closed`, `payment.completed`, `table.updated`

## Fluxo operacional

1. **Garçom** abre mesa → monta pedido → envia à cozinha  
2. **Cozinha** move ticket Recebido → Preparo → Pronto  
3. **Garçom** pode solicitar conta  
4. **Caixa** fecha mesa com PIX / dinheiro / débito / crédito  

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
