// AI 러닝크루 2기 프롬프트 지식 허브 & 자율 챌린지 타입 시스템

export type AIToolType =
  | 'ChatGPT'
  | 'Claude'
  | 'Gemini'
  | 'Perplexity'
  | 'Cursor'
  | 'v0'
  | '기타';

export type PromptCategory =
  | '전체'
  | '보고서/기획'
  | '코딩/개발'
  | '업무자동화'
  | '데이터분석'
  | '번역/외국어'
  | '아이디어'
  | '기타';

export interface CrewMember {
  id: string;
  name: string;
  department: string;     // 소속 부서/동 (예: 평생교육과, 건축과, 수정5동 등)
  role: 'member' | 'admin';
  initialBalance: number; // 기본 회비 80,000원 (8만원)
  depositPaid: boolean;   // 회비 8만원 납부 완료 여부
  paidAmount: number;     // 실제 납부된 금액
  createdAt: string;
}

export type ShowcaseType = 'prompt' | 'image' | 'html';

export interface PromptSubmission {
  id: string;
  memberId: string;
  memberName: string;
  department?: string;
  date: string;            // YYYY-MM-DD (KST)
  submittedAt: string;     // ISO String
  aiTool: AIToolType;
  promptUrl: string;       // 공식 Share 링크 (또는 아티팩트 원본 링크)
  title: string;           // 프롬프트 또는 산출물 제목
  promptSnippet?: string;  // 핵심 프롬프트 구문 또는 설명
  category: PromptCategory;
  summaryNote?: string;    // 한 줄 소감/팁
  likesAwesome: number;    // 🔥 기발해요
  likesHelpful: number;    // 💡 도움돼요
  status: 'approved' | 'exempted';
  // 🎨 이미지 및 ⚡️ HTML 전시용 확장 필드
  showcaseType?: ShowcaseType; // 'prompt' | 'image' | 'html'
  imageUrl?: string;           // 이미지 URL 또는 data:image/base64
  htmlCode?: string;           // 인터랙티브 HTML 원본 코드
  rawPromptText?: string;      // 산출물 생성에 사용된 프롬프트 전문
}

export interface MemberSummary {
  member: CrewMember;
  totalSubmissions: number;
  missedCount: number;
  penaltyAmount: number;     // 미제출 * 2,000원
  remainingBalance: number;  // 남은 회비 (80,000원 - 벌금)
  consecutiveStreak: number; // 연속 출석 스트릭
  recentDaysStatus: { date: string; submitted: boolean }[];
  submittedToday: boolean;
  todaySubmission?: PromptSubmission;
}

export interface DailyReport {
  date: string;
  isWeekday: boolean;
  totalMembersCount: number;
  submittedMembers: CrewMember[];
  missedMembers: CrewMember[];
  submissions: PromptSubmission[];
  submissionRate: number;
  totalPenaltyPool: number;
}

// 💬 Q&A 및 크루원 자유게시판 타입
export type PostType = 'question' | 'free';

export interface CommunityComment {
  id: string;
  postId: string;
  memberId: string;
  memberName: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  memberId: string;
  memberName: string;
  department?: string;
  type: PostType;          // 'question' (질문) | 'free' (자유/꿀팁)
  title: string;
  content: string;
  linkUrl?: string;        // 관련 참고 링크 (선택)
  isResolved?: boolean;    // 질문 해결 여부
  likesCount: number;
  comments: CommunityComment[];
  createdAt: string;
}
