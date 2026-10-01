"use strict";

function updateToolbarIcon(settings) {
  const paused = settings?.paused === true;
  browser.browserAction.setIcon({ path: paused ? "icon-paused.svg" : "icon.svg" });
  browser.browserAction.setTitle({ title: paused ? "QuiteTube — paused" : "QuiteTube — active" });
}

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) updateToolbarIcon(changes.settings.newValue);
});
browser.storage.local.get("settings").then(result => updateToolbarIcon(result.settings));
