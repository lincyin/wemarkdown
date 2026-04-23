# Chat Mode Rendering Style

This document describes the **visual & typographic rules** for the **Chats** preview mode of WeMarkdown. It inherits from [`rendering-spec.md`](./rendering-spec.md) and only records what Chats mode **adds** or **overrides**. Any renderer following this document together with the base spec should produce visually equivalent Chats-mode output.

Chats mode is designed to preview a **single message as it would appear inside a chat thread** — a left-anchored speech bubble sitting on the familiar neutral-grey chat wallpaper. It favours a flat typographic rhythm over document-style heading hierarchy, because real chat messages are read as prose.

---

## 1. Scene Intent

| Property | Value |
|---|---|
| Scene | A single chat message (IM / messenger) |
| DOM selector | `.preview-panel[data-mode="chats"]` |
| Role | Secondary mode; opt-in from the mode switcher |
| Reading pattern | Prose-like; short paragraphs; occasional light structure |

In a chat thread every message is one utterance. Huge H1 titles or full six-level outlines inside a single bubble would look out of place, so Chats mode **collapses all heading levels to body size** while keeping their semantic weight (bold) and spacing.

---

## 2. Container

### 2.1 Virtual screen background — `.preview-outer`
This is the mode's strongest visual signature. The background emulates a chat wallpaper:

| Theme | Background |
|---|---|
| Light | `#EDEDED` |
| Dark | `#111111` |

These are intentionally slightly off from `--pv-bg` (the default device wallpaper) to reproduce the warm-grey / deep-black tones familiar from messenger apps.

### 2.2 Bubble container — `.preview-card`
- Same as base: `padding: 16px`, `padding-top: 64px`, `padding-bottom: 64px`
- Vertical scroll, horizontal clip
- Scrollbar fully hidden

### 2.3 Bubble — `.markdown-body`
- Background: `var(--pv-card-bg)` (light `#FFFFFF` / dark `#252528`)
- `border-radius: 8px`
- `padding: 8px 12px`
- `max-width: 640px` — prevents very wide messages on large screens
- Left pointer tip (`::before`) inherited from the base spec — the bubble looks like an incoming chat message

---

## 3. Typography Overrides

### 3.1 Flattened headings — the defining rule of Chats mode
All `<h1>`–`<h6>` are rendered at **body size**, with no top breathing room:

```css
.preview-panel[data-mode="chats"] .markdown-body h1,
.preview-panel[data-mode="chats"] .markdown-body h2,
.preview-panel[data-mode="chats"] .markdown-body h3,
.preview-panel[data-mode="chats"] .markdown-body h4,
.preview-panel[data-mode="chats"] .markdown-body h5,
.preview-panel[data-mode="chats"] .markdown-body h6 {
  font-size: var(--fs-base);
  padding-top: 0;
  margin-top: 0;
}
```

| Property | Value | Reason |
|---|---|---|
| `font-size` | `--fs-base` (all levels) | Chat bubbles do not carry document-style titles |
| `padding-top` | `0` | Remove the per-level breathing room (`--mt-h1…h6`) |
| `margin-top` | `0` | Consistent with base; no top collapse |
| `font-weight` | `600` (inherited) | Headings still read as **bold lines** for soft structure |
| `margin-bottom` | `var(--sp-double)` (inherited) | Paragraph-level gap after each heading |
| `line-height` | `1.4` (inherited) | Same as body |

**Effect**: an `# H1` and a `**bold**` line look nearly identical — headings become a lightweight way to bold-label a paragraph, not to build a document outline.

### 3.2 Base font sizes (unchanged)
| Variable | Value |
|---|---|
| `--fs-base` | `17px` |
| `--fs-code` | `15px` |
| `--fs-code-small` | `13px` |
| `--fs-lang-label` | `15px` |

### 3.3 Spacing (unchanged)
- `--sp-single = 4px`, `--sp-double = 8px`
- Paragraph: `margin-top: 0`, `margin-bottom: var(--sp-double)`

---

## 4. Block Elements (base spec, unmodified)

These elements behave exactly like the base spec; only their surrounding wallpaper colour changes:

- Paragraph `<p>`
- Blockquote `<blockquote>`
- Lists `<ul>` / `<ol>` — flex-baseline markers, tabular-nums, marker-width unification
- Code block `<pre><code>` — 0.5px borders, language label, horizontal-scroll with gradient masks
- Table `<table>` — column cap `container × 2/3`, gradient masks on overflow
- Formula (KaTeX) — inline wrap, block scroll
- Horizontal rule `<hr>`
- Image `<img>`
- Footnotes
- Inline elements (bold / italic / strike / link / inline code / sup / sub)

---

## 5. Nesting Depth

- `--max-indent: 3` (base default)
- Flatten blockquote / list beyond 3 levels
- Chat messages rarely need deeper structure; the 640px bubble would otherwise crush readable line width

---

## 6. Empty State

Same as base: when the editor is empty the bubble is hidden so the virtual screen reads as an empty chat wallpaper, not an empty balloon.

---

## 7. Copy Behaviour

Unchanged from the base spec's Section 17. **Note**: headings still round-trip to `#`, `##`, `###`… — the visual flattening is presentation only, not a semantic downgrade.

---

## 8. Chats Mode Invariants (summary)

1. **Chat-wallpaper background** (`#EDEDED` / `#111`) — the mode's unmistakable cue
2. **All headings rendered at body size, weight 600** — flat rhythm, soft emphasis only
3. **Left-anchored bubble with pointer tip** — "incoming message" visual metaphor
4. **Max bubble width 640px** — comfortable chat reading width
5. **3-level max nesting** — short messages, shallow structure

---

_End of Chats-mode style document._
