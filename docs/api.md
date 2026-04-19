# API仕様書

## ベースURL

```
http://localhost:8080
```

## 共通レスポンス仕様

本APIでは、全てのレスポンスを以下の形式で統一する。  
フロントエンドは error.code を用いて分岐制御を行うこと  
message には依存しない

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

---

### error.code
フロントエンドの分岐制御用の固定値
| code                  | 説明           |
| --------------------- | ------------ |
| INVALID_REQUEST       | リクエスト形式不正    |
| VALIDATION_ERROR      | 入力バリデーションエラー |
| UNAUTHORIZED          | 認証エラー        |
| NOT_FOUND             | リソース未存在      |
| INTERNAL_SERVER_ERROR | サーバエラー       |

---

### error.details（バリデーション時）
```json
[
  {
    "field": "email",
    "code": "INVALID_FORMAT",
    "message": "メールアドレスの形式が不正です"
  }
]
```
| field   | 対象フィールド     |
| ------- | ----------- |
| code    | エラー種別       |
| message | ユーザー向けメッセージ |

---

### detail.code
| code           | 説明   |
| -------------- | ---- |
| REQUIRED       | 未入力  |
| INVALID_FORMAT | 形式不正 |
| TOO_SHORT      | 短すぎ  |
| TOO_LONG       | 長すぎ  |
| OUT_OF_RANGE   | 範囲外  |

---

### 認証エラーの方針

認証系エラーは詳細を分けず、常に以下を返す
```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "unauthorized"
  }
}
```
※ セキュリティ上の理由により詳細は非公開


## ユーザー登録

### POST /users

#### リクエスト

```json
{
  "name": "string",
  "email": "string",
  "password": "string (6文字以上)"
}
```

#### レスポンス（成功）

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "string",
      "email": "string"
    }
  },
  "error": null
}
```

#### レスポンス（エラー）

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "validation error",
    "details": [
      {
        "field": "name",
        "code": "REQUIRED",
        "message": "名前は必須です"
      }
    ]
  }
}
```
※ その他のエラーは共通レスポンス仕様を参照

#### バリデーション

name: 必須
email: 必須 / 形式チェック
password: 6文字以上


#### ステータスコード

* 201: 作成成功
* 400: 入力不正
* 500: サーバエラー

---

## ログイン

### POST /login

#### リクエスト

```json
{
  "email": "string",
  "password": "string"
}
```

#### レスポンス（成功）

```json
{
  "data": {
    "token": "JWTトークン"
  },
  "error": null
}
```

#### レスポンス（エラー）

```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "unauthorized"
  }
}
```
※ その他のエラーは共通レスポンス仕様を参照

#### バリデーション

email: 必須 / 形式チェック
password: 6文字以上

#### ステータスコード

* 200: 成功（取得・更新）
* 400: 入力不正
* 401: 認証失敗

---

## ユーザー一覧（認証必須）

### GET /users

#### ヘッダー

```
Authorization: Bearer {token}
```

#### レスポンス（成功）

```json
{
  "data": {
    "users": [
      {
        "id": 1,
        "name": "string",
        "email": "string"
      }
    ]
  },
  "error": null
}
```

#### レスポンス（エラー）

```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "unauthorized"
  }
}
```
※ その他のエラーは共通レスポンス仕様を参照

#### ステータスコード

* 200: 成功（取得・更新）
* 401: 認証エラー
* 500: サーバエラー

---

## ログインユーザ情報取得（認証必須）

### GET /me

#### ヘッダー

```
Authorization: Bearer {token}
```

#### レスポンス（成功）

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "string",
      "email": "string"
    }
  },
  "error": null
}
```

#### レスポンス（エラー）

```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "unauthorized"
  }
}
```
※ その他のエラーは共通レスポンス仕様を参照

#### ステータスコード

* 200: 成功（取得・更新）
* 401: 認証エラー
* 500: サーバエラー

---

## タスク作成（認証必須）

### POST /tasks

#### ヘッダー

```
Authorization: Bearer {token}
```

#### リクエスト

```json
{
  "title": "string",
  "dueDate": "YYYY-MM-DD | null"
}
```

※ dueDate: 任意（未指定または空文字の場合はnullとして扱う）  
※ 形式: YYYY-MM-DD


#### レスポンス（成功）

```json
{
  "data": {
    "task": {
      "id": 1,
      "title": "string",
      "completed": false,
      "dueDate": "YYYY-MM-DD"
    }
  },
  "error": null
}
```

#### レスポンス（エラー）

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "validation error",
    "details": [
      {
        "field": "title",
        "code": "REQUIRED",
        "message": "タイトルは必須です"
      }
    ]
  }
}
```
※ その他のエラーは共通レスポンス仕様を参照

#### ステータスコード

* 201: 作成成功
* 400: 入力不正
* 401: 認証エラー
* 500: サーバエラー

---


## タスク一覧取得（認証必須）

### GET /tasks

#### ヘッダー

```
Authorization: Bearer {token}
```

#### レスポンス（成功）

```json
{
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "string",
        "completed": false,
        "dueDate": "YYYY-MM-DD"
      }
    ]
  },
  "error": null
}
```

#### レスポンス（エラー）

```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "unauthorized"
  }
}
```
※ その他のエラーは共通レスポンス仕様を参照

#### ステータスコード

* 200: 成功（取得・更新）
* 401: 認証エラー
* 500: サーバエラー