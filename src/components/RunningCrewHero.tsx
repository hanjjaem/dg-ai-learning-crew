'use client';

import React from 'react';
import { DailyReport, MemberSummary, PromptSubmission } from '@/lib/types';
import { ArrowRight, Plus } from 'lucide-react';

interface RunningCrewHeroProps {
  dailyReport: DailyReport;
  memberSummaries: MemberSummary[];
  submissions: PromptSubmission[];
  onOpenShareDrawer: () => void;
  onExplorePrompts: () => void;
}

// 28일 최근 활동 Mock 데이터 (8월 7일 ~ 9월 3일)
const LAST_28_DAYS = [
  { date: '8/7', tip: '8/7 · 챌린지 1건', level: 1 },
  { date: '8/8', tip: '8/8 · 챌린지 2건', level: 3 },
  { date: '8/9', tip: '8/9 · 공유 1건', level: 2 },
  { date: '8/10', tip: '8/10 · 활동 3건', level: 4 },
  { date: '8/11', tip: '8/11 · 활동 1건', level: 2 },
  { date: '8/12', tip: '8/12 · 활동 1건', level: 1 },
  { date: '8/13', tip: '8/13 · 활동 없음', level: 0 },
  { date: '8/14', tip: '8/14 · 활동 1건', level: 2 },
  { date: '8/15', tip: '8/15 · 활동 4건', level: 4 },
  { date: '8/16', tip: '8/16 · 활동 2건', level: 3 },
  { date: '8/17', tip: '8/17 · 활동 2건', level: 3 },
  { date: '8/18', tip: '8/18 · 활동 1건', level: 1 },
  { date: '8/19', tip: '8/19 · 활동 없음', level: 0 },
  { date: '8/20', tip: '8/20 · 활동 1건', level: 2 },
  { date: '8/21', tip: '8/21 · 활동 2건', level: 3 },
  { date: '8/22', tip: '8/22 · 활동 4건', level: 4 },
  { date: '8/23', tip: '8/23 · 활동 1건', level: 2 },
  { date: '8/24', tip: '8/24 · 활동 1건', level: 1 },
  { date: '8/25', tip: '8/25 · 활동 2건', level: 3 },
  { date: '8/26', tip: '8/26 · 활동 1건', level: 2 },
  { date: '8/27', tip: '8/27 · 활동 3건', level: 4 },
  { date: '8/28', tip: '8/28 · 활동 2건', level: 3 },
  { date: '8/29', tip: '8/29 · 활동 2건', level: 3 },
  { date: '8/30', tip: '8/30 · 활동 4건', level: 4 },
  { date: '8/31', tip: '8/31 · 활동 1건', level: 2 },
  { date: '9/1', tip: '9/1 · 활동 2건', level: 3 },
  { date: '9/2', tip: '9/2 · 활동 4건', level: 4 },
  { date: '9/3', tip: '9/3 · 활동 3건', level: 3 },
];

