import BlockEditor from '@/components/editor/BlockEditor';

export const metadata = {
  title: 'AI Block Editor - Enterprise CMS',
};

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navbar */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">B</div>
          <span className="font-bold text-slate-900 tracking-tight">CMS AI Editor</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500">Draft saved at 10:42 AM</span>
          <button className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">Publish</button>
        </div>
      </nav>

      {/* Editor Main Area */}
      <div className="flex-1 overflow-hidden">
        <BlockEditor />
      </div>
    </div>
  );
}
