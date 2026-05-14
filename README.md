# 📝 My Task App
「今日やること」に集中し、実際の行動に繋げるためのタスク管理アプリ

## 🚀 デモ

| ![registration](./docs/registration.png) | ![login](./docs/login.png) | ![task_list](./docs/task_list.png) | ![task_update](./docs/task_update.png) |
| :---------------------: | :------------: | :---------------------: | :------------: |
| ユーザ登録 | ログイン | タスク一覧 | タスク編集 |

## 💡 コンセプト
一般的なタスク管理アプリは「一覧で管理する」ことに重きを置きがちですが、  
本アプリは「実際に行動できる状態にする」ことを重視しています。  
Go、Typescript学習と個人開発のポートフォリオとして作成しました。  

- 今日やるタスクにフォーカス
- シンプルなUI
- 最低限の操作で実行できる設計

## 🧩 主な機能

### 認証
- ユーザー登録
- ログイン（JWT認証）

### タスク管理
- タスク作成
- タスク一覧取得
- 今日のタスク表示（dueDateベース）
- タスク完了（チェックによる状態更新）
- タスク編集（部分更新）
- タスク削除（論理削除）

### タスク更新APIについて

タスク更新は PATCH /tasks/:id にて実装しています。

- 送信されたフィールドのみ更新（部分更新）
- 未送信フィールドは変更されません

#### バリデーション方針

- title: 空文字・空白は禁止
- dueDate: YYYY-MM-DD形式のみ許可
- dueDate未指定: 変更なし
- dueDate: null: 期限削除
- dueDate: 空文字は禁止
- dueDateはDB内部ではDATE型、APIではYYYY-MM-DD文字列として扱う

#### 設計意図

HTTP PATCHの思想に沿い、フロントからの差分更新に柔軟に対応するため  
部分更新方式を採用しています。

### タスク削除について

タスク削除は論理削除（soft delete）で実装しています。

- GORMの deleted_at を利用
- 実データは保持される

#### 設計意図

将来的な復元機能や履歴管理を見据え、  
実務でも一般的な論理削除を採用しています。


## 🛠 技術スタック

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

## 🏗 アーキテクチャ
レイヤードアーキテクチャを採用し、責務を分離
- Controller: リクエスト受付
- Service: ビジネスロジック
- Repository: DB操作

### バックエンド設計方針

バックエンドは controller -> service -> repository の3層構成を維持します。

- Controller: HTTP request / response の制御
- Service: 業務ルール、所有者チェック、更新可否判断
- Repository: DBアクセス

現時点では usecase 層や repository interface は導入していません。
本アプリの規模では、まず既存3層の責務を明確にし、過剰な抽象化を避ける方針です。

一方で、`TaskService` のように業務ルールが集まりやすい箇所では、service が HTTP request DTO に依存しすぎないよう service input の導入を検討します。
repository interface は、unit test 導入時に DB 依存を切り離す必要が明確になった範囲から最小限で検討します。

詳細は [backend設計方針](./docs/backend_design_policy.md) を参照してください。

### フロントエンド構成

フロントエンドは feature 単位で画面・API・型・補助ロジックをまとめています。

- auth: 認証画面と認証関連API
- tasks: タスク一覧・編集などのタスク管理機能
- common: 複数機能で利用する共通UI、hooks、API基盤、型定義

feature 外から利用する要素は `features/{feature}/index.ts` を入口にし、利用側が feature 内部構造に依存しすぎないようにしています。

## 🗄 DBスキーマ運用ルール

本プロジェクトは、DBスキーマ変更を `backend/db/migrations` に一本化します。

- スキーマ変更は必ずマイグレーションファイルで行う
- `AutoMigrate` には依存しない（起動時に自動でDDL変更しない）
- 変更時は Up/Down をセットで管理し、適用順を崩さない
- 新規環境はマイグレーションのみで構築できる状態を維持する
- `tasks.due_date` はDB内部ではDATE型とし、API境界では `YYYY-MM-DD | null` として扱う

## 🔗 API設計（重要ポイント）
本アプリでは、APIレスポンスを以下の形式に統一しています。  
詳細は[API仕様](./docs/api.md)を参照

### 成功時
```json
{
  "data": {...},
  "error": null
}
```

