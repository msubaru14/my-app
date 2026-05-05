# フロントエンド エラー処理方針

## ■ 目的

APIエラーをフロントエンドでどのように分類し、表示するかを定義する。

## ■ 前提

APIレスポンス仕様は docs/api.md に従う。

## ■ 基本方針

- エラー制御は error.code を元に行う
- message の文字列で分岐しない
- API error.message は表示候補として扱う
- 表示メッセージは以下の優先順位で決定する
  1. フロント固定文
  2. API error.message
  3. 汎用エラーメッセージ

## ■ useApiError の役割

- APIエラーを redirect / validation / message に分類する
- 画面表示に使いやすい形へ整える
- 実際の表示・遷移は画面側で行う

## ■ 画面側の責務

- result.type で分岐する
- redirect は navigate
- validation は fieldErrors などで表示
- message は error または画面方針に応じて表示

## ■ validation の扱い

- details[].message を表示する
- details が空の場合は result.message を使う

## ■ 注意点

- message の文字列で制御しない
- API message に内部情報を含めない
- 表示統一のための最小限の挙動変更は許容する
