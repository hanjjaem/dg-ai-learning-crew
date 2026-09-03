# 🏃‍♂️ AI 러닝크루 2기 | 프롬프트 지식 허브 & 자율 챌린지 플랫폼

> **"카카오톡 단톡방 인증을 넘어, 2기 크루원들이 매일 PC 업무 중에 켜두는 독립형 AI 프롬프트 지식 허브 & 자율 챌린지 플랫폼"**

본 프로젝트는 동구청 공무원 AI 러닝크루 2기를 위한 전용 웹 서비스로, 1일 1프롬프트 인증과 AI 산출물(이미지, 인터랙티브 HTML 웹 위젯)을 지식 자산으로 축적하고 공유하는 데스크톱 우선(Desktop-First) 와이드 대시보드입니다.

---

## ✨ 핵심 기능

### 1. 🚀 3초 컷 무마찰 인증 (Zero Friction)
* ChatGPT, Claude, Gemini 등의 공식 **Share(공유) 링크** 붙여넣기만으로 AI 도구 자동 감지 및 1초 인증 완료
* 복잡한 사진 업로드나 의무 소감문 작성 없이 업무 흐름을 방해하지 않는 초경량 인증

### 2. 🎨 AI 산출물 쇼케이스 (Knowledge Hub)
* **💬 프롬프트 아카이브**: 동료들이 실무에 검증한 프롬프트 원클릭 복사 및 원본 대화방 열람
* **🎨 그림 전시 (Image Showcase)**: AI로 생성한 포스터, 시안, 일러스트를 고화질 액자 뷰로 전시
* **⚡️ 인터랙티브 HTML 전시 (Live HTML Sandbox)**: Claude / ChatGPT로 만든 간이 계산기, 대시보드 등 단일 HTML 웹 위젯을 브라우저 격리 샌드박스에서 즉시 실행

### 3. 📊 실시간 자율 출석부 & 회비 정산 장부
* 총무 개입 없이 평일 23:59 기준 출석 및 벌금(2,000원) 자동 연산
* **초기 회비 80,000원 납부 현황 게이지** 및 크루원별 실시간 잔여 회비 추적
* 공휴일 자동 제외, 출장/연차 면제 관리, CSV 엑셀 원클릭 다운로드

---

## 🛠️ 기술 스택

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript (Strict Mode)
* **Styling**: Tailwind CSS v4, Lucide React Icons, Canvas-Confetti
* **Backend & Database**: Supabase (PostgreSQL, Storage, RLS)
* **Architecture**: Clean Architecture (순수 비즈니스 로직 격리 & Graceful Local Fallback)

---

## 🚀 로컬 개발 환경 실행

```bash
# 의존성 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

---

## 🗄️ Supabase 데이터베이스 구축

1. [Supabase Dashboard](https://supabase.com/dashboard) 로그인 ➡️ 프로젝트 선택
2. **SQL Editor** 메뉴 진입
3. 루트 경로의 `supabase_schema.sql` 내용을 복사하여 붙여넣고 **Run** 실행 (16명 크루원 및 스토리지 버킷 자동 연동)
