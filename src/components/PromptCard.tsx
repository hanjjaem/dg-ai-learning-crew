'use client';

import React from 'react';
import { ExternalLink, Flame } from 'lucide-react';
import { PromptSubmission } from '@/lib/types';
import { ChallengeStorage } from '@/lib/storage';

interface PromptCardProps {
  submission: PromptSubmission;
  onReactionAdded: () => void;
  onSelectArtifact?: (submission: PromptSubmission) => void;
}

export default function PromptCard({
  submission,
  onReactionAdded,
  onSelectArtifact,
}: PromptCardProps) {
  const handleReaction = (e: React.MouseEvent) => {
    e.stopPropagation();
    ChallengeStorage.addReaction(submission.id, 'awesome');
    onReactionAdded();
  };

  const handleCardClick = () => {
    // 카드 본체 클릭 시 내부 상세 모달 띄우기
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

  return (
    <article
      onClick={handleCardClick}
      className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-2xs hover:shadow-xs hover:border-zinc-400 transition-all duration-200 ease-in-out cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* 상단: 도구 뱃지 & 작성자 & 날짜 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200/70">
              {submission.aiTool}
            </span>
            <span className="text-xs font-bold text-zinc-900">
              {submission.department ? `${submission.department} ` : ''}{submission.memberName}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">{submission.date}</span>
        </div>

        {/* 프롬프트 제목 */}
        <h4 className="text-sm font-bold text-zinc-900 leading-snug mb-1.5 group-hover:text-zinc-950 transition-colors">
          {submission.title}
        </h4>

        {/* 짧은 설명/스니펫 (있는 경우만 담백하게) */}
        {submission.promptSnippet && (
          <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-3">
            {submission.promptSnippet}
          </p>
        )}
      </div>

      {/* 하단: 새 탭 열기 안내 & 리액션 */}
      <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs">
        {submission.promptUrl && submission.promptUrl !== '#' ? (
          <button
            type="button"
            onClick={handleOpenExternal}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-900 hover:text-[#087a5b] hover:underline cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>대화 원본 열기</span>
          </button>
        ) : (
          <span className="text-[11px] text-[#717875]">상세보기</span>
        )}

        <button
          type="button"
          onClick={handleReaction}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 text-[11px] font-medium transition-all duration-200 cursor-pointer"
        >
          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>{submission.likesAwesome || 0}</span>
        </button>
      </div>
    </article>
  );
}