### エラー時
```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "message",
    "details": [...]
  }
}
```

### 設計意図
- フロントエンド側では `error.code` を基準にエラーを分類
- `message` はユーザー表示用（変更可能）
- `details` によりフィールド単位のエラーを表現

👉 表示と制御を分離することで、変更に強い設計にしています

## 認証
- JWTベース認証
- Authorizationヘッダーで管理
- 認証エラーは詳細を分けず統一（セキュリティ対策）


## ⚙️ セットアップ

### 1. クローン
```bash
git clone git@github-personal:yourname/my-app.git
cd my-app
```

### 2. 環境変数設定
```bash
cp backend/.env.example backend/.env
```

### 3. 起動
```bash
docker compose up --build -d
```

### 4. アクセス
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
│  ├── pkg
│  ├── repository
│  ├── router
│  ├── service
│  └── utils
├── docs
└── frontend
    ├── public
    └── src
        ├── components
        ├── constants
        ├── features
        │   ├── auth
        │   │   ├── api
        │   │   └── components
        │   └── tasks
        │       ├── api
        │       ├── components
        │       ├── hooks
        │       ├── types
        │       └── utils
        ├── hooks
        ├── lib
        └── types
```


## 🚧 今後の予定
- TaskService など業務ルールが多い箇所から unit test を小さく追加
- service input 導入による request DTO 依存の整理
- 無料PaaS構成でのデプロイ
- 必要に応じたUI/UX改善


## 🧠 設計の特徴
- APIレスポンスを完全に統一
- エラーを code ベースで管理
- APIエラーを共通処理で分類し、画面側は分類結果を元に表示・遷移を判断
- details によりバリデーションを柔軟に表現  
- APIリクエスト処理を `frontend/src/lib/api.ts` に集約
- APIエラーの分類と表示用メッセージ整形を `useApiError` に集約
- 認証・タスク管理を feature 単位で分離し、変更範囲を追いやすい構成に整理
- feature の公開口を `index.ts` にまとめ、利用側から見える依存を簡潔に維持
- backend は controller -> service -> repository の3層構成を維持
- usecase 層や repository interface は、必要性が明確になるまで導入しない
- service input / unit test は、業務ルールが多い箇所から小さく検討
👉 実務を意識した設計にしています


## ✅ 完成条件

本アプリは、機能を増やし続けることよりも「設計と保守性を意識したWebアプリ」として完成させることを重視します。

- ユーザー登録 / ログイン / ログインユーザー取得が安定して動作する
- タスク作成 / 一覧 / 更新 / 削除が安定して動作する
- API仕様、エラー形式、dueDate 仕様がドキュメント化されている
- backend の責務分離方針を説明できる
- frontend の feature 分割と error handling 方針を説明できる
- TaskService など重要な業務ルールに unit test を小さく導入している
- 無料PaaS構成でデプロイできる状態になっている

## ☁️ デプロイ方針

ポートフォリオとして公開しやすいよう、無料枠で始められるPaaS構成を想定します。

- Frontend: Vercel
- Backend: Render
- Database: Neon

デプロイ時も、API仕様・認証挙動・DBスキーマを変更しない方針を維持します。

### デプロイ前提の環境変数

詳細は [deploy preflight notes](./docs/deploy-preflight.md) を参照してください。

Frontend は Vite 標準の environment variable で API URL を切り替えます。

```env
VITE_API_BASE_URL=https://your-render-backend.example.com
```

未設定時は local development 用に `http://localhost:8080` を使用します。

Backend は production frontend origin を CORS 許可 origin として設定します。

```env
FRONTEND_URL=https://your-vercel-frontend.example.com
GIN_MODE=release
```

Production DB 接続では `DATABASE_URL` を使用します。

```env
DATABASE_URL=postgresql://your-neon-user:your-neon-password@your-neon-host/your-neon-database?sslmode=require
```

`DATABASE_URL` が未設定の場合、local Docker 開発用に以下の分割 environment variables から DB 接続 DSN を組み立てます。

```env
DB_HOST=db
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=mydb
```

### マイグレーション

Backend 起動時に `backend/db/migrations` 配下の migration が順に実行されます。
Neon 初期 DB では、Render backend 起動時に DB 接続が成功すれば migration が適用されます。


## 📄 ライセンス
MIT
