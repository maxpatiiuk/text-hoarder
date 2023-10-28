# Text Hoarder

- [ ] Review all code and remove unused/simplify
- [ ] Decide if tests are needed
- [ ] Deploy cors-auth-middleware to vercel

- [ ] Sync example config files with changes in real config files
- [ ] Add github repository description and meta (home url, setup url)
- [ ] Add description and meta data for github app (and "Add a note to users")
- [ ] Design extension icon and update src/public/images
- [ ] Add documentation & screenshots & video (compare to calendar plus
      documentation)
- [ ] Add description and action.default_title in manifest.json
- [ ] Add to portfolio
- [ ] Submit to Chrome Web Store and post link in several places
- [ ] In GitHub App settings, set "Make this GitHub App public" to allow others
      to install the app

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
git clone https://github.com/maxxxxxdlp/text-hoarder
cd packages/browser-extension
```

(Run all following commands from the `/src` directory) Install dependencies:

```sh
npm install
```

### Running

Build the front-end for production:

```sh
npm run build
```

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

## Testing

Unit tests are powered by Jest. Static Typechecking is powered by TypeScript.

You can run both like this:

```sh
npm test
```

or:

```sh
npm t
```

Alternatively, you can start Jest in watch mode:

```sh
npm run unitTests:watch
```