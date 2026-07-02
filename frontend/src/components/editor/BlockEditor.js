'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCommand, FiCheck, FiZap, FiEdit3, FiSave, FiList, FiImage, FiVideo, FiBarChart2 } from 'react-icons/fi';

export default function BlockEditor() {
  const [blocks, setBlocks] = useState([
    { id: '1', type: 'h1', content: '' },
    { id: '2', type: 'p', content: '' }
  ]);
  
  const [focusKeyword, setFocusKeyword] = useState('');
  const [aiStats, setAiStats] = useState({ word_count: 0, readability_score: 0, seo_score: 0, keyword_density: 0 });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  
  const timeoutRef = useRef(null);

  // Debounced Analysis
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      const fullText = blocks.map(b => b.content).join('\n');
      analyzeContent(fullText, focusKeyword);
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(timeoutRef.current);
  }, [blocks, focusKeyword]);

  const analyzeContent = async (content, keyword) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/index.php/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, focus_keyword: keyword })
      });
      const data = await res.json();
      if (data.success) {
        setAiStats(data.stats);
        setAiSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    }
  };

  const updateBlock = (index, newContent) => {
    const newBlocks = [...blocks];
    newBlocks[index].content = newContent;
    setBlocks(newBlocks);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, { id: Date.now().toString(), type: 'p', content: '' });
      setBlocks(newBlocks);
      setTimeout(() => {
        document.getElementById(`block-${index + 1}`)?.focus();
      }, 10);
    }
    if (e.key === 'Backspace' && blocks[index].content === '' && blocks.length > 1) {
      e.preventDefault();
      const newBlocks = [...blocks];
      newBlocks.splice(index, 1);
      setBlocks(newBlocks);
      setTimeout(() => {
        document.getElementById(`block-${index - 1}`)?.focus();
      }, 10);
    }
    // Block slash command simulation
    if (e.key === '/') {
       // In a full implementation, this opens a dropdown menu
       console.log("Open slash command menu");
    }
  };

  const triggerAIGeneration = async () => {
    setIsGenerating(true);
    setGeneratedText('');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/index.php/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Write an introduction based on current blocks.' })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
               break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              setGeneratedText(prev => prev + parsed.chunk);
            } catch(e) {}
          }
        }
      }
    } catch (err) {
      console.error("SSE Failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptAIGeneration = () => {
    setBlocks([...blocks, { id: Date.now().toString(), type: 'p', content: generatedText }]);
    setGeneratedText('');
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          
          <div className="mb-10 flex justify-between items-end">
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-2 tracking-widest uppercase">Draft Editor</p>
              <h1 className="text-4xl font-bold text-slate-900 placeholder:text-slate-300 outline-none" contentEditable placeholder="Untitled Document"></h1>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all">
              <FiSave /> Save Draft
            </button>
          </div>

          <div className="space-y-3">
            {blocks.map((block, index) => (
              <div key={block.id} className="group relative flex items-start gap-2">
                <div className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab mt-1 shrink-0">
                  <FiList className="text-slate-400" />
                </div>
                {block.type === 'h1' ? (
                  <h1 
                    id={`block-${index}`}
                    contentEditable
                    suppressContentEditableWarning
                    className="text-3xl font-bold text-slate-900 w-full outline-none empty:before:content-[attr(placeholder)] empty:before:text-slate-300"
                    placeholder="Heading 1"
                    onBlur={(e) => updateBlock(index, e.currentTarget.textContent)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  >{block.content}</h1>
                ) : (
                  <p 
                    id={`block-${index}`}
                    contentEditable
                    suppressContentEditableWarning
                    className="text-lg text-slate-700 w-full outline-none leading-relaxed min-h-[1.5rem] empty:before:content-[attr(placeholder)] empty:before:text-slate-300"
                    placeholder="Type '/' for commands"
                    onBlur={(e) => updateBlock(index, e.currentTarget.textContent)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  >{block.content}</p>
                )}
              </div>
            ))}
          </div>
          
          {/* AI Generation Stream Box */}
          <AnimatePresence>
            {(isGenerating || generatedText) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-inner"
              >
                <div className="flex items-center gap-2 mb-3 text-indigo-700 font-semibold">
                  <FiZap className={isGenerating ? "animate-pulse" : ""} />
                  {isGenerating ? "AI is generating..." : "AI Suggestion Ready"}
                </div>
                <p className="text-slate-700 leading-relaxed min-h-[3rem]">{generatedText}</p>
                
                {!isGenerating && generatedText && (
                  <div className="mt-4 flex gap-2">
                    <button onClick={acceptAIGeneration} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                      Insert
                    </button>
                    <button onClick={() => setGeneratedText('')} className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                      Discard
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <div className="w-80 bg-slate-50 border-l border-slate-200 overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs">AI</div>
            Assistant
          </h3>
          <p className="text-xs text-slate-500 mt-1">Real-time analysis & generation</p>
        </div>

        <div className="p-6 flex-1 space-y-8">
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={triggerAIGeneration} disabled={isGenerating} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm disabled:opacity-50 text-sm font-medium text-slate-700">
              <FiEdit3 className="text-xl" />
              Write Intro
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm text-sm font-medium text-slate-700">
              <FiBarChart2 className="text-xl" />
              Make Outline
            </button>
          </div>

          {/* Focus Keyword */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Focus Keyword</label>
            <input 
              type="text" 
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="e.g. Next.js Architecture"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Live SEO Score */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">SEO Score</label>
              <span className={`text-lg font-extrabold ${aiStats.seo_score > 70 ? 'text-emerald-600' : aiStats.seo_score > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                {aiStats.seo_score}/100
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${aiStats.seo_score > 70 ? 'bg-emerald-500' : aiStats.seo_score > 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                initial={{ width: 0 }}
                animate={{ width: `${aiStats.seo_score}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Live Readability */}
            <div className="flex justify-between items-end mt-4 mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Readability</label>
              <span className={`text-sm font-bold ${aiStats.readability_score > 60 ? 'text-emerald-600' : 'text-amber-500'}`}>
                {aiStats.readability_score > 60 ? 'Good' : 'Needs Work'} ({aiStats.readability_score})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
              <div className="bg-white border border-slate-200 rounded-lg p-2">
                <span className="block text-xl font-bold text-slate-800">{aiStats.word_count}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Words</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-2">
                <span className="block text-xl font-bold text-slate-800">{aiStats.keyword_density}%</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Density</span>
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Live Suggestions</label>
              <ul className="space-y-2">
                {aiSuggestions.map((sug, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-slate-600 flex items-start gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100"
                  >
                    <span className="text-blue-500 mt-0.5">•</span> {sug}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