export default function RunningCrewHero({
  dailyReport,
  memberSummaries,
  submissions,
  onOpenShareDrawer,
  onExplorePrompts,
}: RunningCrewHeroProps) {
  const paceRate = dailyReport.submissionRate || 74;
  const maxStreak = Math.max(...memberSummaries.map((m) => m.consecutiveStreak), 6);
  const remainingForFinish = Math.max(0, dailyReport.totalMembersCount - dailyReport.submittedMembers.length);

  // 셀 레벨에 따른 배경 클래스
  const getCellClass = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-[#dcefe8]';
      case 2:
        return 'bg-[#b7dfd1]';
      case 3:
        return 'bg-[#78c3a9]';
      case 4:
        return 'bg-[#087a5b]';
      default:
        return 'bg-[#eef1ef]';
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      {/* 1. 좌측 메시지 & CTA (lg:col-span-5) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="text-xs font-extrabold tracking-widest text-[#087a5b] uppercase">
          AI Running Crew · Season 02
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#111312] leading-[1.08] tracking-[-0.04em]">
          함께 쌓는<br />
          <span className="text-[#087a5b]">AI 학습 페이스</span>
        </h1>

        <p className="text-base sm:text-lg text-[#717875] leading-relaxed max-w-lg font-normal">
          러닝을 직접 그리지 않고, 러닝처럼 느끼게 합니다. 챌린지 제출은 페이스가 되고,
          연속 참여는 스트릭이 되고, 팀의 누적 성과는 Finish line까지의 거리로 쌓입니다.
        </p>

        {/* 액션: [ + 프롬프트 공유 ] + [ 프롬프트 아카이브 → ] 나란히 배치 */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onOpenShareDrawer}
            className="h-11 px-5 rounded-[10px] bg-[#0f1714] hover:bg-[#202724] active:scale-[0.99] text-white font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>프롬프트 공유</span>
          </button>

          <button
            type="button"
            onClick={onExplorePrompts}
            className="h-11 px-5 rounded-[10px] bg-white hover:bg-zinc-50 border border-[#e8ebe9] text-[#111312] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>프롬프트 아카이브</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#717875]" />
          </button>
        </div>

        {/* 하단 인라인 메타데이터 */}
        <div className="pt-4 flex items-center gap-6 text-xs text-[#717875]">
          <span>
            <strong className="text-[#111312] font-extrabold">15명</strong> 참여 중
          </span>
          <span>
            <strong className="text-[#111312] font-extrabold">{maxStreak}일</strong> 연속 참여
          </span>
          <span>
            <strong className="text-[#111312] font-extrabold">{submissions.length}건</strong> 프롬프트 공유
          </span>
        </div>
      </div>

      {/* 2. 우측 시그니처 러닝 데이터 패널 (lg:col-span-7) */}
      <div className="lg:col-span-7 bg-white border border-[#e8ebe9] rounded-[16px] p-6 sm:p-8 shadow-xs space-y-6">
        {/* 패널 헤더: Week / Date */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold tracking-widest text-[#717875] uppercase">
            Week 04
          </span>
          <span className="text-xs text-[#98a09c] font-medium">
            Sep 3 — Sep 9
          </span>
        </div>

        {/* TEAM PACE & Number */}
        <div>
          <div className="text-xs font-bold text-[#717875] tracking-wider mb-1">
            TEAM PACE
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-5xl sm:text-6xl font-black text-[#111312] tracking-tighter leading-none">
              {paceRate}%
            </span>
            <span className="text-xs font-black text-[#087a5b] uppercase tracking-wide">
              ON PACE
            </span>
          </div>
        </div>

        {/* 얇은 Horizontal Progress Rail (러닝 트랙 메타포) */}
        <div className="relative h-14 pt-3">
          {/* 베이스 레일 */}
          <div className="absolute left-0 right-0 top-5 h-1.5 bg-[#eef1ef] rounded-full" />

          {/* 진행 레일 */}
          <div
            className="absolute left-0 top-5 h-1.5 bg-[#087a5b] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(10, paceRate))}%` }}
          />

          {/* 러너 닷 (현재 위치) */}
          <div
            className="absolute top-3 w-5 h-5 rounded-full bg-white border-[5px] border-[#087a5b] -translate-x-1/2 shadow-xs transition-all duration-500"
            style={{ left: `${Math.min(100, Math.max(10, paceRate))}%` }}
          />

          {/* 텍스트 레이블: START, 현재 페이스, FINISH */}
          <span className="absolute left-0 top-9 text-[11px] font-semibold text-[#98a09c]">
            START
          </span>
          <span
            className="absolute top-9 text-[11px] font-bold text-[#717875] -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${Math.min(100, Math.max(10, paceRate))}%` }}
          >
            현재 페이스
          </span>
          <span className="absolute right-0 top-0 text-[11px] font-medium text-[#717875]">
            FINISH · {dailyReport.totalMembersCount}명 완주
          </span>
        </div>

        {/* 3대 핵심 Stats (구분선 Grid) */}
        <div className="grid grid-cols-3 border-y border-[#e8ebe9] py-4 divide-x divide-[#e8ebe9]">
          <div className="pr-4">
            <strong className="block text-2xl sm:text-3xl font-bold text-[#111312] tracking-tight">
              {dailyReport.submittedMembers.length}
            </strong>
            <span className="block mt-1 text-xs text-[#717875] font-normal">
              이번 주 제출
            </span>
          </div>

          <div className="px-4">
            <strong className="block text-2xl sm:text-3xl font-bold text-[#111312] tracking-tight">
              {submissions.length}
            </strong>
            <span className="block mt-1 text-xs text-[#717875] font-normal">
              프롬프트 공유
            </span>
          </div>

          <div className="pl-4">
            <strong className="block text-2xl sm:text-3xl font-bold text-[#111312] tracking-tight">
              {maxStreak}
            </strong>
            <span className="block mt-1 text-xs text-[#717875] font-normal">
              day streak
            </span>
          </div>
        </div>

        {/* LAST 28 DAYS Activity Grid (28개 사각형) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#111312] uppercase tracking-wider">
              LAST 28 DAYS
            </h3>
            <span className="text-[11px] text-[#717875]">
              활동이 많을수록 진하게 표시
            </span>
          </div>

          <div className="grid grid-cols-14 gap-1.5">
            {LAST_28_DAYS.map((day, idx) => (
              <div
                key={idx}
                title={day.tip}
                className={`aspect-square rounded-[4px] transition-all duration-150 cursor-pointer hover:scale-110 ${getCellClass(
                  day.level
                )}`}
              />
            ))}
          </div>
        </div>

        {/* 하단 2개 서브 카드 (오늘의 챌린지 + Next finish) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {/* 카드 1: 오늘의 챌린지 */}
          <div className="bg-[#f7f8f7] border border-[#e8ebe9] rounded-[12px] p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#717875] block">
                오늘의 챌린지
              </span>
              <strong className="text-sm font-bold text-[#111312] block mt-0.5">
                AI 업무 프롬프트 인증
              </strong>
              <p className="text-[11px] text-[#717875] mt-1">
                평일 23:59 마감 · 현재 {dailyReport.submittedMembers.length}명 참여
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="block text-xl font-black text-[#087a5b]">
                {dailyReport.submittedMembers.length}/{dailyReport.totalMembersCount}
              </span>
              <span className="text-[10px] text-[#717875] font-medium">크루원</span>
            </div>
          </div>

          {/* 카드 2: Next Finish */}
          <div className="bg-[#f7f8f7] border border-[#e8ebe9] rounded-[12px] p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#717875] block">
                Next finish
              </span>
              <strong className="text-sm font-bold text-[#111312] block mt-0.5">
                {remainingForFinish} submissions left
              </strong>
              <p className="text-[11px] text-[#717875] mt-1">
                오늘 100% 완주까지 {remainingForFinish}개의 인증이 남았습니다.
              </p>
            </div>
            <div className="w-8 h-8 rounded-[8px] bg-white border border-[#e8ebe9] flex items-center justify-center text-[#717875] shrink-0 shadow-2xs">
              <span className="text-xs font-mono font-bold text-[#087a5b]">
                {remainingForFinish}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
