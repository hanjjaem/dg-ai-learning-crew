'use client';

import React, { useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { PromptSubmission, AIToolType } from '@/lib/types';
import PromptCard from './PromptCard';

interface PromptLibraryProps {
  submissions: PromptSubmission[];
  onRefresh: () => void;
}

const AI_TOOLS: (AIToolType | '전체')[] = [
  '전체',
  'ChatGPT',
  'Claude',
  'Gemini',
  'Perplexity',
];

export default function PromptLibrary({ submissions, onRefresh }: PromptLibraryProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<AIToolType | '전체'>('전체');

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      if (selectedTool !== '전체' && sub.aiTool !== selectedTool) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = sub.title.toLowerCase().includes(query);
        const matchAuthor = sub.memberName.toLowerCase().includes(query);
        const matchDept = sub.department?.toLowerCase().includes(query);
        const matchSnippet = sub.promptSnippet?.toLowerCase().includes(query);
        if (!matchTitle && !matchAuthor && !matchDept && !matchSnippet) return false;
      }
      return true;
    });
  }, [submissions, selectedTool, searchQuery]);

  return (
    <div className="space-y-3.5">
      {/* 상단: 깔끔한 검색창 & 도구 필터 (Linear 감성) */}
      <div className="bg-white rounded-2xl p-3 sm:px-4 border border-zinc-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* 검색창 */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="프롬프트 제목, 작성자, 부서명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all duration-200"
          />
        </div>

        {/* 도구 필터 탭 */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {AI_TOOLS.map((tool) => (
            <button
              key={tool}
              onClick={() => setSelectedTool(tool)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all duration-200 cursor-pointer ${
                selectedTool === tool
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      {/* 헤더 안내 */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
          공유 프롬프트 ({filteredSubmissions.length}개)
        </h3>
        <span className="text-[11px] text-zinc-500 font-medium">카드를 클릭하면 대화 원본이 열립니다</span>
      </div>

      {/* 카드 그리드 */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-zinc-200/90 shadow-xs">
          <p className="text-xs font-bold text-zinc-800">해당하는 프롬프트가 없습니다.</p>
          <p className="text-[11px] text-zinc-500 mt-1">좌측에서 오늘 대화 링크를 공유해보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filteredSubmissions.map((item) => (
            <PromptCard key={item.id} submission={item} onReactionAdded={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}
