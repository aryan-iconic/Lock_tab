# Tab Lock - Chrome Extension

A Chrome extension that lets you lock tabs with biometric authentication, PIN codes, and presence detection to prevent unauthorized access.

---

## Project Overview

**Tab Lock** teaches you how to build a real Chrome extension from the ground up. You'll learn:
- Chrome extension architecture and manifest configuration
- Message passing between different extension contexts
- Content script injection and DOM manipulation
- Storage APIs and session management
- Web Crypto, WebAuthn, and security practices
- WebRTC and real-time video processing

---

## Architecture

The extension follows a hub-and-spoke communication model:

```
popup.js  →  background.js  →  content.js
  (UI)         (brain)          (page)
```

**Key principle:** Different parts of an extension can't call each other directly. They communicate via Chrome's `chrome.runtime.sendMessage()` API.

- **`background.js`** — Always-running service worker. Tracks which tabs are locked, handles storage, coordinates all events.
- **`content.js`** — Injected into every webpage. Shows/hides the black overlay when told by background.
- **`popup.js`** — Handles UI in the extension popup. Sends lock/unlock requests to background.

---

## File Structure

```
lock-extension/
├── manifest.json           # Chrome extension configuration (start here!)
├── background.js           # Service worker (always running)
├── content.js              # Injected into webpages
├── popup.html              # Popup UI
├── popup.js                # Popup logic
│
├── auth/
│   ├── biometric.js        # WebAuthn/fingerprint support
│   ├── pin.js              # PIN hashing and validation
│   └── unlock-screen.html  # What user sees when locked tab opens
│
├── presence/
│   ├── camera.js           # Webcam feed capture
│   ├── presence-worker.js  # MediaPipe in Web Worker
│   └── presence-models/    # MediaPipe model files
│
├── settings/
│   ├── settings.html       # Full settings page
│   ├── settings.js         # Settings logic
│   └── guest.js            # Guest mode handling
│
└── README.md               # This file
```

---

## Phases & Learning Path

| Phase | Goal | New Concepts | Files |
|-------|------|--------------|-------|
| **1** | Overlay on demand | Message passing, content scripts | `manifest.json`, `background.js`, `content.js`, `popup.html`, `popup.js` |
| **2** | Lock & unlock tabs | Tab events, storage API, tab injection | Add tab tracking to background |
| **3** | PIN protection | Web Crypto API, hashing, security | `auth/pin.js` |
| **4** | Biometric auth | WebAuthn, OS integration | `auth/biometric.js` |
| **5** | Presence detection | WebRTC, MediaPipe, video processing | `presence/camera.js`, `presence/presence-worker.js` |
| **6** | Guest mode & settings | Session management, advanced UX | `settings/settings.js` |

---

## Phase 1: Your First Extension

**Goal:** Click the popup button → black overlay appears on the current tab.

**Why this teaches you everything:**
1. You'll write `manifest.json` (how Chrome knows what to load)
2. You'll create a popup button (extension UI)
3. You'll send a message from popup to background
4. You'll relay it to the content script
5. You'll inject a DOM element into the webpage

**Files to create:**
- `manifest.json` — already provided as skeleton
- `background.js` — listener for popup messages, relays to content.js
- `content.js` — receives message, injects overlay
- `popup.html` — simple button
- `popup.js` — sends message on button click

**How to test:** Load the unpacked extension in Chrome, click the extension icon, click the button, watch the overlay appear.

---

## How to Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `lock-extension` folder
5. Your extension appears in the toolbar!

---

## Message Passing Reference

Chrome doesn't let different parts of an extension call each other directly. Instead, they use `chrome.runtime.sendMessage()`:

**From popup.js → background.js:**
```javascript
chrome.runtime.sendMessage({ action: "lockTab", tabId: 123 });
```

**In background.js listener:**
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "lockTab") {
    // Do something with request.tabId
    sendResponse({ status: "locked" });
  }
});
```

**From background.js → content.js (in a specific tab):**
```javascript
chrome.tabs.sendMessage(tabId, { action: "showOverlay" });
```

**In content.js listener:**
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showOverlay") {
    // Inject overlay into the page
  }
});
```

---

## Storage API

The extension uses `chrome.storage.local` to persist data:

```javascript
// Save
chrome.storage.local.set({ lockedTabs: [1, 2, 3] });

// Read
chrome.storage.local.get("lockedTabs", (data) => {
  console.log(data.lockedTabs);
});
```

---

## Key Principles

1. **Manifest first** — Always start by defining what your extension needs in `manifest.json`
2. **One job per file** — Keep background, content, and popup logic separate
3. **Message passing is your tool** — Never try to call functions across contexts directly
4. **Test early** — Load in Chrome after each phase, don't wait until everything is done
5. **Permissions matter** — Request only what you need; Chrome warns users about invasive permissions

---

## Resources

- [Chrome Extension API Docs](https://developer.chrome.com/docs/extensions/)
- [Message Passing Guide](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [WebAuthn](https://webauthn.me/)
- [MediaPipe JS](https://developers.google.com/mediapipe/solutions)

---

## Next Steps

1. Write `popup.html` and `popup.js` (simple button)
2. Implement `background.js` listener
3. Implement `content.js` overlay logic
4. Load in Chrome and test Phase 1
5. Move to Phase 2 (tab tracking and storage)

Happy coding! 🚀
