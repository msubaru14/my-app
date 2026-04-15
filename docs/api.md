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

#### ステータスコード

* 200: 成功
* 401: 認証エラー
* 500: サーバエラー
