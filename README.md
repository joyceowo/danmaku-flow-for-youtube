# LiveCanvas Chat for YouTube

> Bring polished danmaku-style live comments to YouTube with stream-ready chat controls and customization.

LiveCanvas Chat for YouTube is a Chrome extension that turns YouTube live chat
messages into flowing on-screen overlays. It helps present live comments more
like danmaku or floating subtitles, while keeping the display customizable and
easier to manage during busy streams.

## Acknowledgements

This project is based on and inspired by the original
[subdiox/youtube-live-chat-flow](https://github.com/subdiox/youtube-live-chat-flow).
Many thanks to the original author for creating and sharing the project.

## Features

- Display YouTube live chat messages directly over the video as flowing comments.
- Customize message appearance, including color, size, width, opacity, outline, and speed.
- Control whether author names and avatars are shown for different user types.
- Support Super Chats, Super Stickers, and Membership messages.
- Adjust layout behavior such as line count, max lines, stacking direction, and overflow mode.
- Move the chat input to the video controls area and add helper buttons to the chat list.
- Limit message rate with `Max Displays per second`.
- Limit simultaneous on-screen overlays with `Max Active Displays` to reduce lag during heavy chat traffic.

## Screenshots

![LiveCanvas preview](.github/img/livecanvas-preview.png)

## Installation

1. Build the extension with `npm run build`.
2. Open the Extension Management page by navigating to `chrome://extensions`.
3. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.
4. Click the **LOAD UNPACKED** button and select the `app` directory.

To create a distributable archive for this fork, run `npm run package` and use the generated `dist/archive.zip` file.

## Development

```bash
# install dependencies
npm install

# production build output to ./app
npm run build

# watch source changes and enable MV3 hot reload workflow
npm run dev

# watch webpack only
npm run watch:src

# lint the project
npm run lint

# create distributable zip in ./dist
npm run package
```

## Build And Debug

### Build Modes

```bash
# production build (minified)
npm run build

# development build without minification, suitable for Chrome DevTools
npx webpack --config webpack.config.js --mode development --devtool source-map
```

### Load The Extension In Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select the `app` directory.
5. After rebuilding, click **Reload** on the extension card.

### Debug Content Scripts

1. Build with source maps:

```bash
npx webpack --config webpack.config.js --mode development --devtool source-map
```

2. Reload the unpacked extension in `chrome://extensions`.
3. Open a YouTube watch page.
4. Press `F12` to open Chrome DevTools on that page.
5. Open **Sources**.
6. Use `Ctrl+P` and search for `content-script.ts` or `content-script-iframe.ts`.
7. Set breakpoints and refresh the YouTube page.

### Notes

- `npm run build` writes the extension bundle to the `app` directory.
- `webpack.config.dev.js` uses `cheap-module-source-map` for development watch mode.
- Avoid eval-based devtool settings for MV3 testing, because Chrome extension CSP blocks `unsafe-eval`.

```

```
