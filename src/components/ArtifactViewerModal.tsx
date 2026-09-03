'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Eye,
  Sparkles,
  Flame,
  Calendar,
  User,
  Building2,
} from 'lucide-react';
import { PromptSubmission } from '@/lib/types';
import AIToolLogo from './AIToolLogo';
import { ChallengeStorage } from '@/lib/storage';

interface ArtifactViewerModalProps {
  submission: PromptSubmission | null;
  onClose: () => void;
  onReactionAdded?: () => void;
}

export default function ArtifactViewerModal({
  submission,
  onClose,
  onReactionAdded,
}: ArtifactViewerModalProps) {
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (submission) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [submission, onClose]);

  if (!submission || !mounted) return null;

  const isImage = submission.showcaseType === 'image';
  const isHtml = submission.showcaseType === 'html';

  const handleCopyPrompt = () => {
    const textToCopy = submission.rawPromptText || submission.promptSnippet || '';
    navigator.clipboard.writeText(textToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyCode = () => {
    if (submission.htmlCode) {
      navigator.clipboard.writeText(submission.htmlCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    ChallengeStorage.addReaction(submission.id, 'awesome');
    if (onReactionAdded) onReactionAdded();
  };

  // createPortal로 document.body에 직접 부착하여 상단 헤더를 포함한 화면 전체(100vw, 100vh)를 덮음
  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/75 backdrop-blur-md p-4 sm:p-6 md:p-8 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* 상세 모달 메인 카드 (뷰포트 90vh 이내 완벽 정렬 & 상단 헤더 고정) */}
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. 상단 모달 헤더 (동구_공모전 스타일 상세 헤더) */}
        <div className="px-6 py-4.5 border-b border-[#e8ebe9] bg-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0 flex-1">
            {/* 상단 뱃지 & 메타 정보 행 */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-[4px] uppercase ${
                  isImage
                    ? 'bg-purple-50 text-purple-700'
                    : isHtml
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-[#eaf5f1] text-[#087a5b]'
                }`}
              >
                {isImage ? '🎨 IMAGE SHOWCASE' : isHtml ? '⚡️ INTERACTIVE HTML' : '💬 PROMPT'}
              </span>

              <span className="text-xs text-[#717875] flex items-center gap-1 font-medium">
                <Building2 className="w-3 h-3 text-[#717875]" />
                {submission.department}
              </span>
              <span className="text-xs text-[#717875]">·</span>
              <span className="text-xs text-[#111312] font-semibold flex items-center gap-1">
                <User className="w-3 h-3 text-[#717875]" />
                {submission.memberName}
              </span>
              <span className="text-xs text-[#717875]">·</span>
              <span className="text-xs text-[#717875] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#717875]" />
                {submission.date}
              </span>
            </div>

            {/* 메인 작품 제목 */}
            <h2 className="text-lg sm:text-xl font-bold text-[#111312] tracking-tight leading-snug">
              {submission.title}
            </h2>
          </div>

          {/* 우측 상단 컨트롤: AI 도구 로고 + 닫기 버튼 */}
          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#f6f8f7] border border-[#e8ebe9]">
              <AIToolLogo tool={submission.aiTool} className="w-4 h-4" />
              <span className="text-xs font-bold text-[#111312]">{submission.aiTool}</span>
            </div>

            {submission.promptUrl && submission.promptUrl !== '#' && (
              <a
                href={submission.promptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-[#717875] hover:text-[#111312] hover:bg-[#f6f8f7] transition-colors"
                title="원본 대화방 열기"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* 동구_공모전 스타일 원형 닫기 X 버튼 */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f6f8f7] hover:bg-[#eef1ef] text-[#717875] hover:text-[#111312] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. 모달 본문 영역 (내부 스크롤) */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-[#fafbfa]">
          {/* A. 이미지 전시일 때 */}
          {isImage && submission.imageUrl && (
            <div className="space-y-3">
              <div className="bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center p-3 border border-zinc-800 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={submission.imageUrl}
                  alt={submission.title}
                  className="max-h-[440px] w-auto max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          {/* B. HTML 전시일 때 */}
          {isHtml && submission.htmlCode && (
            <div className="space-y-3">
              {/* HTML 프리뷰 / 코드 토글 탭 바 */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111312]">
                  실시간 인터랙티브 웹 위젯
                </span>
                <div className="flex items-center bg-[#f6f8f7] p-0.5 rounded-lg border border-[#e8ebe9]">
                  <button
                    type="button"
                    onClick={() => setActiveView('preview')}
                    className={`px-3 py-1 rounded-[6px] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeView === 'preview'
                        ? 'bg-white text-[#111312] shadow-2xs'
                        : 'text-[#717875] hover:text-[#111312]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>실행 화면</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('code')}
                    className={`px-3 py-1 rounded-[6px] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeView === 'code'
                        ? 'bg-white text-[#111312] shadow-2xs'
                        : 'text-[#717875] hover:text-[#111312]'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>HTML 소스</span>
                  </button>
                </div>
              </div>

              {/* 프레임 본체 */}
              <div className="rounded-xl overflow-hidden border border-[#e8ebe9] bg-white shadow-xs">
                {activeView === 'preview' ? (
                  <div className="relative">
                    <iframe
                      srcDoc={submission.htmlCode}
                      sandbox="allow-scripts"
                      title="HTML Artifact Live Preview"
                      className="w-full h-[400px] border-0 bg-white"
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-zinc-900/80 backdrop-blur-xs text-[10px] text-white rounded-md font-mono pointer-events-none">
                      Sandbox Isolated
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="p-4 bg-zinc-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[400px]">
                      <pre className="whitespace-pre-wrap">{submission.htmlCode}</pre>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="absolute top-3 right-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? '복사됨!' : 'HTML 복사'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* C. 프롬프트 전문 (복사 가능) */}
          <div className="bg-white p-5 rounded-xl border border-[#e8ebe9] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#087a5b]" />
                <span className="text-xs font-bold text-[#111312]">
                  제작에 사용된 AI 프롬프트 전문
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-3 py-1.5 rounded-[8px] bg-[#f6f8f7] hover:bg-[#eef1ef] text-[#111312] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#e8ebe9]"
              >
                {copiedPrompt ? (
                  <Check className="w-3.5 h-3.5 text-[#087a5b]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#717875]" />
                )}
                <span>{copiedPrompt ? '프롬프트 복사됨!' : '프롬프트 복사'}</span>
              </button>
            </div>

            <div className="p-4 bg-[#f6f8f7] rounded-lg border border-[#e8ebe9] text-xs text-[#202724] font-mono leading-relaxed select-text whitespace-pre-wrap">
              {submission.rawPromptText || submission.promptSnippet || '등록된 프롬프트 내용이 없습니다.'}
            </div>
          </div>

          {/* D. 크루원 소감 및 추천 액션 바 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-[#e8ebe9]">
            <div className="text-xs text-[#717875] flex items-center gap-2">
              <span className="font-bold text-[#111312]">소감/팁:</span>
              <span>{submission.summaryNote || submission.promptSnippet || '동료들과 공유된 산출물입니다.'}</span>
            </div>

            <button
              type="button"
              onClick={handleLike}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f8f7] hover:bg-[#eaf5f1] text-xs font-bold text-[#111312] border border-[#e8ebe9] transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>기발해요 {(submission.likesAwesome || 0)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
