import { useMedia } from './useMedia';

export function useReducedMotion(): boolean {
  return useMedia('(prefers-reduced-motion: reduce)');
}
