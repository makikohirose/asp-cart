import React, { useState } from 'react';
import { KnowledgeItem, Platform } from '../types';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KnowledgeViewProps {
  knowledge: KnowledgeItem[];
  onSave: (items: KnowledgeItem[]) => void;
  platforms: Platform[];
}

export function KnowledgeView({ knowledge, onSave, platforms }: KnowledgeViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const openModal = (item?: KnowledgeItem) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title);
      setContent(item.content);
      setSelectedPlatforms(item.platforms);
    } else {
      setEditingItem(null);
      setTitle('');
      setContent('');
      setSelectedPlatforms([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    // Auto-tagging logic
    const tags: string[] = [];
    const lowerContent = content.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const fullText = lowerTitle + ' ' + lowerContent;

    // Check for URLs (実績URLあり)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(content)) {
      tags.push('実績URLあり');
    }

    // Keyword based tagging
    if (fullText.includes('レスポンシブ') || fullText.includes('スマホ') || fullText.includes('sp')) {
      tags.push('レスポンシブ');
    }
    if (fullText.includes('css') || fullText.includes('スタイル')) {
      tags.push('CSS');
    }
    if (fullText.includes('javascript') || fullText.includes('js')) {
      tags.push('JavaScript');
    }
    if (fullText.includes('デザイン') || fullText.includes('レイアウト')) {
      tags.push('デザイン');
    }
    if (fullText.includes('api')) {
      tags.push('API');
    }

    const newItem: KnowledgeItem = {
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      title,
      content,
      platforms: selectedPlatforms,
      tags: Array.from(new Set(tags)), // Remove duplicates
      createdAt: editingItem ? editingItem.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    if (editingItem) {
      onSave(knowledge.map(k => k.id === editingItem.id ? newItem : k));
    } else {
      onSave([...knowledge, newItem]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      onSave(knowledge.filter(k => k.id !== id));
    }
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ナレッジスペース</h1>
          <p className="text-slate-500">過去に確定した情報やマニュアルを追加・管理します。</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          新規追加
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {knowledge.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{item.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => openModal(item)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm text-slate-600 line-clamp-4 mb-4 flex-grow whitespace-pre-wrap">{item.content}</p>
            
            <div className="flex flex-wrap gap-1 mt-auto">
              {item.platforms.map(p => (
                <span key={p} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                  {p}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
        {knowledge.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
            ナレッジがまだありません。「新規追加」から追加してください。
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
              <h2 className="text-xl font-bold text-slate-900">{editingItem ? 'ナレッジ編集' : 'ナレッジ追加'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">タイトル</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例: MakeShopでのLPコーディングについて"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">内容</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full h-40 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="確定している情報やマニュアルの内容を入力してください"
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
                disabled={!title.trim() || !content.trim()}
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
