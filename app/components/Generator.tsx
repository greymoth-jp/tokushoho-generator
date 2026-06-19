"use client";

import { useMemo, useState, useCallback } from "react";

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
  additionalInfo: string;
  websiteUrl: string;
}

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
  additionalInfo: "",
  websiteUrl: "",
};

function generateJP(f: FormData): string {
  const rows: Array<{ label: string; value: string; note?: string }> = [
    { label: "販売事業者名", value: f.sellerName || "（未入力）" },
    { label: "運営責任者", value: f.representativeName || "（未入力）" },
    { label: "所在地", value: f.address || "（未入力）" },
    { label: "お問い合わせ先（メール）", value: f.email || "（未入力）" },
    {
      label: "お問い合わせ先（電話）",
      value:
        f.phone ||
        (f.contactFormUrl
          ? `お問い合わせフォーム: ${f.contactFormUrl}`
          : "（未入力）"),
    },
    { label: "販売価格・料金", value: f.pricing || "（未入力）" },
    { label: "お支払い方法", value: f.paymentMethods || "（未入力）" },
    {
      label: "サービス提供・引き渡し時期",
      value: f.deliveryTiming || "（未入力）",
    },
    {
      label: "返品・キャンセルポリシー",
      value: f.returnPolicy || "（未入力）",
    },
    { label: "営業時間", value: f.businessHours || "（未入力）" },
  ];

  if (f.additionalInfo) {
    rows.push({ label: "その他", value: f.additionalInfo });
  }

  const tableRows = rows
    .map(
      (r) => `    <tr>
      <th scope="row">${r.label}</th>
      <td>${r.value.replace(/\n/g, "<br>")}</td>
    </tr>`
    )
    .join("\n");

  const disclaimer = `<p class="disclaimer">本表記は特定商取引法（特商法）に基づき作成されたものです。内容は情報提供を目的としており、法的アドバイスを構成するものではありません。詳細はご自身の法律の専門家にご確認ください。</p>`;

  const footer = `<p class="generator-credit">このページは <a href="https://tokushoho-generator.vercel.app" rel="noopener">特商法ページジェネレーター</a> で作成されました。</p>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>特定商取引法に基づく表記</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; color: #1a1a1a; background: #fff; padding: 2rem 1rem; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; border-bottom: 2px solid #1a1a1a; padding-bottom: 0.75rem; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
    th, td { padding: 0.75rem 1rem; border: 1px solid #d1d5db; text-align: left; vertical-align: top; line-height: 1.6; }
    th { width: 35%; background: #f9fafb; font-weight: 600; white-space: nowrap; }
    @media (max-width: 600px) { th { width: 45%; font-size: 0.875rem; } td { font-size: 0.875rem; } }
    .disclaimer { font-size: 0.8rem; color: #6b7280; border: 1px solid #e5e7eb; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; line-height: 1.6; }
    .generator-credit { font-size: 0.75rem; color: #9ca3af; margin-top: 2rem; text-align: center; }
    .generator-credit a { color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <h1>特定商取引法に基づく表記</h1>
    <table>
      <tbody>
${tableRows}
      </tbody>
    </table>
    ${disclaimer}
    ${footer}
  </div>
</body>
</html>`;
}

