export type PlatformCategory = 'SaaS型EC' | 'ECモール' | 'SNS型EC' | 'その他';

export interface Platform {
  id: string;
  name: string;
  url: string;
  category: PlatformCategory;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface PresetQuestion {
  id: string;
  name: string;
  intent: string;
  createdAt: number;
  updatedAt: number;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  platforms: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PlatformJudgment {
  platform: string;
  judgment: '可能' | '不可' | '条件付きで可能';
  evidence: string;
  implementation_tips: string;
  referenceLinks: string[];
  referencedKnowledgeIds: string[];
}
