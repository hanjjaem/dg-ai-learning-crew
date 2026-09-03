'use client';

import React, { useState, useEffect, useCallback } from 'react';
import RunningCrewHeader from '@/components/RunningCrewHeader';
import RunningCrewHero from '@/components/RunningCrewHero';
import PromptArchiveView from '@/components/PromptArchiveView';
import CommunityBoard from '@/components/CommunityBoard';
import AttendanceBoard from '@/components/AttendanceBoard';
import SharePromptDrawer from '@/components/SharePromptDrawer';
import DailySummaryModal from '@/components/DailySummaryModal';
import PromptRow from '@/components/PromptRow';
import ArtifactViewerModal from '@/components/ArtifactViewerModal';
import { CrewMember, PromptSubmission, DailyReport, MemberSummary } from '@/lib/types';
import { ChallengeStorage, INITIAL_MEMBERS, INITIAL_SUBMISSIONS } from '@/lib/storage';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'archive' | 'community' | 'attendance'>('home');
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState<boolean>(false);
  const [selectedArtifact, setSelectedArtifact] = useState<PromptSubmission | null>(null);

  const [members, setMembers] = useState<CrewMember[]>(INITIAL_MEMBERS);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(() =>
    ChallengeStorage.getLastMemberId()
  );
  const [submissions, setSubmissions] = useState<PromptSubmission[]>(INITIAL_SUBMISSIONS);
  const [dailyReport, setDailyReport] = useState<DailyReport>(() => ChallengeStorage.getDailyReport());
  const [memberSummaries, setMemberSummaries] = useState<MemberSummary[]>(() =>
    ChallengeStorage.getMemberSummaries()
  );

  const refreshData = useCallback(() => {
    const mems = ChallengeStorage.getMembers();
    const subs = ChallengeStorage.getSubmissions();
    const report = ChallengeStorage.getDailyReport();
    const summaries = ChallengeStorage.getMemberSummaries();

    setMembers(mems);
    setSubmissions(subs);
    setDailyReport(report);
    setMemberSummaries(summaries);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    ChallengeStorage.setLastMemberId(id);
  };

  const currentMember =
    members.find((m) => m.id === selectedMemberId) || members[0];
  const isAdmin = currentMember?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-[#111312] flex flex-col font-sans antialiased">
      {/* 1. 상단 모던 러닝크루 헤더 (ref/preview (9).html 기준) */}
      <RunningCrewHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        members={members}
        selectedMemberId={selectedMemberId}
      />

      {/* 2. 메인 와이드 워크스페이스 (max-w-[1420px]) */}
      <main className="flex-1 max-w-[1420px] w-full mx-auto px-6 sm:px-10 lg:px-12 py-10 space-y-14">
        {/* 탭 1: 홈 · 대시보드 (메인 히어로 + 최근 팀 활동 리스트) */}
        {activeTab === 'home' && (
          <div className="space-y-16">
            {/* 메인 히어로 섹션 (좌측 메시지 + 우측 러닝 데이터 패널) */}
            <RunningCrewHero
              dailyReport={dailyReport}
              memberSummaries={memberSummaries}
              submissions={submissions}
              onOpenShareDrawer={() => setIsShareDrawerOpen(true)}
              onExplorePrompts={() => setActiveTab('archive')}
            />

            {/* 최근 팀 활동 섹션 (ref/preview (9).html .section & .list 기준) */}
            <section className="space-y-5 pt-4">
              <div className="flex items-end justify-between border-b border-[#e8ebe9] pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#111312] tracking-tight">
                    최근 팀 활동
                  </h2>
                  <p className="text-xs text-[#717875] mt-1">
                    러닝 메타포는 유지하되, 콘텐츠는 정보 중심으로
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('archive')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#087a5b] hover:text-[#065b44] transition-colors cursor-pointer"
                >
                  <span>프롬프트 전체보기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 프롬프트 리스트 (1열 와이드 모던 행) */}
              <div className="space-y-2.5">
                {submissions.slice(0, 5).map((sub) => (
                  <PromptRow
                    key={sub.id}
                    submission={sub}
                    onReactionAdded={refreshData}
                    onSelectArtifact={setSelectedArtifact}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 탭 2: 프롬프트 아카이브 */}
        {activeTab === 'archive' && (
          <PromptArchiveView
            submissions={submissions}
            onRefresh={refreshData}
            currentMemberId={selectedMemberId}
          />
        )}

        {/* 탭 3: 질문 · 자유게시판 */}
        {activeTab === 'community' && (
          <CommunityBoard members={members} />
        )}

        {/* 탭 4: 러닝보드 · 출석부 */}
        {activeTab === 'attendance' && (
          <AttendanceBoard
            dailyReport={dailyReport}
            memberSummaries={memberSummaries}
          />
        )}
      </main>

      {/* 3. 우측 슬라이드 드로어: 프롬프트 공유하기 */}
      <SharePromptDrawer
        isOpen={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        members={members}
        onSubmissionSuccess={refreshData}
      />

      {/* 4. 플로팅 요약 모달 (총무/관리자만 노출) */}
      {isAdmin && (
        <DailySummaryModal
          dailyReport={dailyReport}
          submissions={submissions}
          memberSummaries={memberSummaries}
        />
      )}

      {/* 5. 아티팩트(이미지/HTML) 뷰어 모달 */}
      <ArtifactViewerModal
        submission={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
        onReactionAdded={refreshData}
      />
    </div>
  );
}
