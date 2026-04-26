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
- dueDateのnull更新（削除）は未対応

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
- フロントエンドは `error.code` を用いて分岐
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
        ├── assets
        ├── components
        ├── lib
        └── types
```


## 🚧 今後の予定
- 今日以外のタスク表示
- UI/UXの改善
- 認証強化（リフレッシュトークン）


## 🧠 設計の特徴
- APIレスポンスを完全に統一
- エラーを code ベースで管理
- フロントは code のみを参照して分岐
- details によりバリデーションを柔軟に表現  
👉 実務を意識した設計にしています


## ⚠️ 今後の改善・拡張予定
- バリデーションロジックのService層への集約
- APIクライアントの共通化
- エラーハンドリングのさらなる整理
- テストコードの追加
- レスポンシブ対応


## 📄 ライセンス
MIT