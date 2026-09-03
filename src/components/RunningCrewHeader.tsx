'use client';

import React from 'react';
import { CrewMember } from '@/lib/types';

interface RunningCrewHeaderProps {
  activeTab: 'home' | 'archive' | 'community' | 'attendance';
  onSelectTab: (tab: 'home' | 'archive' | 'community' | 'attendance') => void;
  members: CrewMember[];
  selectedMemberId: string;
}

export default function RunningCrewHeader({
  activeTab,
  onSelectTab,
  members,
  selectedMemberId,
}: RunningCrewHeaderProps) {
  const currentMember =
    members.find((m) => m.id === selectedMemberId) || members[0];

  return (
    <header className="h-[68px] px-6 sm:px-10 lg:px-12 flex items-center justify-between border-b border-[#e8ebe9] bg-white sticky top-0 z-40">
      {/* 1. 좌측 브랜드 (RC 심볼 마크 + 서비스명) */}
      <div
        onClick={() => onSelectTab('home')}
        className="flex items-center gap-3 font-extrabold text-base sm:text-lg tracking-tight text-[#111312] cursor-pointer select-none"
      >
        <div className="w-[32px] h-[32px] rounded-[8px] bg-[#0f1714] text-white flex items-center justify-center font-black text-xs tracking-tighter">
          RC
        </div>
        <span>AI 러닝크루 2기</span>
      </div>

      {/* 2. 중앙 네비게이션 (2px 그린 언더라인 + 68px 높이 완벽 밀착) */}
      <nav className="hidden md:flex items-center gap-8 text-sm h-full font-medium">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`h-full flex items-center relative transition-colors cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#111312] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#087a5b]'
              : 'text-[#717875] hover:text-[#111312]'
          }`}
        >
          홈 · 대시보드
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('archive')}
          className={`h-full flex items-center relative transition-colors cursor-pointer ${
            activeTab === 'archive'
              ? 'text-[#111312] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#087a5b]'
              : 'text-[#717875] hover:text-[#111312]'
          }`}
        >
          프롬프트 아카이브
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('community')}
          className={`h-full flex items-center relative transition-colors cursor-pointer ${
            activeTab === 'community'
              ? 'text-[#111312] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#087a5b]'
              : 'text-[#717875] hover:text-[#111312]'
          }`}
        >
          질문 · 자유게시판
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('attendance')}
          className={`h-full flex items-center relative transition-colors cursor-pointer ${
            activeTab === 'attendance'
              ? 'text-[#111312] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#087a5b]'
              : 'text-[#717875] hover:text-[#111312]'
          }`}
        >
          러닝보드 · 출석부
        </button>
      </nav>

      {/* 3. 우측: 42px 컴팩트 사용자 프로필 (헤더 정보 밀도 극대화) */}
      <div className="h-[42px] px-3 rounded-[10px] bg-[#f6f8f7] border border-[#e8ebe9] flex items-center gap-2.5 select-none">
        <div className="w-6 h-6 rounded-full bg-[#e2e5e3] text-[#111312] font-bold text-[11px] flex items-center justify-center shrink-0">
          {currentMember?.name?.slice(0, 1) || '나'}
        </div>
        <div className="text-left leading-none">
          <div className="text-xs font-bold text-[#111312] flex items-center gap-1.5">
            <span>{currentMember?.name}</span>
            {currentMember?.role === 'admin' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[#eaf5f1] text-[#087a5b] font-bold">
                총무
              </span>
            )}
          </div>
          <div className="text-[10px] text-[#717875] mt-0.5 font-normal">
            {currentMember?.department}
          </div>
        </div>
      </div>
    </header>
  );
}
