# NeuroMath 프로젝트 인계문서

## 문서 정보

| 항목 | 내용 |
|------|------|
| 프로젝트명 | NeuroMath (뇌과학 기반 수학 학습 앱) |
| 버전 | 0.1.0 |
| 작성일 | 2025-12-15 |
| **최종 수정일** | **2025-12-30** |
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
│       └── ... (총 11개 파일)
├── src/
│   ├── app/                      # Next.js App Router 페이지
│   │   ├── page.tsx              # 홈 (대시보드)
│   │   ├── study/page.tsx        # 학습 페이지
│   │   ├── decks/page.tsx        # 덱 관리
│   │   ├── deck/[deckId]/page.tsx # 개별 덱 상세
│   │   ├── session/[deckId]/page.tsx # 학습 세션 (수정됨)
│   │   ├── stats/page.tsx        # 통계 (수정됨)
│   │   ├── stats-guide/page.tsx  # 통계 해석 가이드 (신규)
│   │   ├── science/page.tsx      # 과학적 배경 설명
│   │   ├── settings/page.tsx     # 설정
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   ├── providers.tsx         # Context Providers
│   │   └── globals.css           # 전역 스타일
│   ├── components/               # 재사용 컴포넌트
│   │   ├── Navigation.tsx        # 네비게이션 (수정됨)
│   │   ├── FlashCard.tsx         # 플래시카드 UI
│   │   ├── MCQCard.tsx           # 객관식 카드 (수정됨)
│   │   ├── NumericCard.tsx       # 수치 입력 카드
│   │   ├── ProcedureCard.tsx     # 절차형 카드
│   │   ├── ErrorTagModal.tsx     # 오답 원인 분석 모달
│   │   ├── RatingButtons.tsx     # 평가 버튼 (Again/Hard/Good/Easy)
│   │   ├── ClozeRenderer.tsx     # 빈칸채우기 렌더러
│   │   ├── CardList.tsx          # 카드 목록
│   │   └── CardTypeEditor.tsx    # 카드 타입 편집기
│   ├── lib/
│   │   ├── db/                   # 데이터베이스
│   │   │   ├── index.ts          # Dexie DB 정의
│   │   │   └── repository.ts     # CRUD 작업 (수정됨)
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

## 3. 신규 추가/수정 사항 (2025-12-30)

### 3.1 MCQ 카드 오류 태그 모달 타이밍 수정

**문제**: 객관식(MCQ) 오답 시 결과 확인 전에 오류 태그 모달이 즉시 표시됨

**해결**: 사용자가 오답 원인을 확인한 후 선택적으로 오류 태그 기록 가능하도록 변경

**수정 파일**:
- `src/components/MCQCard.tsx`
- `src/app/session/[deckId]/page.tsx`

**상세 변경**:

```typescript
// MCQCard.tsx - 신규 상태 및 버튼 추가
const [hasCalledOnAnswer, setHasCalledOnAnswer] = useState(false);

// 답변 확인 후 버튼 UI
{isAnswered && !hasCalledOnAnswer && (
  <div className="mt-4 flex gap-3">
    {/* 오답일 때만 표시 */}
    {!isCorrectAnswer && onRequestErrorTag && (
      <button onClick={onRequestErrorTag} className="...">
        <Tag size={18} />
        오류 유형 기록
      </button>
    )}
    {/* 다음 카드로 이동 */}
    <button onClick={handleNext} className="...">
      다음
      <ArrowRight size={18} />
    </button>
  </div>
)}
```

```typescript
// session/[deckId]/page.tsx - MCQ용 skipErrorTagModal 플래그 추가
const handleAutoGradedAnswer = async (
  isCorrect: boolean,
  userAnswer: string,
  skipErrorTagModal = false  // MCQ는 true로 전달
) => {
  // ...
  if (!isCorrect && cardId) {
    setPendingErrorCard({ cardId });
    if (!skipErrorTagModal) {  // MCQ가 아닐 때만 자동 표시
      setShowErrorTagModal(true);
    }
  }
};

// MCQ에서 수동으로 오류 태그 모달 열기
const handleMCQRequestErrorTag = () => {
  if (pendingErrorCard) {
    setShowErrorTagModal(true);
  }
};
```

---

### 3.2 기억 확률(Retrievability) 계산 오류 수정

**문제**: 통계 페이지에서 기억 확률이 항상 100%로 표시됨

**원인**: DB에 저장된 `retrievability` 값(마지막 복습 시점 기준)을 그대로 사용

**해결**: 현재 시점 기준으로 FSRS 공식을 이용해 실시간 계산

**수정 파일**:
- `src/app/stats/page.tsx`

**상세 변경**:

```typescript
// 기존: 저장된 값 사용
// const ret = card.retrievability;  // 항상 ~1.0

// 수정: 실시간 계산
import { retrievability as calcRetrievability } from '@/lib/fsrs/algorithm';

const reviewedCards = cards.filter(c =>
  c.state !== 'new' && c.lastReview && c.stability > 0
);

for (const card of reviewedCards) {
  const lastReview = new Date(card.lastReview!);
  const elapsedDays = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);

  // FSRS 공식: R(t) = (1 + t / (9 × S))^(-1)
  const ret = calcRetrievability(elapsedDays, card.stability);

  // 분류: 90%+ (강함), 70-90% (적정), <70% (약함)
  if (ret >= 0.9) highRet++;
  else if (ret >= 0.7) mediumRet++;
  else lowRet++;
}
```

