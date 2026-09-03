import {
  CrewMember,
  PromptSubmission,
  DailyReport,
  MemberSummary,
  PromptCategory,
  CommunityPost,
  PostType,
  AIToolType,
  ShowcaseType,
} from './types';
import {
  getKSTDateString,
  isWeekday,
  getRecentWeekdays,
  detectAIToolFromUrl,
  DEFAULT_MEMBER_DEPOSIT,
  PENALTY_PER_MISS,
} from './calculations';

// AI 러닝크루 2기 실제 참여 공무원 크루원 명단 (총 16명)
export const INITIAL_MEMBERS: CrewMember[] = [
  { id: 'm1', department: '평생교육과', name: '신봉일', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: false, paidAmount: 0, createdAt: '2026-08-25' },
  { id: 'm2', department: '건축과', name: '김남희', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: true, paidAmount: 80000, createdAt: '2026-08-25' }, // 8만원 입금완료
  { id: 'm3', department: '수정5동', name: '김보영', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: false, paidAmount: 0, createdAt: '2026-08-25' },
  { id: 'm4', department: '재무과', name: '남수현', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: true, paidAmount: 80000, createdAt: '2026-08-25' }, // 8만원 입금완료
  { id: 'm5', department: '환경청소위생과', name: '이민경', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: true, paidAmount: 80000, createdAt: '2026-08-25' }, // 8만원 입금완료
  { id: 'm6', department: '문화관광과', name: '박윤희', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: false, paidAmount: 0, createdAt: '2026-08-25' },
  { id: 'm7', department: '환경청소위생과', name: '서윤정', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: true, paidAmount: 80000, createdAt: '2026-08-25' }, // 8만원 입금완료
  { id: 'm8', department: '문화관광과', name: '양소희', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: true, paidAmount: 80000, createdAt: '2026-08-25' }, // 8만원 입금완료
  { id: 'm9', department: '문화관광과', name: '오혜숙', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: false, paidAmount: 0, createdAt: '2026-08-25' },
  { id: 'm10', department: '교통행정과', name: '오희주', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: false, paidAmount: 0, createdAt: '2026-08-25' },
  { id: 'm11', department: '생활보장과', name: '이길례', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: true, paidAmount: 80000, createdAt: '2026-08-25' }, // 8만원 입금완료
  { id: 'm12', department: '남항사업소', name: '장소향', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: true, paidAmount: 80000, createdAt: '2026-08-25' }, // 8만원 입금완료
  { id: 'm13', department: '일자리경제과', name: '전은정', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: false, paidAmount: 0, createdAt: '2026-08-25' },
  { id: 'm14', department: '총무과', name: '최진웅', role: 'admin', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: false, paidAmount: 0, createdAt: '2026-08-25' },
  { id: 'm15', department: '생활보장과', name: '홍민지', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: false, paidAmount: 0, createdAt: '2026-08-25' },
  { id: 'm16', department: '복지정책과', name: '이현아', role: 'member', initialBalance: DEFAULT_MEMBER_DEPOSIT, depositPaid: true, paidAmount: 80000, createdAt: '2026-08-25' }, // 8만원 입금완료
];

// 실제 운영을 위한 빈 제출 목록 (실제 데이터 입력 대기)
export const INITIAL_SUBMISSIONS: PromptSubmission[] = [];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    memberId: 'm14',
    memberName: '최진웅',
    department: '총무과',
    type: 'free',
    title: '2기 1일 1프롬프트 챌린지 시작을 환영합니다! (운영 안내)',
    content: '안녕하세요 크루원 여러분! 총무과 최진웅입니다. 매일 평일 23:59까지 AI 대화방의 Share 링크 또는 직접 만든 산출물을 올려주시면 출석이 인정됩니다. 오늘부터 즐겁게 함께해요!',
    likesCount: 14,
    createdAt: '2026-09-03 09:00',
    comments: [],
  },
];

const STORAGE_KEY_MEMBERS = 'dg_crew_members_v10_hyuna_welfare';
const STORAGE_KEY_SUBMISSIONS = 'dg_crew_submissions_v10_hyuna_welfare';
const STORAGE_KEY_LAST_MEMBER = 'dg_crew_last_member_id_v10_hyuna_welfare';
const STORAGE_KEY_POSTS = 'dg_crew_posts_v10_hyuna_welfare';

