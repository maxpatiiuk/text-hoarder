import React from 'react';
import { documentToSimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { readerText } from '../../localization/readerText';
import { H1 } from '../Atoms';
import { Tools } from './Tools';

export function Dialog(): JSX.Element {
  const simpleDocument = React.useMemo(() => documentToSimpleDocument(), []);
  return (
    <div
      className="flex flex-col gap-4 p-4 md:p-16"
      lang={simpleDocument?.lang}
      dir={simpleDocument?.dir}
    >
      {simpleDocument === undefined ? (
        <p>{readerText.noContentFound}</p>
      ) : (
        <>
          <Tools simpleDocument={simpleDocument} />
          <H1>{simpleDocument.title ?? document.title}</H1>
          <Content node={simpleDocument.content} />
        </>
      )}
    </div>
  );
}

function Content({ node }: { readonly node: HTMLElement }): JSX.Element {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const clone = node.cloneNode(true) as Element;
    containerRef.current?.append(clone);
    return (): void => clone.remove();
  }, [node]);
  return <div className="markdown-body" ref={containerRef} />;
}
