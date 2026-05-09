# バックエンド リファクタリング方針

## ■ 目的

本フェーズは、既存API仕様・認証挙動・DBスキーマを維持したまま、
バックエンドの構造整理・責務分離・保守性向上を目的とする。

本作業は **機能開発ではなくリファクタリングフェーズ** と位置付ける。

---

## ■ 基本原則

以下を最優先とする：

1. **既存API仕様・挙動を変更しない**
2. **認証・認可挙動を変更しない**
3. **DBスキーマを変更しない**
4. **変更は最小単位で行う（1PR = 1目的）**
5. **controller → service → repository の層構造を維持する**
6. **スコープ外の変更は行わない**

※ 本方針はリポジトリのルールにも準拠する。

---

## ■ 現状整理

Issue #136 の調査結果をもとに、backend には以下の特徴がある。

### 良い点

- `controller -> service -> repository` の基本的な層構造がある
- repository は GORM 操作を包む役割におおむね限定されている
- task の更新・削除では `user_id` を使った所有者チェックが行われている
- APIレスポンスは `pkg/response`、APIエラーは `pkg/apperror` に共通化され始めている
- request DTO / response DTO と model は分離されている
- migration は `schema_migrations` と transaction を使って実行済み管理されている

### 気になる点

- validation の責務整理は一区切りしたが、create/update 間で意図的に維持している仕様差分がある
- error response の組み立て方が controller ごとにやや異なる
- DTO 変換が controller 内に手書きで重複している
- `model.Task` に JSON tag があり、DB model と API表現の境界が少し曖昧
- JWT secret の取得箇所・取得タイミングが複数箇所に分散している
- task作成とtask更新で `dueDate` の空文字扱いが異なる

---

## ■ 進捗サマリ

### 1. validation の責務整理

- [x] validation の現状仕様を endpoint ごとに一覧化
- [x] `POST /users` validation を controller 側へ整理
- [x] `POST /tasks` validation を controller 側で整理
- [x] `PATCH /tasks/:id` validation を request validation と業務ルールに分離
- [x] task title 最大長仕様差分を整理
- [x] task title validation を共通化
- [x] task validation helper を `task_controller.go` から分離

補足：

- `POST /users` は DTO `binding` tag ではなく controller 側で validation detail を組み立てる形へ整理済み
- `POST /tasks` / `PATCH /tasks/:id` の title validation は共通 helper を使う形へ整理済み
- `PATCH /tasks/:id` の更新フィールド未指定、所有者チェック、not found 判定は service 側に維持
- `POST /tasks` の title は既存どおり trim せず、`PATCH /tasks/:id` の title は既存どおり trim する
- `POST /tasks` では `dueDate` 空文字を `nil` として扱い、`PATCH /tasks/:id` では validation error として扱う仕様差分を維持
- `POST /tasks` で title と dueDate が同時に不正な場合は、validation details が配列であることに合わせて複数 details を返す

### 2. apperror / response 利用方針の統一

- [x] controller ごとの error response 組み立て方を確認
- [x] `apperror.APIError` の使われ方を確認
- [x] `response.Error` の呼び出し方を確認
- [x] `MapErrorCodeToStatus` の利用箇所を確認
- [x] service から返す error と controller で返す response の関係を整理
- [x] 既存挙動を変えずに `APIError` 生成 helper へ寄せる範囲を決定
- [x] `APIError` 生成 helper 化を最小差分で実装
- [x] `MapErrorCodeToStatus` の適用範囲を決定
- [x] controller / middleware の `APIError` response を `MapErrorCodeToStatus` 経由へ整理
- [x] `ShouldBindJSON` 失敗時の endpoint 差分を扱うか決定
- [x] `ShouldBindJSON` 失敗時の error code を `INVALID_REQUEST` に統一

補足：

- `response` は HTTP response 出力、`apperror` は `APIError` 生成を担当する形へ整理済み
- HTTP status は `APIError.Code` をもとに `MapErrorCodeToStatus` で決定する
- JSON形式不正や型不正は validation error ではなく request形式不正として扱う

### 3. controller 内 DTO 変換の重複整理

- [x] controller 内 DTO 変換の重複整理

補足：

- `UserResponse` / `TaskResponse` の生成処理は DTO 側の変換 helper へ整理済み
- controller 側は既存の `data` / `error` 構造を維持したまま、DTO 変換 helper を呼び出す形へ整理済み

### 4. 次フェーズ候補

- [ ] JWT / config 周りの責務整理

---

## ■ 整理対象と優先順位

### 1. validation の責務整理

優先度：完了

目的：

