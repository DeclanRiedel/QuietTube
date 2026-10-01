"use strict";

const container = document.getElementById("settings");
const errorMessage = document.getElementById("error");
const pauseToggle = document.getElementById("pause-toggle");
const pauseIcon = document.getElementById("pause-icon");
const preset = document.getElementById("preset");
let current = normalizeUnhookSettings();
pauseToggle.addEventListener("click", () => save({ ...current, paused: !current.paused }));
for (const [key, value] of Object.entries(UNHOOK_PRESETS)) {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = value.label;
  preset.appendChild(option);
}
preset.addEventListener("change", () => {
  if (UNHOOK_PRESETS[preset.value]) save({ ...UNHOOK_PRESETS[preset.value].settings, paused: current.paused });
});

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
  for (const [key, value] of Object.entries(current)) {
    if (key !== "paused") document.getElementById(key).checked = value;
  }
  pauseIcon.src = current.paused ? "icon-paused.svg" : "icon.svg";
  pauseToggle.setAttribute("aria-pressed", String(current.paused));
  pauseToggle.setAttribute("aria-label", current.paused ? "Resume QuiteTube" : "Pause QuiteTube");
  pauseToggle.title = current.paused ? "Resume QuiteTube" : "Pause QuiteTube";
  preset.value = Object.keys(UNHOOK_PRESETS).find(key =>
    Object.keys(UNHOOK_DEFAULTS).every(option => option === "paused" || current[option] === UNHOOK_PRESETS[key].settings[option])
  ) || "custom";
}

async function save(next) {
  const previous = current;
  current = normalizeUnhookSettings(next);
  render();
  errorMessage.hidden = true;
  try {
    await browser.storage.local.set({ settings: current });
  } catch (error) {
    current = previous;
    render();
    errorMessage.textContent = "Could not save settings.";
    errorMessage.hidden = false;
    console.error("QuiteTube could not save settings:", error);
  }
}

browser.storage.local.get("settings").then(result => {
  current = normalizeUnhookSettings(result.settings);
  render();
});
