'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Link2,
  Sparkles,
  Image as ImageIcon,
  Code2,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CrewMember, AIToolType, PromptCategory, ShowcaseType } from '@/lib/types';
import { ChallengeStorage } from '@/lib/storage';
import { validateShareUrl } from '@/lib/calculations';
import MemberCombobox from './MemberCombobox';

interface SharePromptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  members: CrewMember[];
  onSubmissionSuccess: () => void;
}

const CATEGORIES: PromptCategory[] = [
  '보고서/기획',
  '코딩/개발',
  '업무자동화',
  '데이터분석',
  '번역/외국어',
  '기타',
];

export default function SharePromptDrawer({
  isOpen,
  onClose,
  members,
  onSubmissionSuccess,
}: SharePromptDrawerProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(() =>
    ChallengeStorage.getLastMemberId()
  );
  const [showcaseTab, setShowcaseTab] = useState<ShowcaseType>('prompt');

  // 프롬프트 링크 폼 필드
  const [promptUrl, setPromptUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<PromptCategory>('업무자동화');
  const [snippet, setSnippet] = useState<string>('');
  const [detectedTool, setDetectedTool] = useState<AIToolType | null>(null);

  // 이미지 아티팩트 필드
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageTool, setImageTool] = useState<AIToolType>('ChatGPT');

  // HTML 아티팩트 필드
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [rawPrompt, setRawPrompt] = useState<string>('');

  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSuccessMessage(null);
      setUrlError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (showcaseTab !== 'prompt' || !promptUrl.trim()) {
      setDetectedTool(null);
      setUrlError(null);
      return;
    }

    const res = validateShareUrl(promptUrl);
    setDetectedTool(res.tool);
    if (!res.valid && res.message) {
      setUrlError(res.message);
    } else {
      setUrlError(null);
    }
  }, [promptUrl, showcaseTab]);

  // 이미지 파일 선택 처리 (동구_공모전 방식)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUrlError('이미지 파일(PNG, JPG, WebP)만 업로드 가능합니다.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    setSuccessMessage(null);

    // 1. 프롬프트 링크 제출일 때
    if (showcaseTab === 'prompt') {
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
          category,
          promptSnippet: snippet.trim() || undefined,
        });

        handleSuccess('프롬프트 공유가 완료되었습니다!');
      } catch (err: unknown) {
        setUrlError(err instanceof Error ? err.message : '제출 중 오류가 발생했습니다.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 2. 이미지 전시 제출일 때
    if (showcaseTab === 'image') {
      if (!imagePreview) {
        setUrlError('전시할 이미지 파일을 선택해주세요.');
        return;
      }
      if (!title.trim()) {
        setUrlError('작품 제목을 입력해주세요.');
        return;
      }

      setIsSubmitting(true);
      try {
        ChallengeStorage.submitShowcaseArtifact({
          memberId: selectedMemberId,
          showcaseType: 'image',
          title: title.trim(),
          aiTool: imageTool,
          category,
          imageUrl: imagePreview,
          rawPromptText: rawPrompt.trim(),
          promptSnippet: snippet.trim() || rawPrompt.trim(),
        });

        handleSuccess('이미지 전시 등록이 완료되었습니다!');
      } catch (err: unknown) {
        setUrlError(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 3. HTML 웹 아티팩트 제출일 때
    if (showcaseTab === 'html') {
      if (!htmlCode.trim()) {
        setUrlError('전시할 HTML 코드를 입력해주세요.');
        return;
      }
      if (!title.trim()) {
        setUrlError('작품 제목을 입력해주세요.');
        return;
      }

      setIsSubmitting(true);
      try {
        ChallengeStorage.submitShowcaseArtifact({
          memberId: selectedMemberId,
          showcaseType: 'html',
          title: title.trim(),
          aiTool: 'Claude',
          category,
          htmlCode: htmlCode.trim(),
          rawPromptText: rawPrompt.trim(),
          promptSnippet: snippet.trim() || rawPrompt.trim(),
        });

        handleSuccess('인터랙티브 HTML 등록이 완료되었습니다!');
      } catch (err: unknown) {
        setUrlError(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSuccess = (msg: string) => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5, x: 0.8 },
    });

    setSuccessMessage(msg);
    setPromptUrl('');
    setTitle('');
    setSnippet('');
    setImageFile(null);
    setImagePreview(null);
    setHtmlCode('');
    setRawPrompt('');
    onSubmissionSuccess();

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* 배경 오버레이 */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* 우측 슬라이드 드로어 패널 */}
      <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col z-10 animate-slide-left border-l border-[#e8ebe9]">
        {/* 드로어 헤더 */}
        <div className="p-6 border-b border-[#e8ebe9] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#111312] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#087a5b]" />
              지식 및 산출물 공유
            </h2>
            <p className="text-xs text-[#717875] mt-0.5">
              프롬프트 링크, 생성 이미지, 인터랙티브 HTML을 크루와 공유하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#717875] hover:text-[#111312] hover:bg-[#f6f8f7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 전환: 💬 프롬프트 / 🎨 이미지 / ⚡️ HTML */}
        <div className="px-6 pt-4 pb-2 border-b border-[#e8ebe9] bg-[#fafbfa]">
          <div className="grid grid-cols-3 gap-1 bg-[#eef1ef] p-1 rounded-[10px]">
            <button
              type="button"
              onClick={() => setShowcaseTab('prompt')}
              className={`py-1.5 rounded-[8px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                showcaseTab === 'prompt'
                  ? 'bg-white text-[#111312] shadow-2xs'
                  : 'text-[#717875] hover:text-[#111312]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>대화 링크</span>
            </button>

            <button
              type="button"
              onClick={() => setShowcaseTab('image')}
              className={`py-1.5 rounded-[8px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                showcaseTab === 'image'
                  ? 'bg-white text-[#111312] shadow-2xs'
                  : 'text-[#717875] hover:text-[#111312]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>그림 전시</span>
            </button>

            <button
              type="button"
              onClick={() => setShowcaseTab('html')}
              className={`py-1.5 rounded-[8px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                showcaseTab === 'html'
                  ? 'bg-white text-[#111312] shadow-2xs'
                  : 'text-[#717875] hover:text-[#111312]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>HTML 전시</span>
            </button>
          </div>
        </div>

        {/* 폼 본문 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {urlError && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{urlError}</span>
            </div>
          )}

          {/* 1. 작성자 선택 (커스텀 Combobox) */}
          <MemberCombobox
            label="작성자 (본인 확인)"
            members={members}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
          />

          {/* 2-A. 프롬프트 링크 폼 */}
          {showcaseTab === 'prompt' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#111312] mb-1.5 flex items-center justify-between">
                  <span>AI 대화 Share 링크</span>
                  {detectedTool && (
                    <span className="text-[11px] font-bold text-[#087a5b] bg-[#eaf5f1] px-2 py-0.5 rounded-full">
                      ✓ {detectedTool} 감지됨
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-[#717875] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="url"
                    required
                    placeholder="https://chatgpt.com/share/..."
                    value={promptUrl}
                    onChange={(e) => setPromptUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f6f8f7] border border-[#e8ebe9] rounded-[10px] text-xs font-mono text-[#111312] focus:outline-hidden focus:bg-white focus:border-[#087a5b] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111312] mb-1.5">
                  프롬프트 제목
                </label>
                <input
                  type="text"
                  placeholder="예: 공공 조례 상충 검토 요약 프롬프트"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f6f8f7] border border-[#e8ebe9] rounded-[10px] text-xs text-[#111312] focus:outline-hidden focus:bg-white focus:border-[#087a5b] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111312] mb-1.5">
                  핵심 프롬프트 구문 (선택)
                </label>
                <textarea
                  rows={3}
                  placeholder="대화방에서 가장 효과적이었던 핵심 프롬프트를 복사해 넣어주세요."
                  value={snippet}
                  onChange={(e) => setSnippet(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f6f8f7] border border-[#e8ebe9] rounded-[10px] text-xs text-[#111312] focus:outline-hidden focus:bg-white focus:border-[#087a5b] transition-colors font-mono"
                />
              </div>
            </>
          )}

          {/* 2-B. 그림 전시 폼 (동구_공모전 UX) */}
          {showcaseTab === 'image' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#111312] mb-1.5">
                  작품 제목
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 2026 동구 초량 불빛 야경 축제 포스터"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f6f8f7] border border-[#e8ebe9] rounded-[10px] text-xs text-[#111312] focus:outline-hidden focus:bg-white focus:border-[#087a5b] transition-colors"
                />
              </div>

              {/* 이미지 파일 업로더 (드래그앤드롭 박스) */}
              <div>
                <label className="block text-xs font-bold text-[#111312] mb-1.5">
                  생성 이미지 파일 (PNG, JPG, WebP)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e8ebe9] hover:border-[#087a5b] bg-[#fafbfa] hover:bg-[#f6f8f7] rounded-[12px] p-6 text-center cursor-pointer transition-colors"
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="미리보기"
                        className="max-h-48 mx-auto rounded-lg object-contain shadow-xs"
                      />
                      <p className="text-[11px] text-[#087a5b] font-bold">
                        클릭하여 다른 이미지로 변경
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-[#717875]">
                      <Upload className="w-6 h-6 mx-auto text-[#087a5b]" />
                      <div className="text-xs font-bold text-[#111312]">
                        클릭하여 이미지 업로드
                      </div>
                      <p className="text-[11px]">최대 10MB (Midjourney, DALL-E, 캔바 등)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111312] mb-1.5">
                  이미지 생성에 사용한 프롬프트
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="이미지를 만들기 위해 AI에 입력했던 프롬프트 영문/한글 전문을 적어주세요."
                  value={rawPrompt}
                  onChange={(e) => setRawPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f6f8f7] border border-[#e8ebe9] rounded-[10px] text-xs text-[#111312] focus:outline-hidden focus:bg-white focus:border-[#087a5b] transition-colors font-mono"
                />
              </div>
            </>
          )}

          {/* 2-C. HTML 전시 폼 (Claude 아티팩트 방식) */}
          {showcaseTab === 'html' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#111312] mb-1.5">
                  웹 위젯 / 대시보드 제목
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 취득세 및 지방세 간이 계산기 위젯"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f6f8f7] border border-[#e8ebe9] rounded-[10px] text-xs text-[#111312] focus:outline-hidden focus:bg-white focus:border-[#087a5b] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111312] mb-1.5 flex items-center justify-between">
                  <span>인터랙티브 HTML 코드</span>
                  <span className="text-[10px] text-[#717875]">단일 HTML 파일 권장</span>
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="<!DOCTYPE html><html><head>...</head><body>...</body></html>"
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111312] text-emerald-400 border border-[#e8ebe9] rounded-[10px] text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111312] mb-1.5">
                  이 HTML을 만든 AI 프롬프트
                </label>
                <textarea
                  rows={2}
                  placeholder="AI에게 요구했던 지시문 프롬프트를 적어주세요."
                  value={rawPrompt}
                  onChange={(e) => setRawPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f6f8f7] border border-[#e8ebe9] rounded-[10px] text-xs text-[#111312] focus:outline-hidden focus:bg-white focus:border-[#087a5b] transition-colors font-mono"
                />
              </div>
            </>
          )}

          {/* 3. 업무 분야 카테고리 */}
          <div>
            <label className="block text-xs font-bold text-[#111312] mb-1.5">
              업무 분야 카테고리
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer border ${
                    category === cat
                      ? 'bg-[#087a5b] text-white border-[#087a5b]'
                      : 'bg-white text-[#717875] border-[#e8ebe9] hover:bg-[#f6f8f7]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#0f1714] hover:bg-[#202724] active:scale-[0.99] text-white font-bold text-xs rounded-[10px] shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? '등록 중...'
                  : showcaseTab === 'image'
                  ? '그림 갤러리에 전시하기'
                  : showcaseTab === 'html'
                  ? 'HTML 위젯 등록하기'
                  : '오늘의 프롬프트 공유 완료'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
