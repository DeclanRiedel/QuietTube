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
    ["mixes", "Hide Mix and Radio playlists", true],
    ["communityPosts", "Hide community posts", false],
    ["channelRecommendations", "Hide channel For you shelves", false]
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
    ["searchClutter", "Hide unrelated search sections", true],
    ["searchShorts", "Hide Shorts in search", false],
    ["topicChips", "Hide topic chips", false]
  ]}
];

const UNHOOK_DEFAULTS = Object.fromEntries(
  UNHOOK_GROUPS.flatMap(group => group.options.map(([key, , enabled]) => [key, enabled]))
);
UNHOOK_DEFAULTS.paused = false;

const UNHOOK_PRESETS = {
  balanced: { label: "Balanced", settings: { ...UNHOOK_DEFAULTS } },
  minimal: { label: "Minimal", settings: { ...Object.fromEntries(Object.keys(UNHOOK_DEFAULTS).map(key => [key, false])), playables: true, shorts: true } },
  subscriptions: { label: "Subscriptions only", settings: {
    ...Object.fromEntries(Object.keys(UNHOOK_DEFAULTS).map(key => [key, false])),
    homeFeed: true,
    shorts: true,
    playables: true,
    explore: true,
    moreFromYoutube: true,
    mixes: true,
    communityPosts: true,
    channelRecommendations: true,
    searchShorts: true,
    redirectSubscriptions: true
  } }
};

function normalizeUnhookSettings(saved) {
  const values = saved && typeof saved === "object" ? saved : {};
  return Object.fromEntries(Object.entries(UNHOOK_DEFAULTS).map(([key, fallback]) => [
    key,
    typeof values[key] === "boolean" ? values[key] : fallback
  ]));
}
