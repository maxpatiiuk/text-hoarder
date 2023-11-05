import { useMedia } from '../../../common/src/hooks/useMedia';
import { useStorage } from './useStorage';

export function useDarkMode(): boolean {
  const [theme] = useStorage('ui.theme');
  const media = useMedia('(prefers-color-scheme: dark)');
  return theme === 'system' ? media : theme === 'dark';
}
