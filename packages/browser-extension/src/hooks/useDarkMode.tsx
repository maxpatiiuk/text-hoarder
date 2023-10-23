import { useMedia } from './useMedia';
import { useStorage } from './useStorage';

export function useDarkMode(): boolean {
  const [theme] = useStorage('theme');
  const media = useMedia('(prefers-color-scheme: dark)');
  return theme === 'system' ? media : theme === 'dark';
}
