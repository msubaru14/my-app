# API仕様書

## ベースURL

```
http://localhost:8080
```

---

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

#### レスポンス

```json
{
  "user": {
    "id": 1,
    "name": "string",
    "email": "string"
  }
}
```

```json
{
  "error": "invalid request"
}
```

#### バリデーション

name: 必須
email: 必須 / 形式チェック
password: 6文字以上


#### ステータスコード

* 201: 成功
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

#### レスポンス

```json
{
  "token": "JWTトークン"
}
```

```json
{
  "error": "invalid request"
}
```

#### バリデーション

email: 必須 / 形式チェック
password: 6文字以上

#### ステータスコード

* 200: 成功
* 400: 入力不正
* 401: 認証失敗

---

## ユーザー一覧（認証必須）

### GET /users

#### ヘッダー

```
Authorization: Bearer {token}
```

#### レスポンス

```json
{
  "users": [
    {
      "id": 1,
      "name": "string",
      "email": "string"
    }
  ]
}
```

```json
{
  "error": "invalid request"
}
```

#### ステータスコード

* 200: 成功
* 401: 認証エラー
* 500: サーバエラー

---

## ログインユーザ情報取得（認証必須）

### GET /me

#### ヘッダー

```
Authorization: Bearer {token}
```

#### レスポンス

```json
{
  "id": 1,
  "name": "string",
  "email": "string"
}
```

```json
{
  "error": "invalid request"
}
```

#### ステータスコード

* 200: 成功
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

```md
dueDate: 任意（未指定または空文字の場合はnullとして扱う）
形式: YYYY-MM-DD
```

#### レスポンス

```json
{
  "task": {
    "id": 1,
    "title": "string",
    "completed": false,
    "dueDate": "YYYY-MM-DD"
  }
}
```

```json
{
  "error": "invalid request"
}
```

#### ステータスコード

* 200: 成功
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

#### レスポンス

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "string",
      "completed": false,
      "dueDate": "YYYY-MM-DD"
    }
  ]
}
```

```json
{
  "error": "invalid request"
}
```

#### ステータスコード

* 200: 成功
* 401: 認証エラー
* 500: サーバエラー