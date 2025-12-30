'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Card, Choice } from '@/lib/db';
import { Check, X, Tag, ArrowRight } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MCQCardProps {
  card: Card;
  onAnswer: (isCorrect: boolean, selectedChoiceId: string) => void;
  onRequestErrorTag?: () => void;
  disabled?: boolean;
}

export function MCQCard({ card, onAnswer, onRequestErrorTag, disabled = false }: MCQCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [hasCalledOnAnswer, setHasCalledOnAnswer] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState<Choice[]>(() => {
    // Shuffle choices on initial render
    const choices = [...(card.choices || [])];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
  });

  const handleSelect = useCallback((choiceId: string) => {
    if (isAnswered || disabled) return;
    setSelectedId(choiceId);
  }, [isAnswered, disabled]);

  const handleConfirm = useCallback(() => {
    if (!selectedId || isAnswered || disabled) return;
    setIsAnswered(true);
  }, [selectedId, isAnswered, disabled]);

  // Called when user clicks "Next" button after reviewing the result
  const handleNext = useCallback(() => {
    if (!selectedId || hasCalledOnAnswer) return;

    setHasCalledOnAnswer(true);
    const selectedChoice = shuffledChoices.find(c => c.id === selectedId);
    const isCorrect = selectedChoice?.isCorrect || false;
    onAnswer(isCorrect, selectedId);
  }, [selectedId, hasCalledOnAnswer, shuffledChoices, onAnswer]);

  const isCorrectAnswer = shuffledChoices.find(c => c.id === selectedId)?.isCorrect || false;

  const getChoiceStyle = (choice: Choice) => {
    if (!isAnswered) {
      return selectedId === choice.id
        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600';
    }

    // After answering
    if (choice.isCorrect) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    }
    if (selectedId === choice.id && !choice.isCorrect) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }
    return 'border-gray-200 dark:border-gray-700 opacity-50';
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Question */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-4">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
          Question
        </span>
        <p className="text-lg text-gray-900 dark:text-white whitespace-pre-wrap">
          {card.front}
        </p>
      </div>

      {/* Choices */}
      <div className="space-y-3">
        {shuffledChoices.map((choice, index) => (
          <button
            key={choice.id}
            onClick={() => handleSelect(choice.id)}
            disabled={isAnswered || disabled}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
              getChoiceStyle(choice),
              !isAnswered && !disabled && 'cursor-pointer'
            )}
          >
            <span className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              selectedId === choice.id && !isAnswered
                ? 'bg-orange-500 text-white'
                : isAnswered && choice.isCorrect
                  ? 'bg-green-500 text-white'
                  : isAnswered && selectedId === choice.id && !choice.isCorrect
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}>
              {isAnswered && choice.isCorrect ? (
                <Check size={16} />
              ) : isAnswered && selectedId === choice.id && !choice.isCorrect ? (
                <X size={16} />
              ) : (
                String.fromCharCode(65 + index)
              )}
            </span>
            <span className={cn(
              'flex-1',
              isAnswered && choice.isCorrect
                ? 'text-green-700 dark:text-green-400 font-medium'
                : isAnswered && selectedId === choice.id && !choice.isCorrect
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
            )}>
              {choice.text}
            </span>
          </button>
        ))}
      </div>

      {/* Confirm Button */}
      {!isAnswered && (
        <button
          onClick={handleConfirm}
          disabled={!selectedId || disabled}
          className={cn(
            'w-full mt-4 py-3 rounded-xl font-semibold transition-colors',
            selectedId && !disabled
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          )}
        >
          Confirm Answer
        </button>
      )}

      {/* Result message */}
      {isAnswered && (
        <div className={cn(
          'mt-4 p-4 rounded-xl text-center font-medium',
          isCorrectAnswer
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        )}>
          {isCorrectAnswer
            ? '정답입니다!'
            : '틀렸습니다. 정답을 확인하세요.'}
        </div>
      )}

      {/* Explanation after answer */}
      {isAnswered && card.back && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Explanation
          </span>
          <div className="mt-2">
            <MarkdownRenderer content={card.back} />
          </div>
        </div>
      )}

      {/* Action buttons after answer */}
      {isAnswered && !hasCalledOnAnswer && (
        <div className="mt-4 flex gap-3">
          {/* Error tag button - only show for incorrect answers */}
          {!isCorrectAnswer && onRequestErrorTag && (
            <button
              onClick={onRequestErrorTag}
              className="flex-1 py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <Tag size={18} />
              오류 유형 기록
            </button>
          )}
          {/* Next button */}
          <button
            onClick={handleNext}
            className={cn(
              'py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2',
              isCorrectAnswer
                ? 'flex-1 bg-green-500 hover:bg-green-600 text-white'
                : onRequestErrorTag
                  ? 'flex-1 bg-orange-500 hover:bg-orange-600 text-white'
                  : 'flex-1 bg-orange-500 hover:bg-orange-600 text-white'
            )}
          >
            다음
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
