import { useState, useEffect } from 'react';
import { KnowledgeItem, FAQItem, PresetQuestion, Platform } from '../types';

const DEFAULT_PLATFORMS: Platform[] = [
  { id: 'p1', name: 'ecforce', url: 'https://ec-force.com/', category: 'SaaS型EC', order: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p2', name: 'MakeShop', url: 'https://www.makeshop.jp/', category: 'SaaS型EC', order: 2, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p3', name: 'BASE', url: 'https://thebase.in/', category: 'SaaS型EC', order: 3, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p4', name: 'Shopify', url: 'https://www.shopify.com/jp', category: 'SaaS型EC', order: 4, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p5', name: 'futureshop', url: 'https://www.future-shop.jp/', category: 'SaaS型EC', order: 5, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p6', name: 'カラーミーショップ', url: 'https://shop-pro.jp/', category: 'SaaS型EC', order: 6, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p7', name: 'STORES', url: 'https://stores.jp/', category: 'SaaS型EC', order: 7, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p8', name: 'shopserve', url: 'https://sps.estore.jp/', category: 'SaaS型EC', order: 8, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p9', name: 'リピストX', url: 'https://rpst.jp/x/', category: 'SaaS型EC', order: 9, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p10', name: 'サブスクストア', url: 'https://subscription-store.com/', category: 'SaaS型EC', order: 10, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p11', name: '楽天市場', url: 'https://www.rakuten.co.jp/', category: 'ECモール', order: 11, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p12', name: 'Yahoo!ショッピング', url: 'https://shopping.yahoo.co.jp/', category: 'ECモール', order: 12, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p13', name: 'Amazon', url: 'https://www.amazon.co.jp/', category: 'ECモール', order: 13, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p14', name: 'Qoo10', url: 'https://www.qoo10.jp/', category: 'ECモール', order: 14, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p15', name: 'au PAY マーケット', url: 'https://wowma.jp/', category: 'ECモール', order: 15, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'p16', name: 'TikTok Shop', url: 'https://shop.tiktok.com/', category: 'SNS型EC', order: 16, createdAt: Date.now(), updatedAt: Date.now() },
];

const DEFAULT_PRESETS: PresetQuestion[] = [
  { id: '1', name: 'スマホ+PC固定背景', intent: 'PC表示時でも画面中央にスマホサイズのコンテンツを表示し、左右に背景を敷く', createdAt: Date.now(), updatedAt: Date.now() },
  { id: '2', name: 'PC/SPレスポンシブ', intent: 'PCとスマートフォンで画面幅に応じてレイアウトが可変するレスポンシブデザイン', createdAt: Date.now(), updatedAt: Date.now() },
  { id: '3', name: '画像形式ブロックデザイン', intent: 'Amazonサムネイルのような画像ベースで複数枚登録する方法', createdAt: Date.now(), updatedAt: Date.now() },
  { id: '4', name: 'オリジナルcss使用', intent: 'プラットフォームのデフォルトCSSを上書き、または独自のCSSファイルを追加してデザインをカスタマイズする', createdAt: Date.now(), updatedAt: Date.now() },
];

const DEFAULT_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: 'k1',
    title: 'ecforceのレスポンシブ対応について',
    content: 'ecforceのPC/SPのレスポンシブコーディングは弊社でも対応可能です。\n実績URL:\nhttps://online.kirei-kibun.jp/shop/products/T005\nhttps://online.kirei-kibun.jp/shop/products/T001',
    platforms: ['ecforce'],
    tags: ['実績URLあり', 'レスポンシブ'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'k2',
    title: 'Shopifyのレスポンシブ対応について',
    content: 'ShopifyのPC/SPのレスポンシブコーディングは弊社でも対応可能です。\n実績URL:\nhttps://ks-online.jp/pages/moegiigai_ex\nhttps://ks-online.jp/pages/moegiigaiex\nhttps://molsy.co.jp/pages/lactul-lp',
    platforms: ['Shopify'],
    tags: ['実績URLあり', 'レスポンシブ'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'k3',
    title: 'リピストXのトップページ反映について',
    content: 'リピストXでトップページを反映した実績があります。\n実績URL:\nhttps://maisonsakilab-no003.com/',
    platforms: ['リピストX'],
    tags: ['実績URLあり'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'f1',
    question: '各カートの「スマホ+PC固定背景」「PC/SPレスポンシブ」対応可否',
    answer: `| カート名 | スマホ+PC固定背景 | PC/SPレスポンシブ |
|---|---|---|
| ecforce | ◯ | ◯ |
| MakeShop | ◯ | ◯ |
| BASE | ◯ | ◯ |
| Shopify | ◯ | ◯ |
| futureshop | ◯ | ◯ |
| カラーミーショップ | ◯ | ◯ |
| STORES | ◯ | ◯ |
| shopserve | ◯ | ◯ |
| リピストX | ◯ | ◯ |
| サブスクストア | ◯ | ◯ |`,
    platforms: ['ecforce', 'MakeShop', 'BASE', 'Shopify', 'futureshop', 'カラーミーショップ', 'STORES', 'shopserve', 'リピストX', 'サブスクストア'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'f2',
    question: 'ノーコードでの画像登録が基本となっているプラットフォーム一覧',
    answer: `主に以下のプラットフォームでは、HTML/CSSのコーディングよりも、管理画面からの画像アップロードやブロック配置（ノーコード）でのページ作成が基本となっています。

- **BASE**
- **STORES**
- **Shopify** (テーマによるがノーコードエディタが強力)
- **TikTok Shop**
- **Amazon**
- **Qoo10**`,
    platforms: ['BASE', 'STORES', 'Shopify', 'TikTok Shop', 'Amazon', 'Qoo10'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export function useStore() {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [presets, setPresets] = useState<PresetQuestion[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const k = localStorage.getItem('ec_knowledge');
    const f = localStorage.getItem('ec_faqs');
    const p = localStorage.getItem('ec_presets');
    const pl = localStorage.getItem('ec_platforms');
    
    if (k) {
      const parsedKnowledge = JSON.parse(k) as KnowledgeItem[];
      // Merge default knowledge if they don't exist
      const newKnowledge = [...parsedKnowledge];
      let hasChanges = false;
      DEFAULT_KNOWLEDGE.forEach(defaultK => {
        if (!parsedKnowledge.some(item => item.id === defaultK.id)) {
          newKnowledge.push(defaultK);
          hasChanges = true;
        }
      });
      setKnowledge(newKnowledge);
      if (hasChanges) {
        localStorage.setItem('ec_knowledge', JSON.stringify(newKnowledge));
      }
    } else {
      setKnowledge(DEFAULT_KNOWLEDGE);
      localStorage.setItem('ec_knowledge', JSON.stringify(DEFAULT_KNOWLEDGE));
    }

    if (f) {
      const parsedFaqs = JSON.parse(f) as FAQItem[];
      // Merge default faqs if they don't exist
      const newFaqs = [...parsedFaqs];
      let hasChanges = false;
      DEFAULT_FAQS.forEach(defaultFaq => {
        if (!parsedFaqs.some(faq => faq.id === defaultFaq.id)) {
          newFaqs.push(defaultFaq);
          hasChanges = true;
        }
      });
      setFaqs(newFaqs);
      if (hasChanges) {
        localStorage.setItem('ec_faqs', JSON.stringify(newFaqs));
      }
    } else {
      setFaqs(DEFAULT_FAQS);
      localStorage.setItem('ec_faqs', JSON.stringify(DEFAULT_FAQS));
    }
    
    if (p) {
      setPresets(JSON.parse(p));
    } else {
      setPresets(DEFAULT_PRESETS);
      localStorage.setItem('ec_presets', JSON.stringify(DEFAULT_PRESETS));
    }

    if (pl) {
      const parsed = JSON.parse(pl);
      // Ensure existing platforms have an order
      const withOrder = parsed.map((p: any, i: number) => ({ ...p, order: p.order ?? i }));
      setPlatforms(withOrder);
    } else {
      setPlatforms(DEFAULT_PLATFORMS);
      localStorage.setItem('ec_platforms', JSON.stringify(DEFAULT_PLATFORMS));
    }
    
    setIsLoaded(true);
  }, []);

  const saveKnowledge = (items: KnowledgeItem[]) => {
    setKnowledge(items);
    localStorage.setItem('ec_knowledge', JSON.stringify(items));
  };

  const saveFaqs = (items: FAQItem[]) => {
    setFaqs(items);
    localStorage.setItem('ec_faqs', JSON.stringify(items));
  };

  const savePresets = (items: PresetQuestion[]) => {
    setPresets(items);
    localStorage.setItem('ec_presets', JSON.stringify(items));
  };

  const savePlatforms = (items: Platform[]) => {
    setPlatforms(items);
    localStorage.setItem('ec_platforms', JSON.stringify(items));
  };

  return { knowledge, saveKnowledge, faqs, saveFaqs, presets, savePresets, platforms, savePlatforms, isLoaded };
}
