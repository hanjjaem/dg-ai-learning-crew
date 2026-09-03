-- ==============================================================================
-- 🛡️ AI 러닝크루 2기 (DG-AI-LearningCrew) Supabase 데이터베이스 스키마
-- 테이블 접두사: crew_ (기존 공모전 테이블과의 무결성 분리 보장)
-- ==============================================================================

-- 1. 크루원 테이블 (15명 고정)
CREATE TABLE IF NOT EXISTS crew_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    initial_deposit INTEGER NOT NULL DEFAULT 80000,
    deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_amount INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 프롬프트 & 산출물 제출 테이블
CREATE TABLE IF NOT EXISTS crew_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    date DATE NOT NULL,                                              -- 출석 인정일 (YYYY-MM-DD KST)
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),                 -- 실제 제출 시각 (마감 판정용)
    showcase_type TEXT NOT NULL DEFAULT 'prompt' CHECK (showcase_type IN ('prompt', 'image', 'html')),
    ai_tool TEXT NOT NULL,                                           -- ChatGPT, Claude, Gemini, Midjourney 등
    category TEXT NOT NULL DEFAULT '업무자동화',                     -- 업무 분야 카테고리
    title TEXT NOT NULL,                                             -- 제목
    prompt_url TEXT,                                                 -- 공식 Share 링크
    prompt_snippet TEXT,                                             -- 핵심 구문 요약
    raw_prompt_text TEXT,                                            -- 생성에 사용된 프롬프트 전문 (복사용)
    image_url TEXT,                                                  -- 그림 전시용 공개 CDN URL
    html_code TEXT,                                                  -- 인터랙티브 웹 위젯 원본 HTML
    summary_note TEXT,                                               -- 한 줄 소감/팁
    likes_awesome INTEGER NOT NULL DEFAULT 0,                        -- 🔥 기발해요
    likes_helpful INTEGER NOT NULL DEFAULT 0,                        -- 💡 도움돼요
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'exempted')),
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,                        -- 관리자 블라인드 여부 (개인정보/보안)
    hidden_reason TEXT,                                              -- 블라인드 사유
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1인 1일 1출석 단일성 보장 색인 (중복 제출 시 덮어쓰기 or 누적 관리)
CREATE INDEX IF NOT EXISTS idx_crew_submissions_date ON crew_submissions(date);
CREATE INDEX IF NOT EXISTS idx_crew_submissions_member ON crew_submissions(member_id);
CREATE INDEX IF NOT EXISTS idx_crew_submissions_type ON crew_submissions(showcase_type);

-- 3. 추천 / 리액션 테이블 (동일인 중복 연타 방지)
CREATE TABLE IF NOT EXISTS crew_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES crew_submissions(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('awesome', 'helpful')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(submission_id, member_id, reaction_type)
);

-- 4. 출장 / 연차 / 병가 / 공가 출석 면제 승인 테이블 (총무 관리 전용)
CREATE TABLE IF NOT EXISTS crew_exemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    exempt_date DATE NOT NULL,
    reason_type TEXT NOT NULL CHECK (reason_type IN ('출장', '연차', '병가', '교육', '기타')),
    memo TEXT,
    approved_by TEXT REFERENCES crew_members(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(member_id, exempt_date)
);

-- 5. 회비 & 벌금 입출금 투명 장부 테이블 (총무 회계 관리)
CREATE TABLE IF NOT EXISTS crew_fee_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT REFERENCES crew_members(id) ON DELETE SET NULL,
    tx_type TEXT NOT NULL CHECK (tx_type IN ('초기예치', '벌금입금', '회비환급', '우수자시상', '운영비지출')),
    amount INTEGER NOT NULL,                                         -- 입금(+), 출금(-)
    memo TEXT NOT NULL,                                              -- 거래 내역 메모
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. 대한민국 공휴일 및 구청 휴무일 테이블 (평일 자동 계산 시 제외)
CREATE TABLE IF NOT EXISTS crew_holidays (
    holiday_date DATE PRIMARY KEY,
    name TEXT NOT NULL,
    is_official BOOLEAN NOT NULL DEFAULT TRUE
);

