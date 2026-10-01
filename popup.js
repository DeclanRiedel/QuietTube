"use strict";

const container = document.getElementById("settings");
const status = document.getElementById("status");
let current = normalizeUnhookSettings();
document.getElementById("paused").addEventListener("change", event => save({ ...current, paused: event.target.checked }));

for (const group of UNHOOK_GROUPS) {
  const section = document.createElement("section");
  const heading = document.createElement("h2");
  heading.textContent = group.name;
  section.appendChild(heading);
  for (const [key, labelText] of group.options) {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = key;
    checkbox.addEventListener("change", () => save({ ...current, [key]: checkbox.checked }));
    const text = document.createElement("span");
    text.textContent = labelText;
    label.append(checkbox, text);
    section.appendChild(label);
  }
  container.appendChild(section);
}

function render() {
  for (const [key, value] of Object.entries(current)) document.getElementById(key).checked = value;
}

async function save(next) {
  current = normalizeUnhookSettings(next);
  render();
  status.textContent = "Saving…";
  try {
    await browser.storage.local.set({ settings: current });
    status.textContent = "Saved";
  } catch (error) {
    status.textContent = "Save failed";
    console.error("Unhook Playables could not save settings:", error);
  }
}

document.getElementById("enable-all").addEventListener("click", () => save(Object.fromEntries(Object.keys(current).map(key => [key, true]))));
document.getElementById("disable-all").addEventListener("click", () => save(Object.fromEntries(Object.keys(current).map(key => [key, false]))));
browser.storage.local.get("settings").then(result => {
  current = normalizeUnhookSettings(result.settings);
  render();
});
