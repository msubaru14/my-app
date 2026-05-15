# backend設計方針

## ■ 目的

backend設計改善フェーズの最終判断をまとめる。

このドキュメントは、現時点で採用する構成、今は導入しない設計、今後の導入判断を説明できる状態にするための方針書として扱う。

---

## ■ 採用する構成

backend は controller / service / repository の3層構成を維持する。

- controller: HTTP request / response の制御
- service: 業務ルール、所有者チェック、更新可否判断
- repository: DBアクセス

現時点では、usecase 層を追加せず、既存3層の責務を明確にすることを優先する。

---

## ■ service input の扱い

service が HTTP request DTO に依存しすぎないよう、必要な箇所から service input の導入を検討する。

優先候補：

- `TaskService.UpdateTask`

方針：

- controller は request DTO を受け取り、必要に応じて service input へ変換する
- service は HTTP request の形状を直接意識しすぎない形を目指す
- ただし、型追加による差分と効果を比較し、実装変更は別 Issue で扱う

---

## ■ usecase 層の扱い

現時点では usecase 層を導入しない。

理由：

- 現状のタスク管理アプリでは、複数 service / repository をまたぐ orchestration が少ない
- controller が複雑な業務手順を抱えている状態ではない
- 3層構成と service input の整理で対応できる可能性が高い
- 構造を増やすより、既存責務を明確にする方が現状規模に合っている

導入を再検討する条件：

- 複数 service / repository をまたぐ処理が増える
- controller が usecase 手順を知りすぎる
- service が HTTP 入力や response 都合を強く意識し始める
- 複数操作を1つの業務単位としてまとめる必要が出る

---

## ■ repository interface の扱い

現時点では repository interface を導入しない。

理由：

- 抽象化のためだけの interface は避ける
- repository 実装を差し替える具体的な予定がない
- unit test 導入時に必要性が明確になってから最小限で判断する方が安全

導入を再検討する条件：

- service の unit test で DB 依存を切り離す必要が高くなる
- repository 実装を差し替える具体的な理由が出る
- interface が利用側の要件として自然に定義できる

---

## ■ dueDate の扱い

task の `dueDate` は、DB内部では `DATE` 型、Go model では `*time.Time` として扱う。

API request / response では引き続き `YYYY-MM-DD | null` を維持する。
controller / DTO 境界で `YYYY-MM-DD` 文字列と `time.Time` を変換し、frontend に DB 内部型を露出しない。

方針：

- `POST /tasks` の `dueDate` 未指定 / `null` / 空文字は期限なしとして扱う
- `PATCH /tasks/:id` の `dueDate` 未指定は更新対象外として扱う
- `PATCH /tasks/:id` の `dueDate: null` は期限削除として扱う
- `PATCH /tasks/:id` の `dueDate: ""` は validation error として扱う
- API response の `dueDate` は `YYYY-MM-DD | null` として返す

---

## ■ service error の扱い

現時点では service error の一括統一は行わない。

controller / service / repository の3層構成では、controller が HTTP response への変換を担当し、service は業務ルール、所有者チェック、更新可否判断を担当する。
そのため、service が HTTP status を直接意識する形には寄せない。

ただし、service が判定した業務エラーを controller へ code として伝える必要がある場合は、既存の `apperror.APIError` を使ってよい。
controller は受け取った `apperror.APIError` を `respondAPIError` 経由で API response に変換する。

現状整理：

| 対象 | service が返す error | controller の扱い | 判断 |
| --- | --- | --- | --- |
| task | 更新対象なし、not found を `apperror.APIError` として返す。repository error は通常の `error` として返す | `apperror.APIError` は code に応じて response 化し、それ以外は internal server error に変換する | 業務エラーを service が判断しているため現状維持 |
| auth | 認証失敗を通常の `error` として返す。token生成失敗も通常の `error` として返す | login 失敗時は unauthorized response に変換する | 認証失敗の詳細を外へ出さない目的があるため現状維持 |
| user | hash生成、repository error を通常の `error` として返す | internal server error に変換する | 現状では API code を service から明示する必要がないため現状維持 |

方針：

- controller は HTTP request / response の制御と、error response への変換を担当する
- service は業務ルール上の失敗を判断する
- service が返す `apperror.APIError` は、HTTP response そのものではなく、controller に伝える API error code と message として扱う
- repository error は、service で業務上の意味に変換できるものだけ変換する
- repository error を業務エラーとして判断できない場合は、通常の `error` のまま controller へ返す
- controller は通常の `error` を原則として internal server error に変換する
- auth の認証失敗は、user の存在有無や password 不一致を区別せず、controller で unauthorized に変換する
- task / auth / user の責務差分は、業務上の意味が異なるため無理に揃えない

判断：

- `apperror.APIError` は controller 専用ではなく、service が業務エラー code を返す必要がある場合に限って利用する
- service 全体を `apperror.APIError` へ寄せる実装変更は、現時点では行わない
- APIレスポンス形式、HTTP status、error code は変更しない
- error 方針の実装変更が必要になった場合は、個別の Issue として扱う

今後の検討候補：

- service error 用の domain error を別途導入する必要があるか確認する
- auth service の認証失敗を通常の `error` のまま維持するか、code を持つ業務エラーとして表すか確認する
- task service の `apperror.APIError` 利用が増えた場合、service error 方針を再確認する

---

## ■ unit test 導入方針

unit test は一括導入せず、業務ルールが多い箇所から小さく追加する。

優先候補：

- `TaskService.UpdateTask`
- `TaskService.DeleteTask`
- task validation helper
- auth / user の重要な分岐

方針：

- まず service の業務ルールを確認しやすいテストから始める
- DB 依存が強い場合は、repository interface の必要性をその時点で判断する
- API response 形式の確認は、必要に応じて handler / integration test として別途扱う
- unit test 実装は別 Issue として小さく進める

---

## ■ 完成条件

本アプリは「設計と保守性を意識したWebアプリ」として完成を目指す。

完成条件：

- ユーザー登録 / ログイン / ログインユーザー取得が安定して動作する
- タスク作成 / 一覧 / 更新 / 削除が安定して動作する
- API仕様、エラー形式、dueDate 仕様がドキュメント化されている
- backend の責務分離方針を説明できる
- frontend の feature 分割と error handling 方針を説明できる
- TaskService など重要な業務ルールに unit test を小さく導入している
- 無料PaaS構成で production deploy 済みである

---

## ■ デプロイ方針

ポートフォリオとして公開しやすいよう、無料枠で始められるPaaS構成で deploy している。

- Frontend: Vercel
- Backend: Render
- Database: Neon

デプロイ時も、API仕様・認証挙動・DBスキーマを変更しない方針を維持する。

---

## ■ 今後の改善候補

1. service error 方針に基づき、実装変更が必要な箇所が出た場合は個別 Issue で扱う
2. user / auth validation helper 分離の必要性を確認する
