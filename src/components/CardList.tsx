'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Card, CardType } from '@/lib/db';
import { CardTypeEditor } from './CardTypeEditor';
import {
  Edit2,
  Trash2,
  FileText,
  List,
  Calculator,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';

interface CardListProps {
  cards: Card[];
  onUpdateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
}

const CARD_TYPE_ICONS: Record<CardType, React.ReactNode> = {
  basic: <FileText size={16} />,
  cloze: <FileText size={16} />,
  mcq: <List size={16} />,
  numeric: <Calculator size={16} />,
  procedure: <ListOrdered size={16} />,
};

const CARD_TYPE_LABELS: Record<CardType, string> = {
  basic: '기본형',
  cloze: '빈칸',
  mcq: '객관식',
  numeric: '숫자',
  procedure: '절차',
};

export function CardList({ cards, onUpdateCard, onDeleteCard }: CardListProps) {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<Card>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<CardType | 'all'>('all');

  const filteredCards = cards.filter(card => {
    const matchesSearch = searchQuery === '' ||
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || card.cardType === filterType;
    return matchesSearch && matchesType;
  });

  const toggleExpand = useCallback((cardId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  const handleStartEdit = useCallback((card: Card) => {
    setEditingCardId(card.id);
    setPendingUpdates({});
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCardId(null);
    setPendingUpdates({});
  }, []);

  const handleUpdatePending = useCallback((updates: Partial<Card>) => {
    setPendingUpdates(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSave = useCallback(async () => {
    if (editingCardId && Object.keys(pendingUpdates).length > 0) {
      await onUpdateCard(editingCardId, pendingUpdates);
    }
    setEditingCardId(null);
    setPendingUpdates({});
  }, [editingCardId, pendingUpdates, onUpdateCard]);

  const handleDelete = useCallback(async (cardId: string) => {
    if (confirm('이 카드를 삭제하시겠습니까?')) {
      await onDeleteCard(cardId);
    }
  }, [onDeleteCard]);

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="카드 검색..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as CardType | 'all')}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">모든 타입</option>
          <option value="basic">기본형</option>
          <option value="cloze">빈칸 채우기</option>
          <option value="mcq">객관식</option>
          <option value="numeric">숫자 입력</option>
          <option value="procedure">절차형</option>
        </select>
      </div>

      {/* Card Count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        총 {filteredCards.length}개 카드 {searchQuery && `(검색: "${searchQuery}")`}
      </p>

      {/* Card List */}
      <div className="space-y-3">
        {filteredCards.map((card) => {
          const isEditing = editingCardId === card.id;
          const isExpanded = expandedCards.has(card.id);
          const editableCard = isEditing ? { ...card, ...pendingUpdates } : card;

          return (
            <div
              key={card.id}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-xl border transition-all',
                isEditing
                  ? 'border-orange-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              {isEditing ? (
                <CardTypeEditor
                  card={editableCard}
                  onUpdate={handleUpdatePending}
                  onSave={handleSave}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <>
                  {/* Card Header */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() => toggleExpand(card.id)}
                  >
                    <span className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                      card.cardType === 'mcq' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                      card.cardType === 'numeric' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                      card.cardType === 'procedure' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    )}>
                      {CARD_TYPE_ICONS[card.cardType]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white font-medium truncate">
                        {card.front.substring(0, 60)}{card.front.length > 60 ? '...' : ''}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {CARD_TYPE_LABELS[card.cardType]} •
                        {card.state === 'new' ? ' 새 카드' :
                         card.state === 'learning' ? ' 학습 중' :
                         card.state === 'review' ? ' 복습' : ' 재학습'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(card);
                        }}
                        className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                        title="편집"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(card.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                      {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            질문
                          </span>
                          <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">
                            {card.front}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            답변
                          </span>
                          <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {card.back || '-'}
                          </p>
                        </div>
                      </div>

                      {/* MCQ Choices */}
                      {card.cardType === 'mcq' && card.choices && (
                        <div className="mt-4">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            보기
                          </span>
                          <ul className="mt-2 space-y-1">
                            {card.choices.map((choice, idx) => (
                              <li
                                key={choice.id}
                                className={cn(
                                  'flex items-center gap-2 text-sm',
                                  choice.isCorrect ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                                )}
                              >
                                <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                {choice.text}
                                {choice.isCorrect && ' ✓'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Numeric Answer */}
                      {card.cardType === 'numeric' && card.answerKey && (
                        <div className="mt-4">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            정답
                          </span>
                          <p className="mt-1 text-green-600 dark:text-green-400 font-mono font-medium">
                            {card.answerKey}
                          </p>
                        </div>
                      )}

                      {/* Procedure Steps */}
                      {card.cardType === 'procedure' && card.steps && (
                        <div className="mt-4">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            단계
                          </span>
                          <ol className="mt-2 space-y-2">
                            {card.steps.map((step) => (
                              <li key={step.order} className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center text-sm font-medium">
                                  {step.order}
                                </span>
                                <div>
                                  <p className="text-gray-900 dark:text-white">{step.content}</p>
                                  {step.hint && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">힌트: {step.hint}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>난이도: {(card.difficulty * 100).toFixed(0)}%</span>
                        <span>안정성: {card.stability.toFixed(1)}일</span>
                        <span>복습 횟수: {card.reps}</span>
                        <span>실패 횟수: {card.lapses}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchQuery ? '검색 결과가 없습니다.' : '카드가 없습니다.'}
        </div>
      )}
    </div>
  );
}
