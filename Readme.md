# 📄 Contract Management API

An Express.js + Bun backend with Supabase Postgres and Drizzle ORM to manage contracts — including uploading, filtering, updating, deleting, and real-time WebSocket updates. Optimized for dashboards and API-first frontend apps.

---

## 🚀 Features

- Upload and manage contract data (JSON or file)
- Filter/search by status, client, ID
- Pagination support
- Dashboard summary endpoint
- Real-time updates via WebSocket
- Swagger API docs
- PostgreSQL with Drizzle ORM
- Fully dockerized

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/adityapandey9/mini-contract-api.git
cd mini-contract-api
```

### 2. Install dependencies using Bun

```bash
bun install
```

### 3. Set up environment variables

Create a `.env` file at the root with:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

> Get `DATABASE_URL` from Supabase → Project Settings → Database

---

## 🛠️ Local Development

### 1. Push the schema to Supabase

If using Drizzle ORM:

```bash
bun run db:push
```

### 2. Start the dev server

```bash
bun run dev
```

or

```bash
bun index.js
```

Server will start at `http://localhost:3000`

---

## 🔌 API Reference

### Swagger Docs

Once the server is running:

📄 `http://localhost:3000/docs`

---

## 🧪 Testing APIs

You can use:

- `curl` commands (see test section)
- Postman collection (optional)
- WebSocket clients for real-time updates

---

## 🐳 Docker Usage

### Build and Run

```bash
docker build -t contract-api .
docker run -p 3000:3000 --env-file .env contract-api
```

---

## 📡 WebSocket

WebSocket URL: `ws://localhost:3000`

### To subscribe to client updates:

```json
{
  "type": "subscribe",
  "clientName": "Alice"
}
```

---

## 📁 Folder Structure

```
├── index.js                  # Entry point
├── .env                      # Env variables
├── drizzle/                  # Drizzle schema & migrations
├── db/
│   └── client.js             # PostgreSQL connection via Drizzle
├── controllers/
│   └── contracts.js
├── routes/
│   └── contracts.js
│   └── dashboard.js
├── middleware/
│   └── errorHandler.js
├── swagger.yaml              # API Documentation
├── Dockerfile
```

---

## 📦 Scripts

```json
"scripts": {
  "start": "bun index.js",
  "dev": "bun --watch index.js",
  "db:push": "bunx drizzle-kit push",
  "db:migrate": "bunx drizzle-kit generate:pg"
}
```

---

## 🧠 Powered By

- [Express.js](https://expressjs.com/)
- [Bun](https://bun.sh/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Supabase](https://supabase.com/)
- [WebSocket](https://github.com/websockets/ws)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

## 💬 Questions or Improvements?

Feel free to open issues or submit PRs. Happy coding!