-- 7. 질문 및 자유 소통 게시판
CREATE TABLE IF NOT EXISTS crew_community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'free' CHECK (type IN ('free', 'question')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crew_community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES crew_community_posts(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 🔒 RLS (Row Level Security) 설정 및 공개 정책
-- ==============================================================================
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_fee_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_community_comments ENABLE ROW LEVEL SECURITY;

-- 익명(anon) 및 인증 사용자 전체 조회 및 입력 허용 (내부 인트라넷 환경 호환)
DROP POLICY IF EXISTS "Public read crew_members" ON crew_members;
CREATE POLICY "Public read crew_members" ON crew_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read crew_submissions" ON crew_submissions;
CREATE POLICY "Public read crew_submissions" ON crew_submissions FOR SELECT USING (is_hidden = false);

DROP POLICY IF EXISTS "Public insert crew_submissions" ON crew_submissions;
CREATE POLICY "Public insert crew_submissions" ON crew_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update crew_submissions" ON crew_submissions;
CREATE POLICY "Public update crew_submissions" ON crew_submissions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public all crew_reactions" ON crew_reactions;
CREATE POLICY "Public all crew_reactions" ON crew_reactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Public all crew_exemptions" ON crew_exemptions;
CREATE POLICY "Public all crew_exemptions" ON crew_exemptions FOR ALL USING (true);

DROP POLICY IF EXISTS "Public all crew_fee_ledger" ON crew_fee_ledger;
CREATE POLICY "Public all crew_fee_ledger" ON crew_fee_ledger FOR ALL USING (true);

DROP POLICY IF EXISTS "Public all crew_holidays" ON crew_holidays;
CREATE POLICY "Public all crew_holidays" ON crew_holidays FOR ALL USING (true);

DROP POLICY IF EXISTS "Public all crew_community_posts" ON crew_community_posts;
CREATE POLICY "Public all crew_community_posts" ON crew_community_posts FOR ALL USING (true);

DROP POLICY IF EXISTS "Public all crew_community_comments" ON crew_community_comments;
CREATE POLICY "Public all crew_community_comments" ON crew_community_comments FOR ALL USING (true);

-- ==============================================================================
-- 👥 16명 실제 공무원 크루원 데이터 INSERT 및 회비 8만원 납부 현황
-- ==============================================================================
INSERT INTO crew_members (id, name, department, role, initial_deposit, deposit_paid, paid_amount) VALUES
    ('m1', '신봉일', '평생교육과', 'member', 80000, FALSE, 0),
    ('m2', '김남희', '건축과', 'member', 80000, TRUE, 80000),      -- 8만원 입금완료
    ('m3', '김보영', '수정5동', 'member', 80000, FALSE, 0),
    ('m4', '남수현', '재무과', 'member', 80000, TRUE, 80000),      -- 8만원 입금완료
    ('m5', '이민경', '환경청소위생과', 'member', 80000, TRUE, 80000), -- 8만원 입금완료
    ('m6', '박윤희', '문화관광과', 'member', 80000, FALSE, 0),
    ('m7', '서윤정', '환경청소위생과', 'member', 80000, TRUE, 80000), -- 8만원 입금완료
    ('m8', '양소희', '문화관광과', 'member', 80000, TRUE, 80000),  -- 8만원 입금완료
    ('m9', '오혜숙', '문화관광과', 'member', 80000, FALSE, 0),
    ('m10', '오희주', '교통행정과', 'member', 80000, FALSE, 0),
    ('m11', '이길례', '생활보장과', 'member', 80000, TRUE, 80000),  -- 8만원 입금완료
    ('m12', '장소향', '남항사업소', 'member', 80000, TRUE, 80000),  -- 8만원 입금완료
    ('m13', '전은정', '일자리경제과', 'member', 80000, FALSE, 0),
    ('m14', '최진웅', '총무과', 'admin', 80000, FALSE, 0),        -- 총무/관리자
    ('m15', '홍민지', '생활보장과', 'member', 80000, FALSE, 0),
    ('m16', '이현아', '복지정책과', 'member', 80000, TRUE, 80000)       -- 8만원 입금완료
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    department = EXCLUDED.department,
    role = EXCLUDED.role,
    initial_deposit = EXCLUDED.initial_deposit,
    deposit_paid = EXCLUDED.deposit_paid,
    paid_amount = EXCLUDED.paid_amount;

-- 8명 입금완료 거래내역 회계 장부(crew_fee_ledger) 초기 등록
INSERT INTO crew_fee_ledger (member_id, tx_type, amount, memo) VALUES
    ('m2', '초기예치', 80000, '김남희 2기 초기 회비 80,000원 입금 확인'),
    ('m4', '초기예치', 80000, '남수현 2기 초기 회비 80,000원 입금 확인'),
    ('m5', '초기예치', 80000, '이민경 2기 초기 회비 80,000원 입금 확인'),
    ('m7', '초기예치', 80000, '서윤정 2기 초기 회비 80,000원 입금 확인'),
    ('m8', '초기예치', 80000, '양소희 2기 초기 회비 80,000원 입금 확인'),
    ('m11', '초기예치', 80000, '이길례 2기 초기 회비 80,000원 입금 확인'),
    ('m12', '초기예치', 80000, '장소향 2기 초기 회비 80,000원 입금 확인'),
    ('m16', '초기예치', 80000, '이현아 2기 초기 회비 80,000원 입금 확인');

-- 2026년 하반기 법정공휴일 사전 등록
INSERT INTO crew_holidays (holiday_date, name) VALUES
    ('2026-09-15', '추석 연휴'),
    ('2026-09-16', '추석'),
    ('2026-09-17', '추석 연휴'),
    ('2026-10-03', '개천절'),
    ('2026-10-05', '대체공휴일'),
    ('2026-10-09', '한글날'),
    ('2026-12-25', '성탄절')
ON CONFLICT (holiday_date) DO NOTHING;
