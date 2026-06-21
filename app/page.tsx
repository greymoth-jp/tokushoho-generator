'use client';
import { useState } from 'react';

export default function TokushohoGenerator() {
  const [data, setData] = useState({
    companyName: 'Stripe, Inc.',
    address: '354 Oyster Point Blvd, South San Francisco, CA 94080',
    representative: 'John Doe',
    email: 'support@stripe.com',
    price: 'Listed on each product page.',
    paymentMethod: 'Credit Card (Stripe)',
    deliveryTime: 'Immediate upon payment completion.',
    refundPolicy: 'No refunds after purchase. Subscriptions can be canceled at any time.',
  });

  const generatedCode = `
import React from 'react';

export default function Tokushoho() {
  return (
    <div className="max-w-3xl mx-auto p-8 text-gray-900 bg-white">
      <h1 className="text-2xl font-bold mb-6">特定商取引法に基づく表記</h1>
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <tbody>
          <tr className="border-b"><th className="p-3 text-left bg-gray-50 w-1/3">販売事業者名</th><td className="p-3">${data.companyName}</td></tr>
          <tr className="border-b"><th className="p-3 text-left bg-gray-50">代表者名</th><td className="p-3">${data.representative}</td></tr>
          <tr className="border-b"><th className="p-3 text-left bg-gray-50">所在地</th><td className="p-3">${data.address}</td></tr>
          <tr className="border-b"><th className="p-3 text-left bg-gray-50">連絡先</th><td className="p-3">${data.email}</td></tr>
          <tr className="border-b"><th className="p-3 text-left bg-gray-50">販売価格</th><td className="p-3">${data.price}</td></tr>
          <tr className="border-b"><th className="p-3 text-left bg-gray-50">代金の支払方法</th><td className="p-3">${data.paymentMethod}</td></tr>
          <tr className="border-b"><th className="p-3 text-left bg-gray-50">引渡時期</th><td className="p-3">${data.deliveryTime}</td></tr>
          <tr className="border-b"><th className="p-3 text-left bg-gray-50">返品・キャンセル</th><td className="p-3">${data.refundPolicy}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] p-10 font-mono">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tokushoho Generator</h1>
          <p className="text-gray-400 mb-8">Stop paying lawyers $2000 for a legally required copy-paste page. Fill this out, grab the React component, and drop it in your Next.js app.</p>
          
          <div className="space-y-4">
            {Object.entries(data).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm mb-1 text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input 
                  type="text" 
                  value={value} 
                  onChange={(e) => setData({...data, [key]: e.target.value})}
                  className="w-full bg-[#111] border border-[#333] rounded p-2 text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Generated Code (React)</h2>
          <pre className="bg-[#111] border border-[#333] p-4 rounded text-xs overflow-x-auto h-[600px] text-green-400">
            {generatedCode.trim()}
          </pre>
          <button 
            className="mt-4 w-full bg-white text-black font-bold py-2 rounded hover:bg-gray-200 transition-colors"
            onClick={() => navigator.clipboard.writeText(generatedCode.trim())}
          >
            Copy Code
          </button>
        </div>
      </div>
    </div>
  );
}