export class ChallengeStorage {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public static getMembers(): CrewMember[] {
    if (!this.isClient()) return INITIAL_MEMBERS;
    const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MEMBERS;
    }
  }

  public static getLastMemberId(): string {
    if (!this.isClient()) return INITIAL_MEMBERS[13].id; // 총무과 최진웅 디폴트
    return localStorage.getItem(STORAGE_KEY_LAST_MEMBER) || INITIAL_MEMBERS[13].id;
  }

  public static setLastMemberId(id: string): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_LAST_MEMBER, id);
    }
  }

  public static getSubmissions(): PromptSubmission[] {
    if (!this.isClient()) return INITIAL_SUBMISSIONS;
    const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  }

  public static submitShareLink(data: {
    memberId: string;
    promptUrl: string;
    title?: string;
    category?: PromptCategory;
    promptSnippet?: string;
    summaryNote?: string;
  }): PromptSubmission {
    const members = this.getMembers();
    const targetMember = members.find((m) => m.id === data.memberId);
    if (!targetMember) throw new Error('등록되지 않은 크루원입니다.');

    const aiTool = detectAIToolFromUrl(data.promptUrl);
    const todayKST = getKSTDateString();
    const submissions = this.getSubmissions();

    const existingIndex = submissions.findIndex(
      (s) => s.memberId === data.memberId && s.date === todayKST
    );

    const newSubmission: PromptSubmission = {
      id: existingIndex >= 0 ? submissions[existingIndex].id : `sub-${Date.now()}`,
      memberId: targetMember.id,
      memberName: targetMember.name,
      department: targetMember.department,
      date: todayKST,
      submittedAt: new Date().toISOString(),
      aiTool,
      promptUrl: data.promptUrl.trim(),
      title: data.title?.trim() || `${aiTool} 대화 프롬프트 공유`,
      category: data.category || '업무자동화',
      promptSnippet: data.promptSnippet?.trim(),
      summaryNote: data.summaryNote?.trim(),
      likesAwesome: existingIndex >= 0 ? submissions[existingIndex].likesAwesome : 0,
      likesHelpful: existingIndex >= 0 ? submissions[existingIndex].likesHelpful : 0,
      status: 'approved',
    };

    if (existingIndex >= 0) {
      submissions[existingIndex] = newSubmission;
    } else {
      submissions.unshift(newSubmission);
    }

    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
      this.setLastMemberId(data.memberId);
    }

    return newSubmission;
  }

  public static submitShowcaseArtifact(data: {
    memberId: string;
    showcaseType: 'prompt' | 'image' | 'html';
    title: string;
    aiTool: AIToolType;
    category?: PromptCategory;
    promptSnippet?: string;
    imageUrl?: string;
    htmlCode?: string;
    rawPromptText?: string;
    promptUrl?: string;
  }): PromptSubmission {
    const members = this.getMembers();
    const targetMember = members.find((m) => m.id === data.memberId);
    if (!targetMember) throw new Error('등록되지 않은 크루원입니다.');

    const todayKST = getKSTDateString();
    const submissions = this.getSubmissions();

    const newSubmission: PromptSubmission = {
      id: `showcase-${Date.now()}`,
      memberId: targetMember.id,
      memberName: targetMember.name,
      department: targetMember.department,
      date: todayKST,
      submittedAt: new Date().toISOString(),
      aiTool: data.aiTool,
      promptUrl: data.promptUrl?.trim() || '#',
      title: data.title.trim(),
      category: data.category || '업무자동화',
      promptSnippet: data.promptSnippet?.trim() || data.rawPromptText?.slice(0, 100),
      showcaseType: data.showcaseType,
      imageUrl: data.imageUrl,
      htmlCode: data.htmlCode,
      rawPromptText: data.rawPromptText,
      likesAwesome: 1,
      likesHelpful: 1,
      status: 'approved',
    };

    submissions.unshift(newSubmission);

    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
      this.setLastMemberId(data.memberId);
    }

    return newSubmission;
  }

  public static addReaction(submissionId: string, type: 'awesome' | 'helpful'): void {
    const submissions = this.getSubmissions();
    const sub = submissions.find((s) => s.id === submissionId);
    if (sub) {
      if (type === 'awesome') sub.likesAwesome = (sub.likesAwesome || 0) + 1;
      if (type === 'helpful') sub.likesHelpful = (sub.likesHelpful || 0) + 1;
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
      }
    }
  }

  public static getDailyReport(dateString: string = getKSTDateString()): DailyReport {
    const members = this.getMembers();
    const submissions = this.getSubmissions().filter((s) => s.date === dateString);
    const submittedMemberIds = new Set(submissions.map((s) => s.memberId));

    const submittedMembers = members.filter((m) => submittedMemberIds.has(m.id));
    const missedMembers = members.filter((m) => !submittedMemberIds.has(m.id));

    const totalMembersCount = members.length;
    const rate = totalMembersCount > 0 ? Math.round((submittedMembers.length / totalMembersCount) * 100) : 0;
    const totalPenaltyPool = missedMembers.length * PENALTY_PER_MISS;

    return {
      date: dateString,
      isWeekday: isWeekday(dateString),
      totalMembersCount,
      submittedMembers,
      missedMembers,
      submissions,
      submissionRate: rate,
      totalPenaltyPool,
    };
  }

  public static getMemberSummaries(): MemberSummary[] {
    const members = this.getMembers();
    const submissions = this.getSubmissions();
    const todayKST = getKSTDateString();
    const recent5Days = getRecentWeekdays(5);

    return members.map((member) => {
      const memberSubs = submissions.filter((s) => s.memberId === member.id && s.status === 'approved');
      const todaySub = memberSubs.find((s) => s.date === todayKST);
      const totalSubmissions = memberSubs.length;

      // 챌린지 시작일 기준 미제출 횟수 계산
      const missedCount = Math.max(0, 2 - totalSubmissions);
      const penaltyAmount = missedCount * PENALTY_PER_MISS;
      const remainingBalance = Math.max(0, member.initialBalance - penaltyAmount);

      const subDates = new Set(memberSubs.map((s) => s.date));
      const recentDaysStatus = recent5Days.map((date) => ({
        date,
        submitted: subDates.has(date),
      }));

      let consecutiveStreak = 0;
      for (const day of recentDaysStatus) {
        if (day.submitted) consecutiveStreak++;
        else break;
      }

      return {
        member,
        totalSubmissions,
        missedCount,
        penaltyAmount,
        remainingBalance,
        consecutiveStreak,
        recentDaysStatus,
        submittedToday: !!todaySub,
        todaySubmission: todaySub,
      };
    });
  }

  public static getCommunityPosts(): CommunityPost[] {
    if (!this.isClient()) return INITIAL_COMMUNITY_POSTS;
    const raw = localStorage.getItem(STORAGE_KEY_POSTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(INITIAL_COMMUNITY_POSTS));
      return INITIAL_COMMUNITY_POSTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_COMMUNITY_POSTS;
    }
  }

  public static addCommunityPost(data: {
    memberId: string;
    type: PostType;
    title: string;
    content: string;
    linkUrl?: string;
  }): CommunityPost {
    const members = this.getMembers();
    const targetMember = members.find((m) => m.id === data.memberId);
    if (!targetMember) throw new Error('등록되지 않은 크루원입니다.');

    const posts = this.getCommunityPosts();
    const now = new Date();
    const timeStr = `${getKSTDateString()} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      memberId: targetMember.id,
      memberName: targetMember.name,
      department: targetMember.department,
      type: data.type,
      title: data.title.trim(),
      content: data.content.trim(),
      linkUrl: data.linkUrl?.trim() || undefined,
      isResolved: data.type === 'question' ? false : undefined,
      likesCount: 0,
      comments: [],
      createdAt: timeStr,
    };

    posts.unshift(newPost);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    }
    return newPost;
  }

  public static addPostComment(postId: string, memberId: string, content: string): void {
    const members = this.getMembers();
    const member = members.find((m) => m.id === memberId);
    if (!member) throw new Error('회원 정보를 찾을 수 없습니다.');

    const posts = this.getCommunityPosts();
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const now = new Date();
    const timeStr = `${getKSTDateString()} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    targetPost.comments.push({
      id: `comm-${Date.now()}`,
      postId,
      memberId: member.id,
      memberName: member.name,
      content: content.trim(),
      createdAt: timeStr,
    });

    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    }
  }

  public static togglePostLike(postId: string): void {
    const posts = this.getCommunityPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.likesCount = (post.likesCount || 0) + 1;
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
      }
    }
  }

  public static toggleQuestionResolved(postId: string): void {
    const posts = this.getCommunityPosts();
    const post = posts.find((p) => p.id === postId);
    if (post && post.type === 'question') {
      post.isResolved = !post.isResolved;
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
      }
    }
  }
}
