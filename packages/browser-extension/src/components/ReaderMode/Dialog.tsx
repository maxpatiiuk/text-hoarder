import React from 'react';
import { SimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { readerText } from '../../localization/readerText';
import { H1 } from '../Atoms';
import { Tools } from './Tools';
import { useStorage } from '../../hooks/useStorage';
import { usePageStyle } from '../Preferences/usePageStyle';

/** Apply github-markdown-css styles */
const markdownBody = 'markdown-body';

export function Dialog({
  simpleDocument,
}: {
  readonly simpleDocument: SimpleDocument | undefined;
}): JSX.Element {
  const [allowScrollPastLastLine] = useStorage(
    'reader.allowScrollPastLastLine',
  );
  const { style, customCss } = usePageStyle();
  return (
    <>
      {typeof simpleDocument === 'object' && (
        <Tools
          simpleDocument={simpleDocument}
          /*
           * I don't want this element to be affected by markdownBody styles
           * (breaks Link.Info) but do want user styles
           */
          style={style}
        />
      )}
      <div
        className={`flex flex-col gap-4 p-4 md:p-16 ${markdownBody}`}
        lang={simpleDocument?.lang}
        dir={simpleDocument?.dir}
        // Setting these as style attribute to override markdownBody styles
        style={{
          ...style,
          fontFamily:
            style.fontFamily === 'sans-serif'
              ? /* default */ undefined
              : style.fontFamily,
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
        {customCss}
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
