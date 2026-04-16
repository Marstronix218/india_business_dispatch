# India Business Dispatch

日本企業向けのインド市場インテリジェンス v1。  
ニュース一覧型のホームで複数記事を一画面に見せつつ、記事詳細では約500字の要約と日本企業への示唆、`為替・市況` カテゴリでは `為替 / 株式 / 金利 / 原油` の4指標を表示します。

## Current Shape

- カテゴリは `経済 / 規制 / 社会 / 文化 / 為替・市況 / コラム`
- ホームはニュース一覧型で、先頭1件の注目記事 + 2カラムの記事一覧
- 価格は `/pricing`、お問い合わせは `/contact`
- 記事モデルは `summary` と `marketSnapshot` を持つ
- `workflowStatus` が `review` または `failed` の記事は公開一覧から除外

## Key Files

- `app/page.tsx`
  ホームの一覧ページ。
- `app/pricing/page.tsx`
  価格表ページ。無料会員登録フォームもここに置いています。
- `app/contact/page.tsx`
  問い合わせ専用ページ。
- `components/news-list.tsx`
  ホームの一覧UIと検索・カテゴリ・業界タグフィルタ。
- `components/news-card.tsx`
  注目記事カード、通常記事カード、為替・市況の4指標表示。
- `components/article-view.tsx`
  記事詳細の表示。500字要約と関連記事、問い合わせCTAを持ちます。
- `lib/news-data.ts`
  記事型、カテゴリ、`MarketSnapshot`、シードデータ。
- `lib/site-config.ts`
  価格プラン、会員登録、問い合わせ型の設定。
- `lib/automation.ts`
  RSS/API 前提の source connector と、重複排除・要約・示唆生成の基盤関数。

## Getting Started

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## Validation

```bash
./node_modules/.bin/tsc --noEmit
npm run build
```

## Scraping Execution

Python バックエンド経由での取得とパイプライン実行を追加しました。

```bash
npm run scrape:fetch
npm run scrape:run
```

- `scrape:fetch`
  RSS 取得を試行し、取得不可時はフォールバック記事を生成します。
- `scrape:run`
  Python 取得結果を `POST /api/scrape/run` に送信して自動化パイプラインを実行します。
- 管理画面 `/admin` の `スクレイピング実行` ボタンは `POST /api/scrape/python` を呼び出し、取得結果をそのまま記事一覧に取り込みます。

## Notes

- 問い合わせフォームと無料会員登録フォームは UI 実装までで、外部 API 送信は未接続です。
- `為替・市況` は現在静的データで管理しています。
- 自動化基盤はローカルのサンプル実装で、本番の RSS/API 接続先は `lib/automation.ts` の `SOURCE_CONNECTORS` から差し替えられます。
