'use client';

import { cn } from '@/lib/utils/cn';
import { getIntimacyInfo } from '@/types/chat';

interface IntimacyBarProps {
  score: number;
  className?: string;
}

const LEVEL_COLORS = [
  'bg-gray-500',      // 0 - 陌生人
  'bg-gray-400',      // 1 - 初识
  'bg-blue-400',      // 2 - 熟悉
  'bg-blue-500',      // 3 - 朋友
  'bg-green-400',     // 4 - 好友
  'bg-green-500',     // 5 - 知己
  'bg-yellow-400',    // 6 - 亲密
  'bg-yellow-500',    // 7 - 挚友
  'bg-orange-400',    // 8 - 恋人
  'bg-pink-400',      // 9 - 灵魂伴侣
  'bg-pink-500',      // 10 - 永恒
];

export function IntimacyBar({ score, className }: IntimacyBarProps) {
  const info = getIntimacyInfo(score);
  const progress = Math.min((score / info.nextLevelScore) * 100, 100);
  const color = LEVEL_COLORS[info.level] ?? LEVEL_COLORS[0];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* 爱心图标和等级 */}
      <div className="flex items-center gap-1.5">
        <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="text-xs font-medium text-gray-300">
          Lv.{info.level}
        </span>
      </div>

      {/* 进度条 */}
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', color)}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 关系名称 */}
      <span className="text-xs text-gray-400 whitespace-nowrap min-w-[48px] text-right">
        {info.title}
      </span>
    </div>
  );
}
