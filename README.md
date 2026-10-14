# Wedding memory site

Vite + React + TypeScript. `npm run build` produces **one self-contained file**, `dist/index.html`, with photos, fonts and code all inlined. Share that file anywhere (Netlify Drop, GitHub Pages, Google Drive, etc.).

## Setup

1. `npm install`
2. Edit `src/wedding.json`: names, venue, story, events, YouTube link, Google Drive album link, thank-you note.
3. Put your photos in `photos/`:
   - `hero.jpg` for the cover (or set `"hero"` in the config)
   - `story_01.jpg`, `story_02.jpg`, … for the timeline (match the `"photo"` field of each story entry)
   - Event photos are grouped by the event's `"prefix"`: `haldi_01.jpg`, `wedding_12.jpg`, `reception_03.jpg`, …
   - Every photo except the story ones also appears in the Gallery.
   - iPhone HEIC photos must be converted to JPG first.
4. Optional background music: put an MP3 at `src/music.mp3` (or set `"music"` to a URL). It stays off until a visitor taps the ♫ button.

## Commands

- `npm run dev`: live preview at http://localhost:5173
- `npm run build`: compresses the photos (1400px WebP, about 130 KB each), then writes `dist/index.html`

Leave `"youtube"` empty to hide the video section. Leave `"albumUrl"` without a link to hide the album button.
