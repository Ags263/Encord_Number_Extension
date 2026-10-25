# Encord Segment Numbers

Chrome extension v0.4.2 that adds numbers above the Detailed Caption timeline in Encord.

## Download

[Download Encord Segment Numbers v0.4.2](https://github.com/Ags263/Encord_Number_Extension/raw/refs/heads/main/Encord_Segment_Numbers_v0.4.2.zip)

## Install

1. Download the ZIP above and extract it.
2. Open `chrome://extensions` in Chrome.
3. Remove or disable older Encord Segment Numbers versions.
4. Turn on **Developer mode**.
5. Click **Load unpacked** and select the extracted folder directly containing `manifest.json`.
6. Refresh your Encord task. Open the extension and click **Connect to this Encord tab** if needed.

The ZIP cannot be installed directly: extract it before using Load unpacked.

## What it does

- Targets Detailed Caption segment bars using their range attributes.
- Orders unique ranges by start and end values.
- Places labels in one horizontal row, with sideways spacing for crowded labels.
- Adds a visual overlay without editing annotations.

## Accuracy limits

The count represents unique range elements currently rendered in the page. If Encord removes off-screen ranges, the count and ranks can change. Full-task coverage is unverified. This is the segment-numbering version; caption review is not included.

## Verify the download

SHA-256 of `Encord_Segment_Numbers_v0.4.2.zip`:

```
e6930f2059ddadab2534e2206b5d3a203bf5e10a133fab822f537471c470de4e
```
