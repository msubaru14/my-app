# My Task App

## 📝 概要
「今日やるタスク」にフォーカスしたシンプルなタスク管理アプリです。
タスクを並べるのではなく、行動を促す設計を重視しています。

## 📸 画面イメージ

![login](./docs/login.png)

## 💡 コンセプト

タスクを「管理する」ではなく
「実行できる状態にする」ことを目的としています。

## 📌 機能
- ユーザー登録
- ログイン（JWT認証）
- タスク作成
- タスク一覧取得
- 今日のタスク表示（dueDateベース）

## 🚀 使用技術

### Frontend
- React
- TypeScript
- Vite

### Backend
- Go
- Gin
- GORM

### Database
- PostgreSQL

### Infrastructure
- Docker / Docker Compose

### 技術選定理由
- React: コンポーネントベースで状態管理を学ぶため
- Go: シンプルな構文と高速なAPI開発を体験するため
- Docker: 環境差異をなくし、再現性のある開発環境を構築するため

## 🏗 アーキテクチャ

- Controller: リクエスト受付
- Service: ビジネスロジック
- Repository: DB操作

## 🔗 API / 🔐 認証

### API
- POST /login
- GET /me
- GET /users
- POST /tasks
- GET /tasks

詳細は[API仕様](./docs/api.md)を参照

### 認証
- JWTを使用
- Authorizationヘッダーで認証

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
docker compose up --build -d
```

### 4.停止
```bash
docker compose down
```

## 🌐 アクセス
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## 📂 ディレクトリ構成

主要ディレクトリ:

- backend: APIサーバ
- frontend: UI
- docs: 仕様・画像

```
.
├── backend
│  ├── controller
│  ├── db
│  ├── dto
│  ├── middleware
│  ├── model
│  ├── repository
│  ├── router
│  ├── service
│  └── utils
├── docs
└── frontend
    ├── public
    └── src
        ├── assets
        ├── components
        ├── lib
        └── types
```


## 🚧 今後の予定
- タスク完了機能（チェック）
- タスク更新・削除
- 今日以外のタスク表示
- UI/UXの改善
- 認証強化（リフレッシュトークン）

## 🧠 学んだこと
- レイヤードアーキテクチャでのAPI設計
- JWT認証の実装とミドルウェアによる認可制御
- Dockerを用いたフルスタック環境構築
- ReactとAPIの連携方法


## 📄 ライセンス
MIT