"use client";

import { useMemo, useState, useCallback, useRef } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface FormData {
  sellerName: string;
  representativeName: string;
  address: string;
  email: string;
  phone: string;
  contactFormUrl: string;
  pricing: string;
  paymentMethods: string;
  deliveryTiming: string;
  returnPolicy: string;
  businessHours: string;
  websiteUrl: string;
  additionalInfo: string;
}

type OutputMode = "jp" | "bilingual";
type CopyState = "idle" | "copied";

const EMPTY: FormData = {
  sellerName: "",
  representativeName: "",
  address: "",
  email: "",
  phone: "",
  contactFormUrl: "",
  pricing: "",
  paymentMethods: "",
  deliveryTiming: "",
  returnPolicy: "",
  businessHours: "",
  websiteUrl: "",
  additionalInfo: "",
};

const REQUIRED_FIELDS: (keyof FormData)[] = [
  "sellerName",
  "representativeName",
  "address",
  "email",
  "pricing",
  "paymentMethods",
  "deliveryTiming",
  "returnPolicy",
  "businessHours",
];

/* ─── Field definitions ──────────────────────────────────────────────────── */
interface FieldDef {
  id: keyof FormData;
  label: string;
  sublabel: string;
  placeholder: string;
  type?: "textarea";
  required?: boolean;
  rows?: number;
  legalNote: string;
  legalConsequence: string;
  example: string;
}

const FIELDS: FieldDef[] = [
  {
    id: "sellerName",
    label: "Seller / Business Name",
    sublabel: "販売事業者名",
    placeholder: "Acme Inc.",
    required: true,
    legalNote: "The legal entity name of your business or your personal trade name.",
    legalConsequence: "Omission = non-compliance. Japanese payment processors check for this.",
    example: "Acme Inc. / Jane Smith (sole trader)",
  },
  {
    id: "representativeName",
    label: "Representative Name",
    sublabel: "運営責任者",
    placeholder: "John Smith",
    required: true,
    legalNote: "The named individual responsible for the business operation.",
    legalConsequence: "Required for 通信販売 (mail-order / subscription) sellers. Must be a real person's name.",
    example: "John Smith",
  },
  {
    id: "address",
    label: "Business Address",
    sublabel: "所在地（住所）",
    placeholder: "1234 Market St, San Francisco, CA 94103, USA",
    required: true,
    type: "textarea",
    rows: 2,
    legalNote: "Full physical address of the business. PO Box alone is not accepted.",
    legalConsequence: "Missing or vague addresses are the most common reason Japanese users abandon checkout.",
    example: "123 Main Street, Suite 400, San Francisco, CA 94105, United States",
  },
  {
    id: "email",
    label: "Contact Email",
    sublabel: "お問い合わせメール",
    placeholder: "support@example.com",
    required: true,
    legalNote: "The primary email address Japanese customers can use to contact you.",
    legalConsequence: "Required. Must be actively monitored — Japanese consumer law expects a reply.",
    example: "support@yourcompany.com",
  },
  {
    id: "phone",
    label: "Phone Number",
    sublabel: "電話番号（任意・フォームURLでも可）",
    placeholder: "+1-800-000-0000",
    legalNote: "International format accepted. If omitted, contact form URL becomes mandatory.",
    legalConsequence: "Phone OR contact form URL — at least one is required by law.",
    example: "+1-415-000-0000",
  },
  {
    id: "contactFormUrl",
    label: "Contact Form URL",
    sublabel: "問い合わせフォームURL（電話なし場合は必須）",
    placeholder: "https://example.com/contact",
    legalNote: "Acceptable substitute for a phone number under the 2022 amendment.",
    legalConsequence: "If no phone: this field becomes required. The form must be publicly accessible.",
    example: "https://yourcompany.com/support",
  },
  {
    id: "pricing",
    label: "Pricing / Fees",
    sublabel: "販売価格・料金",
    placeholder: "Monthly: $29/mo · Annual: $290/yr. Prices in USD; Japanese consumption tax (消費税) applies at checkout.",
    required: true,
    type: "textarea",
    rows: 3,
    legalNote: "Must state all applicable prices including tax treatment. Subscription terms must be explicit.",
    legalConsequence: "Vague pricing is a top consumer complaint and grounds for regulatory inquiry.",
    example: "Basic: $29/month · Pro: $99/month. All prices in USD. 10% Japanese consumption tax (消費税) added at checkout.",
  },
  {
    id: "paymentMethods",
    label: "Payment Methods",
    sublabel: "お支払い方法",
    placeholder: "Credit card (Visa, Mastercard, Amex), PayPal",
    required: true,
    legalNote: "List all accepted payment methods explicitly.",
    legalConsequence: "Required disclosure. Japanese users want to confirm their preferred method before purchasing.",
    example: "Credit/debit card (Visa, Mastercard, American Express), PayPal, Stripe",
  },
  {
    id: "deliveryTiming",
    label: "Service Delivery / Access Timing",
    sublabel: "サービス提供・引き渡し時期",
    placeholder: "Immediately after payment confirmation. Access granted automatically.",
    required: true,
    legalNote: "For SaaS/digital: state when access is granted. For physical goods: expected shipping timeframe.",
    legalConsequence: "Required. Ambiguity here leads to chargebacks from Japanese users.",
    example: "Service access is granted immediately upon successful payment. Login credentials sent by email within 5 minutes.",
  },
  {
    id: "returnPolicy",
    label: "Return / Refund Policy",
    sublabel: "返品・キャンセルポリシー",
    placeholder: "Due to the digital nature of the service, refunds are not available once access is granted. Contact us within 14 days for billing errors.",
    required: true,
    type: "textarea",
    rows: 3,
    legalNote: "Explicit no-refund policies are legally enforceable for digital goods in Japan if disclosed clearly.",
    legalConsequence: "Absence of a clear policy defaults to 8-day cancellation right under 特商法. State your terms explicitly.",
    example: "Digital services: no refund after access is granted. Physical goods: returns accepted within 8 days of delivery, unopened only.",
  },
  {
    id: "businessHours",
    label: "Business Hours",
    sublabel: "営業時間",
    placeholder: "Mon–Fri 09:00–18:00 PST (replies within 2 business days)",
    required: true,
    legalNote: "When customers can expect to reach you. Include timezone.",
    legalConsequence: "Required. Japanese users check this to know when to expect replies.",
    example: "Monday–Friday 09:00–18:00 PST (UTC-8). Replies within 1–2 business days.",
  },
  {
    id: "websiteUrl",
    label: "Your Website URL",
    sublabel: "サービスサイトURL（フッターリンク用）",
    placeholder: "https://example.com",
    legalNote: "Used in the generated page footer to link back to your main site.",
    legalConsequence: "Optional but recommended — helps Japanese users verify legitimacy.",
    example: "https://yourcompany.com",
  },
  {
    id: "additionalInfo",
    label: "Additional Information (optional)",
    sublabel: "その他（任意）",
    placeholder: "Any other disclosures specific to your service...",
    type: "textarea",
    rows: 2,
    legalNote: "Industry-specific additional disclosures (e.g. for financial services, healthcare, etc.).",
    legalConsequence: "Optional. Include only if your service type has additional regulatory requirements.",
    example: "This service does not constitute financial advice. Past performance is not indicative of future results.",
  },
];

