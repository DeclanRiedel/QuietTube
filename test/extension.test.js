const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const source = name => fs.readFileSync(path.join(root, name), "utf8");

async function page(html, pathname = "/") {
  const dom = new JSDOM(html, { url: `https://www.youtube.com${pathname}`, pretendToBeVisual: true });
  const callbacks = [];
  const redirects = [];
  let values = {};
  const browser = {
    storage: {
      local: {
        get: async () => ({ settings: values.settings }),
        set: async next => {
          values = { ...values, ...next };
          callbacks.forEach(callback => callback({ settings: { newValue: values.settings } }, "local"));
        }
      },
      onChanged: { addListener: callback => callbacks.push(callback) }
    }
  };
  const location = { pathname, replace: target => redirects.push(target) };
  const context = vm.createContext({
    window: dom.window,
    document: dom.window.document,
    MutationObserver: dom.window.MutationObserver,
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    location,
    browser,
    console
  });
  vm.runInContext(source("settings.js"), context);
  vm.runInContext(source("content.js"), context);
  await new Promise(resolve => setTimeout(resolve, 30));
  return { dom, browser, location, redirects, context, wait: () => new Promise(resolve => setTimeout(resolve, 30)) };
}

test("default options hide Playables, Shorts and recommendations", async () => {
  const { dom } = await page("<html><head></head><body></body></html>");
  const css = dom.window.document.getElementById("unhook-playables-style").textContent;
  assert.match(css, /\/playables/);
  assert.match(css, /\/shorts/);
  assert.match(css, /#secondary/);
  assert.match(css, /ytd-comments/);
  dom.window.close();
});

test("Playables shelves added after navigation get hidden and setting changes restore them", async () => {
  const { dom, browser, wait } = await page("<html><head></head><body><main></main></body></html>");
  const shelf = dom.window.document.createElement("ytd-rich-section-renderer");
  shelf.innerHTML = '<a href="/playables/game/123">Game</a>';
  dom.window.document.querySelector("main").appendChild(shelf);
  await wait();
  assert.ok(shelf.hasAttribute("data-unhook-playables"));
  assert.equal(dom.window.getComputedStyle(shelf).display, "none");
  await browser.storage.local.set({ settings: { playables: false } });
  await wait();
  assert.notEqual(dom.window.getComputedStyle(shelf).display, "none");
  dom.window.close();
});

test("direct Playables navigation redirects only when enabled", async () => {
  const active = await page("<html><head></head><body></body></html>", "/playables/game/123");
  assert.deepEqual(active.redirects, ["/feed/subscriptions"]);
  active.location.pathname = "/feed/subscriptions";
  active.dom.window.document.dispatchEvent(new active.dom.window.Event("yt-navigate-finish"));
  await active.wait();
  active.location.pathname = "/playables";
  active.dom.window.document.dispatchEvent(new active.dom.window.Event("yt-navigate-finish"));
  await active.wait();
  assert.deepEqual(active.redirects, ["/feed/subscriptions", "/feed/subscriptions"]);
  active.dom.window.close();
  const inactive = await page("<html><head></head><body></body></html>", "/watch");
  await inactive.browser.storage.local.set({ settings: { playables: false } });
  inactive.location.pathname = "/playables";
  inactive.dom.window.document.dispatchEvent(new inactive.dom.window.Event("yt-navigate-finish"));
  await inactive.wait();
  assert.deepEqual(inactive.redirects, []);
  inactive.dom.window.close();
});

test("autoplay control gets switched off", async () => {
  const { dom } = await page('<html><head></head><body><button class="ytp-autonav-toggle-button" aria-checked="true"></button><video autoplay></video></body></html>');
  const button = dom.window.document.querySelector("button");
  let clicks = 0;
  button.addEventListener("click", () => { clicks++; button.setAttribute("aria-checked", "false"); });
  dom.window.document.body.appendChild(dom.window.document.createElement("div"));
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(clicks, 1);
  assert.ok(!dom.window.document.querySelector("video").hasAttribute("autoplay"));
  dom.window.close();
});

test("popup renders every option and saves changes", async () => {
  const dom = new JSDOM(source("popup.html"), { url: "moz-extension://test/popup.html" });
  let stored = {};
  const browser = { storage: { local: {
    get: async () => stored,
    set: async next => { stored = next; }
  } } };
  const context = vm.createContext({ document: dom.window.document, browser, console });
  vm.runInContext(source("settings.js"), context);
  vm.runInContext(source("popup.js"), context);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(dom.window.document.querySelectorAll("input[type=checkbox]").length, 25);
  const checkbox = dom.window.document.getElementById("playables");
  assert.equal(checkbox.checked, true);
  checkbox.checked = false;
  checkbox.dispatchEvent(new dom.window.Event("change"));
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(stored.settings.playables, false);
  dom.window.close();
});
