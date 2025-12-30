'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  type Card,
  type CardType,
  type AnswerType,
  type Choice,
  type Step,
  generateId
} from '@/lib/db';
import {
  FileText,
  List,
  Calculator,
  ListOrdered,
  Plus,
  Trash2,
  GripVertical,
  Check
} from 'lucide-react';

interface CardTypeEditorProps {
  card: Card;
  onUpdate: (updates: Partial<Card>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const CARD_TYPE_OPTIONS: { value: CardType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'basic', label: '기본형', icon: <FileText size={20} />, description: '질문과 답변' },
  { value: 'cloze', label: '빈칸 채우기', icon: <FileText size={20} />, description: '텍스트에서 빈칸 채우기' },
  { value: 'mcq', label: '객관식', icon: <List size={20} />, description: '보기 중 선택' },
  { value: 'numeric', label: '숫자 입력', icon: <Calculator size={20} />, description: '정확한 숫자 입력' },
  { value: 'procedure', label: '절차형', icon: <ListOrdered size={20} />, description: '순서대로 단계 배열' },
];

const ANSWER_TYPE_OPTIONS: { value: AnswerType; label: string }[] = [
  { value: 'text', label: '텍스트' },
  { value: 'number', label: '숫자' },
  { value: 'choice', label: '선택' },
  { value: 'ordered-steps', label: '순서 정렬' },
];

export function CardTypeEditor({ card, onUpdate, onSave, onCancel }: CardTypeEditorProps) {
  const [localCard, setLocalCard] = useState(card);

  const handleCardTypeChange = useCallback((cardType: CardType) => {
    let answerType: AnswerType = 'text';
    let choices: Choice[] | undefined = undefined;
    let steps: Step[] | undefined = undefined;
    let answerKey: string | undefined = undefined;

    switch (cardType) {
      case 'mcq':
        answerType = 'choice';
        choices = [
          { id: generateId(), text: '', isCorrect: true },
          { id: generateId(), text: '', isCorrect: false },
          { id: generateId(), text: '', isCorrect: false },
          { id: generateId(), text: '', isCorrect: false },
        ];
        break;
      case 'numeric':
        answerType = 'number';
        answerKey = '';
        break;
      case 'procedure':
        answerType = 'ordered-steps';
        steps = [
          { order: 1, content: '', hint: '' },
          { order: 2, content: '', hint: '' },
        ];
        break;
      case 'cloze':
      case 'basic':
      default:
        answerType = 'text';
        break;
    }

    const updates = { cardType, answerType, choices, steps, answerKey };
    setLocalCard(prev => ({ ...prev, ...updates }));
    onUpdate(updates);
  }, [onUpdate]);

  const handleChoiceChange = useCallback((index: number, field: keyof Choice, value: string | boolean) => {
    const newChoices = [...(localCard.choices || [])];
    if (field === 'isCorrect' && value === true) {
      // Only one correct answer
      newChoices.forEach((c, i) => {
        c.isCorrect = i === index;
      });
    } else {
      (newChoices[index] as any)[field] = value;
    }
    setLocalCard(prev => ({ ...prev, choices: newChoices }));
    onUpdate({ choices: newChoices });
  }, [localCard.choices, onUpdate]);

  const addChoice = useCallback(() => {
    const newChoices = [...(localCard.choices || []), { id: generateId(), text: '', isCorrect: false }];
    setLocalCard(prev => ({ ...prev, choices: newChoices }));
    onUpdate({ choices: newChoices });
  }, [localCard.choices, onUpdate]);

  const removeChoice = useCallback((index: number) => {
    const newChoices = (localCard.choices || []).filter((_, i) => i !== index);
    setLocalCard(prev => ({ ...prev, choices: newChoices }));
    onUpdate({ choices: newChoices });
  }, [localCard.choices, onUpdate]);

  const handleStepChange = useCallback((index: number, field: keyof Step, value: string | number) => {
    const newSteps = [...(localCard.steps || [])];
    (newSteps[index] as any)[field] = value;
    setLocalCard(prev => ({ ...prev, steps: newSteps }));
    onUpdate({ steps: newSteps });
  }, [localCard.steps, onUpdate]);

  const addStep = useCallback(() => {
    const newSteps = [...(localCard.steps || []), { order: (localCard.steps?.length || 0) + 1, content: '', hint: '' }];
    setLocalCard(prev => ({ ...prev, steps: newSteps }));
    onUpdate({ steps: newSteps });
  }, [localCard.steps, onUpdate]);

  const removeStep = useCallback((index: number) => {
    const newSteps = (localCard.steps || []).filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }));
    setLocalCard(prev => ({ ...prev, steps: newSteps }));
    onUpdate({ steps: newSteps });
  }, [localCard.steps, onUpdate]);

  const handleAnswerKeyChange = useCallback((value: string) => {
    setLocalCard(prev => ({ ...prev, answerKey: value }));
    onUpdate({ answerKey: value });
  }, [onUpdate]);

  const handleFrontChange = useCallback((value: string) => {
    setLocalCard(prev => ({ ...prev, front: value }));
    onUpdate({ front: value });
  }, [onUpdate]);

  const handleBackChange = useCallback((value: string) => {
    setLocalCard(prev => ({ ...prev, back: value }));
    onUpdate({ back: value });
  }, [onUpdate]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Card Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          카드 타입
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {CARD_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleCardTypeChange(option.value)}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg border-2 transition-all',
                localCard.cardType === option.value
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <span className={cn(
                'mb-1',
                localCard.cardType === option.value ? 'text-orange-500' : 'text-gray-400'
              )}>
                {option.icon}
              </span>
              <span className={cn(
                'text-sm font-medium',
                localCard.cardType === option.value ? 'text-orange-500' : 'text-gray-600 dark:text-gray-400'
              )}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Front (Question) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          질문 (앞면)
        </label>
        <textarea
          value={localCard.front}
          onChange={(e) => handleFrontChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="질문을 입력하세요..."
        />
      </div>

      {/* Back (Answer) - for basic and cloze */}
      {(localCard.cardType === 'basic' || localCard.cardType === 'cloze') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            답변/설명 (뒷면)
          </label>
          <textarea
            value={localCard.back}
            onChange={(e) => handleBackChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="답변 또는 설명을 입력하세요..."
          />
        </div>
      )}

      {/* MCQ Choices */}
      {localCard.cardType === 'mcq' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            보기 (정답에 체크)
          </label>
          <div className="space-y-3">
            {localCard.choices?.map((choice, index) => (
              <div key={choice.id} className="flex items-center gap-3">
                <button
                  onClick={() => handleChoiceChange(index, 'isCorrect', true)}
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    choice.isCorrect
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                  )}
                >
                  {choice.isCorrect && <Check size={14} />}
                </button>
                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={`보기 ${index + 1}`}
                />
                {(localCard.choices?.length || 0) > 2 && (
                  <button
                    onClick={() => removeChoice(index)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            {(localCard.choices?.length || 0) < 6 && (
              <button
                onClick={addChoice}
                className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                <Plus size={18} />
                보기 추가
              </button>
            )}
          </div>
        </div>
      )}

      {/* Numeric Answer */}
      {localCard.cardType === 'numeric' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            정답 (숫자)
          </label>
          <input
            type="text"
            value={localCard.answerKey || ''}
            onChange={(e) => handleAnswerKeyChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="정답 숫자를 입력하세요 (예: 42, 3.14, -7)"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            소수점, 음수, 분수(1/2 형식) 모두 지원됩니다.
          </p>
        </div>
      )}

      {/* Procedure Steps */}
      {localCard.cardType === 'procedure' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            절차 단계 (올바른 순서대로 입력)
          </label>
          <div className="space-y-3">
            {localCard.steps?.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center font-medium">
                  {step.order}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={step.content}
                    onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`단계 ${step.order} 내용`}
                  />
                  <input
                    type="text"
                    value={step.hint || ''}
                    onChange={(e) => handleStepChange(index, 'hint', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="힌트 (선택사항)"
                  />
                </div>
                {(localCard.steps?.length || 0) > 2 && (
                  <button
                    onClick={() => removeStep(index)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addStep}
              className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              <Plus size={18} />
              단계 추가
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
        >
          취소
        </button>
        <button
          onClick={onSave}
          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          저장
        </button>
      </div>
    </div>
  );
}
