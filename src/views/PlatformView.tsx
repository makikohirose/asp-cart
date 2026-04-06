import React, { useState } from 'react';
import { Platform, PlatformCategory } from '../types';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, X, Link as LinkIcon, ArrowUp, ArrowDown } from 'lucide-react';

interface PlatformViewProps {
  platforms: Platform[];
  onSave: (items: Platform[]) => void;
}

const CATEGORIES: PlatformCategory[] = ['SaaS型EC', 'ECモール', 'SNS型EC', 'その他'];

export function PlatformView({ platforms, onSave }: PlatformViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Platform | null>(null);
  
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<PlatformCategory>('SaaS型EC');

  const openModal = (item?: Platform) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setUrl(item.url);
      setCategory(item.category);
    } else {
      setEditingItem(null);
      setName('');
      setUrl('');
      setCategory('SaaS型EC');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    if (!name.trim() || !url.trim()) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      alert('有効なURLを入力してください（http:// または https:// から始まる必要があります）');
      return;
    }

    const newItem: Platform = {
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      name,
      url,
      category,
      order: editingItem ? editingItem.order : platforms.length + 1,
      createdAt: editingItem ? editingItem.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    if (editingItem) {
      onSave(platforms.map(p => p.id === editingItem.id ? newItem : p));
    } else {
      onSave([...platforms, newItem]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      onSave(platforms.filter(p => p.id !== id));
    }
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    const sorted = [...platforms].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(p => p.id === id);
    if (index === -1) return;
    
    // Find the nearest item in the same category
    const current = sorted[index];
    let targetIndex = -1;

    if (direction === 'up') {
      for (let i = index - 1; i >= 0; i--) {
        if (sorted[i].category === current.category) {
          targetIndex = i;
          break;
        }
      }
    } else {
      for (let i = index + 1; i < sorted.length; i++) {
        if (sorted[i].category === current.category) {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex !== -1) {
      const target = sorted[targetIndex];
      const newPlatforms = platforms.map(p => {
        if (p.id === current.id) return { ...p, order: target.order };
        if (p.id === target.id) return { ...p, order: current.order };
        return p;
      });
      onSave(newPlatforms);
    }
  };

  const sortedPlatforms = [...platforms].sort((a, b) => a.order - b.order);
  const groupedPlatforms = sortedPlatforms.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, Platform[]>);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">プラットフォーム管理</h1>
          <p className="text-slate-500">チェック対象となるECプラットフォームやモールを管理します。</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          新規追加
        </button>
      </div>

      <div className="space-y-8">
        {CATEGORIES.map(cat => {
          const catPlatforms = groupedPlatforms[cat] || [];
          if (catPlatforms.length === 0) return null;

          return (
            <div key={cat} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">{cat}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catPlatforms.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleMove(item.id, 'up')} 
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMove(item.id, 'down')} 
                          disabled={index === catPlatforms.length - 1}
                          className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 my-auto mx-1" />
                        <button onClick={() => openModal(item)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg break-all">
                      <LinkIcon className="w-4 h-4 flex-shrink-0" />
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline">
                        {item.url}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
        {platforms.length === 0 && (
          <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
            プラットフォームがまだありません。「新規追加」から追加してください。
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900">{editingItem ? 'プラットフォーム編集' : 'プラットフォーム追加'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">プラットフォーム名</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例: リピストX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">公式サイトURL</label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例: https://rpst.jp/x/"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">カテゴリ</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as PlatformCategory)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
                disabled={!name.trim() || !url.trim()}
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
