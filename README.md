# Chrome SS Tools

Chrome SS Tools is a Chrome extension that adds "Copy to clipboard" buttons to divs containing rspec commands on SameSystem CI pages.

## Features

- Works only on `ci.samesystem.net/*`
- Finds divs with `rspec ./spec/*` content
- Adds copy to clipboard buttons with dropdown options
- Automatically updates when new content loads

## Development Setup

To enable and test this extension during development:

1. **Clone or download this repository.**

2. **Open Chrome and go to:** [chrome://extensions/](chrome://extensions/)

3. **Enable "Developer mode"** (toggle in the top right corner).

4. **Click "Load unpacked"** and select the project folder

5. **The extension will appear in your extensions list.**
    - Click the extension icon to open the popup.
    - Visit a supported page (e.g., `https://ci.samesystem.net/job/alfa/*`) to see the content script in action.

6. **For changes to take effect:**
    - After editing files, click the "Reload" button on the extension card in `chrome://extensions/`.
    - Refresh the target page.

## File Overview

- `manifest.json` — Chrome extension manifest
- `content.js` — Content script injected into supported pages
- `popup.js` — Popup script for extension UI
- `hello.html` — Popup HTML
- `logo.png` — Extension icon

## Troubleshooting

- Make sure you are on a supported URL (`ci.samesystem.net/job/alfa/*`).
- If copy buttons do not appear, reload the extension and refresh the page.

---

