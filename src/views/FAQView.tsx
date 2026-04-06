import React, { useState } from 'react';
import { FAQItem, Platform } from '../types';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FAQViewProps {
  faqs: FAQItem[];
  onSave: (items: FAQItem[]) => void;
  platforms: Platform[];
}

export function FAQView({ faqs, onSave, platforms }: FAQViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const openModal = (item?: FAQItem) => {
    if (item) {
      setEditingItem(item);
      setQuestion(item.question);
      setAnswer(item.answer);
      setSelectedPlatforms(item.platforms);
    } else {
      setEditingItem(null);
      setQuestion('');
      setAnswer('');
      setSelectedPlatforms([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) return;

    const newItem: FAQItem = {
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      question,
      answer,
      platforms: selectedPlatforms,
      createdAt: editingItem ? editingItem.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    if (editingItem) {
      onSave(faqs.map(f => f.id === editingItem.id ? newItem : f));
    } else {
      onSave([...faqs, newItem]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      onSave(faqs.filter(f => f.id !== id));
    }
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">よくある質問</h1>
          <p className="text-slate-500">よく聞かれる質問と回答をリスト化して管理します。</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          新規追加
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div 
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors gap-4"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div className="flex items-start gap-4 flex-grow">
                <span className="text-indigo-600 font-bold text-xl mt-0.5">Q.</span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.question}</h3>
              </div>
              <div className="flex items-center gap-4 sm:w-1/2 justify-end">
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {item.platforms.map(p => (
                    <span key={p} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-full font-medium whitespace-nowrap">
                      {p}
                    </span>
                  ))}
                </div>
                <div className="flex-shrink-0">
                  {expandedId === item.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>
            </div>
            
            {expandedId === item.id && (
              <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
                <div className="flex gap-4 mt-5">
                  <span className="text-emerald-600 font-bold text-xl">A.</span>
                  <div className="flex-grow prose prose-slate prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.answer}
                    </ReactMarkdown>
                  </div>
                  <div className="flex gap-2 self-start ml-4">
                    <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
        {faqs.length === 0 && (
          <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
            FAQがまだありません。「新規追加」から追加してください。
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900">{editingItem ? 'FAQ編集' : 'FAQ追加'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">質問 (Q)</label>
                <input
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例: LPのコーディングは可能ですか？"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">回答 (A)</label>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  className="w-full h-40 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="回答を入力してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">関連プラットフォーム</label>
                <div className="space-y-4">
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
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 flex-shrink-0">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={!question.trim() || !answer.trim()}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存する
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
