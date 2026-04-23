<p align="center">
  <img src="logo-light.svg#gh-light-mode-only" alt="WeMarkdown" width="120" />
  <img src="logo-dark.svg#gh-dark-mode-only" alt="WeMarkdown" width="120" />
</p>

<h1 align="center">WeMarkdown</h1>

<p align="center">
  A zero-dependency, in-browser Markdown renderer &amp; style workbench — designed for pixel-perfect typography, multi-screen side-by-side preview, and a live style inspector.
</p>

<p align="center">
  <a href="#-features">Features</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-project-structure">Structure</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-rendering-spec">Rendering Spec</a> ·
  <a href="#-deployment">Deployment</a>
</p>

---

## ✨ Features

### Editor
- **Live Markdown editor** with line numbers, whitespace overlay, and a source-to-preview scroll sync
- **Default demo content** in English and 中文, auto-switched with the language toggle
- One-click **reset** to default content; **export** the current source as `.md`
- Collapsible editor panel — hides the source pane for a clean preview-only view

### Preview (the highlight)
- **Multi-screen comparison**: add up to N virtual "phone screens" side-by-side so you can compare how the same Markdown renders at different widths simultaneously
- **Fully draggable card geometry** — resize each screen's width and the overall height by grabbing the top/bottom/left/right handles; the current width is shown in a live tooltip
- **Three preview modes**: AI (narrow bubble), Chats (chat-style column), Files (full-document column) — each with its own default width and background
- **Fullscreen mode** for distraction-free viewing
- **Footnote drawer**: `[^n]` references render as icon buttons that slide up a bottom-aligned footnote panel

### Style Inspector (the other highlight)
- Live-editable CSS custom properties through a compact stepper UI:
  - **Typography** — base font size, per-level H1–H6 inner top padding
  - **Spacing** — single-break / double-break gaps
  - **Layout** — max nesting indent depth
  - **Colors** — text, border, card bg, inline-code bg (with HEX + opacity %), edited independently for light and dark themes
- **Element inspector**: click any rendered element in the preview to see its effective styles
- **Export rules** as `styles.md` — a human-readable dump of your current customizations

### Theming &amp; i18n
- **Light / Dark** themes with a 0.5s synchronized color transition (no DOM rebuild on toggle)
- **English / 中文** UI, auto-detected from the browser locale and persisted to `localStorage`
- All color tokens are CSS variables, so themes and inspector edits propagate instantly

