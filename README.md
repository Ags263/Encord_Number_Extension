# Encord Segment Numbers

Chrome extension v0.4.2 that adds numbers above the Detailed Caption timeline in Encord.

## Download and install

1. Click **Code → Download ZIP** on this repository, then extract the download. Alternatively, clone the repository.
2. Open `chrome://extensions` in Chrome.
3. Remove or disable older Encord Segment Numbers versions.
4. Turn on **Developer mode**.
5. Click **Load unpacked** and select the extracted repository folder directly containing `manifest.json` (usually `Encord_Number_Extension-main`).
6. Refresh your Encord task. Open the extension and click **Connect to this Encord tab** if needed.

The extension files are stored directly in this repository. No separate extension ZIP is required. There is no build step or dependency installation.

## Files

- `manifest.json`: Chrome extension configuration, at the repository root.
- `content.js` and `overlay.css`: segment detection and single-line number overlay.
- `popup.html`, `popup.js` and `popup.css`: extension controls.
- `icons/`: required extension icons.

## What it does

- Targets Detailed Caption segment bars using their range attributes.
- Orders unique ranges by start and end values.
- Places labels in one horizontal row, with sideways spacing for crowded labels.
- Adds a visual overlay without editing annotations.

## Accuracy limits

The count represents unique range elements currently rendered in the page. If Encord removes off-screen ranges, the count and ranks can change. Full-task coverage is unverified. This is the segment-numbering version; caption review is not included.

## Source

Runtime files and icons match the user-supplied v0.4.2 package. This README contains repository installation instructions. No build is required.
