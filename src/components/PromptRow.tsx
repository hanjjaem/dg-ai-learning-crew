'use client';

import React, { useState } from 'react';
import { Flame, ExternalLink, MoreVertical, Check } from 'lucide-react';
import { PromptSubmission } from '@/lib/types';
import { ChallengeStorage } from '@/lib/storage';
import AIToolLogo from './AIToolLogo';

interface PromptRowProps {
  submission: PromptSubmission;
  onReactionAdded: () => void;
  onSelectArtifact?: (sub: PromptSubmission) => void;
}

export default function PromptRow({
  submission,
  onReactionAdded,
  onSelectArtifact,
}: PromptRowProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const isArtifact = submission.showcaseType === 'image' || submission.showcaseType === 'html';

  const handleReaction = (e: React.MouseEvent) => {
    e.stopPropagation();
    ChallengeStorage.addReaction(submission.id, 'awesome');
    onReactionAdded();
  };

  const handleCardClick = () => {
    // 행 본체 클릭 시에는 절대 외부로 튕기지 않고 내부 상세 모달을 띄움
    if (onSelectArtifact) {
      onSelectArtifact(submission);
    }
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    // 오직 이 버튼을 눌렀을 때만 외부 새 탭으로 이동
    e.stopPropagation();
    if (submission.promptUrl && submission.promptUrl !== '#') {
      window.open(submission.promptUrl, '_blank');
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(submission.promptUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 태그 목록 구성
  const tags: string[] = [];
  if (submission.category) tags.push(submission.category);
  if (submission.title.includes('SSH') || submission.title.includes('로그')) {
    tags.push('서버', '보안');
  } else if (submission.title.includes('축제') || submission.title.includes('보도자료')) {
    tags.push('홍보', '카피라이팅');
  } else if (submission.title.includes('건축') || submission.title.includes('조례')) {
    tags.push('법령검토', '지자체조례');
  }

  // 러닝크루 태그 스타일 (#087A5B 딥그린 엑센트 기반)
  const isChallenge = submission.title.includes('챌린지') || submission.category === '보고서/기획';

  const getBadge = () => {
    if (submission.showcaseType === 'image') {
      return { text: '🎨 IMAGE', bg: 'bg-purple-50 text-purple-700' };
    }
    if (submission.showcaseType === 'html') {
      return { text: '⚡️ LIVE HTML', bg: 'bg-blue-50 text-blue-700' };
    }
    return {
      text: isChallenge ? 'CHALLENGE' : 'PROMPT',
      bg: 'bg-[#eaf5f1] text-[#087a5b]',
    };
  };

  const badge = getBadge();

  return (
    <article
      onClick={handleCardClick}
      className="group bg-white rounded-[12px] p-4 sm:p-5 border border-[#e8ebe9] hover:border-[#ccd3cf] hover:bg-[#fbfcfb] transition-all duration-150 cursor-pointer flex items-center gap-4 select-none"
    >
      {/* 1. 좌측 플랫폼 아이콘 또는 이미지 썸네일 (40x40px) */}
      {submission.showcaseType === 'image' && submission.imageUrl ? (
        <div className="w-10 h-10 rounded-[8px] overflow-hidden shrink-0 border border-[#e8ebe9] bg-zinc-100 shadow-2xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={submission.imageUrl}
            alt={submission.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      ) : (
        <AIToolLogo tool={submission.aiTool} className="w-10 h-10 shrink-0" />
      )}

      {/* 2. 중앙 메인 콘텐츠 (3행 컴팩트 러닝 레이아웃) */}
      <div className="flex-1 min-w-0">
        {/* 1행: 러닝 메타포 태그 + 제목 (15px Bold) + 우측 액션 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-[10px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-[4px] shrink-0 uppercase ${badge.bg}`}
            >
              {badge.text}
            </span>
            <h3 className="text-sm sm:text-[15px] font-bold text-[#111312] group-hover:text-black transition-colors truncate">
              {submission.title}
            </h3>
          </div>

          {/* 우측 상단 액션: 원본 새 탭 열기 ↗ 및 복사 */}
          <div className="flex items-center gap-1 shrink-0 text-[#717875] group-hover:text-[#111312] transition-colors">
            {submission.promptUrl && submission.promptUrl !== '#' && (
              <button
                type="button"
                onClick={handleOpenExternal}
                className="p-1 rounded-[6px] hover:bg-[#eef1ef] text-[#717875] hover:text-[#111312] transition-colors cursor-pointer"
                title="AI 대화 원본 새 탭 열기"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1 rounded-[6px] hover:bg-[#eef1ef] text-[#717875] hover:text-[#111312] transition-colors cursor-pointer"
              title={copied ? '링크 복사됨!' : '대화 링크 복사'}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#087a5b]" />
              ) : (
                <MoreVertical className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* 2행: 스니펫 설명 (12~13px muted) */}
        {submission.promptSnippet && (
          <p className="text-xs text-[#717875] font-normal truncate mt-1 mb-2">
            {submission.promptSnippet}
          </p>
        )}

        {/* 3행: 메타 라인 (작성자 | 모델 | 날짜 | 태그들 ... +1 pace / 🔥 추천) */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3 pt-0.5 text-xs text-[#717875]">
          <div className="flex flex-wrap items-center gap-2">
            {/* 부서 · 작성자 */}
            <span className="text-[#55605b] font-medium">
              {submission.department ? `${submission.department} · ` : ''}
              {submission.memberName}
            </span>

            <span className="text-[#e2e5e3] select-none">|</span>

            {/* 모델명 */}
            <span className="text-[#717875]">{submission.aiTool}</span>

            <span className="text-[#e2e5e3] select-none">|</span>

            {/* 날짜 */}
            <span className="font-mono text-[#98a09c] text-[11px]">{submission.date}</span>

            {/* 태그 목록 */}
            {tags.length > 0 && (
              <>
                <span className="text-[#e2e5e3] select-none">|</span>
                <div className="flex items-center gap-1">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded-[4px] bg-[#f2f4f3] text-[#55605b] text-[10px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 우측 끝: 러닝 페이스 가산점(+1 pace) & 🔥 추천 수 */}
          <div className="flex items-center gap-2.5 ml-auto">
            <span className="text-[11px] font-bold text-[#087a5b] bg-[#eaf5f1] px-2 py-0.5 rounded-full">
              +1 pace
            </span>

            <button
              type="button"
              onClick={handleReaction}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#55605b] hover:text-[#087a5b] transition-colors cursor-pointer"
              title="추천하기"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{submission.likesAwesome || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