### Rendering engine
- Built on [`marked`](https://github.com/markedjs/marked) (GFM + `breaks: true`), [`highlight.js`](https://github.com/highlightjs/highlight.js), and [KaTeX](https://katex.org/) for formulas
- Custom post-processing pipeline wraps tables, code blocks, formulas, headings, list markers, and footnotes in structured containers for precise styling, overflow masking, and alignment
- **Strict isolation**: `$...$` / `$$...$$` and Markdown metacharacters inside code blocks are never re-parsed
- **Copy-as-Markdown**: rendered content copies back as its original Markdown syntax

---

## 🚀 Quick Start

WeMarkdown is a pure static site — no build step, no package manager required.

### Option 1: Open directly
Double-click `index.html`. Most features work out of the box; a few (clipboard, cross-origin fonts) benefit from being served over `http://`.

### Option 2: Local dev server (recommended)
A tiny no-cache Python server is included so you can just refresh the browser after editing:

```bash
python3 dev-server.py          # defaults to http://localhost:8765/
python3 dev-server.py 3000     # or pick a port
```

### Requirements
- Any modern browser (Chrome / Safari / Firefox / Edge)
- Python 3 (only for the optional dev server)

---

## 📁 Project Structure

```
WeMarkdown/
├── index.html            # App shell: topbar, editor pane, preview pane, inspector pane
├── app.js                # All application logic (~4k lines, see "Architecture" below)
├── style.css             # Global styles, theme variables, Markdown rendering rules
├── rendering-spec.md     # Canonical spec for the Markdown visual/typographic rules
├── favicon.svg
├── logo.svg / logo-light.svg / logo-dark.svg
├── dev-server.py         # No-cache local dev server
├── deploy.sh             # One-shot deploy to OA Pages
└── lib/
    ├── marked.min.js
    ├── highlight.min.js
    ├── github-hljs.min.css
    └── github-dark-hljs.min.css
```

No `node_modules`, no `package.json`, no bundler. All third-party libraries are vendored under `lib/` (KaTeX is loaded from a CDN).

---

## 🏗 Architecture

`app.js` is a single IIFE (`(function () { 'use strict'; ... })()`) that owns the whole application. It's deliberately written in plain ES5-flavored vanilla JS so it runs anywhere without transpilation. The file is organized into clearly-commented sections:

| Section | Responsibility |
|---|---|
| **i18n** | `I18N` dictionary (`en` / `zh`), `t(key)`, `setLang()`, `applyI18n()` |
| **DOM refs** | Cached references to editor, preview, handles, panels, toast, etc. |
| **Markdown pipeline** | `renderMarkdown()` → `marked.parse()` → `postProcess()` |
| **Post-processing** | `wrapTables`, `wrapCodeBlocks`, `wrapFormulas`, `wrapHeadingText`, `wrapListTextNodes`, `wrapTableCellText`, `processFootnoteRefs`, `adjustListWidths`, `checkAllScrollShadows` |
| **Formula rendering** | `renderLatex()` — KaTeX with `<pre>`/`<code>` isolation via TreeWalker |
| **Source map** | `buildSourceMap()` / `findSourceLines()` — maps DOM nodes back to source-line ranges for scroll sync |
| **Editor UX** | Line numbers, whitespace overlay, visual-row measurement, scroll sync |
| **Resizing &amp; screens** | Per-screen width drag, global height drag, multi-screen add/remove, min/max width logic |
| **Inspector** | Steppers for typography/spacing/layout, color controls with HEX + alpha, per-theme color storage, live CSS variable updates |
| **Theme &amp; mode** | `setTheme(dark)` swaps hljs stylesheets + `data-theme`; `setMode(mode)` switches AI / Chats / Files |
| **Misc** | Fullscreen toggle, toast, export `.md` / `styles.md`, `localStorage` persistence |

### Rendering pipeline (high level)

```mermaid
flowchart LR
    A[Textarea source] --> B[marked.parse + GFM]
    B --> C[innerHTML into .markdown-body]
    C --> D[Post-process pipeline]
    D --> D1[Wrap tables / code / formulas]
    D --> D2[Wrap headings / list text / cell text]
    D --> D3[Render KaTeX (skip pre/code)]
    D --> D4[Footnote refs -> icon buttons]
    D --> D5[Measure OL number / UL bullet widths]
    D --> D6[Compute table column max-width = container * 2/3]
    D --> D7[Shadow masks for overflowing tables/code/formulas]
    D --> E[Final DOM, live-styled via CSS variables]
```

State that persists across sessions (via `localStorage`):
- Selected language (`md-lang`)
- Selected theme (`md-theme`)
- Current preview mode
- Inspector customizations per theme (font sizes, spacing, indents, colors)
- Editor content (if non-default)

---

## 📐 Rendering Spec

The `rendering-spec.md` file is the **single source of truth** for how Markdown should render — typography scale, spacing semantics, heading anchoring, list marker alignment, code block chrome, table column rules, KaTeX wrapping, footnote UI, max nesting depth, copy-back-to-Markdown rules, and more.

It is deliberately decoupled from this app's UI so that any renderer following the spec can produce visually equivalent output. Highlights:

- All dimensions derive from a small set of base variables (`--fs-base`, `--sp-single`, `--sp-double`, `--mt-h1..6`, `--max-indent`)
- Paragraph spacing is **`margin-bottom`-only** to avoid margin-collapse surprises
- Headings use **inner `padding-top`** (not outer `margin-top`) so text anchors to the content it introduces
- Ordered-list numbers are real DOM nodes with tabular-nums, aligned to the widest number in the same list
- Tables cap column width at **container × 2/3**, with gradient masks on horizontal overflow
- Inline KaTeX wraps at operator boundaries, never mid-token

See [`rendering-spec.md`](./rendering-spec.md) for the full specification.

---

## 📦 Deployment

`deploy.sh` ships the whole site (root files + `lib/`) to OA Pages as a single PUT request:

```bash
# Optional: override the API key
export OA_PAGES_API_KEY="<your-key>"

./deploy.sh
# -> https://wemd.pages.woa.com
```

For any other static host (Netlify, Vercel, GitHub Pages, S3, Nginx…), upload the repository contents as-is. There is nothing to build.

---

## 🤔 Why vanilla JS (no framework)?

This project was intentionally built **without Vue / React / Svelte** because:

1. **Zero build step** — clone, open, done. No toolchain rot.
2. **No hydration cost** — the app is fundamentally a long-running single page that mutates a tiny DOM tree; a framework's diffing and re-render cost would be pure overhead.
3. **Direct DOM control** for rendering-critical work — post-processing, scroll-shadow detection, OL/UL width measurement, TreeWalker-based formula isolation, and source-mapped scroll sync all want raw access to real nodes.
4. **Tiny footprint** — the entire app (minus `marked` / `highlight.js`) is one JS file and one CSS file, fully readable in a single editor session.

That said, `app.js` has grown large (~4k lines). A future refactor could split it into ES modules by section (`i18n.js`, `renderer.js`, `inspector.js`, `screens.js`, `editor.js`) without adopting any framework.

---

## 📝 License

Internal project. See repository for licensing details.
