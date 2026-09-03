import { AIToolType } from './types';

export const PENALTY_PER_MISS = 2000;
export const DEFAULT_MEMBER_DEPOSIT = 80000;

/**
 * 한국 표준시(KST) 기준 날짜 문자열(YYYY-MM-DD)을 반환합니다.
 */
export function getKSTDateString(date: Date = new Date()): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const kst = new Date(utc + 9 * 3600000);
  const year = kst.getFullYear();
  const month = String(kst.getMonth() + 1).padStart(2, '0');
  const day = String(kst.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 한국 요일 이름을 반환합니다. (월, 화, 수, 목, 금, 토, 일)
 */
export function getKoreanDayOfWeek(dateString: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(`${dateString}T12:00:00+09:00`);
  return days[date.getDay()];
}

/**
 * 주어진 날짜가 평일(월~금)인지 판정합니다.
 */
export function isWeekday(dateString: string): boolean {
  const date = new Date(`${dateString}T12:00:00+09:00`);
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/**
 * 오늘 자정(23:59:59)까지 남은 시간을 포맷팅하여 반환합니다 (예: "04시간 22분 남음")
 */
export function getTimeRemainingToday(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kst = new Date(utc + 9 * 3600000);

  const midnight = new Date(kst);
  midnight.setHours(23, 59, 59, 999);

  const diffMs = midnight.getTime() - kst.getTime();
  if (diffMs <= 0) return '마감 완료';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${String(hours).padStart(2, '0')}시간 ${String(minutes).padStart(2, '0')}분 남음`;
}

/**
 * URL을 분석하여 AI 도구를 자동으로 감지합니다.
 */
export function detectAIToolFromUrl(url: string): AIToolType {
  const cleanUrl = url.toLowerCase().trim();
  if (cleanUrl.includes('chatgpt.com') || cleanUrl.includes('chat.openai.com')) {
    return 'ChatGPT';
  }
  if (cleanUrl.includes('claude.ai')) {
    return 'Claude';
  }
  if (cleanUrl.includes('gemini.google.com')) {
    return 'Gemini';
  }
  if (cleanUrl.includes('perplexity.ai')) {
    return 'Perplexity';
  }
  if (cleanUrl.includes('v0.dev')) {
    return 'v0';
  }
  if (cleanUrl.includes('cursor.sh') || cleanUrl.includes('cursor.com')) {
    return 'Cursor';
  }
  return '기타';
}

/**
 * 붙여넣은 URL이 공식 Share 링크 규격인지 검증합니다.
 */
export function validateShareUrl(url: string): { valid: boolean; tool: AIToolType; message?: string } {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return { valid: false, tool: '기타', message: '올바른 웹 주소(URL) 형식이 아닙니다.' };
  }

  const tool = detectAIToolFromUrl(trimmed);

  // ChatGPT 단순 홈 링크 방어
  if (trimmed === 'https://chatgpt.com' || trimmed === 'https://chat.openai.com' || trimmed === 'https://chatgpt.com/') {
    return {
      valid: false,
      tool,
      message: '메인 주소 대신, 대화방 우측 상단 Share(공유) 버튼으로 복사한 링크를 넣어주세요.',
    };
  }

  // Claude 단순 홈 링크 방어
  if (trimmed === 'https://claude.ai' || trimmed === 'https://claude.ai/new' || trimmed === 'https://claude.ai/') {
    return {
      valid: false,
      tool,
      message: 'Claude 대화방 우측 상단 Share 링크를 넣어주세요.',
    };
  }

  return { valid: true, tool };
}

/**
 * 최근 N개의 유효 평일 날짜(YYYY-MM-DD) 목록을 최신순으로 반환합니다.
 */
export function getRecentWeekdays(count: number = 5): string[] {
  const weekdays: string[] = [];
  const temp = new Date();
  while (weekdays.length < count) {
    const dStr = getKSTDateString(temp);
    if (isWeekday(dStr)) {
      weekdays.push(dStr);
    }
    temp.setDate(temp.getDate() - 1);
  }
  return weekdays;
}

/**
 * 금액을 한국 원화 단위(콤마)로 포맷팅합니다.
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}
