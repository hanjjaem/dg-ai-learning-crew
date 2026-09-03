'use client';

import React from 'react';
import {
  Trophy,
  Flame,
  AlertCircle,
  CheckCircle2,
  Users,
  Wallet,
  Download,
  CreditCard,
} from 'lucide-react';
import { DailyReport, MemberSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

interface AttendanceBoardProps {
  dailyReport: DailyReport;
  memberSummaries: MemberSummary[];
}

export default function AttendanceBoard({
  dailyReport,
  memberSummaries,
}: AttendanceBoardProps) {
  // 연속 스트릭 탑 3 크루원 추출
  const topStreaks = [...memberSummaries]
    .sort((a, b) => b.consecutiveStreak - a.consecutiveStreak || b.totalSubmissions - a.totalSubmissions)
    .slice(0, 3);

  // 8만 원 회비 납부 현황 연산
  const paidCount = memberSummaries.filter((s) => s.member.depositPaid).length;
  const totalTargetAmount = memberSummaries.length * 80000;
  const currentCollectedAmount = paidCount * 80000;
  const collectionRate = memberSummaries.length > 0 ? Math.round((paidCount / memberSummaries.length) * 100) : 0;

  const handleDownloadCSV = () => {
    const headers = [
      '소속 부서',
      '이름',
      '역할',
      '회비 납부 상태',
      '납부 금액',
      '총 제출 횟수',
      '미제출 횟수',
      '누적 벌금(차감)',
      '남은 회비 잔액',
      '연속 스트릭',
      '오늘 제출 여부',
    ];

    const rows = memberSummaries.map((s) => [
      s.member.department,
      s.member.name,
      s.member.role === 'admin' ? '총무' : '크루원',
      s.member.depositPaid ? '완납' : '미납(입금대기)',
      s.member.depositPaid ? '80,000원' : '0원',
      s.totalSubmissions,
      s.missedCount,
      `${s.penaltyAmount}원`,
      `${s.remainingBalance}원`,
      `${s.consecutiveStreak}일`,
      s.submittedToday ? '완료' : '미제출',
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `러닝크루_2기_출석정산표_${dailyReport.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* 1. 2기 회비 8만 원 실시간 납부 현황 배너 */}
      <div className="bg-white rounded-[16px] p-5 border border-[#e8ebe9] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#eaf5f1] text-[#087a5b] flex items-center justify-center font-bold shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#111312]">
                  2기 초기 회비(80,000원) 납부 현황
                </h4>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#eaf5f1] text-[#087a5b]">
                  {paidCount}/{memberSummaries.length}명 완납 ({collectionRate}%)
                </span>
              </div>
              <p className="text-xs text-[#717875] mt-0.5">
                현재 수납액: <strong className="text-[#087a5b] font-mono">{formatCurrency(currentCollectedAmount)}</strong> / 목표 {formatCurrency(totalTargetAmount)}
              </p>
            </div>
          </div>

          <span className="text-xs text-[#717875] self-start sm:self-auto font-medium">
            미납 {memberSummaries.length - paidCount}명 입금 대기 중
          </span>
        </div>

        {/* 진행 바 */}
        <div className="w-full h-2 bg-[#f0f2f1] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#087a5b] rounded-full transition-all duration-500"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
      </div>

      {/* 2. 명예의 전당 (슬레이트 블랙 미니멀 배너) */}
      <div className="bg-[#0f1714] rounded-[16px] p-5 text-white shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#78c3a9]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#dcefe8]">
              연속 참여 STREAK TOP 3 (Hall of Fame)
            </h4>
          </div>
          <span className="text-[11px] text-[#98a09c]">러닝 페이스를 이끄는 크루원</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {topStreaks.map((item, idx) => (
            <div
              key={item.member.id}
              className="bg-white/5 border border-white/10 rounded-[10px] p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-[6px] bg-[#087a5b] text-white font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <div className="text-xs font-bold text-white">{item.member.name}</div>
                  <div className="text-[10px] text-[#98a09c]">{item.member.department}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#78c3a9]">
                <Flame className="w-3.5 h-3.5 fill-[#78c3a9]" />
                {item.consecutiveStreak}일 연속
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 3대 핵심 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-[12px] border border-[#e8ebe9] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#717875] text-xs font-medium mb-1">
            <Users className="w-3.5 h-3.5 text-[#717875]" />
            <span>오늘 출석 인원</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-[#111312] font-mono">
              {dailyReport.submittedMembers.length}/{dailyReport.totalMembersCount}명
            </span>
            <span className="text-xs font-bold text-[#087a5b] bg-[#eaf5f1] px-2 py-0.5 rounded-full">
              {dailyReport.submissionRate}% ON PACE
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#e8ebe9] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#717875] text-xs font-medium mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>미제출자 (차감 대상)</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-rose-600 font-mono">
              {dailyReport.missedMembers.length}명
            </span>
            <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              각 2,000원
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#e8ebe9] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#717875] text-xs font-medium mb-1">
            <Wallet className="w-3.5 h-3.5 text-[#087a5b]" />
            <span>오늘 발생 총 벌금</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-zinc-900 font-mono">
              {formatCurrency(dailyReport.totalPenaltyPool)}
            </span>
            <span className="text-[11px] text-zinc-400">자동 연산</span>
          </div>
        </div>
      </div>

      {/* 4. 전체 정산표 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/90 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              실시간 출석부 & 회비 장부
            </h3>
            <p className="text-[11px] text-zinc-400">
              총무 개입 없이 시스템이 23:59에 자동 정산합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            CSV 엑셀 다운로드
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400">
                <th className="py-2.5 px-3">소속 / 크루원</th>
                <th className="py-2.5 text-center">회비 납부</th>
                <th className="py-2.5 text-center">오늘 출석</th>
                <th className="py-2.5 text-center">최근 잔디</th>
                <th className="py-2.5 text-center">연속</th>
                <th className="py-2.5 text-center">총 제출</th>
                <th className="py-2.5 text-center">미제출</th>
                <th className="py-2.5 text-right px-3">남은 회비 잔액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {memberSummaries.map((s) => (
                <tr key={s.member.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {s.member.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-900">{s.member.name}</span>
                          {s.member.role === 'admin' && (
                            <span className="text-[10px] px-1 py-0.2 rounded-sm bg-zinc-100 text-zinc-700 font-bold">
                              총무
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 block">
                          {s.member.department}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 8만원 회비 납부 상태 열 */}
                  <td className="py-2.5 text-center">
                    {s.member.depositPaid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        8만 완납
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        입금대기
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 text-center">
                    {s.submittedToday ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3" />
                        인증완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                        <AlertCircle className="w-3 h-3" />
                        미제출
                      </span>
                    )}
                  </td>

                  <td className="py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      {s.recentDaysStatus.map((day) => (
                        <span
                          key={day.date}
                          title={`${day.date}: ${day.submitted ? '출석' : '미제출'}`}
                          className={`w-3 h-3 rounded-xs ${
                            day.submitted ? 'bg-emerald-500' : 'bg-zinc-200'
                          }`}
                        />
                      ))}
                    </div>
                  </td>

                  <td className="py-2.5 text-center font-bold text-zinc-700">
                    {s.consecutiveStreak}일
                  </td>

                  <td className="py-2.5 text-center font-medium text-zinc-600">
                    {s.totalSubmissions}회
                  </td>

                  <td className="py-2.5 text-center font-bold text-rose-600">
                    {s.missedCount}회
                  </td>

                  <td className="py-2.5 text-right px-3 font-mono font-bold text-zinc-900">
                    {formatCurrency(s.remainingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