function generateBilingual(f: FormData): string {
  const rows: Array<{ jpLabel: string; enLabel: string; value: string }> = [
    {
      jpLabel: "販売事業者名",
      enLabel: "Seller / Business Name",
      value: f.sellerName || "（未入力）",
    },
    {
      jpLabel: "運営責任者",
      enLabel: "Representative",
      value: f.representativeName || "（未入力）",
    },
    {
      jpLabel: "所在地",
      enLabel: "Address",
      value: f.address || "（未入力）",
    },
    {
      jpLabel: "お問い合わせ先（メール）",
      enLabel: "Contact Email",
      value: f.email || "（未入力）",
    },
    {
      jpLabel: "お問い合わせ先（電話）",
      enLabel: "Phone / Contact Form",
      value:
        f.phone ||
        (f.contactFormUrl
          ? `フォーム / Form: ${f.contactFormUrl}`
          : "（未入力）"),
    },
    {
      jpLabel: "販売価格・料金",
      enLabel: "Pricing",
      value: f.pricing || "（未入力）",
    },
    {
      jpLabel: "お支払い方法",
      enLabel: "Payment Methods",
      value: f.paymentMethods || "（未入力）",
    },
    {
      jpLabel: "サービス提供・引き渡し時期",
      enLabel: "Service Delivery Timing",
      value: f.deliveryTiming || "（未入力）",
    },
    {
      jpLabel: "返品・キャンセルポリシー",
      enLabel: "Return / Refund Policy",
      value: f.returnPolicy || "（未入力）",
    },
    {
      jpLabel: "営業時間",
      enLabel: "Business Hours",
      value: f.businessHours || "（未入力）",
    },
  ];

  if (f.additionalInfo) {
    rows.push({
      jpLabel: "その他",
      enLabel: "Additional Info",
      value: f.additionalInfo,
    });
  }

  const tableRows = rows
    .map(
      (r) => `    <tr>
      <th scope="row"><span class="jp">${r.jpLabel}</span><span class="en">${r.enLabel}</span></th>
      <td>${r.value.replace(/\n/g, "<br>")}</td>
    </tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>特定商取引法に基づく表記（英語注釈付き）</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; color: #1a1a1a; background: #fff; padding: 2rem 1rem; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; border-bottom: 2px solid #1a1a1a; padding-bottom: 0.75rem; }
    .subtitle { font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem; margin-top: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
    th, td { padding: 0.75rem 1rem; border: 1px solid #d1d5db; text-align: left; vertical-align: top; line-height: 1.6; }
    th { width: 35%; background: #f9fafb; font-weight: 600; }
    .jp { display: block; }
    .en { display: block; font-size: 0.75rem; color: #6b7280; font-weight: 400; font-family: system-ui, sans-serif; }
    @media (max-width: 600px) { th { width: 45%; } }
    .disclaimer { font-size: 0.8rem; color: #6b7280; border: 1px solid #e5e7eb; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; line-height: 1.6; }
    .generator-credit { font-size: 0.75rem; color: #9ca3af; margin-top: 2rem; text-align: center; }
    .generator-credit a { color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <h1>特定商取引法に基づく表記</h1>
    <p class="subtitle">Specified Commercial Transactions Act Disclosure (with English annotations)</p>
    <table>
      <tbody>
${tableRows}
      </tbody>
    </table>
    <p class="disclaimer">本表記は特定商取引法（特商法）に基づき作成されたものです。内容は情報提供を目的としており、法的アドバイスを構成するものではありません。詳細はご自身の法律の専門家にご確認ください。<br><br>This disclosure is generated based on Japan's Act on Specified Commercial Transactions. It is for informational purposes only and does not constitute legal advice. Confirm your specific obligations with a qualified legal professional.</p>
    <p class="generator-credit">Generated with <a href="https://tokushoho-generator.vercel.app" rel="noopener">Tokushoho Page Generator</a></p>
  </div>
</body>
</html>`;
}

function plainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type OutputMode = "jp" | "bilingual";
type CopyState = "idle" | "copied";

export default function Generator() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [outputMode, setOutputMode] = useState<OutputMode>("jp");
  const [copyHtmlState, setCopyHtmlState] = useState<CopyState>("idle");
  const [copyTextState, setCopyTextState] = useState<CopyState>("idle");

  const jpHtml = useMemo(() => generateJP(form), [form]);
  const bilingualHtml = useMemo(() => generateBilingual(form), [form]);

  const activeHtml = outputMode === "jp" ? jpHtml : bilingualHtml;

  const set = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const copyHtml = useCallback(() => {
    navigator.clipboard.writeText(activeHtml).then(() => {
      setCopyHtmlState("copied");
      setTimeout(() => setCopyHtmlState("idle"), 2000);
    });
  }, [activeHtml]);

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(plainText(activeHtml)).then(() => {
      setCopyTextState("copied");
      setTimeout(() => setCopyTextState("idle"), 2000);
    });
  }, [activeHtml]);

  const download = useCallback(() => {
    const blob = new Blob([activeHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tokushoho.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [activeHtml]);

  const fields: Array<{
    id: keyof FormData;
    label: string;
    sublabel: string;
    placeholder: string;
    type?: "textarea";
    required?: boolean;
  }> = [
    {
      id: "sellerName",
      label: "Seller / Business Name",
      sublabel: "販売事業者名",
      placeholder: "Acme Inc.",
      required: true,
    },
    {
      id: "representativeName",
      label: "Representative Name",
      sublabel: "運営責任者",
      placeholder: "John Smith",
      required: true,
    },
    {
      id: "address",
      label: "Business Address",
      sublabel: "所在地（住所）",
      placeholder: "1234 Market St, San Francisco, CA 94103, USA",
      required: true,
      type: "textarea",
    },
    {
      id: "email",
      label: "Contact Email",
      sublabel: "お問い合わせメール",
      placeholder: "support@example.com",
      required: true,
    },
    {
      id: "phone",
      label: "Phone Number",
      sublabel: "電話番号（任意・フォームURLでも可）",
      placeholder: "+1-800-000-0000",
    },
    {
      id: "contactFormUrl",
      label: "Contact Form URL",
      sublabel: "問い合わせフォームURL（電話なし場合は必須）",
      placeholder: "https://example.com/contact",
    },
    {
      id: "pricing",
      label: "Pricing / Fees",
      sublabel: "販売価格・料金",
      placeholder: "Monthly plan: $29/month. Annual plan: $290/year. All prices shown in USD; Japanese tax (消費税) applies.",
      required: true,
      type: "textarea",
    },
    {
      id: "paymentMethods",
      label: "Payment Methods",
      sublabel: "お支払い方法",
      placeholder: "Credit card (Visa, Mastercard, American Express), PayPal",
      required: true,
    },
    {
      id: "deliveryTiming",
      label: "Service Delivery / Access Timing",
      sublabel: "サービス提供・引き渡し時期",
      placeholder: "Immediately after payment confirmation. Access is granted automatically.",
      required: true,
    },
    {
      id: "returnPolicy",
      label: "Return / Refund Policy",
      sublabel: "返品・キャンセルポリシー",
      placeholder: "Due to the digital nature of the service, we do not offer refunds after access is granted. Please contact us within 14 days of purchase if you experience issues.",
      required: true,
      type: "textarea",
    },
    {
      id: "businessHours",
      label: "Business Hours",
      sublabel: "営業時間",
      placeholder: "Mon–Fri 09:00–18:00 PST (replies within 2 business days)",
      required: true,
    },
    {
      id: "websiteUrl",
      label: "Your Website URL",
      sublabel: "サービスサイトURL（フッターリンク用）",
      placeholder: "https://example.com",
    },
    {
      id: "additionalInfo",
      label: "Additional Information (optional)",
      sublabel: "その他（任意）",
      placeholder: "Any other disclosures required by your specific service...",
      type: "textarea",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            特商法ページ Generator
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Generate a{" "}
            <span className="font-medium text-gray-700">
              特定商取引法に基づく表記
            </span>{" "}
            (Japanese commercial disclosure page) required for selling online in
            Japan. Free, instant, no signup.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Disclaimer banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-sm text-amber-800">
          <strong>Disclaimer:</strong> This tool generates a disclosure page
          template. It is not legal advice. Confirm your specific obligations
          under Japan&apos;s Act on Specified Commercial Transactions (特定商取引法)
          with a qualified professional before going live.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Fill in your details
            </h2>
            <div className="space-y-4">
              {fields.map((f) =>
                f.type === "textarea" ? (
                  <div key={f.id}>
                    <label
                      htmlFor={f.id}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {f.label}
                      {f.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                      <span className="block text-xs text-gray-400 font-normal mt-0.5">
                        {f.sublabel}
                      </span>
                    </label>
                    <textarea
                      id={f.id}
                      rows={3}
                      placeholder={f.placeholder}
                      value={form[f.id]}
                      onChange={set(f.id)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 resize-y"
                    />
                  </div>
                ) : (
                  <div key={f.id}>
                    <label
                      htmlFor={f.id}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {f.label}
                      {f.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                      <span className="block text-xs text-gray-400 font-normal mt-0.5">
                        {f.sublabel}
                      </span>
                    </label>
                    <input
                      id={f.id}
                      type="text"
                      placeholder={f.placeholder}
                      value={form[f.id]}
                      onChange={set(f.id)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    />
                  </div>
                )
              )}
            </div>
          </section>

          {/* Output */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Generated Page
              </h2>
              <div className="flex rounded-md border border-gray-300 overflow-hidden text-sm">
                <button
                  onClick={() => setOutputMode("jp")}
                  className={`px-3 py-1.5 ${outputMode === "jp" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  日本語
                </button>
                <button
                  onClick={() => setOutputMode("bilingual")}
                  className={`px-3 py-1.5 ${outputMode === "bilingual" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  + EN annotations
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={copyHtml}
                className="flex-1 min-w-[120px] rounded-md bg-gray-900 text-white text-sm font-medium px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                {copyHtmlState === "copied" ? "Copied!" : "Copy HTML"}
              </button>
              <button
                onClick={copyText}
                className="flex-1 min-w-[120px] rounded-md border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                {copyTextState === "copied" ? "Copied!" : "Copy Text"}
              </button>
              <button
                onClick={download}
                className="flex-1 min-w-[120px] rounded-md border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                Download .html
              </button>
            </div>

            {/* Preview */}
            <div className="flex-1 rounded-lg border border-gray-200 overflow-hidden bg-white">
              <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2">Preview</span>
              </div>
              <iframe
                srcDoc={activeHtml}
                className="w-full h-[600px] border-0"
                title="Generated 特商法 page preview"
                sandbox="allow-same-origin"
              />
            </div>

            {/* Raw HTML */}
            <details className="mt-4">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 select-none">
                View raw HTML
              </summary>
              <pre className="mt-2 text-xs bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto max-h-64 whitespace-pre-wrap">
                {activeHtml}
              </pre>
            </details>
          </section>
        </div>

        {/* What is Tokushoho section */}
        <section className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            What is 特商法? (Act on Specified Commercial Transactions)
          </h2>
          <div className="prose prose-sm text-gray-600 max-w-none space-y-4">
            <p>
              Japan&apos;s{" "}
              <strong>Act on Specified Commercial Transactions (特定商取引法)</strong>{" "}
              requires online sellers to prominently disclose specific business
              information on their website. This applies to any business selling
              goods or services to Japanese consumers — including foreign SaaS
              companies.
            </p>
            <p>
              Non-compliance can result in fines, service suspension, or being
              blocked by Japanese payment processors. Most Japanese users will
              look for this page before purchasing.
            </p>
            <h3 className="text-base font-semibold text-gray-800 mt-6">
              Required fields for online (通信販売) sellers:
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Seller name and representative name（販売事業者名・運営責任者）</li>
              <li>Business address（所在地）</li>
              <li>Contact information — phone or contact form（電話番号・問い合わせ先）</li>
              <li>Pricing including all taxes（販売価格）</li>
              <li>Payment methods（支払方法）</li>
              <li>Service delivery timing（引き渡し時期）</li>
              <li>Return / refund policy（返品・返金ポリシー）</li>
            </ul>
            <p className="text-xs text-gray-400 mt-4">
              This tool generates a template. Always confirm your specific legal
              obligations with a Japanese law professional.
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>
            特商法ページ Generator — Free tool for foreign founders selling in Japan.
          </p>
          <p className="mt-1">
            Not legal advice. Confirm obligations with a qualified professional.
          </p>
        </div>
      </footer>
    </div>
  );
}
