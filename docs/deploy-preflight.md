# Production Deploy Notes

production deploy の前提、環境変数、CORS、migration 実行方式、動作確認結果をまとめる。
実際の secret / password / full `DATABASE_URL` は記載しない。

## Production Structure

```txt
Frontend: Vercel
Backend: Render
Database: Neon
```

Production URL:

- Frontend: https://my-task-app-psi-seven.vercel.app
- Backend API: https://my-app-backend-uugs.onrender.com

## Frontend

Vercel では以下の environment variable を設定する。

```env
VITE_API_BASE_URL=https://my-app-backend-uugs.onrender.com
```

未設定時は local development 用に `http://localhost:8080` を使用する。

Vercel では `frontend/vercel.json` により、`/login` / `/register` / `/tasks` などの direct access / reload を SPA に rewrite する。

## Backend

Render では以下の environment variables を設定する。

```env
FRONTEND_URL=https://my-task-app-psi-seven.vercel.app
GIN_MODE=release
JWT_SECRET=your-secret
DATABASE_URL=postgresql://your-neon-user:your-neon-password@your-neon-host/your-neon-database?sslmode=require
```

Production deploy では `DATABASE_URL` を DB 接続 DSN として使用する。
`DATABASE_URL` が未設定の場合は、local Docker development 用に `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` から DSN を組み立てる。

Local Docker development では以下の分割 environment variables を引き続き使用する。

```env
DB_HOST=db
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=mydb
```

## CORS

Backend の CORS は `FRONTEND_URL` を許可 origin として使用する。
Render の `FRONTEND_URL` には Vercel の production origin を設定する。

## Migration

Backend 起動時に `db.RunMigrations` が実行され、`backend/db/migrations` 配下の SQL が順に適用される。
Neon 初期 DB では、Render backend 起動時に DB 接続が成功すれば migration が実行される。

## Deploy Checks

deploy フェーズで以下を確認済み。

- `frontend` の production build が成功する
- `backend` の build と起動確認が成功する
- `VITE_API_BASE_URL` 未設定時に localhost fallback する
- `VITE_API_BASE_URL` 設定時に API URL が切り替わる
- Render の `FRONTEND_URL` に Vercel origin を設定できる
- Production DB 接続では `DATABASE_URL` を設定できる
- `DATABASE_URL` 未設定時は分割 env 方式に fallback する
- Neon DB に `schema_migrations` / `users` / `tasks` が作成される
- Render backend が production API として HTTP 応答する
- Vercel frontend から Render backend / Neon DB と連携して操作できる

## Production UI Checks

production 環境で以下を確認済み。

- register
- login
- logout
- task 作成
- task 一覧取得
- task 更新
- task 完了切替
- task 削除
- validation error 表示
- unauthorized redirect
- Vercel SPA routing
- browser console に致命的 error がないこと