---

### 3.3 마스터 카드 판정 기준 수정

**문제**: 덱 퍼포먼스에서 학습 완료 후에도 0% 마스터로 표시

**원인**: `stability >= 30` 조건이 너무 엄격함 (30일 이상 기억 유지 필요)

**해결**: `state === 'review'` 조건으로 변경 (Learning 단계 졸업 = 마스터)

**수정 파일**:
- `src/lib/db/repository.ts`
- `src/app/stats/page.tsx`

**상세 변경**:

```typescript
// repository.ts - getDeckStats()
return {
  // ...
  masteredCards: cards.filter(c => c.state === 'review').length,
  // 기존: cards.filter(c => c.stability >= 30).length
};

// stats/page.tsx
const masteredCards = cards.filter((c) => c.state === 'review').length;
```

**카드 상태 설명**:
| 상태 | 의미 |
|------|------|
| `new` | 아직 학습하지 않은 카드 |
| `learning` | 처음 학습 중 (단기 반복) |
| `review` | **마스터!** 정기 복습 단계 (장기 기억) |
| `relearning` | 틀려서 다시 학습 중 |

---

### 3.4 통계 해석 가이드 페이지 신규 추가

**경로**: `/stats-guide`

**파일**: `src/app/stats-guide/page.tsx` (신규)

**네비게이션 수정**: `src/components/Navigation.tsx`

```typescript
const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/study', label: 'Study', icon: BookOpen },
  { href: '/decks', label: 'Decks', icon: FolderOpen },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/stats-guide', label: 'Guide', icon: HelpCircle },  // 신규
  { href: '/science', label: 'Science', icon: Brain },
  { href: '/settings', label: 'Settings', icon: Settings },
];
```

**페이지 내용**:

1. **주요 지표 해석**
   - Day Streak (연속 학습일): 7일+/30일+ 기준 설명
   - Accuracy (정확도): 80%+/60-80%/<60% 등급
   - Mastered (마스터 카드): Review 상태 = 마스터

2. **기억 확률 분포**
   - FSRS 수식: `R(t) = (1 + t / (9 × S))^(-1)`
   - 90%+/70-90%/<70% 분류 기준

3. **오답 패턴 분석**
   - 부주의 (careless): 실수로 틀림 → 확인 습관
   - 개념 미숙 (concept): 이해 부족 → 교재 재학습
   - 계산 실수 (calculation): 계산 오류 → 검산 습관
   - 암기 부족 (memory): 기억 실패 → 반복 학습
   - 절차 오류 (procedure): 순서 오류 → 단계별 정리
   - 기타 (other)

4. **덱 퍼포먼스**
   - Mastered %: Review 상태 비율
   - Due: 오늘 복습 예정 카드
   - New: 미학습 카드

5. **통계 활용 팁**
   - 정확도 70% 미만 → 새 카드 중단
   - 기억 확률 낮음 → 즉시 복습
   - 오답 패턴 분석 → 학습법 조정
   - Streak 집착 금지 → 장기적 관점

---

## 4. 카드 타입 시스템

### 4.1 지원 카드 타입 (5종)

| 타입 | 설명 | 답변 방식 | 컴포넌트 |
|------|------|----------|----------|
| `basic` | 기본 Q&A | 플립 후 자기 평가 | FlashCard |
| `cloze` | 빈칸 채우기 | `{{c1::정답::힌트}}` | FlashCard + ClozeRenderer |
| `mcq` | 객관식 | 선택지 중 정답 선택 | MCQCard |
| `numeric` | 수치 입력 | 숫자 직접 입력 | NumericCard |
| `procedure` | 절차형 | 단계 순서 배열 | ProcedureCard |

### 4.2 마크다운 파일 형식

#### 기본 Q&A
```markdown
# 덱 이름
tags: 수학, 대수
---
Q: 2 + 2는?
A: 4
```

#### 클로즈 (빈칸 채우기)
```markdown
이차방정식의 근의 공식은 {{c1::(-b ± √(b²-4ac)) / 2a::근의 공식}}이다.
|trap: (-b ± √(b²+4ac)) / 2a, (-b - √(b²-4ac)) / 2a
```

#### 객관식 (MCQ)
```markdown
# Card Title
type: mcq

## front
다음 중 소수가 아닌 것은?

## choices
- [ ] 2
- [ ] 3
- [x] 4
- [ ] 5

## back
4 = 2 × 2 이므로 소수가 아닙니다.
```

#### 수치 입력 (Numeric)
```markdown
# 계산 문제
type: numeric

## front
√144의 값은?

## answer
12

## back
12 × 12 = 144
```

