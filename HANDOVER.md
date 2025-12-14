# NeuroMath 프로젝트 인계문서

## 문서 정보

| 항목 | 내용 |
|------|------|
| 프로젝트명 | NeuroMath (뇌과학 기반 수학 학습 앱) |
| 버전 | 0.1.0 |
| 작성일 | 2025-12-15 |
| GitHub | https://github.com/hyeonjeho3-star/neuromath.git |
| 기반 프로젝트 | NeuroTOEIC (수평 확장) |

---

## 1. 프로젝트 개요

### 1.1 목적
NeuroMath는 중학교 1학년 수학을 대상으로 한 **뇌과학 기반 간격반복 학습 앱**입니다. FSRS 4.5 알고리즘을 사용하여 각 학습자의 망각 곡선에 맞춰 최적의 복습 시점을 자동으로 계산합니다.

### 1.2 학습 대상
- **"승쥬방학수학" 11주 완성 로드맵** 기반
- 중학교 1학년 수학 전 범위 (1학기 ~ 2학기)
- 소인수분해 → 정수 → 유리수 → 문자와 식 → 일차방정식 → 좌표평면 → 정비례/반비례

### 1.3 핵심 기술
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16.0.10 | App Router 기반 프레임워크 |
| React | 19.2.1 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안정성 |
| Tailwind CSS | 4.x | 스타일링 |
| Dexie.js | 4.2.1 | IndexedDB 래퍼 (오프라인 지원) |
| Zustand | 5.0.9 | 상태 관리 |
| FSRS 4.5 | 자체 구현 | 간격반복 알고리즘 |

---

## 2. 프로젝트 구조

```
neuromath-web/
├── public/
│   └── decks/                    # 학습 덱 파일 (11주차)
│       ├── week01-prime-factorization.md
│       ├── week02-integer-multiplication.md
│       ├── week03-rational-numbers.md
│       ├── week04-algebraic-expressions.md
│       ├── week05-linear-expressions.md
│       ├── week06-equations-basics.md
│       ├── week07-complex-equations.md
│       ├── week08-equation-applications.md
│       ├── week09-coordinate-plane.md
│       ├── week10-proportions.md
│       └── week11-review-test.md
├── src/
│   ├── app/                      # Next.js App Router 페이지
│   │   ├── page.tsx              # 홈 (대시보드)
│   │   ├── study/page.tsx        # 학습 페이지
│   │   ├── decks/page.tsx        # 덱 관리
│   │   ├── deck/[deckId]/page.tsx # 개별 덱 상세
│   │   ├── session/[deckId]/page.tsx # 학습 세션
│   │   ├── stats/page.tsx        # 통계
│   │   ├── science/page.tsx      # 과학적 배경 설명
│   │   ├── settings/page.tsx     # 설정
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   ├── providers.tsx         # Context Providers
│   │   └── globals.css           # 전역 스타일
│   ├── components/               # 재사용 컴포넌트
│   │   ├── Navigation.tsx        # 네비게이션 (모바일/데스크톱)
│   │   ├── FlashCard.tsx         # 플래시카드 UI
│   │   ├── RatingButtons.tsx     # 평가 버튼 (Again/Hard/Good/Easy)
│   │   └── ClozeRenderer.tsx     # 빈칸채우기 렌더러
│   ├── lib/
│   │   ├── db/                   # 데이터베이스
│   │   │   ├── index.ts          # Dexie DB 정의
│   │   │   └── repository.ts     # CRUD 작업
│   │   ├── fsrs/                 # FSRS 알고리즘
│   │   │   ├── algorithm.ts      # 핵심 수학 공식
│   │   │   ├── scheduler.ts      # 스케줄링 로직
│   │   │   ├── types.ts          # 타입 정의
│   │   │   ├── index.ts          # 공개 API
│   │   │   └── fsrs.test.ts      # 테스트
│   │   ├── parser/               # 덱 파일 파서
│   │   │   ├── markdown.ts       # MD 파서
│   │   │   ├── text.ts           # TXT 파서
│   │   │   ├── cloze.ts          # 빈칸채우기 추출
│   │   │   ├── types.ts          # 타입 정의
│   │   │   ├── index.ts          # 공개 API
│   │   │   └── parser.test.ts    # 테스트
│   │   └── utils.ts              # 유틸리티 (cn 함수 등)
│   └── stores/                   # Zustand 스토어
│       ├── deckStore.ts          # 덱 상태 관리
│       ├── sessionStore.ts       # 학습 세션 상태
│       └── settingsStore.ts      # 설정 상태
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── postcss.config.mjs
```

