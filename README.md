# QuiteTube

Hide what you don't want from YouTube. Independent Firefox extension inspired by [Unhook's feature list](https://addons.mozilla.org/en-US/firefox/addon/youtube-recommended-videos/). No source code or assets from original add-on are included.

## Use

In Firefox, open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `manifest.json`. Click toolbar button to set options. Click the icon in the popup to pause or resume; the toolbar icon turns grey while paused. Settings save locally and update open YouTube tabs without reload. Temporary add-ons disappear after Firefox restarts; permanent installation requires a signed XPI.

Run `npm install`, `npm test`, `npm run lint`, and `npm run build` to verify and package extension. Build creates `web-ext-artifacts/quitetube-0.1.0.zip`.

## Features

- Hide homepage recommendations, Shorts, Playables, Explore, guide sections, Mixes, and irrelevant search shelves.
- Hide related videos, live chat, playlist panel, end screen suggestions, comments, merch, and video details.
- Disable autoplay; hide annotations, notification bell, or top header.
- Redirect direct Playables pages to subscriptions; optionally redirect YouTube home to subscriptions.
- Include selectors for desktop and mobile YouTube. No network requests or data collection.
- Optional controls for community posts, Shorts in search, topic chips, and channel "For you" shelves. The channel shelf label currently matches English text.
- Clickable pause icon in the popup.

YouTube changes markup often. Selectors may need updates as its interface changes. Autoplay toggling depends on YouTube exposing its player control.