#### 절차형 (Procedure)
```markdown
# 이차방정식 풀이
type: procedure

## front
x² - 5x + 6 = 0 을 인수분해로 푸시오.

## steps
1. 두 수의 곱이 6, 합이 -5인 수 찾기
2. (x - 2)(x - 3) = 0 으로 인수분해
3. x = 2 또는 x = 3

## back
x = 2, x = 3
```

---

## 5. FSRS 4.5 알고리즘

### 5.1 핵심 개념

| 변수 | 설명 | 범위 |
|------|------|------|
| **Stability (S)** | 기억이 90% 유지되는 기간 (일) | 0.1 ~ ∞ |
| **Difficulty (D)** | 카드의 고유 난이도 | 1 ~ 10 |
| **Retrievability (R)** | 현재 기억 확률 | 0 ~ 1 |

### 5.2 주요 공식 (algorithm.ts)

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

### 5.3 평가 등급

| 등급 | 의미 | 효과 |
|------|------|------|
| 1 (Again) | 완전히 잊음 | 안정성 급감, 재학습 시작 |
| 2 (Hard) | 어렵게 기억 | 안정성 소폭 증가, 페널티 적용 |
| 3 (Good) | 정상 기억 | 안정성 정상 증가 |
| 4 (Easy) | 쉽게 기억 | 안정성 크게 증가, 보너스 적용 |

---

## 6. 데이터베이스 구조

### 6.1 IndexedDB 스키마 (Dexie.js)

```typescript
// Version 2 (현재)
this.version(2).stores({
  decks: 'id, name, updatedAt',
  cards: 'id, deckId, state, dueDate, cardType, [deckId+state], [deckId+dueDate], [deckId+cardType]',
  reviewLogs: 'id, cardId, deckId, reviewedAt, errorTag, [deckId+reviewedAt], [deckId+errorTag]',
  settings: 'key',
});
```

### 6.2 주요 테이블

#### Card (카드) - 확장 필드
```typescript
interface Card {
  // 기본 필드
  id: string;
  deckId: string;
  front: string;
  back: string;

  // 카드 타입 관련 (신규)
  cardType: 'basic' | 'cloze' | 'mcq' | 'numeric' | 'procedure';
  answerType: 'text' | 'number' | 'choice' | 'ordered-steps';
  answerKey?: string;      // 수치형 정답
  choices?: Choice[];      // MCQ 선택지
  steps?: Step[];          // 절차형 단계

  // FSRS 상태
  state: 'new' | 'learning' | 'review' | 'relearning';
  difficulty: number;
  stability: number;
  retrievability: number;
  dueDate: Date;
  lastReview: Date | null;
  reps: number;
  lapses: number;
  elapsedDays: number;
  scheduledDays: number;

  createdAt: Date;
  updatedAt: Date;
}
```

#### ReviewLog (복습 기록) - 확장 필드
```typescript
interface ReviewLog {
  // 기본 필드
  id: string;
  cardId: string;
  deckId: string;
  rating: number;
  state: CardState;

  // 확장 필드 (신규)
  isCorrect?: boolean;         // 정답 여부
  userAnswer?: string;         // 사용자 답변
  selectedChoice?: string;     // 선택한 MCQ 답
  errorTag?: ErrorTag;         // 오답 원인 분류

  reviewedAt: Date;
}
```

#### ErrorTag 타입
```typescript
type ErrorTag = 'careless' | 'concept' | 'calculation' | 'memory' | 'procedure' | 'other';
```

---

## 7. 빌드 및 배포

### 7.1 개발 환경 실행
```bash
cd neuromath
npm install
npm run dev
# http://localhost:3000
```

### 7.2 프로덕션 빌드
```bash
npm run build
npm run start
```

---

## 8. 향후 개선 사항

### 8.1 단기 개선
- [ ] PWA 지원 추가 (오프라인 사용)
- [ ] 학습 알림 기능
- [ ] LaTeX 수식 렌더링

### 8.2 중기 개선
- [ ] 사용자 맞춤 FSRS 파라미터 최적화
- [ ] 학습 데이터 내보내기/가져오기 (JSON/CSV)
- [ ] 클라우드 동기화 (선택적)

### 8.3 장기 개선
- [ ] AI 기반 오답 분석
- [ ] 개념 맵 시각화
- [ ] 게이미피케이션 요소

---

## 9. 참고 자료

### 9.1 FSRS 알고리즘
- [FSRS GitHub](https://github.com/open-spaced-repetition/fsrs4anki)
- [FSRS 논문](https://arxiv.org/abs/2402.00296)

### 9.2 기술 문서
- [Next.js 16 문서](https://nextjs.org/docs)
- [Dexie.js 문서](https://dexie.org/docs/)
- [Zustand 문서](https://docs.pmnd.rs/zustand/getting-started/introduction)

---

## 10. 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-15 | 0.1.0 | 초기 버전 |
| 2025-12-30 | 0.1.1 | MCQ 오류 태그 타이밍 수정, 기억 확률 계산 수정, 마스터 판정 기준 수정, 통계 가이드 페이지 추가 |

---

*이 문서는 NeuroMath 프로젝트의 전체적인 구조와 기술적 세부사항을 담고 있습니다.*
*최종 수정: 2025-12-30 (Claude Opus 4.5)*
