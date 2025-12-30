'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Card, Step } from '@/lib/db';
import { Check, X, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';

interface ProcedureCardProps {
  card: Card;
  onAnswer: (isCorrect: boolean, userOrder: number[]) => void;
  disabled?: boolean;
}

export function ProcedureCard({ card, onAnswer, disabled = false }: ProcedureCardProps) {
  // Shuffle steps on initial render
  const [userSteps, setUserSteps] = useState<Step[]>(() => {
    const steps = [...(card.steps || [])];
    for (let i = steps.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [steps[i], steps[j]] = [steps[j], steps[i]];
    }
    return steps;
  });

  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHints, setShowHints] = useState<Set<number>>(new Set());

  const moveStep = useCallback((index: number, direction: 'up' | 'down') => {
    if (isAnswered || disabled) return;

    const newSteps = [...userSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setUserSteps(newSteps);
  }, [userSteps, isAnswered, disabled]);

  const toggleHint = useCallback((stepOrder: number) => {
    setShowHints(prev => {
      const next = new Set(prev);
      if (next.has(stepOrder)) {
        next.delete(stepOrder);
      } else {
        next.add(stepOrder);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (isAnswered || disabled) return;

    // Check if order is correct
    const isOrderCorrect = userSteps.every((step, index) => step.order === index + 1);
    setIsAnswered(true);
    setIsCorrect(isOrderCorrect);

    const userOrder = userSteps.map(s => s.order);

    setTimeout(() => {
      onAnswer(isOrderCorrect, userOrder);
    }, 2000);
  }, [userSteps, isAnswered, disabled, onAnswer]);

  const getStepStyle = (step: Step, index: number) => {
    if (!isAnswered) {
      return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    }

    // After answering
    const correctIndex = step.order - 1;
    if (index === correctIndex) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    }
    return 'border-red-500 bg-red-50 dark:bg-red-900/20';
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
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          아래 단계들을 올바른 순서로 배열하세요
        </p>
      </div>

      {/* Steps to arrange */}
      <div className="space-y-2">
        {userSteps.map((step, index) => (
          <div
            key={step.order}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border-2 transition-all',
              getStepStyle(step, index)
            )}
          >
            {/* Position indicator */}
            <span className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
              isAnswered
                ? index === step.order - 1
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
            )}>
              {isAnswered && index !== step.order - 1 ? (
                <X size={16} />
              ) : isAnswered ? (
                <Check size={16} />
              ) : (
                index + 1
              )}
            </span>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-gray-900 dark:text-white',
                isAnswered && index !== step.order - 1 && 'line-through opacity-60'
              )}>
                {step.content}
              </p>

              {/* Hint */}
              {step.hint && (
                <button
                  onClick={() => toggleHint(step.order)}
                  className="mt-1 flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors"
                >
                  <HelpCircle size={14} />
                  {showHints.has(step.order) ? 'Hide hint' : 'Show hint'}
                </button>
              )}
              {showHints.has(step.order) && step.hint && (
                <p className="mt-1 text-sm text-orange-600 dark:text-orange-400 italic">
                  {step.hint}
                </p>
              )}

              {/* Show correct position after answer */}
              {isAnswered && index !== step.order - 1 && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Correct position: {step.order}
                </p>
              )}
            </div>

            {/* Move buttons */}
            {!isAnswered && !disabled && (
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveStep(index, 'up')}
                  disabled={index === 0}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    index === 0
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                  )}
                >
                  <ArrowUp size={18} />
                </button>
                <button
                  onClick={() => moveStep(index, 'down')}
                  disabled={index === userSteps.length - 1}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    index === userSteps.length - 1
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                  )}
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit button */}
      {!isAnswered && (
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className={cn(
            'w-full mt-4 py-3 rounded-xl font-semibold transition-colors',
            !disabled
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          )}
        >
          정답 확인
        </button>
      )}

      {/* Result */}
      {isAnswered && (
        <>
          <div className={cn(
            'mt-4 p-4 rounded-xl text-center font-medium',
            isCorrect
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          )}>
            {isCorrect
              ? '정답입니다! 올바른 순서로 배열했습니다.'
              : '틀렸습니다. 올바른 순서를 확인하세요.'}
          </div>

          {/* Show correct order if wrong */}
          {!isCorrect && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Correct Order
              </span>
              <ol className="mt-2 space-y-2">
                {(card.steps || [])
                  .sort((a, b) => a.order - b.order)
                  .map((step) => (
                    <li key={step.order} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                        {step.order}
                      </span>
                      {step.content}
                    </li>
                  ))}
              </ol>
            </div>
          )}

          {/* Explanation */}
          {card.back && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Explanation
              </span>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {card.back}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