- controller / service / DTO binding tag の役割を明確にする
- validation error の返し方を統一する
- 既存APIレスポンス形式を維持する

方針：

- まず現状の validation 仕様を一覧化する
- 空文字、未指定、不正形式などの既存挙動を変更しない
- 共通化する場合も、挙動差分を明示してから小さく適用する

注意点：

- validation はフロントエンドのエラー表示にも影響する
- `error.code` / `details[].code` / `details[].message` の互換性を維持する

現在の配置：

- `ShouldBindJSON` による JSON request 形式チェックは controller で行っている
- user登録の validation は controller で行い、DTO `binding` tag への依存は外している
- login DTO / task DTO には `binding` tag がなく、controller または service で validation している
- task作成の title / dueDate validation は controller helper で行っている
- task更新の title / dueDate request validation は controller helper で行っている
- task更新の未指定チェックは service で行っている
- task更新・削除の所有者チェックと not found 判定は service / repository で行っている

endpoint 別の validation 実装箇所：

| endpoint | request形式 | 必須チェック | 形式チェック | 業務ルール / 更新可否 |
| --- | --- | --- | --- | --- |
| `POST /login` | controller | controller | なし | 認証失敗は service 経由で unauthorized |
| `POST /users` | controller | controller | controller で email形式、password最小長をチェック | user作成、password hash は service |
| `POST /tasks` | controller | controller helper | controller helper で title最大長、`dueDate` を `YYYY-MM-DD` チェック | controller で `dueDate` 空文字を `nil` 化、作成処理は service |
| `PATCH /tasks/:id` | controller | controller helper | controller helper で title最大長、`dueDate` を `YYYY-MM-DD` チェック | service で更新対象フィールド未指定、所有者チェック、not found 判定 |
| `DELETE /tasks/:id` | controller | なし | なし | service で所有者チェック、not found 判定 |

validation 種別ごとの責務案：

- request形式
  - controller が担当する
  - `ShouldBindJSON` 失敗時は JSON形式不正または型不正として `INVALID_REQUEST` を返す
- 必須チェック
  - 原則として controller または DTO validation 近辺で扱う
  - ただし既存レスポンスの `details[].field` / `details[].code` / `details[].message` を変えない
  - DTO `binding` tag へ寄せる場合は、既存の日本語メッセージと error detail 形式を維持できるか確認してから扱う
- 形式チェック
  - request単体で完結する形式チェックは controller または DTO validation 近辺で扱う
  - `dueDate` のように create/update で差分があるものは、先に仕様確認Issueで扱う
- 業務ルール
  - service が担当する
  - 例：更新対象フィールドが1つも指定されていない場合の `no fields to update`
- 更新可否判定
  - service が担当する
  - 例：対象taskの存在確認、`user_id` による所有者チェック、not found 判定

推奨方針：

- DTO は JSON request の受け皿とし、項目名・型・最低限の構造を表す責務に留める
- DTO `binding` tag は、それだけで完結する単純な制約に限定して使う
  - 例：`required`、`email`、`min`、`max`
- ただし、`binding` tag を使う場合は、既存の `error.code` / `details[].field` / `details[].code` / `details[].message` 形式へ正規化できることを前提にする
- controller はリクエスト単体で判定できる入力validationを担当する
  - 例：JSON形式、必須項目、空文字、単純な形式チェック、path parameter の形式
- service は DB状態やアプリの業務ルールを伴うvalidationを担当する
  - 例：存在確認、所有者チェック、重複確認、更新可否、認証照合
- create/update で扱いが異なる項目や、空文字を `nil` にするような補正を伴う項目は、DTO `binding` tag に寄せる前に仕様を確認する
- 現時点では、DTOへvalidationを集約するよりも、controller / service の責務を明示して既存挙動を維持する方針を優先する

責務混在箇所：

- user登録は controller validation に整理済み
- task作成は controller helper に必須チェック、日付形式チェック、空文字の `nil` 化がまとまっている
- task更新は controller helper が request validation と補正を担当し、service が業務ルールと更新処理を担当する
- `ShouldBindJSON` 失敗時の error code は `INVALID_REQUEST` に統一済み

完了済み：

1. validation の現状仕様を endpoint ごとに一覧化する
2. `ShouldBindJSON` 失敗時の返却仕様を確認する
3. user登録の DTO `binding` tag と controller 手書きvalidationの重複扱いを決める
4. task作成の controller validation を、挙動を変えずに整理できる単位へ分ける
5. task更新の service validation を、業務ルールと request validation に分けて整理する
6. task title 最大長仕様差分を整理し、create/update で共通化する
7. task validation helper を controller 本体から分離する
8. `ShouldBindJSON` 失敗時の error code を `INVALID_REQUEST` に統一する

