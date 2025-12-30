'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ErrorTag } from '@/lib/db';
import { X, AlertCircle, Brain, Calculator, Clock, ListOrdered, HelpCircle } from 'lucide-react';

interface ErrorTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tag: ErrorTag) => void;
  cardFront?: string;
}

const ERROR_TAG_OPTIONS: { value: ErrorTag; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'careless',
    label: '부주의',
    icon: <AlertCircle size={24} />,
    description: '문제를 잘못 읽었거나 실수로 틀림'
  },
  {
    value: 'concept',
    label: '개념 미숙',
    icon: <Brain size={24} />,
    description: '개념을 이해하지 못해서 틀림'
  },
  {
    value: 'calculation',
    label: '계산 실수',
    icon: <Calculator size={24} />,
    description: '계산 과정에서 실수함'
  },
  {
    value: 'memory',
    label: '암기 부족',
    icon: <Clock size={24} />,
    description: '공식이나 사실을 기억하지 못함'
  },
  {
    value: 'procedure',
    label: '절차 오류',
    icon: <ListOrdered size={24} />,
    description: '풀이 순서나 과정을 틀림'
  },
  {
    value: 'other',
    label: '기타',
    icon: <HelpCircle size={24} />,
    description: '그 외의 이유'
  },
];

export function ErrorTagModal({ isOpen, onClose, onSelect, cardFront }: ErrorTagModalProps) {
  const [selectedTag, setSelectedTag] = useState<ErrorTag | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedTag) {
      onSelect(selectedTag);
      setSelectedTag(null);
    }
  };

  const handleSkip = () => {
    onClose();
    setSelectedTag(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            오답 원인 분석
          </h2>
          <button
            onClick={handleSkip}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Question preview */}
        {cardFront && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {cardFront}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            틀린 이유를 선택하면 취약점 분석에 도움이 됩니다.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {ERROR_TAG_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedTag(option.value)}
                className={cn(
                  'flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center',
                  selectedTag === option.value
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <span className={cn(
                  'mb-2',
                  selectedTag === option.value ? 'text-orange-500' : 'text-gray-400'
                )}>
                  {option.icon}
                </span>
                <span className={cn(
                  'text-sm font-medium',
                  selectedTag === option.value ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'
                )}>
                  {option.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSkip}
            className="flex-1 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            건너뛰기
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTag}
            className={cn(
              'flex-1 py-2.5 font-semibold rounded-xl transition-colors',
              selectedTag
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
