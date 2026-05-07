# フロントエンド リファクタリング方針

## ■ 目的

本フェーズは、既存機能の挙動を維持したまま、
フロントエンドの構造整理・責務分離・保守性向上を目的とする。

本作業は **機能開発ではなくリファクタリングフェーズ** と位置付ける。

---

## ■ 基本原則

以下を最優先とする：

1. **既存挙動を変更しない**
2. **UIを変更しない**
3. **変更は最小単位で行う（1PR = 1目的）**
4. **関心の分離を徹底する**
5. **スコープ外の変更は行わない**

※ 本方針はリポジトリのルールにも準拠する 

---

### 0. 開発基盤整理（追加）

- [x] .gitattributes による改行コード方針の明示（LF）
- [x] frontend 配下の改行コード正規化（LF統一）

---

### 1. APIクライアント共通処理の整理

- [x] base URL の共通化
- [x] token取得処理の共通化
- [x] Authorizationヘッダー生成の共通化
- [x] Content-Type の統一

---

### 2. エラー処理と表示方針の整理

- [x] `useApiError` の責務整理
- [x] `ValidationDetail` 型の整理
- [x] エラー分類（redirect / validation / message）の統一
- [x] 表示メッセージ決定ルールの統一
- [x] Login / Register への適用
- [x] TaskAdd / TaskList / EditTaskModal への適用
- [x] フロントエンドエラー処理方針のドキュメント化
- [x] AGENTS.md への作業ルール反映

補足：

- エラー制御は `error.code` / `result.type` ベースに統一
- message 文字列での制御は禁止
- 表示統一のための最小限の挙動変更は許容
- 詳細は `docs/frontend-error-handling.md` を参照

---

### 3. tasks画面の責務分割

- [x] `TaskList.tsx` の現状責務調査
- [x] 今日タスク抽出ロジックの分離
- [x] タスク行表示の `TaskListItem` 分離
- [x] ヘッダー表示の `TaskListHeader` 分離
- [x] データ取得状態の `useTaskListData` 分離
- [x] タスク操作処理の `useTaskListData` 分離
- [x] タスク操作インターフェースの整理
- [x] 初期取得とタスク再取得の分離
- [x] hook内のエラー表示責務を画面側へ移動

補足：

- `TaskList.tsx` は画面全体の組み立てとUIイベント制御を担当
- `TaskListItem` / `TaskListHeader` は表示責務を担当
- `useTaskListData` はタスク一覧取得・再取得・タスク操作を担当
- 今日タスク抽出は `utils` に分離
- 既存挙動とUIは維持
- 型重複や返り値構造のさらなる整理は、全体リファクタリング完了後の最終整理で扱う

---

### 4. CSS整理

- [x] エラー表示の inline style をCSSへ移行
- [x] tasks配下の汎用CSSクラス名の衝突回避
- [x] common.css の責務整理
- [x] グローバル要素指定の index.css への移動
- [x] common.css の import 位置整理
- [x] auth配下CSSの責務整理
- [x] App.css の未使用スタイル削除
- [x] セレクタの明示化（子要素セレクタの置き換え）

補足：

- 共通化は行っていない（責務分離を優先）
- 軽微な改善余地はあるが、STEP4としては完了扱いとする

---

### 5. export / import 方針の統一

- [x] named export への統一
- [x] default export の排除
- [x] feature単位の公開口 `index.ts` の作成
- [x] `App.tsx` の import 経路整理
- [x] feature間依存ルールの明文化
- [x] auth feature内部の export/import 確認
- [x] tasks feature内部の export/import 確認

補足：

- export は原則 named export に統一
- feature外からは `features/{feature}` 経由で import
- feature内部構造への直接 import は原則避ける
- 同一feature内の相対 import は許容
- `tasks → auth` は認証基盤への依存として許容
- `auth → tasks` のような逆依存は禁止
- feature公開口は必要最小限に限定

---

### 6. フロントエンド最終整理

- [x] 不要 asset の削除
- [x] 不要 console.log の削除
- [x] 明確な未使用 CSS の削除
- [x] セミコロン方針の統一
- [x] ESLint によるセミコロンルール追加
- [x] README のフロントエンド構成説明更新

---

## ■ 禁止事項

* 機能追加
* UI改善（見た目変更）
* 大規模な一括リファクタ
* 複数目的を含むPR
* 既存設計の全面変更

---

## ■ タスク運用ルール

* 1Issue = 1目的
* 1PR = 1変更
* 影響範囲を事前に明確化する
* 変更後は必ず動作確認を行う

---

## ■ 動作確認範囲

最低限以下を確認する：

* ユーザー登録
* ログイン
* タスク一覧取得
* タスク作成
* タスク編集
* タスク削除
* タスク完了切り替え

---

## ■ 今後の拡張（本フェーズ外）

以下は別フェーズで検討する：

* レスポンス型の厳密化
* APIクライアントの完全型安全化
* UI/UX改善
* 状態管理ライブラリ導入
* テストコード整備

---

## ■ 補足

本方針は「安全な構造整理」を目的とし、
スピードよりも **破壊しないこと・積み上げ可能であること** を優先する。
