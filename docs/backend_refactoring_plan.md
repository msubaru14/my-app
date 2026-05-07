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

- validation の置き場所が controller / service / DTO tag で揺れている
- error response の組み立て方が controller ごとにやや異なる
- DTO 変換が controller 内に手書きで重複している
- `model.Task` に JSON tag があり、DB model と API表現の境界が少し曖昧
- JWT secret の取得箇所・取得タイミングが複数箇所に分散している
- task作成とtask更新で `dueDate` の空文字扱いが異なる

---

## ■ 整理対象と優先順位

### 1. validation の責務整理

優先度：高

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

---

### 3. controller 内 DTO 変換の重複整理

優先度：中

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

- backend validation 責務整理方針の具体化
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
