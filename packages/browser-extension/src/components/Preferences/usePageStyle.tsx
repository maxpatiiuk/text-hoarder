import React from 'react';
import { useStorage } from '../../hooks/useStorage';

export function usePageStyle(): {
  readonly style: React.CSSProperties;
  readonly customCss: JSX.Element;
} {
  const [fontSize] = useStorage('reader.fontSize');
  const [lineHeight] = useStorage('reader.lineHeight');
  const [pageWidth] = useStorage('reader.pageWidth');
  const [customCss] = useStorage('reader.customCss');
  const [fontFamily] = useStorage('reader.fontFamily');
  const [fontWeight] = useStorage('reader.fontWeight');
  return {
    style: {
      /*
       * Can't use rem because we don't control the root element styles
       * All children use em, which is affected by this px value
       */
      fontSize: `${fontSize}px`,
      fontWeight,
      lineHeight,
      maxWidth: `${pageWidth}em`,
      fontFamily,
    } as const,
    customCss: <style dangerouslySetInnerHTML={{ __html: customCss }} />,
  };
}
