# tokushoho-generator

A generator for the "Tokushoho page" — the legal notice required by Japan's Act on Specified Commercial Transactions (特定商取引法). If you run e-commerce or SaaS in Japan you must publish this notice, but it has many fields and is easy to leave incomplete. Fill in a form and it generates a page that covers the required items.

Built so an indie developer or small business doesn't get stuck on Tokushoho compliance right before launch — done in 10 minutes.

## What it does

- Enter business name, address, contact, price, payment methods, return policy, and so on
- Generates a page that satisfies the items required by the Act
- Outputs it ready to paste into your own site

## Stack

- Next.js 15 (App Router) / TypeScript / React / Tailwind CSS

## Run locally

```bash
npm install
npm run dev
# http://localhost:3000
```

## Note

The output is a template. Before you publish it, always confirm it matches the current law and your actual business (this tool does not provide legal advice).

## License

Personal project. Terms of use: please ask.

---

> Related: GEO/AEO checker [geo-checker](https://github.com/greymoth-jp/geo-checker) / e-invoicing OSS [zatca-toolkit](https://github.com/greymoth-jp/zatca-toolkit)
