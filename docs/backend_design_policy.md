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
- 無料PaaS構成でデプロイできる状態になっている

---

## ■ デプロイ方針

ポートフォリオとして公開しやすいよう、無料枠で始められるPaaS構成を想定する。

- Frontend: Vercel
- Backend: Render
- Database: Neon

デプロイ時も、API仕様・認証挙動・DBスキーマを変更しない方針を維持する。

---

## ■ 次の進め方

1. `TaskService.UpdateTask` の service input 導入要否を検討する
2. TaskService から unit test を小さく導入する
3. unit test 導入時に repository interface の必要性を確認する
4. service error 方針を整理する
5. user / auth validation helper 分離の必要性を確認する
