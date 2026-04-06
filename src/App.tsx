import { useState } from 'react';
import { useStore } from './hooks/useStore';
import { CheckView } from './views/CheckView';
import { KnowledgeView } from './views/KnowledgeView';
import { FAQView } from './views/FAQView';
import { ChatView } from './views/ChatView';
import { PresetView } from './views/PresetView';
import { PlatformView } from './views/PlatformView';
import { LayoutDashboard, BookOpen, MessageCircleQuestion, MessageSquare, Menu, X, Settings2, Globe } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ViewType = 'check' | 'knowledge' | 'faq' | 'chat' | 'preset' | 'platform';

export default function App() {
  const { knowledge, saveKnowledge, faqs, saveFaqs, presets, savePresets, platforms, savePlatforms, isLoaded } = useStore();
  const [currentView, setCurrentView] = useState<ViewType>('check');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isLoaded) return null;

  const navItems = [
    { id: 'check', label: '実装可否チェック', icon: LayoutDashboard },
    { id: 'knowledge', label: 'ナレッジスペース', icon: BookOpen },
    { id: 'faq', label: 'よくある質問', icon: MessageCircleQuestion },
    { id: 'platform', label: 'プラットフォーム管理', icon: Globe },
    { id: 'preset', label: '質問プリセット管理', icon: Settings2 },
    { id: 'chat', label: 'AIチャット', icon: MessageSquare },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-xl font-black tracking-tight text-indigo-600">EC Design Checker</h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-400")} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-700 mb-1">Director's Toolkit</p>
              商談中の即時回答や、実装可否の判断をサポートする社内システムです。
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className={currentView === 'check' ? 'block' : 'hidden'}>
          <CheckView knowledge={knowledge} faqs={faqs} presets={presets} platforms={platforms} />
        </div>
        
        <div className={currentView === 'chat' ? 'block' : 'hidden'}>
          <ChatView knowledge={knowledge} />
        </div>

        {currentView === 'knowledge' && <KnowledgeView knowledge={knowledge} onSave={saveKnowledge} platforms={platforms} />}
        {currentView === 'faq' && <FAQView faqs={faqs} onSave={saveFaqs} platforms={platforms} />}
        {currentView === 'platform' && <PlatformView platforms={platforms} onSave={savePlatforms} />}
        {currentView === 'preset' && <PresetView presets={presets} onSave={savePresets} />}
      </main>
    </div>
  );
}
