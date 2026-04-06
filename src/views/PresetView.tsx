import React, { useState } from 'react';
import { PresetQuestion } from '../types';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface PresetViewProps {
  presets: PresetQuestion[];
  onSave: (items: PresetQuestion[]) => void;
}

export function PresetView({ presets, onSave }: PresetViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PresetQuestion | null>(null);
  
  const [name, setName] = useState('');
  const [intent, setIntent] = useState('');

  const openModal = (item?: PresetQuestion) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setIntent(item.intent);
    } else {
      setEditingItem(null);
      setName('');
      setIntent('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    if (!name.trim() || !intent.trim()) return;

    const newItem: PresetQuestion = {
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      name,
      intent,
      createdAt: editingItem ? editingItem.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    if (editingItem) {
      onSave(presets.map(p => p.id === editingItem.id ? newItem : p));
    } else {
      onSave([...presets, newItem]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      onSave(presets.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">質問プリセット管理</h1>
          <p className="text-slate-500">実装可否チェックでよく使う質問のプリセットを管理します。</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          新規追加
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presets.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => openModal(item)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">意図する内容</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl whitespace-pre-wrap">{item.intent}</p>
            </div>
          </motion.div>
        ))}
        {presets.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
            プリセットがまだありません。「新規追加」から追加してください。
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
              <h2 className="text-xl font-bold text-slate-900">{editingItem ? 'プリセット編集' : 'プリセット追加'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">プリセット名 (短く分かりやすい名前)</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例: スマホ+PC固定背景"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">意図する内容 (AIに伝わる具体的な指示)</label>
                <textarea
                  value={intent}
                  onChange={e => setIntent(e.target.value)}
                  className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="例: PC表示時でも画面中央にスマホサイズのコンテンツを表示し、左右に背景を敷く"
                />
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
                disabled={!name.trim() || !intent.trim()}
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
