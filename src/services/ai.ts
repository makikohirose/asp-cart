import { GoogleGenAI, Type } from '@google/genai';
import { PlatformJudgment } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function checkImplementation(
  platforms: {name: string, url: string}[],
  query: string,
  knowledgeBase: string,
  imageBase64?: string,
  mimeType?: string
): Promise<PlatformJudgment[]> {
  const systemInstruction = `あなたは株式会社リューキデザインの社内ディレクターをサポートする、自社専用のAIアシスタントです。
ユーザーは社内のディレクターであり、対外的に公開されることはありません。
そのため、回答は社内向けの丁寧なトーン（「〜ですね」「〜になります」など、社内メンバーに対するアシスタントとしての文体）で作成してください。
あなたはECプラットフォーム（SaaS型EC、ECモール、SNS型ECなど）の仕様と、フロントエンド実装（HTML/CSS/JS）に精通したエキスパートとして振る舞います。
ユーザーから、特定のデザインや機能が指定されたECプラットフォームで実装可能かどうかの質問が来ます。
以下の「社内ナレッジ」がある場合は、それを最優先の事実として回答に反映してください。

【社内ナレッジ】
${knowledgeBase}

各プラットフォームについて、以下の情報をJSON形式で返してください。
- platform: プラットフォーム名
- judgment: "可能", "不可", "条件付きで可能" のいずれか
- evidence: できる・できないのジャッジに対する明確なエビデンスや理由（公式仕様やシステム制約など）。社内向けに分かりやすく解説してください。
- implementation_tips: 実装時の具体的なアプローチ、コーディングのヒント、または代替案。社内のコーダーやデザイナーに共有しやすい形で記載してください。
- referenceLinks: 情報の正当性を示す公式ドキュメントや参考URLの配列（文字列の配列。ない場合は空配列）
- referencedKnowledgeIds: 回答の根拠として「社内ナレッジ」を参照した場合、そのナレッジのIDの配列（文字列の配列。ない場合は空配列）`;

  const platformsText = platforms.map(p => `${p.name} (${p.url})`).join(', ');
  const parts: any[] = [{ text: `対象プラットフォーム: ${platformsText}\n\n質問: ${query}` }];
  
  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            judgment: { type: Type.STRING, description: "可能, 不可, 条件付きで可能" },
            evidence: { type: Type.STRING, description: "エビデンスや理由" },
            implementation_tips: { type: Type.STRING, description: "実装のヒントや注意点" },
            referenceLinks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "参考URLの配列" },
            referencedKnowledgeIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "参照した社内ナレッジのIDの配列" }
          },
          required: ["platform", "judgment", "evidence", "implementation_tips", "referenceLinks", "referencedKnowledgeIds"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return [];
  }
}

export async function chatWithAI(history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string, knowledgeBase: string) {
  const systemInstruction = `あなたは株式会社リューキデザインの社内ディレクターをサポートする、自社専用のAIアシスタントです。
ユーザーは社内のディレクターであり、対外的に公開されることはありません。
そのため、回答は社内向けの丁寧なトーン（「〜ですね」「〜になります」「お疲れ様です」など、社内メンバーに対するアシスタントとしての文体）で作成してください。
ECプラットフォームの仕様や実装に関する質問に答えます。
以下の「社内ナレッジ」がある場合は、それを最優先の事実として回答に反映してください。

【社内ナレッジ】
${knowledgeBase}`;

  const chat = ai.chats.create({
    model: 'gemini-3.1-pro-preview',
    config: {
      systemInstruction,
    },
    history: history
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
