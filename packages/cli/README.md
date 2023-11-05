# Text Hoarder

FINAL: update the docs

## Development

### Installation

Pre-requisites:

- Node.js 20
- Npm 8

Checkout this repository:

```sh
git clone https://github.com/maxxxxxdlp/text-hoarder
cd packages/cli
```

(Run all following commands from the `/packages/cli` directory) Install
dependencies:

```sh
npm install
```

### Running

Build the code for production:

```sh
npm run build
```

### Development

Start the watcher script which would rebuild the code on any changes:

```sh
npm run watch
```

## TypeCheck

After making changes, double check that no TypeScript errors have been
introduced:

```sh
npx tsc
```