---

## 3. 11주차 학습 커리큘럼

### 3.1 주차별 학습 내용

| 주차 | 덱 파일 | 학습 내용 | 카드 수 |
|------|---------|-----------|---------|
| 1주차 | week01-prime-factorization.md | 소인수분해, 정수 덧뺄셈 | ~30장 |
| 2주차 | week02-integer-multiplication.md | 정수 곱셈나눗셈, 혼합계산 | ~30장 |
| 3주차 | week03-rational-numbers.md | 유리수 개념 및 사칙연산 | ~30장 |
| 4주차 | week04-algebraic-expressions.md | 문자의 사용법, 식의 값 | ~30장 |
| 5주차 | week05-linear-expressions.md | 일차식 덧셈뺄셈 | ~30장 |
| 6주차 | week06-equations-basics.md | 등식, 일차방정식 기초 | ~30장 |
| 7주차 | week07-complex-equations.md | 복잡한 일차방정식 | ~30장 |
| 8주차 | week08-equation-applications.md | 일차방정식 활용 (문장제) | ~30장 |
| 9주차 | week09-coordinate-plane.md | 좌표평면, 사분면 | ~30장 |
| 10주차 | week10-proportions.md | 정비례, 반비례 | ~30장 |
| 11주차 | week11-review-test.md | 전체 범위 종합 복습 | ~30장 |

### 3.2 덱 파일 형식 (Q&A Format)

```markdown
# 1주차 - 소인수분해와 정수의 덧셈/뺄셈
tags: 중1, 소인수분해, 정수, 덧셈, 뺄셈

---

Q: 소수의 정의는?
A: 1보다 큰 자연수 중에서 약수가 1과 자기 자신뿐인 수

Q: 12를 소인수분해하면?
A: 2² × 3

Q: (+7) + (-3) = ?
A: +4 (다른 부호끼리 더하면 절댓값이 큰 수에서 작은 수를 빼고, 절댓값이 큰 수의 부호를 붙임)
```

### 3.3 지원 덱 형식

| 형식 | 예시 | 용도 |
|------|------|------|
| Q&A | `Q: 질문\nA: 답변` | 단순 문답형 (현재 사용) |
| Simple | `앞면 \| 뒷면` | 파이프 구분 형식 |
| Cloze | `{{c1::답::힌트}}` | 빈칸 채우기 |
| Structured | `## front\n## back` | 복잡한 구조 |

---

## 4. FSRS 4.5 알고리즘

### 4.1 핵심 개념

FSRS (Free Spaced Repetition Scheduler)는 기억의 두 가지 핵심 변수를 추적합니다:

| 변수 | 설명 | 범위 |
|------|------|------|
| **Stability (S)** | 기억이 90% 유지되는 기간 (일) | 0.1 ~ ∞ |
| **Difficulty (D)** | 카드의 고유 난이도 | 1 ~ 10 |
| **Retrievability (R)** | 현재 기억 확률 | 0 ~ 1 |

### 4.2 주요 공식 (algorithm.ts)

```typescript
// 1. 기억 확률 계산
R(t, S) = (1 + t / (9 × S))^(-1)

// 2. 다음 안정성 계산 (성공적 복습)
S'_recall = S × (e^w8 × (11-D) × S^(-w9) × (e^(w10×(1-R)) - 1) × penalty × bonus + 1)

// 3. 다음 안정성 계산 (망각)
S'_forget = w11 × D^(-w12) × ((S+1)^w13 - 1) × e^(w14×(1-R))

// 4. 다음 복습 간격 계산
I(S, R) = S / 0.2346 × ln(R_target)
```

### 4.3 평가 등급

| 등급 | 의미 | 효과 |
|------|------|------|
| 1 (Again) | 완전히 잊음 | 안정성 급감, 재학습 시작 |
| 2 (Hard) | 어렵게 기억 | 안정성 소폭 증가, 페널티 적용 |
| 3 (Good) | 정상 기억 | 안정성 정상 증가 |
| 4 (Easy) | 쉽게 기억 | 안정성 크게 증가, 보너스 적용 |

### 4.4 기본 파라미터 (17개)

