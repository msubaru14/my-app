# AGENTS.md

---

## ■ 目的

この文書は、このリポジトリで Codex が作業する際のルールを定義する。

目的は以下を守ること。

* 安全な変更
* 一貫した実装
* レビューしやすい差分
* 不要な作業の最小化
* Issue 目的に合った適切な判断

---

## ■ プロジェクト概要

このリポジトリはタスク管理アプリケーションである。

* ユーザー登録・ログインができる
* タスクを作成・更新・削除できる
* 認証は JWT で行う

現在のフェーズ:

* Backend のリファクタリング・構造改善フェーズである（機能開発ではない）
* Backend リファクタリングの進捗と優先順位は Issue と `docs/backend_refactoring_plan.md` で管理する
* Backend リファクタリング作業を始める前に、関連 Issue と `docs/backend_refactoring_plan.md` を確認する
* Frontend リファクタリングフェーズは完了済みであり、既存の Frontend ルールは保守制約として維持する

---

## ■ 技術スタック

* Backend: Go
* Frontend: React + TypeScript
* Authentication: JWT
* API: JSON-based HTTP API

---

## ■ ディレクトリ構成

```txt
.
├── backend
│   ├── controller
│   ├── db
│   ├── dto
│   ├── middleware
│   ├── model
│   ├── pkg
│   ├── repository
│   ├── router
│   ├── service
│   └── utils
├── docs
└── frontend
    ├── public
    └── src
        ├── features
        │   ├── tasks
        │   │   ├── components
        │   │   ├── hooks
        │   │   ├── api
        │   │   └── types
        │   └── auth
        │       ├── components
        │       ├── hooks
        │       ├── api
        │       └── types
        ├── components
        ├── hooks
        ├── lib
        ├── constants
        └── types
```

### ルール

* Backend は layer 構造（controller → service → repository）に従う
* Frontend の feature code は `features/{feature}` 配下に置く
* 共有コードは common directory に置く
* 指示がない限り、layer をまたいでファイルを移動しない

### Frontend feature 依存ルール

* Feature の public entry point は `frontend/src/features/{feature}/index.ts` とする
* Feature 外のコードは、その feature を `features/{feature}` 経由で import する
* Feature 外のコードは、`components`、`hooks`、`api`、`types` など feature 内部ディレクトリを直接 import しない
* 同一 feature 内のコードは、自 feature の内部ディレクトリへ relative import してよい
* Cross-feature dependency は最小限かつ明示的にする
* `tasks` などの business feature が、認証を shared application infrastructure として `auth` に依存することは許容する
* `auth` から `tasks` などの business feature へ逆依存することは禁止する
* task が明示的に要求しない限り、`index.ts` から feature internals を追加公開しない

---

## ■ 基本原則

1. Issue の目的を守る
2. タスクを小さく保つ
3. スコープ外を変更しない
4. 関心事を混ぜない
5. 推測しない
6. 不明点を報告する
7. 必ず結果を報告する

補足:

* 既存挙動維持は重要だが、明示的に仕様変更・挙動変更を扱う Issue では、その Issue で決めた方針を優先する
* 「小さく保つ」とは変更量を最小化すること自体ではなく、Issue 目的に対して安全でレビューしやすい単位に保つことである

---

## ■ 優先順位

1. 安全性
2. 読みやすさ
3. 保守性
4. 拡張性
5. 速度

---

## ■ 調査ルール（重要）

* 無関係なファイルは読まない
* 影響範囲を特定するための検索は許容する
* 検索結果から読むファイルは、現在の Issue に関係するものに絞る
* 「念のため」だけで無関係なファイルを開かない
* 調査は Issue 目的に対して必要十分にする

必要な場合:

* 理由を説明する
* 検索・確認した範囲を報告する

---

## ■ タスクスコープルール

* 1 PR = 1 目的
* 変更は小さく保つ
* スコープを明確にする
* 変更前に影響範囲を特定する

---

## ■ 変更サイズ管理

* Issue 目的を満たす範囲で、必要十分な差分を優先する
* 差分量を減らすことを目的化しない
* 最小差分よりも、責務が明確で、重複が少なく、一般的な実装を優先する
* Issue 目的に関係しないファイルは触らない
* 仕様変更・実装変更に伴う docs / test / 関連 helper の更新は、同じ目的の範囲として扱ってよい
* 触るファイル数ではなく、各変更が現在の Issue 目的に直接関係するかで判断する
* 変更が大きくなり始めたら、作業を止めて報告する

