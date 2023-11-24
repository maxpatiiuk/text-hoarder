import React from 'react';
import { SimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { readerText } from '@common/localization/readerText';
import { H1 } from '@common/components/Atoms';
import { Tools } from './Tools';
import { useStorage } from '../../hooks/useStorage';
import { usePageStyle } from '../Preferences/usePageStyle';
import { useReducedMotion } from '@common/hooks/useReduceMotion';
import { listenToAnchors } from './anchors';

/** Apply github-markdown-css styles */
const markdownBody = 'markdown-body';

export function Dialog({
  simpleDocument,
  onRestoreScroll: handleRestoreScroll,
}: {
  readonly simpleDocument: SimpleDocument | undefined;
  readonly onRestoreScroll: (
    containerElement: Element,
    mode: 'smooth' | 'instant' | 'none',
  ) => void;
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
            <Content
              node={simpleDocument.content}
              onRestoreScroll={handleRestoreScroll}
            />
            {allowScrollPastLastLine && <div className="min-h-full" />}
          </>
        )}
        {customCss}
      </div>
    </>
  );
}

function Content({
  node,
  onRestoreScroll: handleRestoreScroll,
}: {
  readonly node: HTMLElement;
  readonly onRestoreScroll: (
    containerElement: Element,
    mode: 'smooth' | 'instant' | 'none',
  ) => void;
}): JSX.Element {
  const [restoreScrollPosition] = useStorage('reader.restoreScrollPosition');
  const reduceMotion = useReducedMotion();
  const restoreScrollMode =
    restoreScrollPosition === 'auto'
      ? reduceMotion
        ? 'instant'
        : 'smooth'
      : restoreScrollPosition;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const clone = node.cloneNode(true) as HTMLElement;
    containerRef.current?.append(clone);

    const anchorCleanUp = listenToAnchors(clone);

    handleRestoreScroll(containerRef.current!, restoreScrollMode);

    return (): void => {
      anchorCleanUp();
      clone.remove();
    };
  }, [node, handleRestoreScroll]);

  return <div className="contents" ref={containerRef} />;
}