```typescript
const DEFAULT_FSRS_PARAMS = {
  w: [
    0.4,    // w0: Again 초기 안정성
    0.6,    // w1: Hard 초기 안정성
    2.4,    // w2: Good 초기 안정성
    5.8,    // w3: Easy 초기 안정성
    4.93,   // w4: 초기 난이도 기준
    0.94,   // w5: 난이도 조정 계수
    0.86,   // w6: 난이도 변화율
    0.01,   // w7: 난이도 평균 회귀
    1.49,   // w8: 안정성 증가 기준
    0.14,   // w9: 안정성 감소 지수
    0.94,   // w10: 망각 영향 계수
    2.18,   // w11: 망각 후 안정성 기준
    0.05,   // w12: 난이도의 망각 영향
    0.34,   // w13: 안정성의 망각 영향
    1.26,   // w14: 기억확률의 망각 영향
    0.29,   // w15: Hard 페널티
    2.61,   // w16: Easy 보너스
  ],
  requestRetention: 0.9,  // 목표 기억 확률 90%
  maximumInterval: 36500, // 최대 간격 100년
};
```

---

## 5. 데이터베이스 구조

### 5.1 IndexedDB 스키마 (Dexie.js)

```typescript
// src/lib/db/index.ts

class NeuroMathDatabase extends Dexie {
  decks!: Table<Deck, string>;
  cards!: Table<Card, string>;
  reviewLogs!: Table<ReviewLog, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('neuromath');  // 데이터베이스 이름

    this.version(1).stores({
      decks: 'id, name, updatedAt',
      cards: 'id, deckId, state, dueDate, [deckId+state], [deckId+dueDate]',
      reviewLogs: 'id, cardId, deckId, reviewedAt, [deckId+reviewedAt]',
      settings: 'key',
    });
  }
}
```

### 5.2 주요 테이블

#### Deck (덱)
```typescript
interface Deck {
  id: string;           // UUID
  name: string;         // 덱 이름
  description?: string; // 설명
  tags: string[];       // 태그 배열
  cardCount: number;    // 총 카드 수
  newCount: number;     // 새 카드 수
  learningCount: number; // 학습 중 카드 수
  reviewCount: number;  // 복습 카드 수
  sourceFile?: string;  // 원본 파일명
  createdAt: Date;
  updatedAt: Date;
}
```

#### Card (카드)
```typescript
interface Card {
  id: string;           // UUID
  deckId: string;       // 소속 덱 ID
  front: string;        // 앞면 (질문)
  back: string;         // 뒷면 (답변)
  clozes: ClozeItem[];  // 빈칸채우기 정보
  trapOptions: string[]; // 오답 선택지
  tags: string[];       // 개별 태그

  // FSRS 상태
  state: 'new' | 'learning' | 'review' | 'relearning';
  difficulty: number;   // 1 ~ 10
  stability: number;    // 기억 안정성 (일)
  retrievability: number; // 현재 기억 확률
  dueDate: Date;        // 다음 복습일
  lastReview: Date | null;
  reps: number;         // 총 복습 횟수
  lapses: number;       // 망각 횟수
  elapsedDays: number;  // 마지막 복습 후 경과일
  scheduledDays: number; // 예정된 간격

  createdAt: Date;
  updatedAt: Date;
}
```

#### ReviewLog (복습 기록)
```typescript
interface ReviewLog {
  id: string;
  cardId: string;
  deckId: string;
  rating: number;       // 1~4
  state: CardState;     // 복습 시 상태
  stability: number;    // 복습 후 안정성
  difficulty: number;   // 복습 후 난이도
  elapsedDays: number;  // 경과일
  lastElapsedDays: number;
  scheduledDays: number; // 다음 간격
  elapsedMs: number;    // 응답 시간 (ms)
  reviewedAt: Date;
}
```

---

## 6. 상태 관리 (Zustand)

### 6.1 deckStore.ts
```typescript
interface DeckStore {
  // 상태
  decks: Deck[];
  deckStats: Record<string, DeckStats>;
  isLoading: boolean;

  // 액션
  loadDecks(): Promise<void>;
  importDeck(parsed: ParsedDeck): Promise<string>;
  deleteDeck(id: string): Promise<void>;
  refreshDeckStats(deckId: string): Promise<void>;
}
```

### 6.2 sessionStore.ts
```typescript
interface SessionStore {
  // 상태
  currentDeck: Deck | null;
  currentCard: Card | null;
  queue: Card[];
  isFlipped: boolean;
  sessionStats: { reviewed: number; correct: number; };

  // 액션
  startSession(deckId: string): Promise<void>;
  flipCard(): void;
  rateCard(rating: Rating): Promise<void>;
  endSession(): void;
}
```

