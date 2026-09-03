'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Flame, BookOpen, Users, MessageSquare } from 'lucide-react';
import { getKSTDateString, getKoreanDayOfWeek, getTimeRemainingToday } from '@/lib/calculations';

interface NavbarProps {
  activeView: 'library' | 'community' | 'attendance';
  setActiveView: (view: 'library' | 'community' | 'attendance') => void;
  submissionRate: number;
  submittedCount: number;
  totalCount: number;
}

export default function Navbar({
  activeView,
  setActiveView,
  submissionRate,
  submittedCount,
  totalCount,
}: NavbarProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const todayKST = getKSTDateString();
  const dayOfWeek = getKoreanDayOfWeek(todayKST);

  useEffect(() => {
    setTimeRemaining(getTimeRemainingToday());
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemainingToday());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-3">
        {/* 서비스 브랜딩 (Linear 모노크롬 감성) */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-zinc-900">
                AI 러닝크루 2기
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-100 text-zinc-600 font-semibold border border-zinc-200/80">
                프롬프트 허브
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-normal">
              {todayKST} ({dayOfWeek})
            </p>
          </div>
        </div>

        {/* 3대 핵심 내비게이션 탭 */}
        <nav className="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/60">
          <button
            onClick={() => setActiveView('library')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'library'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60 font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
            <span>프롬프트 아카이브</span>
          </button>

          <button
            onClick={() => setActiveView('community')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'community'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60 font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
            <span>질문 · 자유게시판</span>
          </button>

          <button
            onClick={() => setActiveView('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'attendance'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60 font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            <span>출석부 & 회비</span>
          </button>
        </nav>

        {/* 우측 마감 타이머 & 출석률 (단정하고 깔끔한 뱃지) */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>마감:</span>
            <span className="text-zinc-900 font-semibold">{timeRemaining || '23:59'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-white shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-xs font-bold">
              {submissionRate}% ({submittedCount}/{totalCount}명)
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