仕様差分として維持しているもの：

- `POST /tasks` の title は trim せず保存する
- `PATCH /tasks/:id` の title は trim して更新する
- `POST /tasks` の `dueDate` 空文字は `nil` として扱う
- `PATCH /tasks/:id` の `dueDate` 空文字は validation error として扱う
- `PATCH /tasks/:id` の `dueDate: null` は未指定扱いとなり、更新フィールドがなければ `INVALID_REQUEST` を返す

---

### 2. apperror / response 利用方針の統一

優先度：高

目的：

- service から返すエラーと controller で返す response の関係を整理する
- API error code と HTTP status の対応を統一する
- controller ごとの手組み差分を減らす

方針：

- 既存の `pkg/apperror` と `pkg/response` を活かす
- APIレスポンス形式は変更しない
- まず task 系で使われている `MapErrorCodeToStatus` の扱いを基準候補として整理する

注意点：

- エラー制御は message 文字列ではなく code ベースで維持する
- unauthorized / validation / not found / internal server error の既存挙動を変えない

現状確認：

- `response.Error` は `status` と `apperror.APIError` を受け取り、共通の `data: nil` / `error: apiErr` 形式で返している
- `UNAUTHORIZED` / `unauthorized` の `APIError` 生成は `apperror.NewUnauthorized` に寄せている
- middleware の認証エラーは `response.Error` と `c.Abort()` を組み合わせて返している
- `apperror.MapErrorCodeToStatus` は `INVALID_REQUEST` / `VALIDATION_ERROR` / `UNAUTHORIZED` / `NOT_FOUND` / `INTERNAL_SERVER_ERROR` を HTTP status に変換する
- `apperror.NewInvalidRequest` / `NewNotFound` / `NewValidationError` / `NewInternalServerError` / `NewUnauthorized` は `APIError` 生成に使う

controller ごとの error response 組み立て：

| controller | invalid request | validation error | unauthorized | not found | internal server error |
| --- | --- | --- | --- | --- | --- |
| `auth_controller.go` | `apperror.NewInvalidRequest` を `MapErrorCodeToStatus` 経由で返す | controller で details を組み立て、`apperror.NewValidationError` を `MapErrorCodeToStatus` 経由で返す | service error を `apperror.NewUnauthorized` + `MapErrorCodeToStatus` 経由で返す | なし | なし |
| `user_controller.go` | `apperror.NewInvalidRequest` を `MapErrorCodeToStatus` 経由で返す | controller で details を組み立て、`apperror.NewValidationError` を `MapErrorCodeToStatus` 経由で返す | `GetMe` の context 不正時に `apperror.NewUnauthorized` + `MapErrorCodeToStatus` 経由で返す | なし | `apperror.NewInternalServerError` を `MapErrorCodeToStatus` 経由で返す |
| `task_controller.go` | path / JSON request 不正は `apperror.NewInvalidRequest` を `MapErrorCodeToStatus` 経由で返す。service 由来の `INVALID_REQUEST` も同じ経路で返す | controller helper が `apperror.NewValidationError` を返し、`MapErrorCodeToStatus` 経由で返す | middleware 側で `apperror.NewUnauthorized` + `MapErrorCodeToStatus` + `c.Abort()` | service 由来の `NOT_FOUND` を `MapErrorCodeToStatus` 経由で返す | `apperror.NewInternalServerError` を `MapErrorCodeToStatus` 経由で返す |

実施済み：

- controller / controller helper / response package にあった `apperror.APIError{...}` の直書きを `apperror` の生成 helper へ寄せた
- `NewInvalidRequest` / `NewNotFound` / `NewValidationError` は `*APIError` を返す形へ整理した
- `NewInternalServerError` / `NewUnauthorized` を追加した
- `response.Unauthorized` は削除し、`response` は HTTP response 出力、`apperror` は APIError 生成を担当する形へ寄せた
- middleware では unauthorized response 後に `c.Abort()` する制御を維持した
- controller で返す `APIError` は `respondAPIError` を通して `MapErrorCodeToStatus` で HTTP status を決める形へ整理した
- middleware の unauthorized response も `MapErrorCodeToStatus` で HTTP status を決める形へ整理した
- `PATCH /tasks/:id` の `ShouldBindJSON` 失敗時 response を `VALIDATION_ERROR` から `INVALID_REQUEST` へ変更し、他 endpoint と揃えた

残っている揺れ・次に決めること：

- `Details: nil` の明示有無を統一対象に含めるか
- auth service は通常の `error` を返し、controller が unauthorized へ変換している。この扱いを維持するか、service error を `apperror` 化するか

