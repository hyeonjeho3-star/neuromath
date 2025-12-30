'use client';

import { useState, useEffect } from 'react';
import { useDeckStore } from '@/stores/deckStore';
import { db, type ErrorTag } from '@/lib/db';
import { AlertCircle, Brain, Calculator, Clock, ListOrdered, HelpCircle } from 'lucide-react';
import { retrievability as calcRetrievability } from '@/lib/fsrs/algorithm';

interface DailyStats {
  date: string;
  reviewed: number;
  correct: number;
}

const ERROR_TAG_INFO: Record<ErrorTag, { label: string; icon: React.ReactNode; color: string }> = {
  careless: { label: '부주의', icon: <AlertCircle size={16} />, color: 'text-yellow-500' },
  concept: { label: '개념 미숙', icon: <Brain size={16} />, color: 'text-purple-500' },
  calculation: { label: '계산 실수', icon: <Calculator size={16} />, color: 'text-blue-500' },
  memory: { label: '암기 부족', icon: <Clock size={16} />, color: 'text-red-500' },
  procedure: { label: '절차 오류', icon: <ListOrdered size={16} />, color: 'text-orange-500' },
  other: { label: '기타', icon: <HelpCircle size={16} />, color: 'text-gray-500' },
};

export default function StatsPage() {
  const { decks, deckStats } = useDeckStore();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [errorTagStats, setErrorTagStats] = useState<Record<string, number>>({});
  const [overallStats, setOverallStats] = useState({
    totalReviews: 0,
    totalCorrect: 0,
    averageAccuracy: 0,
    streak: 0,
    totalCards: 0,
    masteredCards: 0,
  });
  const [retentionStats, setRetentionStats] = useState({
    highRetention: 0,  // > 90%
    mediumRetention: 0,  // 70-90%
    lowRetention: 0,  // < 70%
    averageRetention: 0,
  });

  useEffect(() => {
    loadStats();
  }, [decks]);

  const loadStats = async () => {
    try {
      const logs = await db.reviewLogs.toArray();

      // Daily stats for last 7 days
      const dailyMap = new Map<string, { reviewed: number; correct: number }>();
      const now = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, { reviewed: 0, correct: 0 });
      }

      for (const log of logs) {
        const dateStr = log.reviewedAt.toISOString().split('T')[0];
        if (dailyMap.has(dateStr)) {
          const stats = dailyMap.get(dateStr)!;
          stats.reviewed++;
          if (log.rating >= 3) stats.correct++;
        }
      }

      setDailyStats(
        Array.from(dailyMap.entries())
          .map(([date, stats]) => ({ date, ...stats }))
          .reverse()
      );

      // Overall stats
      const totalReviews = logs.length;
      const totalCorrect = logs.filter((l) => l.rating >= 3).length;

      // Calculate streak
      const reviewDates = [...new Set(logs.map((l) => l.reviewedAt.toISOString().split('T')[0]))].sort().reverse();
      let streak = 0;
      let checkDate = new Date();

      for (const dateStr of reviewDates) {
        const expectedDate = checkDate.toISOString().split('T')[0];
        if (dateStr === expectedDate) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Get mastered cards
      const cards = await db.cards.toArray();
      const masteredCards = cards.filter((c) => c.state === 'review').length;

      // Total cards from deck stats
      let totalCards = 0;
      Object.values(deckStats).forEach((stat) => {
        totalCards += stat.totalCards;
      });

      setOverallStats({
        totalReviews,
        totalCorrect,
        averageAccuracy: totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0,
        streak,
        totalCards,
        masteredCards,
      });

      // Error tag stats
      const tagCounts: Record<string, number> = {};
      for (const log of logs) {
        if (log.errorTag) {
          tagCounts[log.errorTag] = (tagCounts[log.errorTag] || 0) + 1;
        }
      }
      setErrorTagStats(tagCounts);

      // Retention stats based on retrievability
      // Calculate current retrievability based on elapsed time since last review
      const reviewedCards = cards.filter(c => c.state !== 'new' && c.lastReview && c.stability > 0);
      if (reviewedCards.length > 0) {
        let highRet = 0;
        let mediumRet = 0;
        let lowRet = 0;
        let totalRet = 0;

        for (const card of reviewedCards) {
          // Calculate current retrievability based on days elapsed since last review
          const lastReview = new Date(card.lastReview!);
          const elapsedDays = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
          const ret = calcRetrievability(elapsedDays, card.stability);

          totalRet += ret;
          if (ret >= 0.9) highRet++;
          else if (ret >= 0.7) mediumRet++;
          else lowRet++;
        }

        setRetentionStats({
          highRetention: highRet,
          mediumRetention: mediumRet,
          lowRetention: lowRet,
          averageRetention: Math.round((totalRet / reviewedCards.length) * 100),
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const maxDailyReviews = Math.max(...dailyStats.map((s) => s.reviewed), 1);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Statistics</h1>

      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-3xl font-bold text-orange-500">{overallStats.streak}🔥</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Day Streak</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <p
            className={`text-3xl font-bold ${
              overallStats.averageAccuracy >= 80
                ? 'text-green-500'
                : overallStats.averageAccuracy >= 50
                ? 'text-orange-500'
                : 'text-red-500'
            }`}
          >
            {overallStats.averageAccuracy}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accuracy</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {overallStats.totalCards}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Cards</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-green-500">{overallStats.masteredCards}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mastered</p>
          </div>
        </div>
      </div>

      {/* Memory Retention */}
      {(retentionStats.highRetention + retentionStats.mediumRetention + retentionStats.lowRetention) > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">기억 확률 분포</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center mb-4">
              <div className="text-center">
                <p className={`text-4xl font-bold ${
                  retentionStats.averageRetention >= 80 ? 'text-green-500' :
                  retentionStats.averageRetention >= 60 ? 'text-orange-500' :
                  'text-red-500'
                }`}>
                  {retentionStats.averageRetention}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">평균 기억 확률</p>
              </div>
            </div>

            <div className="h-4 flex rounded-full overflow-hidden mb-4">
              {retentionStats.highRetention > 0 && (
                <div
                  className="bg-green-500"
                  style={{
                    width: `${(retentionStats.highRetention / (retentionStats.highRetention + retentionStats.mediumRetention + retentionStats.lowRetention)) * 100}%`
                  }}
                />
              )}
              {retentionStats.mediumRetention > 0 && (
                <div
                  className="bg-orange-500"
                  style={{
                    width: `${(retentionStats.mediumRetention / (retentionStats.highRetention + retentionStats.mediumRetention + retentionStats.lowRetention)) * 100}%`
                  }}
                />
              )}
              {retentionStats.lowRetention > 0 && (
                <div
                  className="bg-red-500"
                  style={{
                    width: `${(retentionStats.lowRetention / (retentionStats.highRetention + retentionStats.mediumRetention + retentionStats.lowRetention)) * 100}%`
                  }}
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1" />
                <span className="text-gray-600 dark:text-gray-400">90%+</span>
                <p className="font-semibold text-gray-900 dark:text-white">{retentionStats.highRetention}</p>
              </div>
              <div>
                <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1" />
                <span className="text-gray-600 dark:text-gray-400">70-90%</span>
                <p className="font-semibold text-gray-900 dark:text-white">{retentionStats.mediumRetention}</p>
              </div>
              <div>
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1" />
                <span className="text-gray-600 dark:text-gray-400">&lt;70%</span>
                <p className="font-semibold text-gray-900 dark:text-white">{retentionStats.lowRetention}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Activity */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Last 7 Days</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          {dailyStats.some((s) => s.reviewed > 0) ? (
            <div className="flex items-end justify-between h-32 gap-2">
              {dailyStats.map((stat) => {
                const height = (stat.reviewed / maxDailyReviews) * 100;
                const accuracy = stat.reviewed > 0 ? stat.correct / stat.reviewed : 0;
                const dayName = new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div key={stat.date} className="flex-1 flex flex-col items-center">
                    <div className="flex-1 w-full flex items-end justify-center">
                      <div
                        className={`w-6 rounded-t transition-all ${
                          accuracy >= 0.8 ? 'bg-green-500' : accuracy >= 0.5 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{dayName}</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{stat.reviewed}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No review data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Pattern Analysis */}
      {Object.keys(errorTagStats).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">오답 패턴 분석</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {Object.entries(errorTagStats)
                .sort(([, a], [, b]) => b - a)
                .map(([tag, count]) => {
                  const info = ERROR_TAG_INFO[tag as ErrorTag];
                  const totalErrors = Object.values(errorTagStats).reduce((a, b) => a + b, 0);
                  const percent = Math.round((count / totalErrors) * 100);
                  return (
                    <div key={tag} className="flex items-center gap-3">
                      <span className={`${info?.color || 'text-gray-500'}`}>
                        {info?.icon || <HelpCircle size={16} />}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 w-24">
                        {info?.label || tag}
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            tag === 'careless' ? 'bg-yellow-500' :
                            tag === 'concept' ? 'bg-purple-500' :
                            tag === 'calculation' ? 'bg-blue-500' :
                            tag === 'memory' ? 'bg-red-500' :
                            tag === 'procedure' ? 'bg-orange-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                        {count}회
                      </span>
                    </div>
                  );
                })}
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              가장 많은 오답 유형을 집중적으로 보완하면 학습 효율이 높아집니다.
            </p>
          </div>
        </div>
      )}

      {/* Deck Performance */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Deck Performance</h2>
        {decks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">No decks imported yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {decks.map((deck) => {
              const stats = deckStats[deck.id];
              const mastery = stats?.totalCards > 0 ? Math.round((stats.masteredCards / stats.totalCards) * 100) : 0;

              return (
                <div
                  key={deck.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{deck.name}</p>
                    <p className="text-sm text-green-500 font-medium">{mastery}% mastered</p>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${mastery}%` }}
                    />
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{stats?.totalCards ?? 0} cards</span>
                    <span className="text-orange-500">{stats?.dueToday ?? 0} due</span>
                    <span className="text-green-500">{stats?.newCards ?? 0} new</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
