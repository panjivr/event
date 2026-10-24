# Pancasila Creative Works

A clean, professional neo-modern website for **Pancasila Creative Works** — a creative event production studio. Built as a static site (HTML + CSS + vanilla JS), no build step required.

## What's inside

- **Landing page** (`index.html`) — hero, selected works (Karya), service pillars (Layanan), process, studio, and contact.
- **A–Z Event Playbook** (`playbook/`) — 24-module tactical playbook for planning and running events, with an index hub.
- **8 AI-generated WebP images** in `assets/` (hero stage + work samples + playbook banner).
- **Accessible, calm motion** — `delight.js` handles glow, magnetic buttons, ripple, split-text, back-to-top progress ring, filter toast, and counters, all respecting `prefers-reduced-motion`.

## Design language

Conceptual Neo-Modernism: Sora (display) + Source Sans 3 (body) + Instrument Serif (italic accent), two-tone headlines, strong grid, generous negative space, a single restrained accent (`#0E63C9`), and refined hairlines.

## Local preview

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8080
# then visit http://localhost:8080
```

## Live site

Published via GitHub Pages: **https://panjivr.github.io/event/**

## Notes

- `.nojekyll` is included so GitHub Pages serves all assets without Jekyll processing.
- All asset and page links are relative, so the site works from any subpath.
