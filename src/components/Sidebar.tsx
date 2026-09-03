'use client';

import React from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  Bookmark,
  Flame,
  Plus,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { CrewMember, MemberSummary } from '@/lib/types';
import { ChallengeStorage } from '@/lib/storage';
import MemberCombobox from './MemberCombobox';

interface SidebarProps {
  members: CrewMember[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  memberSummaries: MemberSummary[];
  onOpenShareDrawer: () => void;
  currentNav: 'all' | 'my' | 'bookmark' | 'popular';
  onSelectNav: (nav: 'all' | 'my' | 'bookmark' | 'popular') => void;
}

export default function Sidebar({
  members,
  selectedMemberId,
  onSelectMember,
  memberSummaries,
  onOpenShareDrawer,
  currentNav,
  onSelectNav,
}: SidebarProps) {
  const currentMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const currentSummary = memberSummaries.find((s) => s.member.id === selectedMemberId);

  return (
    <aside className="w-64 sm:w-72 shrink-0 bg-white border-r border-zinc-200/80 min-h-screen flex flex-col justify-between p-5 select-none">
      {/* 상단 브랜딩 & 프로필 & 메뉴 */}
      <div className="space-y-6">
        {/* 1. 상단 로고 */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-zinc-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-zinc-900 tracking-tight">
              AI 러닝크루 2기
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium">
              프로젝트 허브
            </span>
          </div>
        </div>

        {/* 2. 사용자 프로필 & 잔디 (깔끔한 컴팩트 위젯) */}
        <div className="p-3 bg-zinc-50/70 rounded-2xl border border-zinc-100 space-y-3">
          <MemberCombobox
            members={members}
            selectedMemberId={selectedMemberId}
            onSelectMember={onSelectMember}
          />

          {/* 잔디 스트릭 */}
          <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1 font-medium text-[11px]">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>연속 출석 · {currentSummary?.consecutiveStreak || 1}일</span>
            </div>
            <div className="flex items-center gap-1">
              {currentSummary?.recentDaysStatus.slice(0, 5).map((d) => (
                <span
                  key={d.date}
                  title={`${d.date}: ${d.submitted ? '출석' : '미제출'}`}
                  className={`w-2.5 h-2.5 rounded-xs transition-colors ${
                    d.submitted ? 'bg-emerald-500' : 'bg-zinc-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. 메인 CTA: + 프롬프트 공유하기 (시안 핵심 버튼!) */}
        <button
          type="button"
          onClick={onOpenShareDrawer}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>프롬프트 공유하기</span>
        </button>

        {/* 4. 네비게이션 메뉴 리스트 */}
        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => onSelectNav('all')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              currentNav === 'all'
                ? 'bg-zinc-100 text-zinc-900 font-bold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-zinc-500" />
            <span>프롬프트 아카이브</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectNav('my')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              currentNav === 'my'
                ? 'bg-zinc-100 text-zinc-900 font-bold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <FileText className="w-4 h-4 text-zinc-500" />
            <span>내가 공유한 프롬프트</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectNav('bookmark')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              currentNav === 'bookmark'
                ? 'bg-zinc-100 text-zinc-900 font-bold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <Bookmark className="w-4 h-4 text-zinc-500" />
            <span>북마크한 프롬프트</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectNav('popular')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              currentNav === 'popular'
                ? 'bg-zinc-100 text-zinc-900 font-bold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <Flame className="w-4 h-4 text-zinc-500" />
            <span>인기 프롬프트</span>
          </button>
        </nav>
      </div>

      {/* 하단 인스파이어 배너 & 로그아웃 */}
      <div className="space-y-4 pt-6">
        {/* 인스파이어 배너 (시안 좌측 하단 카드) */}
        <div className="p-3.5 bg-blue-50/60 border border-blue-100/80 rounded-2xl">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-bold text-zinc-900 leading-snug">
            팀의 지식이 모일수록<br />더 강력해집니다
          </h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed mt-1 font-normal">
            좋은 프롬프트를 공유하고 팀의 성장을 함께 만들어가요.
          </p>
        </div>

        {/* 로그아웃 / 초기화 */}
        <button
          type="button"
          onClick={() => {
            if (confirm('저장된 데이터를 초기 상태로 리셋하시겠습니까?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full flex items-center gap-2 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>환경설정 / 데이터 리셋</span>
        </button>
      </div>
    </aside>
  );
}
