'use client';

import {
  BarChart3,
  Flame,
  Target,
  Brain,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Zap,
  RefreshCw,
} from 'lucide-react';

export default function StatsGuidePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="text-orange-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            통계 해석 가이드
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          각 통계 지표의 의미와 학습에 활용하는 방법을 알아보세요.
        </p>
      </div>

      {/* Overview Metrics */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-orange-500" size={24} />
          주요 지표
        </h2>

        {/* Day Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <Flame className="text-orange-500" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Day Streak (연속 학습일)
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                연속으로 학습한 날의 수입니다. 매일 최소 1장이라도 복습하면 유지됩니다.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">해석 방법</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                    <span><strong>7일 이상:</strong> 좋은 학습 습관이 형성되고 있습니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                    <span><strong>30일 이상:</strong> 훌륭합니다! 학습이 습관으로 자리잡았습니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" size={16} />
                    <span><strong>자주 끊김:</strong> 알림 설정이나 학습 시간 고정을 권장합니다</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Target className="text-green-500" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Accuracy (정확도)
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                전체 복습 중 정답(Good/Easy)을 선택한 비율입니다. 실제로 맞춘 비율을 나타냅니다.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">해석 방법</h4>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">80%+</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">우수</p>
                  </div>
                  <div className="text-center p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">60-80%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">적정</p>
                  </div>
                  <div className="text-center p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">&lt;60%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">개선 필요</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>참고:</strong> FSRS 알고리즘은 약 90% 기억률을 목표로 설계되었습니다.
                  정확도가 너무 낮으면 새 카드 추가를 줄이고 복습에 집중하세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mastered */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="text-blue-500" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Mastered (마스터한 카드)
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                학습 단계(Learning)를 졸업하고 정기 복습(Review) 단계에 들어간 카드입니다.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">카드 상태 설명</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">New</span>
                    <span className="text-gray-600 dark:text-gray-300">아직 학습하지 않은 카드</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">Learning</span>
                    <span className="text-gray-600 dark:text-gray-300">처음 학습 중인 카드 (단기 반복)</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-green-100 dark:bg-green-900/30 rounded">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Review</span>
                    <span className="text-gray-600 dark:text-gray-300">마스터! 정기 복습 단계 (장기 기억)</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">Relearning</span>
                    <span className="text-gray-600 dark:text-gray-300">틀려서 다시 학습 중인 카드</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Memory Retention */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Brain className="text-orange-500" size={24} />
          기억 확률 분포
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            FSRS 알고리즘이 계산한 <strong>현재 시점</strong>의 기억 확률입니다.
            마지막 복습 이후 시간이 지나면 자연스럽게 감소합니다.
          </p>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">계산 공식</h4>
            <div className="bg-white dark:bg-gray-800 rounded p-3 font-mono text-sm text-center mb-3">
              R(t) = (1 + t / (9 × S))^(-1)
            </div>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li><strong>R:</strong> 기억 확률 (Retrievability)</li>
              <li><strong>t:</strong> 마지막 복습 이후 경과 일수</li>
              <li><strong>S:</strong> 안정성 (Stability) - 기억이 얼마나 견고한지</li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border-2 border-green-500">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">90%+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">강한 기억</p>
              <p className="text-xs text-gray-500 mt-1">복습 불필요</p>
            </div>
            <div className="text-center p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg border-2 border-orange-500">
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">70-90%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">적정 수준</p>
              <p className="text-xs text-gray-500 mt-1">곧 복습 필요</p>
            </div>
            <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border-2 border-red-500">
              <p className="text-lg font-bold text-red-600 dark:text-red-400">&lt;70%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">약한 기억</p>
              <p className="text-xs text-gray-500 mt-1">즉시 복습 권장</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>팁:</strong> 평균 기억 확률이 낮다면 복습을 미루고 있다는 의미입니다.
              매일 Due 카드를 처리하면 평균 90% 이상을 유지할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Error Pattern Analysis */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <AlertTriangle className="text-orange-500" size={24} />
          오답 패턴 분석
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            오답 시 선택한 오류 유형을 분석하여 학습 전략을 개선할 수 있습니다.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="text-yellow-500 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">부주의 (Careless)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  알고 있었지만 실수로 틀린 경우
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>개선책:</strong> 답변 전 한 번 더 확인하는 습관, 충분한 수면
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Brain className="text-purple-500 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">개념 미숙 (Concept)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  기본 개념을 제대로 이해하지 못한 경우
                </p>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>개선책:</strong> 해당 개념을 교재에서 다시 학습, 관련 카드 집중 복습
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Zap className="text-blue-500 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">계산 실수 (Calculation)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  계산 과정에서 실수한 경우
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>개선책:</strong> 계산 연습 강화, 검산 습관화, 단계별 풀이
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Clock className="text-red-500 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">암기 부족 (Memory)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  공식이나 정의를 기억하지 못한 경우
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>개선책:</strong> 해당 카드 자주 복습, 연상 기억법 활용, 시각화
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <RefreshCw className="text-orange-500 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">절차 오류 (Procedure)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  풀이 순서나 방법을 잘못 적용한 경우
                </p>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>개선책:</strong> 풀이 과정을 단계별로 정리, 절차형 카드로 연습
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>활용 팁:</strong> 가장 많은 오류 유형을 파악하고, 해당 유형에 맞는 학습 전략을 집중적으로 적용하세요.
              예를 들어 &quot;암기 부족&quot;이 많다면 복습 주기를 줄이거나, 더 자주 학습하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Deck Performance */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="text-orange-500" size={24} />
          덱 퍼포먼스
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            각 덱별 학습 진행 상황을 보여줍니다.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">%</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Mastered %</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Review 상태(정기 복습 단계)에 있는 카드의 비율입니다.
                  100%에 가까울수록 해당 덱을 완전히 학습한 것입니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold text-sm">Due</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Due (복습 예정)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  오늘 복습해야 할 카드 수입니다. 매일 0으로 만드는 것이 이상적입니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">New</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">New (새 카드)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  아직 학습하지 않은 카드 수입니다. 하루에 15-25개씩 학습하는 것을 권장합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <HelpCircle className="text-orange-500" size={24} />
          통계 활용 팁
        </h2>

        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold text-lg">1</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">정확도 70% 미만이면 새 카드를 잠시 중단하세요</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  복습 카드를 소화하지 못하면 새 카드가 쌓여서 악순환이 됩니다.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold text-lg">2</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">기억 확률이 낮으면 복습을 미루지 마세요</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Due 카드가 쌓이면 기억 확률이 급격히 떨어집니다. 매일 처리하세요.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold text-lg">3</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">오답 패턴을 분석하고 학습법을 조정하세요</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  같은 유형의 오류가 반복되면 해당 약점을 보완하는 학습이 필요합니다.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold text-lg">4</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Streak을 유지하는 것에 집착하지 마세요</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  질 낮은 학습보다 휴식이 나을 때도 있습니다. 장기적인 관점으로 접근하세요.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Navigation */}
      <div className="flex gap-4">
        <a
          href="/stats"
          className="flex-1 text-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
        >
          통계 보기
        </a>
        <a
          href="/science"
          className="flex-1 text-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors"
        >
          뇌과학 기반 학습
        </a>
      </div>
    </div>
  );
}
