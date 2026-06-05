import { type ClassValue, clsx } from 'clsx';

/**
 * 合并 Tailwind CSS 类名
 * 结合 clsx 简化条件类名拼接
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
