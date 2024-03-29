import React from 'react';
import { SimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { readerText } from '@common/localization/readerText';
import { ErrorMessage, H1 } from '@common/components/Atoms';
import { Tools } from './Tools';
import { useStorage } from '../../hooks/useStorage';
import { usePageStyle } from '../Preferences/usePageStyle';
import { useReducedMotion } from '@common/hooks/useReduceMotion';
import { listenToAnchors } from './anchors';
import { ActivateExtension } from '../Background/messages';

/** Apply github-markdown-css styles */
const markdownBody = 'markdown-body';

export function Dialog({
  simpleDocument,
  onRestoreScroll: handleRestoreScroll,
  activatedReason,
}: {
  readonly simpleDocument: SimpleDocument | string | undefined;
  readonly onRestoreScroll: (
    containerElement: Element,
    mode: 'smooth' | 'instant' | 'none',
  ) => void;
  readonly activatedReason: ActivateExtension['action'];
}): JSX.Element {
  const [allowScrollPastLastLine] = useStorage(
    'reader.allowScrollPastLastLine',
  );
  const { style, customCss } = usePageStyle();
  const { maxWidth, fontFamily, ...restStyles } = style;

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
          activatedReason={activatedReason}
        />
      )}
      <div
        className={`flex flex-col gap-4 p-4 md:p-16 print:!p-0 h-max w-full items-center ${markdownBody}`}
        lang={
          typeof simpleDocument === 'object' ? simpleDocument.lang : undefined
        }
        dir={
          typeof simpleDocument === 'object' ? simpleDocument.dir : undefined
        }
        // Setting these as style attribute to override markdownBody styles
        style={{
          ...restStyles,
          fontFamily:
            fontFamily === 'sans-serif' ? /* default */ undefined : fontFamily,
        }}
      >
        <div
          style={{
            // Have to apply this style to element below the container so that container is full width so that it's background is full width
            maxWidth,
          }}
        >
          {simpleDocument === undefined ? (
            <p>{readerText.noContentFound}</p>
          ) : typeof simpleDocument === 'string' ? (
            <ErrorMessage>{simpleDocument}</ErrorMessage>
          ) : (
            <>
              <H1>{simpleDocument.title ?? document.title}</H1>
              <Content
                node={simpleDocument.content}
                onRestoreScroll={handleRestoreScroll}
              />
              {allowScrollPastLastLine && <div className="h-[80vh]" />}
            </>
          )}
        </div>
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
    clone.classList.add('contents');

    containerRef.current?.append(clone);

    const anchorCleanUp = listenToAnchors(clone);

    handleRestoreScroll(containerRef.current!, restoreScrollMode);

    return (): void => {
      anchorCleanUp();
      clone.remove();
    };
  }, [node, handleRestoreScroll]);

  return <div ref={containerRef} />;
}
