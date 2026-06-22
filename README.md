# tokushoho-generator

特定商取引法に基づく表記（特商法ページ）を生成するツール。日本で EC や SaaS を運営すると、特商法に基づく表記の掲載が必要になりますが、項目が多く・抜け漏れが起きやすい領域です。フォームに入力すると、必要項目を満たした特商法ページを生成します。

個人開発者やスモールビジネスが、リリース直前に特商法対応で詰まるのを 10 分で終わらせるためのツールです。

## 何をするか

- 事業者名・所在地・連絡先・販売価格・支払方法・返品ポリシーなどを入力
- 特商法に必要な項目を満たしたページを生成
- そのまま自サイトに貼れる形で出力

## 技術スタック

- Next.js 15 (App Router) / TypeScript / React / Tailwind CSS

## ローカル実行

```bash
npm install
npm run dev
# http://localhost:3000
```

## 注意

生成物は雛形です。実際の掲載前に、最新の法令と自社の実態に合っているか必ず確認してください（本ツールは法的助言を提供するものではありません）。

## ライセンス

個人プロジェクト。利用条件は要相談。

---

> 関連: GEO/AEO チェッカー [geo-checker](https://github.com/greymoth-jp/geo-checker) ／ e-invoicing OSS [zatca-toolkit](https://github.com/greymoth-jp/zatca-toolkit)
