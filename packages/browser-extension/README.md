# Text Hoarder

This document describes how to do local development and local deployment of Text
Hoarder extension. For regular users, see [introduction page](../../README.md).

As a companion of this extension a [CLI is available](../../docs/cli.md) for
generating stats based on your saved articles.

## Local Installation

### Get extension ID

Follow the
[tutorial on developers.chrome.com for getting an extension ID](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/#keep-consistent-id).

### Create a GitHub OAuth App

In order to enable authentication though GitHub and usage of GitHub APIs, a
GitHub OAuth application needs to be created.

This can be done for a GitHub organization or user profile:

1. Open organization / user settings on GitHub
2. On the sidebar, select "Developer Settings"
3. Select "GitHub Apps"
4. Press "New GitHub App"
5. Fill out the required information

   - Set authentication callback URL to this URL:

     ```
     https://EXTENSION_ID.chromiumapp.org/
     ```

     Replace "EXTENSION_ID" with the extension ID you received in the
     [previous section](#get-extension-id).

   - Check the "Request user authorization (OAuth) during installation" checkbox

   - Check the "Redirect on update" checkbox

6. After the app is created, you will see a Client ID - write it down as you
   will need it the next section.
7. Press "Generate a new client secret" (note, GitHub may also request you to
   generate a private key - it won't be needed for this application). Write down
   the client secret as you will need it in the next section

### Configure the GitHub OAuth2 cors middleware

1. Follow the instructions in
   [../cors-auth-middleware/README.md](../cors-auth-middleware/README.md).

   At the end you should have a next.js application running on some address.

2. Copy [./config.example](./config.example) into `./config.ts` and fill it in
   according to instructions in that file.

### Installation

Pre-requisites:

- Node.js 20
- Npm 8

Checkout this repository:

```sh
git clone https://github.com/maxpatiiuk/text-hoarder
cd packages/browser-extension
```

(Run all following commands from the `/packages/browser-extension` directory)
Install dependencies:

```sh
npm install
```

### Running

Build the front-end for production:

```sh
npm run build
```

Then package into a zip file:

```sh
npm run package:extension
```

The resulting file (`packages/browser-extension/text-hoarder.zip`) can be
uploaded to Chrome Web Store.

### Development

Start the watcher script which would rebuild the code on any changes:

```sh
npm run watch
```

Load unpacked extension into Chrome by
[following the instructions](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/).

Note, on any code change, you will have to press the `Reload Extension` button
in the bottom right corner of the popup in order to see the newest changes.

## React DevTools

You may have noticed that despite the extension being built with React, React
DevTools browser extension does not work for debugging it.

Instead, a standalone React DevTools (an Electron app) needs to be used.
[Installation Instructions](https://github.com/facebook/react/tree/main/packages/react-devtools#installation),

Note, this will only work for when WebPack is run in development mode as we
disabled react DevTools integration in production to reduce bundle size.

## TypeCheck

After making changes, double check that no TypeScript errors have been
introduced:

```sh
npx tsc
```

Note, this project does not include tests, which is an intentional decision.
Read the commit message in
[af2eedf](https://github.com/maxpatiiuk/text-hoarder/commit/af2eedf) to see
several justifications (and why this may be reversed in the future).

## Previous iterations

Previous iterations of the general idea of Text Hoarder:

- [tts-reader](https://github.com/maxpatiiuk/tts-reader/)
- [python_tts](https://github.com/maxpatiiuk/python_tts/)
- [TTS King](https://github.com/maxpatiiuk/tts_king/)
