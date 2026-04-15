# My App

## 📝 概要
React + Go + PostgreSQL + Dockerで構築した個人用Webアプリです。

## 🚀 使用技術

### Frontend
- React
- Vite

### Backend
- Go (Gin)
- GORM

### Database
- PostgreSQL

### Infrastructure
- Docker / Docker Compose

## 🔗 API

- GET /users
- POST /users

詳細は[API仕様](./docs/api.md)を参照


### 技術選定理由
- React: モダンなフロントエンド開発を学ぶため
- Go: 高速でシンプルなバックエンド開発を体験するため
- Docker: 環境構築を統一し、再現性を高めるため

## 📂 ディレクトリ構成
```
.
├── backend
│   ├── db
│   └── models
├── db
└── frontend
    ├── public
    └── src
```


## 🚧 今後の予定

- ログイン機能（JWT）
- UI改善

---

## ⚙️ 環境構築

### 1. クローン
```bash
git clone git@github-personal:yourname/my-app.git
cd my-app
```

### 2. 環境変数設定
```bash
cp backend/.env.example backend/.env
```

### 3.起動
```bash
docker compose up --build
```

## 🌐 アクセス
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## 📌 機能
- ユーザー一覧取得
- ユーザー作成

## 🧠 学んだこと
- Dockerでのフルスタック環境構築
- Go + GinでのAPI開発
- Reactとの連携

## 📄 ライセンス
MIT