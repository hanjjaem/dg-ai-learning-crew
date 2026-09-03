'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  List,
  Sparkles,
  Link2,
  Image as ImageIcon,
  Code2,
} from 'lucide-react';
import { PromptSubmission, AIToolType, ShowcaseType } from '@/lib/types';
import PromptRow from './PromptRow';
import PromptCard from './PromptCard';
import ArtifactViewerModal from './ArtifactViewerModal';

interface PromptArchiveViewProps {
  submissions: PromptSubmission[];
  onRefresh: () => void;
  filterMode?: 'all' | 'my' | 'bookmark' | 'popular';
  currentMemberId?: string;
}

const AI_TOOLS: (AIToolType | '전체')[] = [
  '전체',
  'ChatGPT',
  'Claude',
  'Gemini',
  'Perplexity',
];

export default function PromptArchiveView({
  submissions,
  onRefresh,
  filterMode = 'all',
  currentMemberId,
}: PromptArchiveViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<AIToolType | '전체'>('전체');
  const [selectedShowcaseType, setSelectedShowcaseType] = useState<ShowcaseType | 'all'>('all');
  const [selectedArtifact, setSelectedArtifact] = useState<PromptSubmission | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // 필터링 & 검색 로직
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // 1. 사이드바 필터 모드
      if (filterMode === 'my' && sub.memberId !== currentMemberId) return false;
      if (filterMode === 'popular' && (sub.likesAwesome || 0) < 5) return false;

      // 2. 산출물 유형 필터 (전체 / 프롬프트 / 이미지 / HTML)
      if (selectedShowcaseType !== 'all') {
        const type = sub.showcaseType || 'prompt';
        if (type !== selectedShowcaseType) return false;
      }

      // 3. AI 도구 필터
      if (selectedTool !== '전체' && sub.aiTool !== selectedTool) return false;

      // 4. 키워드 검색
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        sub.title.toLowerCase().includes(q) ||
        (sub.promptSnippet || '').toLowerCase().includes(q) ||
        (sub.rawPromptText || '').toLowerCase().includes(q) ||
        sub.memberName.toLowerCase().includes(q) ||
        (sub.department || '').toLowerCase().includes(q) ||
        sub.category.toLowerCase().includes(q)
      );
    });
  }, [submissions, filterMode, currentMemberId, selectedShowcaseType, selectedTool, searchQuery]);

  // 정렬 로직
  const sortedSubmissions = useMemo(() => {
    const list = [...filteredSubmissions];
    if (sortBy === 'popular') {
      return list.sort(
        (a, b) =>
          (b.likesAwesome + b.likesHelpful) - (a.likesAwesome + a.likesHelpful)
      );
    }
    return list.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }, [filteredSubmissions, sortBy]);

  // 페이지네이션
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedSubmissions.length / itemsPerPage);
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedSubmissions.slice(start, start + itemsPerPage);
  }, [sortedSubmissions, currentPage, itemsPerPage]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. 아카이브 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e8ebe9] pb-6">
        <div>
          <div className="text-xs font-bold text-[#087a5b] tracking-wider uppercase mb-1">
            Knowledge Hub & Showcase
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111312] tracking-tight">
            프롬프트 & AI 산출물 갤러리
          </h1>
          <p className="text-xs sm:text-sm text-[#717875] mt-1">
            동료들이 실무에 검증한 프롬프트 대화와 AI 생성 그림, 인터랙티브 HTML 웹 위젯을 모아봅니다.
          </p>
        </div>

        {/* 탭 카운터 */}
        <div className="flex items-center gap-2 text-xs text-[#717875]">
          <span>총 <strong className="text-[#111312] font-bold">{sortedSubmissions.length}</strong>건 등록됨</span>
        </div>
      </div>

      {/* 2. 검색 및 2단계 정밀 필터 바 */}
      <div className="space-y-4">
        {/* 상단: 검색창 + 산출물 유형 토글 탭 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* 산출물 유형 세그먼트 (전체 / 프롬프트 / 이미지 / HTML) */}
          <div className="flex items-center bg-[#eef1ef] p-1 rounded-[10px] shrink-0">
            <button
              type="button"
              onClick={() => setSelectedShowcaseType('all')}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
                selectedShowcaseType === 'all'
                  ? 'bg-white text-[#111312] shadow-2xs'
                  : 'text-[#717875] hover:text-[#111312]'
              }`}
            >
              전체 보기
            </button>
            <button
              type="button"
              onClick={() => setSelectedShowcaseType('prompt')}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                selectedShowcaseType === 'prompt'
                  ? 'bg-white text-[#111312] shadow-2xs'
                  : 'text-[#717875] hover:text-[#111312]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>프롬프트</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedShowcaseType('image')}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                selectedShowcaseType === 'image'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-[#717875] hover:text-[#111312]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>🎨 그림 갤러리</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedShowcaseType('html')}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                selectedShowcaseType === 'html'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-[#717875] hover:text-[#111312]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>⚡️ HTML 위젯</span>
            </button>
          </div>

          {/* 통합 검색창 */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#717875] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="제목, 프롬프트 내용, 작성자, 부서 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#e8ebe9] hover:border-[#ccd3cf] focus:border-[#087a5b] rounded-[10px] text-xs text-[#111312] focus:outline-hidden transition-colors"
            />
          </div>
        </div>

        {/* 하단: AI 도구 칩 + 정렬/뷰 토글 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* AI 도구 필터 탭 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {AI_TOOLS.map((tool) => (
              <button
                key={tool}
                type="button"
                onClick={() => setSelectedTool(tool)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer shrink-0 ${
                  selectedTool === tool
                    ? 'bg-[#087a5b] text-white shadow-2xs font-bold'
                    : 'bg-transparent text-[#717875] hover:bg-[#eef1ef]'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>

          {/* 우측: 정렬 드롭다운 & 뷰 모드 토글 */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-[11px] text-[#717875] hidden xl:inline-block">
              카드를 클릭하면 상세 뷰어가 열립니다.
            </span>

            {/* 커스텀 정렬 드롭다운 */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="px-3 py-1.5 bg-white border border-[#e8ebe9] hover:border-[#ccd3cf] rounded-[8px] text-xs text-[#111312] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{sortBy === 'latest' ? '최신순' : '인기순'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#717875] transition-transform ${
                    isSortOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-1 w-24 bg-white border border-[#e8ebe9] rounded-[10px] shadow-lg p-1 z-40 animate-fade-in space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('latest');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-[6px] transition-colors cursor-pointer ${
                      sortBy === 'latest'
                        ? 'bg-[#eaf5f1] text-[#087a5b] font-bold'
                        : 'text-[#111312] hover:bg-[#f6f8f7]'
                    }`}
                  >
                    최신순
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('popular');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-[6px] transition-colors cursor-pointer ${
                      sortBy === 'popular'
                        ? 'bg-[#eaf5f1] text-[#087a5b] font-bold'
                        : 'text-[#111312] hover:bg-[#f6f8f7]'
                    }`}
                  >
                    인기순
                  </button>
                </div>
              )}
            </div>

            {/* 뷰 모드 토글 (리스트 / 그리드) */}
            <div className="flex items-center bg-[#f6f8f7] p-0.5 rounded-[8px] border border-[#e8ebe9]">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#111312] shadow-2xs'
                    : 'text-[#717875] hover:text-[#111312]'
                }`}
                title="1열 와이드 행 보기"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#111312] shadow-2xs'
                    : 'text-[#717875] hover:text-[#111312]'
                }`}
                title="그리드 카드 보기"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 콘텐츠 리스트 / 그리드 */}
      {paginatedSubmissions.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-[#e8ebe9] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#f6f8f7] flex items-center justify-center mx-auto text-[#717875]">
            <Search className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-[#111312]">
            일치하는 프롬프트나 산출물이 없습니다.
          </p>
          <p className="text-xs text-[#717875]">
            다른 검색어나 필터 조건을 선택해 보세요.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2.5">
          {paginatedSubmissions.map((sub) => (
            <PromptRow
              key={sub.id}
              submission={sub}
              onReactionAdded={onRefresh}
              onSelectArtifact={setSelectedArtifact}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedSubmissions.map((sub) => (
            <PromptCard
              key={sub.id}
              submission={sub}
              onReactionAdded={onRefresh}
              onSelectArtifact={setSelectedArtifact}
            />
          ))}
        </div>
      )}

      {/* 4. 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-[8px] text-xs font-bold transition-colors cursor-pointer ${
                currentPage === page
                  ? 'bg-[#0f1714] text-white'
                  : 'bg-white text-[#717875] border border-[#e8ebe9] hover:bg-[#f6f8f7]'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* 5. 아티팩트(이미지/HTML) 라이브 프리뷰 모달 */}
      <ArtifactViewerModal
        submission={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
        onReactionAdded={onRefresh}
      />
    </div>
  );
}
