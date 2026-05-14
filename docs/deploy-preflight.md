# Deploy Preflight Notes

Issue #206 では、deploy 実施前の env、CORS、production build、migration 実行方式を確認する。
実deploy、DB schema変更、API仕様変更、backendの `DATABASE_URL` 対応は扱わない。

## Frontend

Vercel では以下の environment variable を設定する。

```env
VITE_API_BASE_URL=https://your-render-backend.example.com
```

未設定時は local development 用に `http://localhost:8080` を使用する。

## Backend

Render では以下の environment variables を設定する。

```env
FRONTEND_URL=https://your-vercel-frontend.example.com
GIN_MODE=release
JWT_SECRET=your-secret
DB_HOST=your-neon-host
DB_PORT=5432
DB_USER=your-neon-user
DB_PASSWORD=your-neon-password
DB_NAME=your-neon-database
```

現在の backend は `DATABASE_URL` ではなく、`DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` から DB 接続 DSN を組み立てる。
`DATABASE_URL` 対応は DB 接続責務の変更を伴うため、別 Issue で扱う。

## CORS

Backend の CORS は `FRONTEND_URL` を許可 origin として使用する。
Production deploy 時は、Render の `FRONTEND_URL` に Vercel の production origin を設定する。

## Migration

Backend 起動時に `db.RunMigrations` が実行され、`backend/db/migrations` 配下の SQL が順に適用される。
Neon 初期 DB では、Render backend 起動時に DB 接続が成功すれば migration が実行される。

## Preflight Checks

Deploy 前に以下を確認する。

- `frontend` の production build が成功する
- `backend` の build と起動確認が成功する
- `VITE_API_BASE_URL` 未設定時に localhost fallback する
- `VITE_API_BASE_URL` 設定時に API URL が切り替わる
- Render の `FRONTEND_URL` に Vercel origin を設定できる
- DB 接続 env は現状の分割 env 方式で整理されている
