import React from 'react';
import { documentToSimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { readerText } from '../../localization/readerText';
import { H1 } from '../Atoms';
import { Tools } from './Tools';
import { useStorage } from '../../hooks/useStorage';

/** Apply github-markdown-css styles */
const markdownBody = 'markdown-body';

export function Dialog(): JSX.Element {
  const simpleDocument = React.useMemo(() => documentToSimpleDocument(), []);
  const [allowScrollPastLastLine] = useStorage(
    'reader.allowScrollPastLastLine',
  );
  const [fontSize] = useStorage('reader.fontSize');
  const [lineHeight] = useStorage('reader.lineHeight');
  const [pageWidth] = useStorage('reader.pageWidth');
  const [customCss] = useStorage('reader.customCss');
  const [fontFamily] = useStorage('reader.fontFamily');

  return (
    <>
      {typeof simpleDocument === 'object' && (
        <Tools simpleDocument={simpleDocument} />
      )}
      <div
        className={`flex flex-col gap-4 p-4 md:p-16 ${markdownBody}`}
        lang={simpleDocument?.lang}
        dir={simpleDocument?.dir}
        style={{
          /*
           * Can't use rem because we don't control the root element styles
           * All children use em, which is affected by this px value
           */
          fontSize: `${fontSize}px`,
          lineHeight,
          maxWidth: `${pageWidth}em`,
          fontFamily:
            fontFamily === 'sans-serif' ? /* default */ undefined : fontFamily,
        }}
      >
        {simpleDocument === undefined ? (
          <p>{readerText.noContentFound}</p>
        ) : (
          <>
            <H1>{simpleDocument.title ?? document.title}</H1>
            <Content node={simpleDocument.content} />
            {allowScrollPastLastLine && <div className="min-h-full" />}
          </>
        )}
        <style dangerouslySetInnerHTML={{ __html: customCss }} />
      </div>
    </>
  );
}

function Content({ node }: { readonly node: HTMLElement }): JSX.Element {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const clone = node.cloneNode(true) as Element;
    containerRef.current?.append(clone);
    return (): void => clone.remove();
  }, [node]);
  return <div className="contents" ref={containerRef} />;
}
