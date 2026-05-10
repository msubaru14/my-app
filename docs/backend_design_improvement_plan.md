# backend設計改善フェーズ 調査書

## ■ 目的

backend リファクタリング完了後の次フェーズとして、controller / service / repository の責務境界を確認し、今後の設計改善候補を整理する。

このドキュメントは、backend設計改善フェーズの判断材料をまとめた調査書として扱う。
最終的な採用方針は `docs/backend_design_policy.md` に整理する。

---

## ■ 前提

- API仕様は変更しない
- 認証・認可挙動は変更しない
- DBスキーマは変更しない
- 現行の controller -> service -> repository の層構造を維持する
- 新しい層や interface は、必要性が明確になるまで導入しない
- 設計改善候補は、小さな Issue に分割して扱う

---

## ■ 現状責務

### controller

現在の主な責務：

- HTTP request の bind
- path parameter / context からの値取得
- request 単体で判定できる validation
- API error response の組み立て
- model への入力変換
- response DTO への変換 helper 呼び出し
- service の呼び出し

確認したファイル：

- `backend/controller/auth_controller.go`
- `backend/controller/user_controller.go`
- `backend/controller/task_controller.go`
- `backend/controller/task_validation.go`
- `backend/controller/error_response.go`

現状メモ：

- `respondAPIError` により、controller の error response は `apperror.MapErrorCodeToStatus` 経由に整理済み
- task validation は `task_validation.go` に分離済み
- user / auth の必須チェックは controller 内に残っている
- `CreateUser` / `CreateTask` では controller が request DTO から model への変換も担当している

### service

現在の主な責務：

- 業務ルールの実行
- repository の呼び出し
- password hash / password check
- JWT 発行処理の呼び出し
- task 更新対象フィールド有無の判定
- task 所有者チェックを含む取得処理の利用
- repository error の一部を API error へ変換

確認したファイル：

- `backend/service/auth_service.go`
- `backend/service/user_service.go`
- `backend/service/task_service.go`

現状メモ：

- `TaskService.UpdateTask` は `dto.UpdateTaskRequest` を受け取り、request DTO に依存している
- task 更新では、未指定チェック、所有者付き取得、更新値反映、永続化まで service にまとまっている
- auth service は通常の `error` を返し、controller が unauthorized response に変換している
- task service は `apperror.APIError` を返す箇所があり、controller がそのまま response に変換している

### repository

現在の主な責務：

- GORM による DB 操作
- 条件付き検索
- 作成・更新・削除
- GORM error の返却

確認したファイル：

- `backend/repository/user_repository.go`
- `backend/repository/task_repository.go`

現状メモ：

- repository はおおむね DB 操作に閉じている
- `FindByIDAndUserID` は所有者チェックを実現するための条件付き取得として service から利用されている
- repository interface は導入されていない

---

## ■ 課題候補

### 1. service が request DTO に依存している

`TaskService.UpdateTask` は `dto.UpdateTaskRequest` を直接受け取っている。

現状では小さい構成のため大きな問題にはなっていないが、service が HTTP request 形状に寄るため、今後 task 更新ロジックが増える場合は責務境界が曖昧になりやすい。

検討候補：

- service 用の入力型を用意する
- controller で request DTO から service 入力へ変換する
- ただし、現時点では型追加による差分と効果を比較してから判断する

### 2. controller の validation が増えやすい

task validation は helper に分離済みだが、user / auth の必須チェックは controller 内に残っている。

現状では endpoint 数が少なく、既存レスポンス形式を維持する目的もあるため許容範囲。
ただし validation 分岐が増える場合、controller が読みづらくなる可能性がある。

検討候補：

- endpoint 単位の validation helper を必要になった範囲で分離する
- error detail 形式を維持できる範囲でのみ整理する
- DTO binding tag への一括移行は行わない

### 3. service error の扱いに差がある

auth service は通常の `error` を返し、controller が unauthorized に変換している。
task service は `apperror.APIError` を返す箇所がある。

現状では response 形式は揃っているが、service が API error を返すべきか、controller が変換すべきかは設計判断として残っている。

検討候補：

- service error 方針を endpoint 横断で整理する
- API response 形式に近い error を service が直接返す範囲を決める
- 文字列 message による制御は避け、code ベースの方針を維持する