/* ─── HTML escaping helpers ─────────────────────────────────────────────── */
function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return escHtml(trimmed);
  return "#";
}

/* ─── Output generators ──────────────────────────────────────────────────── */
const today = (): string => {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

const todayEn = (): string => {
  const d = new Date();
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const issueNumber = (): string => {
  const d = new Date();
  const start = new Date(2024, 0, 1);
  const days = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return String(days).padStart(4, "0");
};

function generateJP(f: FormData): string {
  const rows: Array<{ label: string; value: string }> = [
    { label: "販売事業者名", value: f.sellerName || "（未入力）" },
    { label: "運営責任者", value: f.representativeName || "（未入力）" },
    { label: "所在地", value: f.address || "（未入力）" },
    { label: "お問い合わせ先（メール）", value: f.email || "（未入力）" },
    {
      label: "お問い合わせ先（電話）",
      value: f.phone || (f.contactFormUrl ? `お問い合わせフォーム: ${f.contactFormUrl}` : "（未入力）"),
    },
    { label: "販売価格・料金", value: f.pricing || "（未入力）" },
    { label: "お支払い方法", value: f.paymentMethods || "（未入力）" },
    { label: "サービス提供・引き渡し時期", value: f.deliveryTiming || "（未入力）" },
    { label: "返品・キャンセルポリシー", value: f.returnPolicy || "（未入力）" },
    { label: "営業時間", value: f.businessHours || "（未入力）" },
  ];
  if (f.additionalInfo) rows.push({ label: "その他", value: f.additionalInfo });

  const tableRows = rows
    .map(
      (r) => `    <tr>
      <th scope="row">${escHtml(r.label)}</th>
      <td>${escHtml(r.value).replace(/\n/g, "<br>")}</td>
    </tr>`
    )
    .join("\n");

  const websiteLink = f.websiteUrl
    ? `<a href="${safeHref(f.websiteUrl)}" rel="noopener">${escHtml(f.sellerName || "当社サービス")}</a>`
    : escHtml(f.sellerName || "当社サービス");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>特定商取引法に基づく表記 — ${escHtml(f.sellerName || "事業者名")}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", Georgia, serif;
      color: #0D0D0D;
      background: #F5F0E8;
      padding: 3rem 1rem;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: #FFFFFF;
      padding: 3rem 3.5rem;
      border-top: 4px solid #0D0D0D;
    }
    .gazette-label {
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #C0392B;
      font-weight: 600;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .gazette-label::after {
      content: '';
      display: block;
      flex: 1;
      height: 1px;
      background: #C0392B;
      opacity: 0.4;
    }
    h1 {
      font-size: 1.6rem;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 0.25rem;
      letter-spacing: 0.02em;
    }
    .issued-date {
      font-size: 11px;
      color: #6B6560;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #C8C2B4;
      letter-spacing: 0.04em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2.5rem;
    }
    th, td {
      padding: 0.85rem 1.1rem;
      border: 1px solid #C8C2B4;
      text-align: left;
      vertical-align: top;
      line-height: 1.7;
      font-size: 14px;
    }
    th {
      width: 32%;
      background: #F5F0E8;
      font-weight: 600;
      white-space: nowrap;
      font-size: 13.5px;
    }
    @media (max-width: 600px) {
      .container { padding: 1.5rem 1.25rem; }
      th { width: 42%; font-size: 12px; }
      td { font-size: 13px; }
    }
    .disclaimer {
      font-size: 11.5px;
      color: #6B6560;
      border: 1px solid #C8C2B4;
      border-left: 3px solid #C0392B;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      line-height: 1.7;
      font-style: italic;
    }
    .footer-bar {
      border-top: 1px solid #C8C2B4;
      padding-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .footer-bar a { color: #6B6560; text-decoration: none; }
    .footer-bar a:hover { color: #C0392B; }
    .credit {
      font-size: 10.5px;
      color: #9A948E;
      letter-spacing: 0.06em;
    }
    @media print {
      body { background: white; }
      .container { box-shadow: none; border: 1px solid #ccc; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="gazette-label">特定商取引法に基づく表記</div>
    <h1>特定商取引法に基づく表記</h1>
    <div class="issued-date">発行日：${today()} &nbsp;｜&nbsp; 事業者：${escHtml(f.sellerName || "（未入力）")}</div>
    <table>
      <tbody>
${tableRows}
      </tbody>
    </table>
    <div class="disclaimer">
      本表記は特定商取引法（特商法）に基づき作成されたものです。内容は情報提供を目的としており、法的アドバイスを構成するものではありません。詳細はご自身の法律の専門家にご確認ください。
    </div>
    <div class="footer-bar">
      <span class="credit">${websiteLink}</span>
      <span class="credit">Generated with <a href="https://tokushoho-generator.vercel.app" rel="noopener">tokushoho-generator.vercel.app</a></span>
    </div>
  </div>
</body>
</html>`;
}

function generateBilingual(f: FormData): string {
  const rows: Array<{ jpLabel: string; enLabel: string; value: string }> = [
    { jpLabel: "販売事業者名", enLabel: "Seller / Business Name", value: f.sellerName || "（未入力）" },
    { jpLabel: "運営責任者", enLabel: "Representative", value: f.representativeName || "（未入力）" },
    { jpLabel: "所在地", enLabel: "Business Address", value: f.address || "（未入力）" },
    { jpLabel: "お問い合わせ先（メール）", enLabel: "Contact Email", value: f.email || "（未入力）" },
    {
      jpLabel: "お問い合わせ先（電話）",
      enLabel: "Phone / Contact Form",
      value: f.phone || (f.contactFormUrl ? `Form: ${f.contactFormUrl}` : "（未入力）"),
    },
    { jpLabel: "販売価格・料金", enLabel: "Pricing / Fees", value: f.pricing || "（未入力）" },
    { jpLabel: "お支払い方法", enLabel: "Payment Methods", value: f.paymentMethods || "（未入力）" },
    { jpLabel: "サービス提供・引き渡し時期", enLabel: "Service Delivery Timing", value: f.deliveryTiming || "（未入力）" },
    { jpLabel: "返品・キャンセルポリシー", enLabel: "Return / Refund Policy", value: f.returnPolicy || "（未入力）" },
    { jpLabel: "営業時間", enLabel: "Business Hours", value: f.businessHours || "（未入力）" },
  ];
  if (f.additionalInfo) rows.push({ jpLabel: "その他", enLabel: "Additional Info", value: f.additionalInfo });

  const tableRows = rows
    .map(
      (r) => `    <tr>
      <th scope="row">
        <span class="jp-label">${escHtml(r.jpLabel)}</span>
        <span class="en-label">${escHtml(r.enLabel)}</span>
      </th>
      <td>${escHtml(r.value).replace(/\n/g, "<br>")}</td>
    </tr>`
    )
    .join("\n");

  const websiteLink = f.websiteUrl
    ? `<a href="${safeHref(f.websiteUrl)}" rel="noopener">${escHtml(f.sellerName || "Service")}</a>`
    : escHtml(f.sellerName || "");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>特定商取引法に基づく表記 — ${escHtml(f.sellerName || "事業者名")}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Noto Serif JP", "Hiragino Mincho ProN", Georgia, serif;
      color: #0D0D0D;
      background: #F5F0E8;
      padding: 3rem 1rem;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: #FFFFFF;
      padding: 3rem 3.5rem;
      border-top: 4px solid #0D0D0D;
    }
    .gazette-label {
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #C0392B;
      font-weight: 600;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .gazette-label::after {
      content: '';
      display: block;
      flex: 1;
      height: 1px;
      background: #C0392B;
      opacity: 0.4;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 0.2rem;
    }
    .subtitle {
      font-size: 12px;
      color: #6B6560;
      margin-bottom: 0.25rem;
      font-style: italic;
      letter-spacing: 0.02em;
    }
    .issued-date {
      font-size: 11px;
      color: #6B6560;
      margin-top: 0.5rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #C8C2B4;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 2.5rem; }
    th, td {
      padding: 0.85rem 1.1rem;
      border: 1px solid #C8C2B4;
      text-align: left;
      vertical-align: top;
      line-height: 1.7;
      font-size: 14px;
    }
    th {
      width: 34%;
      background: #F5F0E8;
      font-weight: 600;
      font-size: 13.5px;
    }
    .jp-label { display: block; }
    .en-label {
      display: block;
      font-size: 10.5px;
      color: #6B6560;
      font-weight: 400;
      font-style: italic;
      margin-top: 2px;
      letter-spacing: 0.02em;
    }
    @media (max-width: 600px) {
      .container { padding: 1.5rem 1.25rem; }
      th { width: 42%; }
    }
    .disclaimer {
      font-size: 11.5px;
      color: #6B6560;
      border: 1px solid #C8C2B4;
      border-left: 3px solid #C0392B;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      line-height: 1.75;
      font-style: italic;
    }
    .footer-bar {
      border-top: 1px solid #C8C2B4;
      padding-top: 1rem;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .footer-bar a { color: #6B6560; text-decoration: none; }
    .footer-bar a:hover { color: #C0392B; }
    .credit { font-size: 10.5px; color: #9A948E; letter-spacing: 0.06em; }
    @media print { body { background: white; } .container { border: 1px solid #ccc; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="gazette-label">特定商取引法に基づく表記</div>
    <h1>特定商取引法に基づく表記</h1>
    <div class="subtitle">Specified Commercial Transactions Act Disclosure — with English annotations</div>
    <div class="issued-date">発行日：${today()} &nbsp;|&nbsp; Issued: ${todayEn()} &nbsp;|&nbsp; ${escHtml(f.sellerName || "（未入力）")}</div>
    <table>
      <tbody>
${tableRows}
      </tbody>
    </table>
    <div class="disclaimer">
      本表記は特定商取引法（特商法）に基づき作成されたものです。内容は情報提供を目的としており、法的アドバイスを構成するものではありません。<br><br>
      <em>This disclosure is prepared in accordance with Japan's Act on Specified Commercial Transactions (特定商取引法). It is for informational purposes only and does not constitute legal advice. Verify your specific obligations with a qualified legal professional.</em>
    </div>
    <div class="footer-bar">
      <span class="credit">${websiteLink}</span>
      <span class="credit">Generated with <a href="https://tokushoho-generator.vercel.app" rel="noopener">tokushoho-generator.vercel.app</a></span>
    </div>
  </div>
</body>
</html>`;
}

function generatePassport(f: FormData): string {
  const filled = REQUIRED_FIELDS.filter((k) => f[k].trim().length > 0);
  const total = REQUIRED_FIELDS.length;
  const pct = Math.round((filled.length / total) * 100);
  const status = pct === 100 ? "COMPLIANT" : pct >= 70 ? "INCOMPLETE" : "DRAFT";
  const statusColor = pct === 100 ? "#166534" : pct >= 70 ? "#92400E" : "#6B6560";

  const checks = [
    { label: "販売事業者名", ok: !!f.sellerName },
    { label: "運営責任者", ok: !!f.representativeName },
    { label: "所在地", ok: !!f.address },
    { label: "連絡先", ok: !!(f.email) },
    { label: "電話 / フォーム", ok: !!(f.phone || f.contactFormUrl) },
    { label: "販売価格", ok: !!f.pricing },
    { label: "支払方法", ok: !!f.paymentMethods },
    { label: "引き渡し時期", ok: !!f.deliveryTiming },
    { label: "返品ポリシー", ok: !!f.returnPolicy },
    { label: "営業時間", ok: !!f.businessHours },
  ];

  const checkRows = checks
    .map(
      (c) =>
        `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #EDE8DC;font-size:12px;">
          <span style="color:${c.ok ? "#166534" : "#C0392B"};font-weight:700;font-size:13px;">${c.ok ? "✓" : "○"}</span>
          <span style="color:${c.ok ? "#0D0D0D" : "#6B6560"}">${escHtml(c.label)}</span>
        </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compliance Passport — ${f.sellerName || "Business"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');
    body {
      font-family: "Noto Serif JP", Georgia, serif;
      background: #F5F0E8;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 2rem 1rem;
    }
    .passport {
      background: #FFFFFF;
      width: 420px;
      border-top: 6px solid #0D0D0D;
      padding: 2rem;
      position: relative;
    }
    .pp-label {
      font-family: "JetBrains Mono", monospace;
      font-size: 9px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #C0392B;
      margin-bottom: 1.25rem;
    }
    .pp-name {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 0.25rem;
    }
    .pp-sub {
      font-size: 11px;
      color: #6B6560;
      margin-bottom: 1.5rem;
      font-style: italic;
    }
    .status-badge {
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 4px 12px;
      border: 1.5px solid;
      display: inline-block;
      margin-bottom: 1.5rem;
      color: ${statusColor};
      border-color: ${statusColor};
    }
    .pp-checks { margin-bottom: 1.5rem; }
    .pp-footer {
      border-top: 1px solid #C8C2B4;
      padding-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .pp-footer-label { font-size: 9.5px; color: #9A948E; letter-spacing: 0.06em; font-family: "JetBrains Mono", monospace; }
    .stamp-area {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 64px;
      height: 64px;
      opacity: ${pct === 100 ? "1" : "0.25"};
    }
  </style>
</head>
<body>
  <div class="passport">
    <svg class="stamp-area" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" stroke="#C0392B" stroke-width="2.5"/>
      <circle cx="32" cy="32" r="24" stroke="#C0392B" stroke-width="1"/>
      <text x="32" y="38" text-anchor="middle" font-family="serif" font-size="18" font-weight="700" fill="#C0392B">認</text>
    </svg>
    <div class="pp-label">特商法 Compliance Passport</div>
    <div class="pp-name">${escHtml(f.sellerName || "(Business name not entered)")}</div>
    <div class="pp-sub">Japan Market Readiness · ${today()}</div>
    <div class="status-badge">${status} — ${pct}% complete</div>
    <div class="pp-checks">${checkRows}</div>
    <div class="pp-footer">
      <span class="pp-footer-label">tokushoho-generator.vercel.app</span>
      <span class="pp-footer-label">Issue No. ${issueNumber()}</span>
    </div>
  </div>
</body>
</html>`;
}

function generateEmbed(f: FormData): string {
  const escaped = generateJP(f)
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
  return `<!-- Tokushoho Disclosure Block — paste before </body> -->
<div id="tokushoho-disclosure"></div>
<script>
(function(){
  var html = \`${escaped}\`;
  var el = document.getElementById('tokushoho-disclosure');
  if (el) {
    var iframe = document.createElement('iframe');
    iframe.srcdoc = html;
    iframe.style.cssText = 'width:100%;border:none;min-height:600px;';
    el.appendChild(iframe);
  }
})();
</script>`;
}

function generateDivEmbed(f: FormData): string {
  const rows: Array<{ label: string; value: string }> = [
    { label: "販売事業者名", value: f.sellerName || "（未入力）" },
    { label: "運営責任者", value: f.representativeName || "（未入力）" },
    { label: "所在地", value: f.address || "（未入力）" },
    { label: "お問い合わせ先（メール）", value: f.email || "（未入力）" },
    {
      label: "お問い合わせ先（電話）",
      value: f.phone || (f.contactFormUrl ? `お問い合わせフォーム: ${f.contactFormUrl}` : "（未入力）"),
    },
    { label: "販売価格・料金", value: f.pricing || "（未入力）" },
    { label: "お支払い方法", value: f.paymentMethods || "（未入力）" },
    { label: "サービス提供・引き渡し時期", value: f.deliveryTiming || "（未入力）" },
    { label: "返品・キャンセルポリシー", value: f.returnPolicy || "（未入力）" },
    { label: "営業時間", value: f.businessHours || "（未入力）" },
  ];
  if (f.additionalInfo) rows.push({ label: "その他", value: f.additionalInfo });

  const tableRows = rows
    .map(
      (r) => `    <tr>
      <th scope="row">${escHtml(r.label)}</th>
      <td>${escHtml(r.value).replace(/\n/g, "<br>")}</td>
    </tr>`
    )
    .join("\n");

  const websiteLink = f.websiteUrl
    ? `<a href="${safeHref(f.websiteUrl)}" rel="noopener" style="color:#6B6560;text-decoration:none;">${escHtml(f.sellerName || "当社サービス")}</a>`
    : escHtml(f.sellerName || "当社サービス");

  return `<!-- 特商法 Disclosure Block — paste into your page -->
<div class="tksh-disclosure">
  <style>
    .tksh-disclosure{font-family:"Hiragino Mincho ProN","Yu Mincho",Georgia,serif;color:#0D0D0D;background:#F5F0E8;padding:2rem 1rem;}
    .tksh-inner{max-width:820px;margin:0 auto;background:#fff;padding:2.5rem 3rem;border-top:4px solid #0D0D0D;}
    .tksh-label{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#C0392B;font-weight:600;margin-bottom:1.25rem;}
    .tksh-inner h2{font-size:1.4rem;font-weight:700;margin-bottom:.2rem;}
    .tksh-date{font-size:11px;color:#6B6560;margin-bottom:1.75rem;padding-bottom:1.25rem;border-bottom:1px solid #C8C2B4;}
    .tksh-table{width:100%;border-collapse:collapse;margin-bottom:2rem;}
    .tksh-table th,.tksh-table td{padding:.75rem 1rem;border:1px solid #C8C2B4;text-align:left;vertical-align:top;line-height:1.7;font-size:14px;}
    .tksh-table th{width:32%;background:#F5F0E8;font-weight:600;font-size:13.5px;}
    .tksh-disclaimer{font-size:11.5px;color:#6B6560;border:1px solid #C8C2B4;border-left:3px solid #C0392B;padding:.9rem 1.1rem;margin-bottom:1.25rem;line-height:1.7;font-style:italic;}
    .tksh-footer{border-top:1px solid #C8C2B4;padding-top:.9rem;display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem;}
    .tksh-credit{font-size:10.5px;color:#9A948E;letter-spacing:.06em;}
    @media(max-width:600px){.tksh-inner{padding:1.25rem 1rem;}.tksh-table th{width:42%;font-size:12px;}.tksh-table td{font-size:13px;}}
  </style>
  <div class="tksh-inner">
    <div class="tksh-label">特定商取引法に基づく表記</div>
    <h2>特定商取引法に基づく表記</h2>
    <div class="tksh-date">発行日：${today()} &nbsp;｜&nbsp; 事業者：${escHtml(f.sellerName || "（未入力）")}</div>
    <table class="tksh-table">
      <tbody>
${tableRows}
      </tbody>
    </table>
    <div class="tksh-disclaimer">
      本表記は特定商取引法（特商法）に基づき作成されたものです。内容は情報提供を目的としており、法的アドバイスを構成するものではありません。
    </div>
    <div class="tksh-footer">
      <span class="tksh-credit">${websiteLink}</span>
      <span class="tksh-credit">Generated with <a href="https://tokushoho-generator.vercel.app" rel="noopener" style="color:#9A948E;">tokushoho-generator.vercel.app</a></span>
    </div>
  </div>
</div>`;
}

function plainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ─── SVG: 官印 Hanko Stamp ──────────────────────────────────────────────── */
function HankoSVG({ animated }: { animated: boolean }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-20 h-20 ${animated ? "stamp-animate" : ""}`}
      style={{ opacity: animated ? 1 : 0.2 }}
    >
      <circle cx="40" cy="40" r="37" stroke="#C0392B" strokeWidth="3" />
      <circle cx="40" cy="40" r="30" stroke="#C0392B" strokeWidth="1.2" />
      <text
        x="40"
        y="47"
        textAnchor="middle"
        fontFamily="Noto Serif JP, serif"
        fontSize="22"
        fontWeight="700"
        fill="#C0392B"
      >
        認
      </text>
      <text
        x="40"
        y="68"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="6"
        letterSpacing="2"
        fill="#C0392B"
        opacity="0.7"
      >
        CERTIFIED
      </text>
    </svg>
  );
}

/* ─── Progress bar ───────────────────────────────────────────────────────── */
function ProgressBar({ form }: { form: FormData }) {
  const filled = REQUIRED_FIELDS.filter((k) => form[k].trim().length > 0).length;
  const total = REQUIRED_FIELDS.length;
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {REQUIRED_FIELDS.map((k, i) => (
          <span
            key={i}
            className={`progress-dot ${form[k].trim() ? "filled" : ""}`}
          />
        ))}
      </div>
      <span
        className="font-mono text-[11px] tracking-wide"
        style={{ color: filled === total ? "var(--hanko)" : "var(--muted)" }}
      >
        {filled}/{total} required
      </span>
    </div>
  );
}

/* ─── Field explainer ────────────────────────────────────────────────────── */
function FieldExplainer({ field }: { field: FieldDef }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-[10px] tracking-widest uppercase ml-2"
        style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        aria-label="Show legal note"
      >
        [{open ? "−" : "?"}]
      </button>
      <div className={`field-explainer ${open ? "open" : ""}`}>
        <div
          className="mt-2 p-3 text-[11.5px] leading-relaxed border-l-2"
          style={{
            background: "var(--paper-deep)",
            borderColor: "var(--rule-light)",
            color: "var(--muted)",
            fontStyle: "italic",
          }}
        >
          <strong style={{ color: "var(--ink)", fontStyle: "normal", display: "block", marginBottom: "4px" }}>
            Legal note:
          </strong>
          {field.legalNote}
          <span
            style={{
              display: "block",
              marginTop: "6px",
              color: "var(--hanko-deep)",
              fontStyle: "normal",
            }}
          >
            ⚠ {field.legalConsequence}
          </span>
          <span
            style={{
              display: "block",
              marginTop: "6px",
              fontStyle: "normal",
              color: "var(--ink-soft)",
            }}
          >
            Example: {field.example}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
type ActiveTab = "preview" | "raw" | "embed" | "divembed" | "passport";

export default function Generator() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [outputMode, setOutputMode] = useState<OutputMode>("jp");
  const [activeTab, setActiveTab] = useState<ActiveTab>("preview");
  const [copyHtmlState, setCopyHtmlState] = useState<CopyState>("idle");
  const [copyTextState, setCopyTextState] = useState<CopyState>("idle");
  const [copyEmbedState, setCopyEmbedState] = useState<CopyState>("idle");
  const [copyDivEmbedState, setCopyDivEmbedState] = useState<CopyState>("idle");
  const previewRef = useRef<HTMLIFrameElement>(null);

  const jpHtml = useMemo(() => generateJP(form), [form]);
  const bilingualHtml = useMemo(() => generateBilingual(form), [form]);
  const passportHtml = useMemo(() => generatePassport(form), [form]);
  const embedCode = useMemo(() => generateEmbed(form), [form]);
  const divEmbedCode = useMemo(() => generateDivEmbed(form), [form]);

  const activeHtml = outputMode === "jp" ? jpHtml : bilingualHtml;

  const filledRequired = REQUIRED_FIELDS.filter((k) => form[k].trim().length > 0).length;
  const isComplete = filledRequired === REQUIRED_FIELDS.length;

  const set = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  const copyHtml = useCallback(() => {
    navigator.clipboard.writeText(activeHtml).then(() => {
      setCopyHtmlState("copied");
      setTimeout(() => setCopyHtmlState("idle"), 2200);
    });
  }, [activeHtml]);

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(plainText(activeHtml)).then(() => {
      setCopyTextState("copied");
      setTimeout(() => setCopyTextState("idle"), 2200);
    });
  }, [activeHtml]);

  const copyEmbed = useCallback(() => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopyEmbedState("copied");
      setTimeout(() => setCopyEmbedState("idle"), 2200);
    });
  }, [embedCode]);

  const copyDivEmbed = useCallback(() => {
    navigator.clipboard.writeText(divEmbedCode).then(() => {
      setCopyDivEmbedState("copied");
      setTimeout(() => setCopyDivEmbedState("idle"), 2200);
    });
  }, [divEmbedCode]);

  const download = useCallback(() => {
    const blob = new Blob([activeHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tokushoho-${form.sellerName.replace(/\s+/g, "-").toLowerCase() || "page"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeHtml, form.sellerName]);

  const downloadPassport = useCallback(() => {
    const blob = new Blob([passportHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-passport-${form.sellerName.replace(/\s+/g, "-").toLowerCase() || "business"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [passportHtml, form.sellerName]);

  /* ─── Section groupings ─── */
  const SECTIONS: Array<{
    num: string;
    title: string;
    sub: string;
    ids: (keyof FormData)[];
  }> = [
    {
      num: "§1",
      title: "事業者情報",
      sub: "Business Identity",
      ids: ["sellerName", "representativeName", "address"],
    },
    {
      num: "§2",
      title: "連絡先",
      sub: "Contact Information",
      ids: ["email", "phone", "contactFormUrl"],
    },
    {
      num: "§3",
      title: "取引条件",
      sub: "Transaction Terms",
      ids: ["pricing", "paymentMethods", "deliveryTiming", "returnPolicy"],
    },
    {
      num: "§4",
      title: "その他",
      sub: "Additional",
      ids: ["businessHours", "websiteUrl", "additionalInfo"],
    },
  ];

  const fieldMap = Object.fromEntries(FIELDS.map((f) => [f.id, f]));

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>

      {/* ─── Masthead ─── */}
      <header
        className="no-print"
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          borderBottom: "none",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            borderBottom: "1px solid #2A2A2A",
            padding: "6px 0",
          }}
        >
          <div
            className="max-w-6xl mx-auto px-5 flex justify-between items-center"
          >
            <span
              className="font-mono text-[10px] tracking-widest uppercase"
              style={{ color: "var(--hanko)", letterSpacing: "0.18em" }}
            >
              官報様式 · Official Gazette Format
            </span>
            <span
              className="font-mono text-[10px]"
              style={{ color: "#4A4A4A" }}
            >
              Issue No. {issueNumber()} · {todayEn()}
            </span>
          </div>
        </div>

        {/* Main masthead */}
        <div className="max-w-6xl mx-auto px-5 py-8">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-baseline gap-4 mb-2">
                <h1
                  className="font-display"
                  style={{
                    fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
                    fontWeight: 900,
                    color: "var(--paper)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.01em",
                  }}
                >
                  特商法 Generator
                </h1>
                <span
                  className="font-mono text-[11px] tracking-wide"
                  style={{
                    color: "var(--hanko)",
                    border: "1px solid var(--hanko)",
                    padding: "2px 8px",
                    alignSelf: "center",
                    letterSpacing: "0.1em",
                  }}
                >
                  FREE
                </span>
              </div>
              <p
                className="font-serif"
                style={{
                  color: "#9A948E",
                  fontSize: "13.5px",
                  maxWidth: "520px",
                  lineHeight: 1.6,
                }}
              >
                Generate the legally-required Japanese commercial disclosure page
                for your SaaS. English UI → proper 特定商取引法に基づく表記 output.
                No signup. Client-side only.
              </p>

              {/* Stat row */}
              <div className="flex gap-6 mt-4 flex-wrap">
                {[
                  ["10", "required fields"],
                  ["60s", "to complete"],
                  ["3", "output formats"],
                  ["0", "server calls"],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div
                      className="font-display"
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        color: "var(--hanko)",
                        lineHeight: 1,
                      }}
                    >
                      {val}
                    </div>
                    <div
                      className="font-mono text-[10px] tracking-wide uppercase"
                      style={{ color: "#6B6560" }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hanko stamp */}
            <div className="flex flex-col items-center gap-2">
              <HankoSVG animated={isComplete} />
              <span
                className="font-mono text-[9px] tracking-widest uppercase text-center"
                style={{ color: isComplete ? "var(--hanko)" : "#3A3A3A" }}
              >
                {isComplete ? "Compliance Certified" : "Fill to certify"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Disclaimer banner ─── */}
      <div
        className="no-print"
        style={{
          background: "var(--hanko-light)",
          borderBottom: "1px solid #F5C6C3",
          padding: "10px 0",
        }}
      >
        <div className="max-w-6xl mx-auto px-5">
          <p
            className="font-serif text-[12px] leading-relaxed"
            style={{ color: "#7B2320" }}
          >
            <strong>Disclaimer:</strong> This tool generates a disclosure page template — not legal advice.
            Confirm your specific obligations under Japan&apos;s Act on Specified Commercial Transactions
            (特定商取引法) with a qualified legal professional before going live.
          </p>
        </div>
      </div>

      {/* ─── Main content ─── */}
      <main className="max-w-6xl mx-auto px-5 py-8 no-print">
        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,3fr)" }}
        >
          {/* ─── LEFT: Form ─── */}
          <section>
            {/* Progress */}
            <div
              className="flex items-center justify-between mb-5 pb-3"
              style={{ borderBottom: "2px solid var(--ink)" }}
            >
              <h2
                className="font-display font-bold"
                style={{ fontSize: "1.1rem", color: "var(--ink)" }}
              >
                申請書 / Application Form
              </h2>
              <ProgressBar form={form} />
            </div>

            <div className="space-y-8">
              {SECTIONS.map((sec) => (
                <div key={sec.num}>
                  {/* Section header */}
                  <div
                    className="flex items-baseline gap-3 mb-4 pb-2"
                    style={{ borderBottom: "1px solid var(--rule-light)" }}
                  >
                    <span
                      className="font-mono text-[11px] font-medium"
                      style={{ color: "var(--hanko)" }}
                    >
                      {sec.num}
                    </span>
                    <span
                      className="font-serif font-semibold text-[13px]"
                      style={{ color: "var(--ink)" }}
                    >
                      {sec.title}
                    </span>
                    <span
                      className="font-serif text-[11px]"
                      style={{ color: "var(--muted)", fontStyle: "italic" }}
                    >
                      {sec.sub}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {sec.ids.map((id) => {
                      const field = fieldMap[id];
                      if (!field) return null;
                      return (
                        <div key={id}>
                          <label
                            htmlFor={id}
                            className="block mb-1"
                          >
                            <div className="flex items-center gap-1 flex-wrap">
                              <span
                                className="font-serif font-semibold text-[13px]"
                                style={{ color: "var(--ink)" }}
                              >
                                {field.label}
                              </span>
                              {field.required && (
                                <span
                                  className="font-mono text-[10px] font-medium tracking-wide"
                                  style={{
                                    color: "var(--hanko)",
                                    border: "1px solid var(--hanko)",
                                    padding: "0 4px",
                                    lineHeight: "1.4",
                                  }}
                                >
                                  必須
                                </span>
                              )}
                              <FieldExplainer field={field} />
                            </div>
                            <span
                              className="font-serif text-[11px]"
                              style={{ color: "var(--muted)", fontStyle: "italic", display: "block", marginTop: "1px" }}
                            >
                              {field.sublabel}
                            </span>
                          </label>
                          {field.type === "textarea" ? (
                            <textarea
                              id={id}
                              rows={field.rows ?? 3}
                              placeholder={field.placeholder}
                              value={form[id]}
                              onChange={set(id)}
                              className="kanpou-input"
                            />
                          ) : (
                            <input
                              id={id}
                              type="text"
                              placeholder={field.placeholder}
                              value={form[id]}
                              onChange={set(id)}
                              className="kanpou-input"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── RIGHT: Output ─── */}
          <section className="flex flex-col">
            {/* Output header */}
            <div
              className="flex items-center justify-between mb-4 pb-3"
              style={{ borderBottom: "2px solid var(--ink)" }}
            >
              <h2
                className="font-display font-bold"
                style={{ fontSize: "1.1rem" }}
              >
                発行書類 / Issued Document
              </h2>

              {/* JP / Bilingual toggle */}
              <div className="flex" style={{ border: "1px solid var(--rule-light)" }}>
                <button
                  type="button"
                  onClick={() => setOutputMode("jp")}
                  className={`tab-btn ${outputMode === "jp" ? "active" : ""}`}
                  style={{ borderRight: "1px solid var(--rule-light)" }}
                >
                  日本語
                </button>
                <button
                  type="button"
                  onClick={() => setOutputMode("bilingual")}
                  className={`tab-btn ${outputMode === "bilingual" ? "active" : ""}`}
                >
                  + EN 注釈
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                type="button"
                onClick={copyHtml}
                className={`btn-primary flex-1 ${copyHtmlState === "copied" ? "btn-copied" : ""}`}
                style={{ minWidth: "110px" }}
              >
                {copyHtmlState === "copied" ? "✓ Copied" : "Copy HTML"}
              </button>
              <button
                type="button"
                onClick={copyText}
                className={`btn-ghost flex-1 ${copyTextState === "copied" ? "btn-copied" : ""}`}
                style={{ minWidth: "100px" }}
              >
                {copyTextState === "copied" ? "✓ Copied" : "Copy Text"}
              </button>
              <button
                type="button"
                onClick={download}
                className="btn-ghost flex-1"
                style={{ minWidth: "110px" }}
              >
                Download .html
              </button>
            </div>

            {/* Output tabs */}
            <div
              className="flex mb-0"
              style={{ borderBottom: "1px solid var(--rule-light)" }}
            >
              {(
                [
                  ["preview", "Preview"],
                  ["raw", "Raw HTML"],
                  ["embed", "Embed"],
                  ["divembed", "HTML埋め込み"],
                  ["passport", "Passport"],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="font-mono text-[10px] tracking-wide uppercase px-4 py-2 transition-all"
                  style={{
                    background: activeTab === tab ? "var(--ink)" : "transparent",
                    color: activeTab === tab ? "var(--paper)" : "var(--muted)",
                    border: "none",
                    borderTop: activeTab === tab ? "2px solid var(--hanko)" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Preview panel */}
            <div
              className="flex-1"
              style={{
                border: "1px solid var(--rule-light)",
                borderTop: "none",
                background: "var(--white)",
                overflow: "hidden",
                minHeight: "500px",
              }}
            >
              {/* Browser chrome bar */}
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{
                  background: "var(--paper-deep)",
                  borderBottom: "1px solid var(--rule-light)",
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBBBB", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFE599", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#B9DBA4", display: "inline-block" }} />
                <span
                  className="font-mono text-[10px] ml-2"
                  style={{ color: "var(--muted)" }}
                >
                  {activeTab === "passport"
                    ? "compliance-passport.html"
                    : activeTab === "divembed"
                    ? "tokushoho-div-embed.html"
                    : activeTab === "embed"
                    ? "embed-snippet.html"
                    : activeTab === "raw"
                    ? "tokushoho.html — source"
                    : "tokushoho.html — preview"}
                </span>
              </div>

              {/* Content */}
              {activeTab === "preview" && (
                <iframe
                  ref={previewRef}
                  srcDoc={activeHtml}
                  className="w-full border-0"
                  style={{ height: "580px" }}
                  title="Generated 特商法 page preview"
                  sandbox="allow-same-origin"
                />
              )}

              {activeTab === "passport" && (
                <div style={{ height: "580px", display: "flex", flexDirection: "column" }}>
                  <iframe
                    srcDoc={passportHtml}
                    className="flex-1 border-0 w-full"
                    title="Compliance Passport"
                    sandbox="allow-same-origin"
                  />
                  <div
                    className="flex gap-2 p-3"
                    style={{ borderTop: "1px solid var(--rule-light)", background: "var(--paper-card)" }}
                  >
                    <button
                      type="button"
                      onClick={downloadPassport}
                      className="btn-primary text-[11px]"
                    >
                      Download Passport
                    </button>
                    <span
                      className="font-mono text-[10px] self-center"
                      style={{ color: "var(--muted)", fontStyle: "italic" }}
                    >
                      Share on Twitter / Slack as proof of compliance
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "raw" && (
                <pre
                  className="font-mono text-[11px] p-4 overflow-auto whitespace-pre-wrap"
                  style={{
                    height: "580px",
                    background: "#0D0D0D",
                    color: "#EDE8DC",
                    lineHeight: 1.6,
                  }}
                >
                  {activeHtml}
                </pre>
              )}

              {activeTab === "embed" && (
                <div style={{ height: "580px", display: "flex", flexDirection: "column" }}>
                  <div
                    className="p-4 font-mono text-[10px] flex-1"
                    style={{ color: "var(--muted)", background: "var(--paper-card)" }}
                  >
                    <p className="mb-3" style={{ fontStyle: "italic" }}>
                      Paste this snippet into your Webflow / custom HTML site before the closing{" "}
                      <code style={{ color: "var(--hanko)" }}>&lt;/body&gt;</code> tag.
                      The disclosure will render in an iframe on your page.
                    </p>
                    <pre
                      className="p-3 overflow-auto whitespace-pre-wrap text-[10px]"
                      style={{
                        background: "#0D0D0D",
                        color: "#EDE8DC",
                        maxHeight: "380px",
                      }}
                    >
                      {embedCode}
                    </pre>
                  </div>
                  <div
                    className="flex gap-2 p-3"
                    style={{ borderTop: "1px solid var(--rule-light)", background: "var(--paper-deep)" }}
                  >
                    <button
                      type="button"
                      onClick={copyEmbed}
                      className={`btn-primary text-[11px] ${copyEmbedState === "copied" ? "btn-copied" : ""}`}
                    >
                      {copyEmbedState === "copied" ? "✓ Copied" : "Copy Embed Code"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "divembed" && (
                <div style={{ height: "580px", display: "flex", flexDirection: "column" }}>
                  <div
                    className="p-4 font-mono text-[10px] flex-1"
                    style={{ color: "var(--muted)", background: "var(--paper-card)" }}
                  >
                    <p className="mb-3" style={{ fontStyle: "italic" }}>
                      ページに直接貼り付ける <code style={{ color: "var(--hanko)" }}>&lt;div&gt;</code> スニペット。
                      JavaScript不要。Webflow / WordPress / Next.js など任意の場所に貼り付けてください。
                      スタイルはスコープ化済みで既存CSSとの干渉を最小化しています。
                    </p>
                    <pre
                      className="p-3 overflow-auto whitespace-pre-wrap text-[10px]"
                      style={{
                        background: "#0D0D0D",
                        color: "#EDE8DC",
                        maxHeight: "380px",
                      }}
                    >
                      {divEmbedCode}
                    </pre>
                  </div>
                  <div
                    className="flex gap-2 p-3"
                    style={{ borderTop: "1px solid var(--rule-light)", background: "var(--paper-deep)" }}
                  >
                    <button
                      type="button"
                      onClick={copyDivEmbed}
                      className={`btn-primary text-[11px] ${copyDivEmbedState === "copied" ? "btn-copied" : ""}`}
                    >
                      {copyDivEmbedState === "copied" ? "✓ コピー済み" : "Copy <div> Snippet"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ─── What is 特商法 section ─── */}
        <section
          className="mt-16 pt-10"
          style={{ borderTop: "2px solid var(--ink)" }}
        >
          <div className="grid gap-12" style={{ gridTemplateColumns: "minmax(0,3fr) minmax(0,2fr)" }}>
            <div>
              <div
                className="font-mono text-[10px] tracking-widest uppercase mb-3"
                style={{ color: "var(--hanko)" }}
              >
                §0 — Legal Background
              </div>
              <h2
                className="font-display font-bold mb-4"
                style={{ fontSize: "1.5rem", lineHeight: 1.2 }}
              >
                What is 特商法?
              </h2>
              <div
                className="font-serif space-y-4"
                style={{ fontSize: "14px", color: "var(--ink-soft)", lineHeight: 1.8 }}
              >
                <p>
                  Japan&apos;s <strong>Act on Specified Commercial Transactions (特定商取引法)</strong> requires
                  any business selling goods or services to Japanese consumers to prominently publish specific
                  business disclosures on their website. This applies to every foreign SaaS selling into Japan —
                  no exemption for overseas companies.
                </p>
                <p>
                  Non-compliance exposes you to administrative guidance from the Consumer Affairs Agency,
                  potential fines, and — critically — many Japanese payment processors and app stores
                  require this page before approving your account.
                </p>
                <p>
                  Most Japanese users check for this page before making a purchase. Its absence is a trust signal
                  that stops conversions.
                </p>
              </div>
            </div>

            <div>
              <div
                className="font-mono text-[10px] tracking-widest uppercase mb-3"
                style={{ color: "var(--hanko)" }}
              >
                §0-A — Required Fields
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "12.5px",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--ink)" }}>
                    <th
                      className="font-mono text-[10px] tracking-wide uppercase text-left py-2 pr-3"
                      style={{ color: "var(--muted)", fontWeight: 400 }}
                    >
                      Field
                    </th>
                    <th
                      className="font-mono text-[10px] tracking-wide uppercase text-left py-2"
                      style={{ color: "var(--muted)", fontWeight: 400 }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["販売事業者名・運営責任者", "Required"],
                    ["所在地（住所）", "Required"],
                    ["電話 or 問い合わせフォーム", "Required (either)"],
                    ["メールアドレス", "Required"],
                    ["販売価格", "Required"],
                    ["支払方法", "Required"],
                    ["引き渡し時期", "Required"],
                    ["返品・返金ポリシー", "Required"],
                    ["営業時間", "Required"],
                    ["その他（業種別）", "Optional"],
                  ].map(([label, status], i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: "1px solid var(--rule-light)" }}
                    >
                      <td className="font-serif py-2 pr-3" style={{ color: "var(--ink-soft)", lineHeight: 1.4 }}>
                        {label}
                      </td>
                      <td>
                        <span
                          className="font-mono text-[9.5px] tracking-wide"
                          style={{
                            color: status === "Optional" ? "var(--muted)" : "var(--hanko)",
                            fontWeight: status === "Optional" ? 400 : 500,
                          }}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p
                className="font-serif text-[11px] mt-4"
                style={{ color: "var(--muted)", fontStyle: "italic", lineHeight: 1.6 }}
              >
                Source: 消費者庁 (Consumer Affairs Agency). 2022 amendment allows contact form
                in place of phone number for digital service providers.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer
        className="mt-16 no-print"
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "2.5rem 0",
        }}
      >
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex justify-between items-start gap-6 flex-wrap">
            <div>
              <div
                className="font-display font-bold mb-1"
                style={{ fontSize: "1.2rem", color: "var(--paper)" }}
              >
                特商法 Generator
              </div>
              <p
                className="font-serif text-[12px]"
                style={{ color: "#6B6560", maxWidth: "380px", lineHeight: 1.6 }}
              >
                Free tool for foreign founders selling in Japan. Not legal advice.
                Confirm obligations with a qualified professional.
              </p>
            </div>
            <div className="text-right">
              <div
                className="font-mono text-[10px] tracking-widest uppercase mb-2"
                style={{ color: "var(--hanko)" }}
              >
                Japan Market Readiness
              </div>
              <a
                href="https://glovrex.com"
                className="font-serif text-[13px]"
                style={{ color: "#9A948E" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Full audit → glovrex.com
              </a>
              <div
                className="font-mono text-[10px] mt-3"
                style={{ color: "#3A3A3A" }}
              >
                Issue {issueNumber()} · {todayEn()}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
