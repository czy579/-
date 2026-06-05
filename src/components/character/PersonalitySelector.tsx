'use client';

import { cn } from '@/lib/utils/cn';
import { PERSONALITY_OPTIONS } from '@/types/character';
import type { PersonalityType } from '@/types/database';

interface PersonalitySelectorProps {
  value: PersonalityType | null;
  onChange: (value: PersonalityType) => void;
}

export function PersonalitySelector({ value, onChange }: PersonalitySelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {PERSONALITY_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'relative p-4 rounded-xl border text-left transition-all duration-200',
              'hover:scale-[1.02] active:scale-[0.98]',
              isSelected
                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20',
            )}
          >
            <div className="text-2xl mb-2">{option.emoji}</div>
            <div
              className={cn(
                'text-sm font-medium mb-1',
                isSelected ? 'text-white' : 'text-gray-300',
              )}
            >
              {option.label}
            </div>
            <div className="text-xs text-gray-500 leading-relaxed">
              {option.description}
            </div>

            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
