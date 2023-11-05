import { SimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { markdownToText } from '../ExtractContent/markdownToText';
import { simpleDocumentToMarkdown } from '../ExtractContent/simpleDocumentToMarkdown';
import { downloadFile } from '../../../../common/src/components/Molecules/downloadFile';

export async function downloadDocument(
  downloadFormat: 'markdown' | 'html' | 'text',
  simpleDocument: SimpleDocument,
  toolsContainer: HTMLElement,
): Promise<void> {
  if (downloadFormat === 'html') {
    const document = clonePage(simpleDocument, toolsContainer);

    return downloadFile(
      `${simpleDocument.title}.html`,
      document.documentElement.outerHTML,
    );
  }

  const markdown = simpleDocumentToMarkdown(simpleDocument);

  if (downloadFormat === 'markdown')
    return downloadFile(`${simpleDocument.title}.md`, markdown);
  else
    return downloadFile(
      `${simpleDocument.title}.txt`,
      markdownToText(markdown),
    );
}

/**
 * Turn ShadowRoot into a complete HTML document, while also
 * removing the Tools overlay from the resulting page
 */
function clonePage(
  simpleDocument: SimpleDocument,
  toolsContainer: HTMLElement,
): Document {
  const shadowRoot = toolsContainer.getRootNode() as ShadowRoot;
  const markerAttribute = 'data-marker';
  const markerName = 'tools-container';
  toolsContainer.setAttribute(markerAttribute, markerName);

  const newDocument = document.implementation.createHTMLDocument();

  const metaCharset = newDocument.createElement('meta');
  metaCharset.setAttribute('charset', 'UTF-8');
  newDocument.head.appendChild(metaCharset);

  const metaViewport = newDocument.createElement('meta');
  metaViewport.setAttribute('name', 'viewport');
  metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');

  newDocument.documentElement.lang = simpleDocument.lang;
  newDocument.title = simpleDocument.title;

  shadowRoot.childNodes.forEach((node) =>
    newDocument.body.appendChild(node.cloneNode(true)),
  );

  newDocument.querySelector(`[${markerAttribute}=${markerName}]`)?.remove();
  toolsContainer.removeAttribute(markerAttribute);

  return newDocument;
}
