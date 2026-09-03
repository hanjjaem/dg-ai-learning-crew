'use client';

import React, { useState } from 'react';
import { Copy, Check, X, Share2, Sparkles } from 'lucide-react';
import { DailyReport, PromptSubmission, MemberSummary } from '@/lib/types';
import { getKoreanDayOfWeek } from '@/lib/calculations';

interface DailySummaryModalProps {
  dailyReport: DailyReport;
  submissions: PromptSubmission[];
  memberSummaries: MemberSummary[];
}

export default function DailySummaryModal({
  dailyReport,
  submissions,
}: DailySummaryModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const dayOfWeek = getKoreanDayOfWeek(dailyReport.date);
  const todayTopPrompts = submissions.slice(0, 3);

  // 긴 URL을 완전히 걷어내고 사람 눈에 편안하게 정돈된 요약 텍스트
  const generateCleanNoticeText = (): string => {
    const lines: string[] = [
      `📢 [AI 러닝크루 2기] ${dailyReport.date}(${dayOfWeek}) 1일 1프롬프트 마감`,
      `━━━━━━━━━━━━━━━━━`,
      `🔥 오늘 출석률: ${dailyReport.submissionRate}% (${dailyReport.submittedMembers.length}/${dailyReport.totalMembersCount}명 완료)`,
      ``,
    ];

    if (todayTopPrompts.length > 0) {
      lines.push(`💡 오늘의 베스트 프롬프트 Pick:`);
      todayTopPrompts.forEach((p, idx) => {
        const dept = p.department ? `[${p.department}] ` : '';
        lines.push(`${idx + 1}. ${p.title} (${p.aiTool} · ${dept}${p.memberName})`);
      });
      lines.push(``);
    }

    if (dailyReport.missedMembers.length > 0) {
      lines.push(`⚠️ 오늘 미제출 크루원 (차감 2,000원):`);
      const missedNames = dailyReport.missedMembers
        .map((m) => `${m.department ? `[${m.department}] ` : ''}${m.name}`)
        .join(', ');
      lines.push(missedNames);
      lines.push(``);
    } else {
      lines.push(`🎉 경축! 15명 크루원 전원 100% 제출 완료 (벌금 0원 세이프) 🥳`);
      lines.push(``);
    }

    lines.push(`👉 대화 원본 보러가기: https://dg-ai-challenge.vercel.app`);
    lines.push(`━━━━━━━━━━━━━━━━━`);

    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = generateCleanNoticeText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  return (
    <>
      {/* 우측 하단 플로팅 트리거 버튼 (Linear 스타일) */}
      <aside aria-label="데일리 요약 리포트 버튼" className="fixed bottom-6 right-6 z-30">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-lg shadow-zinc-900/15 flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-zinc-700"
        >
          <Share2 className="w-3.5 h-3.5 text-zinc-300" />
          <span>단톡방 공유 요약</span>
        </button>
      </aside>

      {/* 모달 팝업 */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-modal-title"
          className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-zinc-200">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="summary-modal-title" className="text-xs font-bold text-zinc-900">
                    단톡방 공유 요약
                  </h3>
                  <p className="text-[10px] text-zinc-500">긴 URL을 없애고 핵심만 정돈된 텍스트입니다.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 정돈된 텍스트 박스 */}
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-800 leading-relaxed whitespace-pre-wrap mb-3 select-all">
              {generateCleanNoticeText()}
            </div>

            {/* 복사 버튼 */}
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-[0.99]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>클립보드에 복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-300" />
                  <span>원클릭 텍스트 복사</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