### 6.3 settingsStore.ts
```typescript
interface SettingsStore {
  // 상태
  fsrsParams: FSRSParams;
  dailyNewCards: number;
  dailyReviewCards: number;
  theme: 'light' | 'dark' | 'system';

  // 액션
  updateFSRSParams(params: Partial<FSRSParams>): void;
  setTheme(theme: string): void;
}
```

---

## 7. 주요 컴포넌트

### 7.1 Navigation.tsx
- 모바일: 하단 탭 네비게이션 (5개 항목)
- 데스크톱: 좌측 사이드바 (6개 항목)
- 블루 테마 (`text-blue-500`)

### 7.2 FlashCard.tsx
- 카드 뒤집기 애니메이션
- 앞면/뒷면 전환
- 마크다운 렌더링

### 7.3 RatingButtons.tsx
- Again (빨강), Hard (주황), Good (초록), Easy (청록)
- 예상 다음 복습 간격 표시
- 터치 친화적 UI

### 7.4 ClozeRenderer.tsx
- `{{c1::answer::hint}}` 형식 파싱
- 빈칸 표시 및 답안 공개

---

## 8. 빌드 및 배포

### 8.1 개발 환경 실행
```bash
cd neuromath-web
npm install
npm run dev
# http://localhost:3000
```

### 8.2 프로덕션 빌드
```bash
npm run build
# .next/ 폴더에 최적화된 빌드 생성

npm run start
# 프로덕션 서버 실행
```

### 8.3 빌드 결과
```
Route (app)
├ ○ /                    # 홈 (정적)
├ ○ /decks               # 덱 목록 (정적)
├ ○ /science             # 과학 설명 (정적)
├ ○ /settings            # 설정 (정적)
├ ○ /stats               # 통계 (정적)
├ ○ /study               # 학습 (정적)
├ ƒ /deck/[deckId]       # 덱 상세 (동적)
└ ƒ /session/[deckId]    # 학습 세션 (동적)
```

### 8.4 알려진 경고
```
⚠ Unsupported metadata themeColor is configured in metadata export.
  Please move it to viewport export instead.
```
- Next.js 16에서 `themeColor`가 `metadata`에서 `viewport`로 이동됨
- 기능에는 영향 없음, 향후 수정 권장

---

## 9. 향후 개선 사항

### 9.1 단기 개선
- [ ] `themeColor` → `viewport` 마이그레이션
- [ ] 모바일 네비게이션 색상 통일 (orange → blue)
- [ ] PWA 지원 추가 (오프라인 사용)
- [ ] 학습 알림 기능

### 9.2 중기 개선
- [ ] 사용자 맞춤 FSRS 파라미터 최적화
- [ ] 학습 데이터 내보내기/가져오기
- [ ] 다중 사용자 프로필
- [ ] 동기화 기능 (선택적 서버 연동)

### 9.3 장기 개선
- [ ] AI 기반 오답 분석
- [ ] 개념 맵 시각화
- [ ] 음성 인식 답변
- [ ] 게이미피케이션 요소

---

## 10. 참고 자료

### 10.1 FSRS 알고리즘
- [FSRS GitHub](https://github.com/open-spaced-repetition/fsrs4anki)
- [FSRS 논문](https://arxiv.org/abs/2402.00296)
- [Anki FSRS 위키](https://github.com/open-spaced-repetition/fsrs4anki/wiki)

### 10.2 기술 문서
- [Next.js 16 문서](https://nextjs.org/docs)
- [Dexie.js 문서](https://dexie.org/docs/)
- [Zustand 문서](https://docs.pmnd.rs/zustand/getting-started/introduction)

### 10.3 학습 콘텐츠 출처
- hsjmath-1.txt ~ hsjmath-3-2.txt (중1 수학 PDF 텍스트 추출)
- 승쥬방학수학 11주 완성 로드맵

---

## 11. 연락처 및 지원

| 항목 | 정보 |
|------|------|
| GitHub Repository | https://github.com/hyeonjeho3-star/neuromath.git |
| 이슈 등록 | GitHub Issues |
| 최종 빌드 확인일 | 2025-12-15 |
| 빌드 상태 | ✅ 성공 (Next.js 16.0.10) |

---

*이 문서는 NeuroMath 프로젝트의 전체적인 구조와 기술적 세부사항을 담고 있습니다. 프로젝트 인수인계 시 본 문서를 참고하여 개발을 이어가시기 바랍니다.*
