import { ReadableWebToNodeStream } from '@smessie/readable-web-to-node-stream';
import type { Readable } from 'node:stream';
import tar from 'tar-stream';

self.addEventListener('message', async (event) => {
  const fileStream: ReadableStream<Uint8Array> = event.data;
  try {
    const decompressionStream = new DecompressionStream('gzip');
    const decompressedStream = fileStream.pipeThrough(decompressionStream);

    const stats = await processFiles(decompressedStream); // Implement this
    self.postMessage({ stats });
  } catch (error) {
    console.error('Error processing file in worker:', error);
    self.postMessage({
      type: 'Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

async function processFiles(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  const extract = tar.extract();
  const nodeStream = new ReadableWebToNodeStream(stream) as unknown as Readable;
  nodeStream.pipe(extract);

  for await (const entry of extract) {
    if (entry.header.type !== 'file') continue;
    debugger;
    // if(entry.header.type)
    // console.log(entry);
    // debugger;
    // if (1 === 1) return entry.header.name;
    entry.resume();
  }
  debugger;
  return 'error)';
}
