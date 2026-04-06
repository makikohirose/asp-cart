import React, { useState, useRef } from 'react';
import { PlatformJudgment, KnowledgeItem, FAQItem, PresetQuestion, Platform, PlatformCategory } from '../types';
import { checkImplementation } from '../services/ai';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, Upload, Loader2, Image as ImageIcon, X, CheckSquare, ExternalLink, BookOpen } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CheckViewProps {
  knowledge: KnowledgeItem[];
  faqs: FAQItem[];
  presets: PresetQuestion[];
  platforms: Platform[];
}

export function CheckView({ knowledge, faqs, presets, platforms }: CheckViewProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<PlatformJudgment[] | null>(null);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setImage({
        base64,
        mimeType: file.type,
        previewUrl: result
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCheck = async () => {
    if (selectedPlatforms.length === 0 || !query.trim()) return;

    setIsChecking(true);
    setResults(null);

    const knowledgeText = knowledge.map(k => `[${k.title}]\n${k.content}`).join('\n\n');
    const selectedPlatformObjects = platforms.filter(p => selectedPlatforms.includes(p.name)).map(p => ({ name: p.name, url: p.url }));
    
    try {
      const judgments = await checkImplementation(
        selectedPlatformObjects,
        query,
        knowledgeText,
        image?.base64,
        image?.mimeType
      );
      setResults(judgments);
    } catch (error) {
      console.error(error);
      alert('判定中にエラーが発生しました。');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">実装可否チェック</h1>
        <p className="text-slate-500">選択したECプラットフォームで、指定のデザインや機能が実装可能か判定します。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">プラットフォーム選択</h2>
            <div className="space-y-6">
              {['SaaS型EC', 'ECモール', 'SNS型EC', 'その他'].map(cat => {
                const catPlatforms = platforms.filter(p => p.category === cat).sort((a, b) => a.order - b.order);
                if (catPlatforms.length === 0) return null;
                return (
                  <div key={cat}>
                    <h3 className="text-xs font-bold text-slate-500 mb-2">{cat}</h3>
                    <div className="flex flex-wrap gap-2">
                      {catPlatforms.map(p => {
                        const isSelected = selectedPlatforms.includes(p.name);
                        return (
                          <button
                            key={p.id}
                            onClick={() => togglePlatform(p.name)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-200 ring-offset-1"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                            )}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">質問内容</h2>
            
            {presets && presets.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">プリセットから入力</p>
                <div className="flex flex-wrap gap-2">
                  {presets.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setQuery(p.intent)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-sm rounded-lg transition-colors border border-slate-200 hover:border-indigo-200 text-left"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例: PC表示時でも画面中央にスマホサイズのコンテンツを表示し、左右に背景を敷くレイアウトは可能ですか？"
              className="w-full h-32 p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />

            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              {!image ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-dashed border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  参考画像をアップロード
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={image.previewUrl} alt="Preview" className="w-full h-32 object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleCheck}
              disabled={isChecking || selectedPlatforms.length === 0 || !query.trim()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  判定中...
                </>
              ) : (
                '判定する'
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-4">判定結果</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((res, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{res.platform}</h3>
                        {res.referencedKnowledgeIds && res.referencedKnowledgeIds.length > 0 && (
                          <div className="flex gap-1">
                            {res.referencedKnowledgeIds.map(kId => (
                              <button
                                key={kId}
                                onClick={() => setSelectedKnowledgeId(kId)}
                                className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold hover:bg-amber-200 transition-colors"
                                title="社内ナレッジを参照しました"
                              >
                                <BookOpen className="w-3 h-3" />
                                ナレッジ
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5",
                        res.judgment === '可能' && "bg-emerald-100 text-emerald-800",
                        res.judgment === '不可' && "bg-rose-100 text-rose-800",
                        res.judgment === '条件付きで可能' && "bg-amber-100 text-amber-800"
                      )}>
                        {res.judgment === '可能' && <CheckCircle2 className="w-4 h-4" />}
                        {res.judgment === '不可' && <XCircle className="w-4 h-4" />}
                        {res.judgment === '条件付きで可能' && <AlertCircle className="w-4 h-4" />}
                        {res.judgment}
                      </div>
                    </div>
                    
                    <div className="space-y-4 flex-grow">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">エビデンス・理由</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{res.evidence}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">実装ヒント</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{res.implementation_tips}</p>
                      </div>

                      {res.referenceLinks && res.referenceLinks.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">参考リンク</h4>
                          <ul className="space-y-1">
                            {res.referenceLinks.map((link, idx) => (
                              <li key={idx}>
                                <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 hover:underline break-all">
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  {link}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!results && !isChecking && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <CheckSquare className="w-12 h-12 mb-4 text-slate-300" />
              <p>プラットフォームを選択し、質問を入力して「判定する」をクリックしてください。</p>
            </div>
          )}
        </div>
      </div>

      {/* Knowledge Modal */}
      {selectedKnowledgeId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-600">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-xl font-bold text-slate-900">参照された社内ナレッジ</h2>
              </div>
              <button onClick={() => setSelectedKnowledgeId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {(() => {
                const k = knowledge.find(item => item.id === selectedKnowledgeId);
                if (!k) return <p className="text-slate-500">ナレッジが見つかりません。</p>;
                return (
                  <>
                    <h3 className="text-lg font-bold text-slate-900">{k.title}</h3>
                    <div className="flex gap-2">
                      {k.platforms.map(p => (
                        <span key={p} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {k.content}
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedKnowledgeId(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition-colors"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
