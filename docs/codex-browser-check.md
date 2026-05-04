# Codex Browser Check Guide

## Purpose

Codexからフロントエンドの画面操作と動作確認を行うための前提条件、確認観点、手順を整理する。

この手順はPRレビュー時の補助確認を目的とし、E2Eテスト自動化やCI/CDへの組み込みは対象外とする。

## Scope

- Frontend: React / Vite
- Backend: Go API
- Local development environment
- Manual browser operation supported by Codex execution environment

## Out of Scope

- PlaywrightなどのE2Eテスト自動化
- CI/CDへの組み込み
- 本番環境向け設定
- アプリケーション挙動の変更
- UI変更

## Prerequisites

- `backend/.env` が存在する
- Docker / Docker Compose が利用できる
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Frontend API base URL: `http://localhost:8080`

`backend/.env` がない場合は、以下を参考に作成する。

```bash
cp backend/.env.example backend/.env
```

## Startup

Repository rootで以下を実行する。

```bash
docker compose up --build -d
```

起動後、以下にアクセスできることを確認する。

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## Codex Browser Operation Requirements

Codexから画面操作を行うには、実行環境側でブラウザ操作手段が必要になる。

このリポジトリにはE2E実行ツールを追加しないため、外部依存を追加せず、EdgeのゲストモードとChrome DevTools Protocol（CDP）を利用して確認する。

- ブラウザ: Microsoft Edge
- 実行モード: ゲストモード
- 操作方式: CDP
- CDP endpoint: `http://127.0.0.1:<port>`

普段使いのChromeや、Microsoftアカウントでサインイン済みのEdgeプロファイルは操作対象にしない。

### Edge Guest Startup

EdgeをCodex確認用に起動する場合は、通常プロファイルではなくゲストモードを使う。

```powershell
$profile = Join-Path $env:TEMP 'codex-edge-guest-9335'
New-Item -ItemType Directory -Force -Path $profile | Out-Null
$args = @(
  '--guest',
  '--remote-debugging-port=9335',
  "--user-data-dir=$profile",
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-sync',
  '--disable-features=msEdgeSignIn,EdgeSigninInterceptionEnabled,msSingleSignOnOSForPrimaryAccountIsShared',
  'http://localhost:5173/login'
)
Start-Process -FilePath 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -ArgumentList $args
```

起動後、Edge右上のプロフィール表示がゲストになっていることを確認する。

### CDP Connection Check

CDP接続確認は以下で行う。

```powershell
Invoke-RestMethod http://127.0.0.1:9335/json/version
```

`webSocketDebuggerUrl` が取得できれば、Codexから画面操作を行える。

### Operation Notes

- 入力確認はDOMの `value` を直接変更するだけではなく、実入力イベントまたはReactに伝わる入力イベントで行う
- ボタン押下はDOMの `click()` ではなく、座標に対するマウスイベントで確認する
- console確認では `Runtime.consoleAPICalled` と `Runtime.exceptionThrown` を確認する
- API確認では `Network.responseReceived` を確認する
- PowerShell経由でNodeスクリプトを実行する場合、日本語文字列の判定が文字化けすることがあるため、判定は可能な限りURL、CSS selector、ASCIIのテストデータで行う

## Check Points

### 1. Field Input

- `input` / `textarea` / `select` に値を入力できる
- 入力後の値が画面上に保持される
- バリデーションエラーが想定どおり表示される

### 2. Button Click

- submitボタンを押下できる
- 通常ボタンを押下できる
- 押下後の表示、状態、通信が想定どおり変化する

### 3. Navigation

- URLが想定どおり変化する
- 遷移先画面が表示される
- 認証状態に応じたリダイレクトが想定どおり行われる

### 4. Console

- 想定外の `console.error` が出ていない
- 想定外の `console.warn` が出ていない
- React runtime errorが出ていない

### 5. API Request / Response

- 想定したAPIが発火される
- HTTP status codeが想定どおりである
- request bodyが想定どおりである
- response bodyがAPI仕様どおりである
- エラー時は `code` / `message` / `details` を確認できる

APIレスポンス形式は `docs/api.md` を参照する。

### 6. UI State Change

- 作成、更新、削除の結果が画面に反映される
- チェック状態などのUI状態が変化する
- 再読み込み後も必要な状態が確認できる

## Basic Operation Flow

### Register

1. `http://localhost:5173` を開く
2. ユーザー登録画面へ移動する
3. 必要なフィールドに値を入力する
4. 登録ボタンを押下する
5. 成功時の遷移または表示を確認する
6. console error / warning の有無を確認する
7. `/users` APIのrequest / responseを確認する

### Login

1. ログイン画面を開く
2. 登録済みユーザーの情報を入力する
3. ログインボタンを押下する
4. 成功時にタスク画面へ遷移することを確認する
5. JWTが以降のAPIで利用されることを確認する
6. `/login` APIのrequest / responseを確認する

### Task Create

1. タスク入力欄に値を入力する
2. タスク追加ボタンを押下する
3. 追加したタスクが画面に表示されることを確認する
4. `POST /tasks` のrequest / responseを確認する

### Task Update

1. 既存タスクの編集操作を行う
2. 更新内容を入力する
3. 保存操作を行う
4. 更新内容が画面に反映されることを確認する
5. `PATCH /tasks/:id` のrequest / responseを確認する

### Task Delete

1. 既存タスクの削除操作を行う
2. 削除後、対象タスクが画面から消えることを確認する
3. `DELETE /tasks/:id` のrequest / responseを確認する

### Logout

1. タスク画面右上のログアウトボタンを押下する
2. ログイン画面へ遷移することを確認する
3. console error / warning の有無を確認する

## Verified Scenario

以下のシナリオは、EdgeゲストモードとCDP操作で完走確認済み。

1. ユーザー登録
2. ログイン
3. 今日の日付でタスク追加
4. チェックボックスで完了切替
5. タスク編集
6. タスク削除
7. ログアウト

確認済みの主なAPIレスポンス:

- `POST /users`: `201`
- `POST /login`: `200`
- `GET /me`: `200`
- `GET /tasks`: `200`
- `POST /tasks`: `201`
- `PATCH /tasks/:id`: `200`
- `DELETE /tasks/:id`: `200`

## Known Issues

ログアウト時に `TaskList` でReact Hooks呼び出し数不一致エラーが発生することを確認している。

```txt
Error: Rendered fewer hooks than expected.
This may be caused by an accidental early return statement.
```

この事象は以下のIssueで管理する。

- https://github.com/msubaru14/my-app/issues/62

## Result Template

PRレビュー時は、必要に応じて以下の形式で確認結果を残す。

```md
## Browser Check

- Startup: OK / NG
- Field input: OK / NG / Not checked
- Button click: OK / NG / Not checked
- Navigation: OK / NG / Not checked
- Console: OK / NG / Not checked
- API request / response: OK / NG / Not checked
- UI state change: OK / NG / Not checked
- Logout: OK / NG / Not checked

### Notes

- 
```

## Notes

- この手順は自動テストではなく、Codexまたは司令官による画面確認のための手順である
- ブラウザ操作手段が利用できない環境では、司令官の画面共有や手動確認結果をもとにレビュー補助として利用する
- 確認中に不足が見つかった場合は、別Issueとして切り出す