---

## ■ 設計懸念の報告ルール

Codex は既存挙動を維持することを優先する。
ただし、既存の内部設計や実装詳細を、無条件に温存すべきものとして扱わない。

「既存挙動を維持する」とは、ユーザーから見える挙動、API仕様、認証挙動、DBスキーマを維持することである。
内部実装の細部をすべて固定することではない。

仕様変更や挙動変更を目的とする Issue では、変更前の挙動を守ることではなく、Issue で合意した新しい仕様に沿って実装・test・docs を揃えることを優先する。

既存の設計や実装によって、依頼された作業が不自然・高リスク・実装しづらい・テストしづらい状態になる場合、Codex は無理に実装を進める前に懸念を報告する。

以下につながる可能性がある場合は、設計懸念として報告する。

* 不自然な差分
* 壊れやすいテスト
* 過剰な fake / mock / helper
* 重複ロジック
* 責務境界の曖昧化
* 内部の呼び出し順序や実装詳細に寄りすぎたテスト assertion
* Issue の目的に対して変更が大きくなりすぎる兆候

設計懸念を報告する際は、以下を説明する。

* どの既存設計・実装が懸念になっているか
* なぜ現在のタスクに影響するか
* 現在の Issue のブロッカーか、後続課題でよいか
* 安全な進め方の選択肢
* Codex の推奨案

Codex は自己判断でスコープを広げない。
懸念が現在の Issue 範囲を超える場合は、無関係な設計変更を加えず、報告して別 Issue 化を提案する。

既存実装に多少の扱いづらさがあっても、許容範囲であれば作業を続行してよい。
ただし、そのまま進めることで壊れやすいテスト、過剰な mocking、重複ロジック、責務の曖昧化を固定しそうな場合は、先に小さな準備 Issue を提案する。

小さな差分であっても、不自然な wrapper、意味の薄い helper、重複感の強い実装になる場合は、最小差分より読みやすさ・責務の明確さを優先してよい。

---

## ■ スコープ管理ルール

Codex は不要なスコープ拡大を避ける。

目的は「差分量を極限まで減らすこと」ではない。
目的は、現在の Issue の目的から逸脱せず、安全で読みやすく、保守しやすく、テストしやすい変更にすることである。

現在の Issue を直接支える小さな補助的整理は許容する。

許容する補助的変更:

* 小さな helper 分離
* 現在スコープ内での責務整理
* 現在スコープ内でのテストしやすさ改善
* 現在スコープ内での重複削減
* 現在作業に直接関係する命名整理

許容しない補助的変更:

* feature をまたぐ再設計
* アーキテクチャ置き換え
* 大規模 package 再編
* 広範囲な抽象化導入
* 無関係な cleanup

補助的変更が大きくなり始めた場合は、作業を止めて別 Issue 化を提案する。

スコープ判断の基準:

* 変更量ではなく、現在の Issue 目的に直接必要かで判断する
* 変更は小さく保つが、同じ Issue 目的の範囲では、設計・実装として自然で読みやすい形を優先する
* testability 向上や重複削減のための小整理は、現在の Issue を直接支える場合に限って許容する
* docs-only 変更では、関連する文書整合性の確認を主対象とし、不要な実装検証へ広げない

現在の Issue 範囲を超える変更を先に扱う方が安全・自然・効率的だと判断した場合:

* その場で自己判断で進めない
* なぜ現在の Issue に影響するかを報告する
* 現在の Issue 内で扱う案と、別 Issue に切り出す案を提示する
* Codex の推奨案を明示する

---

## ■ リファクタリングルール

* ユーザーから見える期待挙動を test / 動作確認で守る
* 挙動維持を理由に、内部実装の不自然さや重複を無条件に温存しない
* UI を変えない
* 新しいアーキテクチャを導入しない

補足:

* このルールはリファクタリング Issue に適用する
* 仕様変更・バグ修正・docs 更新 Issue では、それぞれの Issue 目的に必要な変更を優先する

問題を見つけた場合:

* 別途報告する

---

## ■ 実装ルール

* 既存パターンに従う
* 命名規則に従う
* 新しいライブラリを導入しない
* コーディングスタイルを変えない

---

## ■ 実装前

変更前に以下を行う。

