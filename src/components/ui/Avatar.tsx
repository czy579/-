'use client';

import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export function Avatar({ src, alt, size = 'md', className, fallback }: AvatarProps) {
  const initials = fallback || alt.slice(0, 2).toUpperCase();

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizeClasses[size], className)}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium flex-shrink-0',
        'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
        sizeClasses[size],
        className,
      )}
      aria-label={alt}
    >
      {initials}
    </div>
  );
}
