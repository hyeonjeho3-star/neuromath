'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Card } from '@/lib/db';
import { Check, X } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface NumericCardProps {
  card: Card;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
  disabled?: boolean;
}

// Parse numeric value handling fractions like "1/2"
function parseNumericValue(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Handle fractions
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0].trim());
      const denominator = parseFloat(parts[1].trim());
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
    return null;
  }

  // Handle regular numbers
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
}

// Compare two numeric values with tolerance
function compareNumeric(userValue: number, answerValue: number, tolerance: number = 0.0001): boolean {
  return Math.abs(userValue - answerValue) <= tolerance;
}

export function NumericCard({ card, onAnswer, disabled = false }: NumericCardProps) {
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = useCallback(() => {
    if (isAnswered || disabled || !userInput.trim()) return;

    const userValue = parseNumericValue(userInput);
    const answerValue = parseNumericValue(card.answerKey || '');

    if (userValue === null || answerValue === null) {
      // Invalid input
      setIsAnswered(true);
      setIsCorrect(false);
      setTimeout(() => {
        onAnswer(false, userInput);
      }, 1500);
      return;
    }

    const correct = compareNumeric(userValue, answerValue);
    setIsAnswered(true);
    setIsCorrect(correct);

    setTimeout(() => {
      onAnswer(correct, userInput);
    }, 1500);
  }, [isAnswered, disabled, userInput, card.answerKey, onAnswer]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

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

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          답을 입력하세요
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAnswered || disabled}
            placeholder="숫자, 소수, 분수(1/2) 입력 가능"
            className={cn(
              'w-full px-4 py-3 pr-12 rounded-lg border-2 text-lg font-mono transition-colors',
              isAnswered
                ? isCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
            )}
          />
          {isAnswered && (
            <span className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center',
              isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            )}>
              {isCorrect ? <Check size={18} /> : <X size={18} />}
            </span>
          )}
        </div>

        {/* Submit button */}
        {!isAnswered && (
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim() || disabled}
            className={cn(
              'w-full mt-4 py-3 rounded-xl font-semibold transition-colors',
              userInput.trim() && !disabled
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
                ? '정답입니다!'
                : (
                  <div>
                    <p>틀렸습니다.</p>
                    <p className="mt-1 text-sm">정답: <span className="font-mono font-bold">{card.answerKey}</span></p>
                  </div>
                )}
            </div>

            {/* Explanation */}
            {card.back && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Explanation
                </span>
                <div className="mt-2">
                  <MarkdownRenderer content={card.back} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