---

### 3. controller 内 DTO 変換の重複整理

優先度：完了

目的：

- `UserResponse` / `TaskResponse` の生成重複を減らす
- controller の責務を HTTP入出力の制御に寄せる
- model と API response の境界を見えやすくする

方針：

- 変換関数を追加する場合は DTO 近辺に小さく閉じる
- 変換対象は response DTO の生成に限定する
- APIレスポンスのキー名や構造は変更しない

注意点：

- 過剰な抽象化は行わない
- mapper 層などの新しい大きな設計は導入しない

完了済み：

1. `UserResponse` / `TaskResponse` の生成 helper を DTO 側へ追加する
2. controller 内の手書き response DTO 生成を helper 呼び出しへ置き換える
3. APIレスポンスのキー名・構造を維持する

---

### 4. JWT / config 周りの責務整理

優先度：中

目的：

- `JWT_SECRET` の取得箇所・取得タイミングを明確にする
- token生成とtoken検証の責務を整理する
- 認証基盤として扱う範囲を明確にする

方針：

- 認証挙動は変更しない
- JWT仕様、claim名、有効期限は維持する
- 設定取得の整理は単独Issueで扱う

注意点：

- auth 周辺は影響範囲が広いため、validation/error handling と同じPRで扱わない
- package init 時の環境変数取得を見直す場合は、起動時挙動の確認を必須にする

---

### 5. dueDate 仕様差分確認

優先度：中

目的：

- task作成とtask更新における `dueDate` の扱い差分を明確にする
- 既存仕様か、意図しない揺れかを判断できる状態にする

現状：

- task作成では `dueDate` の空文字を `nil` として扱う
- task更新では `dueDate` の空文字を validation error として扱う

方針：

- この方針書の段階では仕様変更しない
- 実装修正前に、既存仕様として維持するか統一するかを判断する
- 統一する場合はAPI仕様変更になり得るため、別Issueで扱う

---

### 6. DB / migration

優先度：低

目的：

- 現時点では大きな変更対象にしない
- migration の実行方式と既存スキーマを維持する

方針：

- DBスキーマ変更は行わない
- migration方式の大幅変更は行わない
- GORM model tag と実DB定義の差分確認に留める

注意点：

- DB変更は既存データ・起動処理・API挙動に影響するため、必要になった場合のみ単独Issueで扱う

---

### 7. controller / service / repository

優先度：低〜中

目的：

- 既存の層構造を維持しながら、責務の境界を明確にする

方針：

- controller は HTTP request / response の制御を担当する
- service は業務ルール、所有者チェック、更新可否判断を担当する
- repository は DBアクセスを担当する
- 層をまたぐファイル移動や大規模な再設計は行わない

注意点：

- service が厚くなること自体は問題にしない
- ただし validation / error / DTO変換の責務が混ざる場合は、個別に整理する

---

## ■ 今すぐ触らない領域

以下は本フェーズでは原則として触らない：

- DBスキーマ変更
- migration方式の大幅変更
- APIレスポンス形式の変更
- route設計変更
- JWT仕様変更
- 認証・認可挙動の変更
- 新規ライブラリ導入
- controller / service / repository をまたぐ大規模な再設計

---

## ■ タスク運用ルール

- 1Issue = 1目的
- 1PR = 1変更
- validation / error handling / auth 周辺は混ぜない
- 影響範囲を事前に明確化する
- 変更後は必ずAPI挙動を確認する
- 既存レスポンスの `data` / `error` 構造を維持する

---

## ■ 動作確認方針

実装変更を行うIssueでは、最低限以下を確認する：

- ユーザー登録
- ログイン
- ログインユーザー取得
- タスク一覧取得
- タスク作成
- タスク更新
- タスク削除
- 認証なしリクエスト
- invalid token リクエスト
- validation error
- not found error

変更内容に応じて、以下も確認する：

- 各 validation 分岐
- `error.code` / `details[].code` / `details[].message`
- `dueDate` の未指定、空文字、不正形式、正常形式
- 対象ユーザー以外のtaskに対する更新・削除可否

---

## ■ 今後のIssue候補

- backend apperror / response 利用方針の統一
- controller DTO変換の重複整理
- JWT設定取得の責務整理
- task create/update の `dueDate` validation 差分確認
- model JSON tag の扱い確認
- DB model tag と migration 定義の差分確認

---

## ■ 補足

本方針は「安全な構造整理」を目的とし、
スピードよりも **破壊しないこと・判断基準を明確にすること** を優先する。

実装時は、既存挙動を変えない小さな変更から進める。
