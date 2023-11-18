import React from 'react';
import { useMedia } from './useMedia';

export function useReducedMotion(): boolean {
  return useMedia('(prefers-reduced-motion: reduce)');
}

const defaultTransitionDuration = 100;

export function useTransitionDuration(): number {
  const reduceMotion = useReducedMotion();
  return React.useMemo(
    () => (reduceMotion ? 0 : defaultTransitionDuration),
    [reduceMotion],
  );
}
