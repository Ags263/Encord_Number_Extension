# Encord Segment Numbers

Chrome extension v0.4.3 adds single-line Detailed Caption segment numbers, red blank-caption highlights and possible gap markers.

## Download and install

1. On this repository choose **Code → Download ZIP**, then **Extract All**. GitHub automatically puts files inside a repository folder.
2. Open that inner folder and check that `manifest.json`, `content.js` and `popup.html` are directly visible.
3. Open `chrome://extensions`, remove or disable older versions, and enable **Developer mode**.
4. Choose **Load unpacked** and select the exact folder containing `manifest.json`.
5. Refresh Encord. Open the extension and click **Connect to this Encord tab** if necessary.

No build or dependency installation is needed. Files are stored directly in this repository; no packaged extension ZIP is committed.

## Red highlights

- A **red segment border and red number** indicate a caption that is empty or contains only whitespace/invisible spacing characters.
- A **red hatched space** indicates a possible uncovered interval between ranges. Check the popup for the neighboring segment numbers and range values.
- NU, ID and DO contain text and are not treated as blank captions.
- Missing caption text elements are counted as unavailable, not assumed to be blank.
- Use **Highlight blank captions and gaps in red** to switch highlights on or off independently of numbering.
- Highlights update when the caption text or range attributes change. The extension never edits annotations.

## Gap interpretation

The default **Inclusive frame ends** mode treats end 9 followed by start 10 as adjacent frames with no missing frame. End 9 followed by start 11 has one uncovered frame. If your editor uses exclusive end boundaries, choose **Exclusive range ends** in the popup instead; touching endpoints are adjacent. Fractional bounds use continuous/exclusive intervals. Range units and boundary semantics have not been independently verified in authenticated Encord.

The detector combines overlapping intervals before finding gaps, so a short nested segment does not create a false gap. Gap shading requires both bordering bars to share a rendered parent container and their empty space to be visible. The popup still lists detected range gaps if they cannot be drawn. Only gaps between known ranges are considered; leading/trailing task gaps are not inferred without a verified video boundary.

## Accuracy limits

Numbers and checks use unique Detailed Caption bars currently present in the page, sorted by start and end. If Encord removes off-screen segments, ranks may change and apparent gaps may reflect unavailable ranges. Counts are not a verified full-task total. Gaps need reviewer verification and may be intentional. This version does not include the separate caption-review sidebar.

## Privacy and files

No network requests or annotation edits. `manifest.json` is at the root; `content.js`, `issues.js` and `overlay.css` handle detection and overlays; `popup.html`, `popup.js`, `popup.css` and `icons/` provide controls and icons. Local storage contains display settings only.

## Validation

JavaScript syntax and Node tests cover blank/whitespace captions, unavailable text, status markers, range edits, overlapping intervals, inclusive/exclusive boundaries, single-frame gaps, numbering and single-line label layout. Live Chrome/Encord rendering has not been verified in this environment.
