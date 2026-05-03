# Flow Chat for YouTube Live

> Chrome Extension for Flow Chat Messages on YouTube Live.

Flow Chat for YouTube Live is a Chrome extension that turns YouTube live chat
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

![screenshot](.github/img/screenshot1.gif)

## Installation

1. Download `archive.zip` from [releases page](https://github.com/subdiox/youtube-live-chat-flow/releases) and unzip this file.
2. Open the Extension Management page by navigating to `chrome://extensions`.
3. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.
4. Click the **LOAD UNPACKED** button and select the unpacked directory named `app`.

## Development

```bash
# install dependencies
yarn

# watch files changed and reload extension
yarn dev
```
