"use strict";

// One source of truth for defaults and popup labels. Stored values override defaults.
const UNHOOK_GROUPS = [
  { name: "Feeds", options: [
    ["homeFeed", "Hide homepage feed", true],
    ["shorts", "Hide Shorts", true],
    ["playables", "Block Playables", true],
    ["explore", "Hide Explore and Trending", true],
    ["moreFromYoutube", "Hide More from YouTube", true],
    ["subscriptionsLink", "Hide subscriptions link", false],
    ["redirectSubscriptions", "Open subscriptions on YouTube home", false],
    ["mixes", "Hide Mix and Radio playlists", true]
  ]},
  { name: "Watching", options: [
    ["sidebar", "Hide video sidebar", true],
    ["liveChat", "Hide live chat", false],
    ["playlist", "Hide playlist panel", false],
    ["endScreen", "Hide end screen video wall", true],
    ["endCards", "Hide end screen cards", true],
    ["comments", "Hide comments", true],
    ["profilePhotos", "Hide comment profile photos", false],
    ["merch", "Hide merch, tickets and offers", true],
    ["videoInfo", "Hide video info", false],
    ["buttons", "Hide video buttons bar", false],
    ["channel", "Hide channel and subscribe", false],
    ["description", "Hide description", false],
    ["autoplay", "Disable autoplay", true],
    ["annotations", "Hide annotations", true]
  ]},
  { name: "Navigation and search", options: [
    ["header", "Hide top header", false],
    ["notificationBell", "Hide notification bell", false],
    ["searchClutter", "Hide unrelated search sections", true]
  ]}
];

const UNHOOK_DEFAULTS = Object.fromEntries(
  UNHOOK_GROUPS.flatMap(group => group.options.map(([key, , enabled]) => [key, enabled]))
);
UNHOOK_DEFAULTS.paused = false;

function normalizeUnhookSettings(saved) {
  const values = saved && typeof saved === "object" ? saved : {};
  return Object.fromEntries(Object.entries(UNHOOK_DEFAULTS).map(([key, fallback]) => [
    key,
    typeof values[key] === "boolean" ? values[key] : fallback
  ]));
}