### 4. update 処理が厚くなりやすい

`TaskService.UpdateTask` は、更新可否判定、対象取得、値反映、保存をまとめて担当している。

現状では自然な service 責務の範囲だが、今後項目数や関連処理が増える場合、usecase 層や command 型の必要性を検討する材料になる。

検討候補：

- まず service 内 helper の分離で足りるか確認する
- usecase 層導入は、複数 service の orchestration が必要になってから検討する

---

## ■ 現行レイヤード構成で改善可能な範囲

- controller 内の validation helper 分離
- controller から service へ渡す入力型の整理
- service 内 helper の小分け
- service error 方針の文書化
- repository のメソッド命名と責務の明確化
- DTO / model / service input の境界整理

これらは新しいアーキテクチャを導入しなくても、小さな Issue として扱える。

---

## ■ 導入検討候補

### usecase 層

検討する条件：

- 複数 service / repository をまたぐ orchestration が増える
- controller が usecase 手順を知りすぎる
- service が HTTP 入力や response 都合を強く意識し始める

現時点の判断：

- すぐには導入しない
- task / user / auth の現状規模では、service 内整理で対応できる可能性が高い

### repository interface

検討する条件：

- service の単体テストで DB 依存を切り離す必要が高くなる
- repository 実装を差し替える具体的な予定が出る
- interface が利用側の要件として自然に定義できる

現時点の判断：

- すぐには導入しない
- 抽象化のためだけの interface は避ける

### transaction 管理方針

検討する条件：

- 複数 repository 操作を1つの整合性単位で扱う処理が増える
- 途中失敗時の rollback が必要になる
- service / usecase のどこで transaction を開始するか判断が必要になる

現時点の判断：

- すぐには変更しない
- 現在の task / user 操作では単一 repository 操作が中心

---

## ■ 別アプリのひな型として使う場合の判断

このリポジトリをタスク管理アプリ単体ではなく、別アプリ開発のひな型として使う場合は、設計判断の基準が少し変わる。

ただし、ひな型化を理由に現時点のタスク管理アプリへ先回りした抽象化を入れることは避ける。
まずは現行構成を軽く保ち、別アプリで必要性が出た時に拡張できる判断基準を残す。

### ひな型として維持したいもの

- controller -> service -> repository の基本的な層構造
- request DTO / response DTO / model の分離
- `apperror` / `response` による API error response の共通化
- controller で HTTP 入出力を扱い、service で業務ルールを扱う方針
- repository を DB 操作に閉じる方針
- 新しい構造を入れる前に、必要性を確認する判断順序

### 別アプリで再評価するもの

別アプリでは、扱う業務の複雑さによって以下を再評価する。

- 複数の業務処理をまたぐ usecase 層が必要か
- service 入力型を request DTO から分離する必要があるか
- repository interface がテストや差し替えに必要か
- transaction 境界を service / usecase のどちらで扱うべきか
- domain ごとに package を分ける必要があるか
- API error と domain error の境界を分ける必要があるか

### 導入を検討しやすいサイン

以下が出てきた場合は、タスク管理アプリでは不要だった設計を導入候補にする。

- 1つの操作で複数の repository 更新が必要になる
- 途中失敗時に rollback が必要になる
- controller が複数 service の呼び出し順序を知り始める
- service が HTTP request / response の都合を強く持ち始める
- DB を使わずに service の単体テストを書きたい場面が増える
- 同じ業務ルールを複数の entry point から使う
- domain ごとのルールや用語が増え、1つの service に混ざり始める

### 現時点の判断

このタスク管理アプリでは、上記のサインはまだ強く出ていない。
そのため、現時点では新アーキテクチャを導入せず、現行レイヤード構成のまま小さく整理する。

一方で、別アプリのひな型として使う場合は、この方針書を「最小構成から始め、必要性が出た段階で拡張するための判断材料」として扱う。

---

## ■ 今は導入しないもの

- usecase 層
- repository interface
- transaction manager
- DI container
- CQRS
- event driven 構成
- package 再編を伴う大規模リファクタリング

---

## ■ 次の進め方

1. 調査結果をもとに、backend設計方針を `docs/backend_design_policy.md` に整理する
2. 実装変更を伴う項目は別 Issue として分割する

各項目は、実装変更を伴う場合は別 Issue として分割する。
