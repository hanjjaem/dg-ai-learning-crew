'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  Send,
  Plus,
  X,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { CommunityPost, CrewMember, PostType } from '@/lib/types';
import { ChallengeStorage } from '@/lib/storage';
import MemberCombobox from './MemberCombobox';

interface CommunityBoardProps {
  members: CrewMember[];
}

export default function CommunityBoard({ members }: CommunityBoardProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(() =>
    ChallengeStorage.getCommunityPosts()
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'question' | 'free'>('all');
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const [selectedMemberId, setSelectedMemberId] = useState<string>(() =>
    ChallengeStorage.getLastMemberId()
  );
  const [postType, setPostType] = useState<PostType>('question');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const refreshPosts = () => {
    setPosts(ChallengeStorage.getCommunityPosts());
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    ChallengeStorage.addCommunityPost({
      memberId: selectedMemberId,
      type: postType,
      title: title.trim(),
      content: content.trim(),
      linkUrl: linkUrl.trim() || undefined,
    });

    setTitle('');
    setContent('');
    setLinkUrl('');
    setIsWriting(false);
    refreshPosts();
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    ChallengeStorage.addPostComment(postId, selectedMemberId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    refreshPosts();
  };

  const handleToggleLike = (postId: string) => {
    ChallengeStorage.togglePostLike(postId);
    refreshPosts();
  };

  const handleToggleResolved = (postId: string) => {
    ChallengeStorage.toggleQuestionResolved(postId);
    refreshPosts();
  };

  const filteredPosts = posts.filter((p) => {
    if (activeFilter === 'question') return p.type === 'question';
    if (activeFilter === 'free') return p.type === 'free';
    return true;
  });

  return (
    <div className="space-y-3.5">
      {/* 상단 툴바: 차분한 필터 칩 & Linear 스타일 글쓰기 버튼 */}
      <div className="bg-white rounded-2xl p-3 sm:px-4 border border-zinc-200/90 shadow-xs flex items-center justify-between gap-2">
        {/* 필터 탭 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            전체 ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('question')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'question'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            질문 Q&A
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('free')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'free'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            자유톡 · 꿀팁
          </button>
        </div>

        {/* 글쓰기 버튼 */}
        <button
          type="button"
          onClick={() => setIsWriting(!isWriting)}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          {isWriting ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>닫기</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>새 글 남기기</span>
            </>
          )}
        </button>
      </div>

      {/* 새 글 작성 폼 (모던 미니멀) */}
      {isWriting && (
        <form
          onSubmit={handleCreatePost}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-300 shadow-sm space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-zinc-700" />
              크루원과 이야기 나누기
            </h4>

            {/* 분류 선택 */}
            <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPostType('question')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  postType === 'question'
                    ? 'bg-white text-zinc-900 shadow-xs font-bold'
                    : 'text-zinc-600'
                }`}
              >
                질문하기
              </button>
              <button
                type="button"
                onClick={() => setPostType('free')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  postType === 'free'
                    ? 'bg-white text-zinc-900 shadow-xs font-bold'
                    : 'text-zinc-600'
                }`}
              >
                자유 이야기
              </button>
            </div>
          </div>

          {/* 작성자 선택 (커스텀 Combobox) */}
          <MemberCombobox
            label="작성자"
            members={members}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
          />

          {/* 제목 */}
          <div>
            <input
              type="text"
              required
              placeholder={
                postType === 'question'
                  ? '질문 제목을 입력하세요 (예: Cursor 단축키 설정 질문있습니다)'
                  : '자유롭게 공유할 이야기나 AI 팁을 적어주세요'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 font-medium placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-900"
            />
          </div>

          {/* 내용 */}
          <div>
            <textarea
              required
              rows={3}
              placeholder="자세한 내용을 입력해주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 font-medium placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-900 resize-none"
            />
          </div>

          {/* 참고 링크 */}
          <div>
            <input
              type="url"
              placeholder="참고할 대화 링크나 웹사이트 URL (선택)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 font-medium placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-900"
            />
          </div>

          {/* 등록 버튼 */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsWriting(false)}
              className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              작성 완료
            </button>
          </div>
        </form>
      )}

      {/* 게시글 목록 (차분하고 세련된 카드 레이아웃) */}
      <div className="space-y-2.5">
        {filteredPosts.map((post) => {
          const isExpanded = expandedPostId === post.id;

          return (
            <article
              key={post.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/90 shadow-xs space-y-2.5 hover:border-zinc-300 transition-colors"
            >
              {/* 상단 메타: 뱃지, 작성자, 시간 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 inline-flex items-center gap-1">
                    {post.type === 'question' ? (
                      <>
                        <HelpCircle className="w-3 h-3 text-zinc-600" />
                        <span>질문</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3 h-3 text-zinc-600" />
                        <span>자유</span>
                      </>
                    )}
                  </span>

                  {post.type === 'question' && (
                    <button
                      type="button"
                      onClick={() => handleToggleResolved(post.id)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer inline-flex items-center gap-1 ${
                        post.isResolved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {post.isResolved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>해결됨</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>답변대기</span>
                        </>
                      )}
                    </button>
                  )}

                  <span className="text-xs font-bold text-zinc-900">
                    {post.department ? `${post.department} ` : ''}{post.memberName}
                  </span>
                </div>

                <span className="text-[11px] text-zinc-400 font-normal">{post.createdAt}</span>
              </div>

              {/* 제목 & 본문 (Pretendard 최적화) */}
              <div>
                <h4 className="text-sm font-bold text-zinc-900 leading-snug tracking-tight mb-1">
                  {post.title}
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {post.linkUrl && (
                  <a
                    href={post.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-900 hover:underline font-semibold mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    대화 링크 확인
                  </a>
                )}
              </div>

              {/* 하단 액션 바 */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <button
                  type="button"
                  onClick={() => handleToggleLike(post.id)}
                  className="inline-flex items-center gap-1.5 hover:text-zinc-900 font-medium text-xs transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>도움돼요 {post.likesCount > 0 ? `(${post.likesCount})` : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                  className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 font-semibold text-xs cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                  <span>댓글 {post.comments.length}</span>
                  <span className="text-[10px] text-zinc-400 font-normal ml-0.5">
                    {isExpanded ? '접기' : '보기'}
                  </span>
                </button>
              </div>

              {/* 스레드 댓글 영역 */}
              {isExpanded && (
                <div className="pt-3 border-t border-zinc-100 space-y-2 bg-zinc-50/70 p-3 rounded-xl">
                  {post.comments.length === 0 ? (
                    <p className="text-center text-[11px] text-zinc-400 py-1 font-normal">
                      아직 댓글이 없습니다. 첫 답변을 남겨보세요.
                    </p>
                  ) : (
                    post.comments.map((c) => (
                      <div key={c.id} className="text-xs bg-white p-2.5 rounded-lg border border-zinc-200/70 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-zinc-900">{c.memberName}</span>
                          <span className="text-[10px] text-zinc-400">{c.createdAt}</span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed">{c.content}</p>
                      </div>
                    ))
                  )}

                  {/* 댓글 작성 폼 */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="답변이나 의견을 작성하세요..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddComment(post.id);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComment(post.id)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      등록
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
