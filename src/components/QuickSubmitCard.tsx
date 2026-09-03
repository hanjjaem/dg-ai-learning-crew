'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Flame,
  Wallet,
} from 'lucide-react';
import { CrewMember, MemberSummary, AIToolType } from '@/lib/types';
import { ChallengeStorage } from '@/lib/storage';
import { validateShareUrl, formatCurrency } from '@/lib/calculations';

interface QuickSubmitCardProps {
  members: CrewMember[];
  memberSummaries: MemberSummary[];
  onSubmissionSuccess: () => void;
}

export default function QuickSubmitCard({
  members,
  memberSummaries,
  onSubmissionSuccess,
}: QuickSubmitCardProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [promptUrl, setPromptUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [detectedTool, setDetectedTool] = useState<AIToolType | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lastId = ChallengeStorage.getLastMemberId();
    if (lastId && members.some((m) => m.id === lastId)) {
      setSelectedMemberId(lastId);
    } else if (members.length > 0) {
      setSelectedMemberId(members[0].id);
    }
  }, [members]);

  useEffect(() => {
    if (!promptUrl.trim()) {
      setDetectedTool(null);
      setUrlError(null);
      return;
    }

    const result = validateShareUrl(promptUrl);
    setDetectedTool(result.tool);
    if (!result.valid && result.message) {
      setUrlError(result.message);
    } else {
      setUrlError(null);
    }
  }, [promptUrl]);

  const currentSummary = memberSummaries.find((s) => s.member.id === selectedMemberId);

  const handleMemberChange = (id: string) => {
    setSelectedMemberId(id);
    ChallengeStorage.setLastMemberId(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    setSuccessNotice(null);

    if (!selectedMemberId) {
      setUrlError('크루원 본인 이름을 선택해주세요.');
      return;
    }

    const validation = validateShareUrl(promptUrl);
    if (!validation.valid) {
      setUrlError(validation.message || '유효한 AI 대화 공유 링크를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      ChallengeStorage.submitShareLink({
        memberId: selectedMemberId,
        promptUrl: promptUrl.trim(),
        title: title.trim() || undefined,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSuccessNotice('오늘의 프롬프트 인증 완료! (벌금 면제)');
      setPromptUrl('');
      setTitle('');
      onSubmissionSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUrlError(err.message);
      } else {
        setUrlError('제출 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden">
      {/* 상단 프로필 & 잔액 (절제된 슬레이트 미니멀 헤더) */}
      <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
            {currentSummary?.member.name.slice(0, 1) || '나'}
          </div>
          <div>
            <label htmlFor="member-select" className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              크루원
            </label>
            <select
              id="member-select"
              value={selectedMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="bg-transparent font-bold text-xs text-zinc-900 focus:outline-hidden cursor-pointer"
            >
              {members.map((m) => {
                const departmentPrefix = m.department ? `[${m.department}] ` : '';
                const roleSuffix = m.role === 'admin' ? ' (총무)' : '';
                const displayName = `${departmentPrefix}${m.name}${roleSuffix}`;
                return (
                  <option key={m.id} value={m.id} className="text-zinc-900 font-medium">
                    {displayName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* 회비 잔액 */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 justify-end">
            <Wallet className="w-3 h-3 text-emerald-600" />
            <span>회비 잔액</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 font-mono">
            {formatCurrency(currentSummary?.remainingBalance ?? 20000)}
          </span>
        </div>
      </div>

      {/* 잔디 스트릭 바 */}
      <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-between text-xs text-zinc-500 bg-white">
        <div className="flex items-center gap-1.5 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>연속 출석:</span>
          <span className="font-bold text-zinc-900">
            {currentSummary?.consecutiveStreak || 0}일
          </span>
        </div>
        <div className="flex items-center gap-1">
          {currentSummary?.recentDaysStatus.map((day) => (
            <span
              key={day.date}
              title={`${day.date}: ${day.submitted ? '출석' : '미제출'}`}
              className={`w-3 h-3 rounded-xs transition-colors ${
                day.submitted ? 'bg-emerald-500' : 'bg-zinc-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 폼 입력 영역 */}
      <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
        {successNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {urlError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200/80 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{urlError}</span>
          </div>
        )}

        {/* 1. Share 링크 입력 */}
        <div>
          <label className="block text-xs font-bold text-zinc-800 mb-1">
            공식 Share 링크 붙여넣기 <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              ref={urlInputRef}
              type="url"
              required
              placeholder="https://chatgpt.com/share/... (Ctrl+V)"
              value={promptUrl}
              onChange={(e) => setPromptUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 font-medium placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
            />
            {detectedTool && (
              <span className="absolute right-2 top-1.5 px-2 py-0.5 rounded-md bg-zinc-900 text-white text-[10px] font-bold shadow-xs">
                {detectedTool}
              </span>
            )}
          </div>
        </div>

        {/* 2. 대화 제목 */}
        <div>
          <label className="block text-xs font-bold text-zinc-800 mb-1 flex items-center justify-between">
            <span>대화 제목 (선택)</span>
            <span className="text-[10px] text-zinc-400 font-normal">미입력 시 자동 생성</span>
          </label>
          <input
            type="text"
            placeholder="예: SSH 로그 분석, 엑셀 함수 최적화 등"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 font-medium placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
          />
        </div>

        {/* 인증 제출 버튼 (Linear 감성의 블랙 버튼) */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          {isSubmitting ? '인증 처리 중...' : '1일 1프롬프트 인증 완료'}
        </button>

        <p className="text-[11px] text-center text-zinc-400 font-normal">
          대화방 우측 상단 <strong>Share(공유)</strong> 링크를 붙여넣으면 끝납니다.
        </p>
      </form>
    </div>
  );
}
