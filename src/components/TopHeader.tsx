'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Flame, Users } from 'lucide-react';
import { getTimeRemainingToday } from '@/lib/calculations';

interface TopHeaderProps {
  activeTab: 'archive' | 'community' | 'attendance';
  onSelectTab: (tab: 'archive' | 'community' | 'attendance') => void;
  submissionRate: number;
  submittedCount: number;
  totalCount: number;
}

export default function TopHeader({
  activeTab,
  onSelectTab,
  submissionRate,
  submittedCount,
  totalCount,
}: TopHeaderProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    setTimeRemaining(getTimeRemainingToday());
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemainingToday());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-15 border-b border-zinc-200/80 bg-white/95 backdrop-blur-xs px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* 좌측: 언더라인 스타일 미니멀 탭 (시안 상단 완벽 일치) */}
      <nav className="flex items-center gap-6 h-full">
        <button
          type="button"
          onClick={() => onSelectTab('archive')}
          className={`h-full text-xs font-bold transition-all relative flex items-center cursor-pointer ${
            activeTab === 'archive'
              ? 'text-zinc-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-900'
              : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          프롬프트 아카이브
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('community')}
          className={`h-full text-xs font-bold transition-all relative flex items-center cursor-pointer ${
            activeTab === 'community'
              ? 'text-zinc-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-900'
              : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          질문 · 자유게시판
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('attendance')}
          className={`h-full text-xs font-bold transition-all relative flex items-center cursor-pointer ${
            activeTab === 'attendance'
              ? 'text-zinc-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-900'
              : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          출석부 & 회비
        </button>
      </nav>

      {/* 우측: 차분하고 모던한 상태 지표 (시안 우측 상단 완벽 일치) */}
      <div className="flex items-center gap-4 text-xs">
        {/* 참여 현황 뱃지 */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>{submittedCount} / {totalCount}명 참여 중</span>
        </div>

        {/* 마감 시간 (텍스트) */}
        <div className="hidden sm:flex items-center gap-1 text-zinc-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>마감 {timeRemaining || '15시간 남음'}</span>
        </div>

        {/* 출석 달성률 */}
        <div className="flex items-center gap-1 text-amber-700 font-bold">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{submissionRate}% ({submittedCount}/{totalCount}명)</span>
        </div>
      </div>
    </header>
  );
}
