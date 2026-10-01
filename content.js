"use strict";

(() => {
  if (window.__unhookPlayablesLoaded) return;
  window.__unhookPlayablesLoaded = true;

  const RULES = {
    homeFeed: ["ytd-browse[page-subtype='home'] ytd-rich-grid-renderer", "ytd-browse[page-subtype='home'] #contents.ytd-rich-grid-renderer", "ytm-browse[tab-identifier='FEwhat_to_watch'] ytm-rich-grid-renderer"],
    shorts: ["ytd-guide-entry-renderer:has(a[href^='/shorts'])", "ytd-mini-guide-entry-renderer:has(a[href^='/shorts'])", "ytd-rich-section-renderer:has(a[href^='/shorts/'])", "ytd-reel-shelf-renderer", "ytd-shorts", "ytm-reel-shelf-renderer", "ytm-pivot-bar-item-renderer:has(a[href^='/shorts'])"],
    playables: ["ytd-guide-entry-renderer:has(a[href^='/playables'])", "ytd-mini-guide-entry-renderer:has(a[href^='/playables'])", "ytd-rich-section-renderer:has(a[href^='/playables/'])", "ytd-rich-shelf-renderer:has(a[href^='/playables/'])", "ytd-grid-shelf-view-model:has(a[href^='/playables/'])", "ytm-pivot-bar-item-renderer:has(a[href^='/playables'])", "[data-unhook-playables]"],
    explore: ["ytd-guide-entry-renderer:has(a[href^='/feed/explore'])", "ytd-guide-entry-renderer:has(a[href^='/feed/trending'])", "ytd-mini-guide-entry-renderer:has(a[href^='/feed/explore'])", "ytd-mini-guide-entry-renderer:has(a[href^='/feed/trending'])", "ytm-pivot-bar-item-renderer:has(a[href^='/feed/explore'])"],
    moreFromYoutube: ["ytd-guide-entry-renderer:has(a[href^='/premium'])", "ytd-guide-entry-renderer:has(a[href^='/music'])", "ytd-guide-entry-renderer:has(a[href^='/gaming'])", "ytd-guide-entry-renderer:has(a[href^='/studio'])"],
    subscriptionsLink: ["ytd-guide-entry-renderer:has(a[href^='/feed/subscriptions'])", "ytd-mini-guide-entry-renderer:has(a[href^='/feed/subscriptions'])", "ytm-pivot-bar-item-renderer:has(a[href^='/feed/subscriptions'])"],
    mixes: ["ytd-rich-item-renderer:has(a[href*='start_radio=1'])", "ytd-compact-radio-renderer", "ytd-radio-renderer", "ytd-search ytd-radio-renderer"],
    sidebar: ["ytd-watch-flexy #secondary", "ytd-watch-grid #secondary", "ytm-watch ytm-item-section-renderer:has(ytm-compact-video-renderer)"],
    liveChat: ["ytd-live-chat-frame", "#chat-container.ytd-watch-flexy", "ytm-live-chat-renderer"],
    playlist: ["ytd-playlist-panel-renderer", "ytm-playlist-panel-renderer"],
    endScreen: [".ytp-endscreen-content", ".ytp-videowall-still", ".html5-endscreen"],
    endCards: [".ytp-ce-element", ".ytp-cards-teaser", ".ytp-cards-button"],
    comments: ["ytd-comments", "#comments.ytd-watch-flexy", "ytm-comment-section-renderer"],
    profilePhotos: ["ytd-comment-renderer #author-thumbnail", "ytd-comment-renderer #author-thumbnail img", "ytm-comment-renderer .comment-icon"],
    merch: ["ytd-merch-shelf-renderer", "ytd-ticket-shelf-renderer", "ytd-offer-module-renderer", "ytd-product-list-renderer", "ytm-merch-shelf-renderer"],
    videoInfo: ["ytd-watch-metadata #above-the-fold", "ytd-video-primary-info-renderer", "ytd-video-secondary-info-renderer", "ytm-watch-metadata"],
    buttons: ["ytd-watch-metadata #actions", "ytd-video-primary-info-renderer #menu", "ytm-watch-metadata #menu"],
    channel: ["ytd-watch-metadata #owner", "ytd-video-secondary-info-renderer #owner", "ytm-watch-metadata ytm-channel-info"],
    description: ["ytd-watch-metadata #description", "ytd-expander#description", "ytm-expandable-video-description-body-renderer"],
    annotations: [".annotation", ".ytp-paid-content-overlay", ".ytp-iv-player-content"],
    header: ["ytd-masthead", "ytm-mobile-topbar-renderer"],
    notificationBell: ["ytd-notification-topbar-button-renderer", "ytm-notification-topbar-button-renderer"],
    searchClutter: ["ytd-search [data-unhook-search-clutter]", "ytm-search [data-unhook-search-clutter]"]
  };

  let settings = normalizeUnhookSettings();
  let style;
  let observer;
  let scanPending = false;
  let redirectPending = false;
  let redirectedFrom = "";

  function updateStyle() {
    if (!style) {
      style = document.createElement("style");
      style.id = "unhook-playables-style";
      (document.head || document.documentElement).appendChild(style);
    }
    const selectors = Object.entries(RULES).flatMap(([key, list]) => !settings.paused && settings[key] ? list : []);
    style.textContent = selectors.length ? `${selectors.join(",\n")} { display: none !important; }` : "";
  }

  function checkRoute() {
    if (settings.paused) {
      redirectPending = false;
      return;
    }
    const path = location.pathname;
    if (redirectPending && path !== redirectedFrom) redirectPending = false;
    if (redirectPending) return;
    if (settings.playables && /^\/playables(?:\/|$)/.test(path)) {
      redirectPending = true;
      redirectedFrom = path;
      location.replace("/feed/subscriptions");
    } else if (settings.redirectSubscriptions && path === "/") {
      redirectPending = true;
      redirectedFrom = path;
      location.replace("/feed/subscriptions");
    }
  }

  function markPlayables() {
    document.querySelectorAll("a[href^='/playables']").forEach(link => {
      const shelf = link.closest("ytd-rich-section-renderer, ytd-rich-shelf-renderer, ytd-grid-shelf-view-model, ytm-rich-section-renderer, ytm-item-section-renderer");
      if (shelf) shelf.setAttribute("data-unhook-playables", "");
    });
    document.querySelectorAll("ytd-rich-section-renderer, ytd-rich-shelf-renderer, ytm-rich-section-renderer").forEach(shelf => {
      const heading = shelf.querySelector("#title, #title-text, h2, h3");
      if (heading && /^(youtube\s+)?playables$/i.test(heading.textContent.trim())) {
        shelf.setAttribute("data-unhook-playables", "");
      }
    });
  }

  function markSearchClutter() {
    const clutter = /^(related to your search|latest from|searches related to|people also search for|for you|previously watched)$/i;
    document.querySelectorAll("ytd-search ytd-shelf-renderer, ytd-search ytd-horizontal-card-list-renderer, ytm-search ytm-shelf-renderer").forEach(shelf => {
      const heading = shelf.querySelector("#title, #title-text, h2, h3");
      if (heading && clutter.test(heading.textContent.trim())) shelf.setAttribute("data-unhook-search-clutter", "");
    });
  }

  function disableAutoplay() {
    if (!settings.autoplay) return;
    document.querySelectorAll("video[autoplay]").forEach(video => video.removeAttribute("autoplay"));
    document.querySelectorAll(".ytp-autonav-toggle-button[aria-checked='true'], .ytp-autonav-toggle-button[aria-label*='on'], ytd-compact-autoplay-renderer tp-yt-paper-toggle-button[checked]").forEach(toggle => {
      if (toggle.isConnected) toggle.click();
    });
  }

  function scan() {
    scanPending = false;
    if (settings.paused) return;
    checkRoute();
    if (settings.playables) markPlayables();
    if (settings.searchClutter) markSearchClutter();
    disableAutoplay();
  }

  function scheduleScan() {
    if (scanPending) return;
    scanPending = true;
    requestAnimationFrame(scan);
  }

  function startObserver() {
    if (observer || !document.documentElement) return;
    observer = new MutationObserver(scheduleScan);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    scheduleScan();
  }

  function applySettings(saved) {
    settings = normalizeUnhookSettings(saved);
    updateStyle();
    checkRoute();
    scheduleScan();
  }

  updateStyle();
  checkRoute();
  startObserver();
  if (!observer) document.addEventListener("DOMContentLoaded", startObserver, { once: true });
  document.addEventListener("yt-navigate-finish", scheduleScan);
  window.addEventListener("popstate", scheduleScan);
  browser.storage.local.get("settings").then(result => applySettings(result.settings));
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.settings) applySettings(changes.settings.newValue);
  });
})();
