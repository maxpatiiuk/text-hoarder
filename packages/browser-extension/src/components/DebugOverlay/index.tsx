import React from 'react';

// FINAL: remove this if it is not needed anymore

import { sendRequest } from '../Background/messages';

/**
 * Used when in development. Adds a button to reload the extension
 */
export function DebugOverlay(): JSX.Element {
  return (
    <div className="absolute bottom-0 right-0">
      <button
        type="button"
        onClick={async (): Promise<void> =>
          /**
           * Inspired by:
           * https://60devs.com/hot-reloading-for-chrome-extensions.html
           * https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid
           */
          sendRequest('ReloadExtension', undefined).catch(console.error)
        }
      >
        Reload Extension
      </button>
    </div>
  );
}