* タスク理解を要約する
* 対象ファイルを列挙する
* スコープを確認する

不明点がある場合:

* 作業前に確認する

---

## ■ ファイル移動ルール

* 指定されたファイルだけ移動する
* logic を変更しない
* import の修正だけ行う
* 無関係なファイルを削除しない
* 移動後に検証する
* 明示的に指示されない限り、ファイルを削除しない

---

## ■ エラーハンドリングルール

* Frontend の error control は `useApiError` が返す `result.type` に基づいて行う
* message text で分岐しない
* API `error.code` は制御ロジックに使用する
* API `error.message` は表示メッセージ候補としてのみ使用してよい
* Validation error は `details[].message` または正規化された `result.message` を使用する
* Error handling と表示を統一するための最小限の挙動変更は許容する
* Error handling 更新時に無関係な UI 変更をしない
* 詳細方針は `docs/frontend-error-handling.md` を参照する

---

## ■ 禁止事項

以下を行わない。

* 無関係なリファクタリング
* Issue 目的に含まれない挙動変更
* アーキテクチャ変更
* 無関係なファイルの読み取り
* 要件の推測
* 依存関係の追加
* UI 変更
* 関心事の混在

---

## ■ Git ワークフロールール

* 常に最新の main から新しいブランチを作成する
* 古いブランチを再利用しない
* 1 branch = 1 目的
* 作業を行った場合、原則としてコミット前で止める
* commit、push、PR 作成は、Commander から明示的に依頼された場合のみ行う
* PR 前に差分を確認する（`git diff origin/main`）
* ローカル差分より GitHub の PR 差分を信頼する
* history が壊れている場合は、新しいブランチを作成する

以下を行わない。

* 複数の変更を1つのブランチに混ぜる
* 無関係なファイルを commit する

---

## ■ 検証ルール

Frontend のブラウザ操作確認を行う場合は、`docs/codex-browser-check.md` を参照する。

この文書は以下に使用する。

* local startup assumptions
* browser operation method
* check points
* change-specific checks
* result reporting format

標準シナリオに加えて、実際の変更内容に合う挙動を確認する。

例:

* 変更した条件分岐それぞれ
* 移動・整理した guard の挙動
* 未認証、invalid token、empty data、API error states などの境界ケース

この文書に従えない場合:

* 検証できなかった内容を報告する
* 理由を説明する
* 結果を推測しない

docs-only 変更の場合:

* Markdown の表示崩れ、リンク、記述整合性など、変更内容に合う確認を行う
* UI や API の挙動に触れていない場合、ブラウザ操作確認や console 確認は必須ではない
* 実装変更を伴わない場合、テスト実行の必要性は変更内容に応じて判断し、未実施の場合は理由を報告する

---

## ■ 報告ルール

作業完了後、以下を報告する。

* 目的
* 変更内容
* 変更ファイル
* 影響範囲
* 検証
* リスクレベル
* 懸念点

---

## ■ PR テンプレート連携（重要）

Codex は repository の PR テンプレートに従う。

* PR テンプレートは `.github/pull_request_template.md` にあるため、PR 作成前に直接読む
* 必須セクションをすべて記入する
* チェックリスト項目を確認する
* スコープルールを満たす
* リファクタリングでは挙動が維持されていることを確認する
* 仕様変更・バグ修正では、Issue で合意した期待挙動になっていることを確認する

確認できないチェックリスト項目がある場合:

* 明示的に報告する

---

## ■ Issue テンプレート連携

Bug report issue を作成する場合、Codex は repository の bug report テンプレートに従う。

* Bug report テンプレートは `.github/ISSUE_TEMPLATE/bug_report.md` にあるため、直接読む
* テンプレートのセクションに従って issue を記入する
* bug report と refactoring / feature task を混ぜない

---

## ■ エンコーディングルール

* Markdown、TypeScript、JavaScript、CSS、JSON、Go files は UTF-8 とする
* 日本語を含む可能性がある text file を PowerShell で読む場合は `Get-Content -Encoding UTF8` を使う
* Terminal output の mojibake は、UTF-8 で再読込するまで file corruption と判断しない

---

## ■ 迷った場合

推測しない。

代わりに以下を報告する。

* 何が不明か
* なぜ重要か
* 考えられる選択肢
* 最も安全な推奨案

---

## ■ タスク指示の優先

より具体的なタスク指示がある場合、その指示はこの文書より優先される。

---
