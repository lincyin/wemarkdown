# AI Mode Rendering Style

This document describes the **visual & typographic rules** for the **AI** preview mode of WeMarkdown. It inherits from [`rendering-spec.md`](./rendering-spec.md) and only records what AI mode **adds** or **overrides**. Any renderer following this document together with the base spec should produce visually equivalent AI-mode output.

AI mode is the **default** preview mode. It represents a single AI reply rendered as a left-anchored chat bubble with a pointer tip — optimised for narrow, read-once LLM answers.

---

## 1. Scene Intent

| Property | Value |
|---|---|
| Scene | AI assistant reply (single message) |
| DOM selector | `.preview-panel[data-mode="ai"]` |
| Role | Default mode; applied when no explicit mode is selected |
| Reading pattern | Vertical scroll within a narrow, speech-bubble column |

AI mode treats the rendered Markdown as a **single utterance from the assistant**. Visual framing (left-anchored bubble, pointer tip, speech-bubble background) communicates "this is a spoken reply", so typography stays readable at the default base size without document-like headings.

---

## 2. Container

### 2.1 Virtual screen background — `.preview-outer`
- Background: `var(--pv-bg)` (light `#F5F5F5` / dark `#1C1C1E`) — a neutral "device wallpaper" tone
- Border-radius: inherits the device-mockup default (outer rounded corners)
- Top and bottom padding is provided by `.preview-card` (64px each) to simulate the safe area above and below a chat bubble on a mobile screen

### 2.2 Bubble container — `.preview-card`
- `padding: 16px`, `padding-top: 64px`, `padding-bottom: 64px`
- `overflow-y: auto` (bubble scrolls internally when content overflows)
- `overflow-x: hidden`
- Scrollbar fully hidden (`scrollbar-width: none`)

### 2.3 Bubble — `.markdown-body`
- Background: `var(--pv-card-bg)` (light `#FFFFFF` / dark `#252528`)
- Text colour: `var(--pv-text)`
- `border-radius: 8px`
- `padding: 8px 12px`
- `max-width: 640px` — bubble never stretches wider than comfortable chat-width, even on large virtual screens
- `position: relative` (anchors the pointer tip)
- `overflow: visible` (lets the tip escape the bubble box)

### 2.4 Pointer tip — `.markdown-body::before`
- Purely decorative SVG drawn to the **left** of the bubble, 6px outside its content box
- Size: `14px × 18px`
- Position: `top: 10px; left: -6px`
- Fill: matches the bubble background (`#FFFFFF` light / `#252528` dark)
- `pointer-events: none` (must not intercept clicks)
- Hidden when the editor is empty (`.preview-panel.is-empty .markdown-body { display: none }`)

---

## 3. Typography (base spec, unmodified)

AI mode uses the base variables from the rendering spec **verbatim**:

| Variable | Value | Applies to |
|---|---|---|
| `--fs-base` | `17px` | Body, paragraphs, inline text |
| `--fs-h1` | `--fs-base + 4px` = 21px | `<h1>` |
| `--fs-h2` | `--fs-base + 2px` = 19px | `<h2>` |
| `--fs-h3…h6` | `--fs-base` = 17px | `<h3>`–`<h6>` |
| `--fs-code` | `--fs-base − 2px` = 15px | Code blocks, table cells |
| `--fs-code-small` | `--fs-base − 4px` = 13px | Inline `<code>` in table headers |
| `--fs-lang-label` | `--fs-base − 2px` = 15px | Code-block language label |

Headings preserve the full six-level visual hierarchy. Paragraph spacing follows `--sp-single` / `--sp-double` exactly as defined in the base spec.

---

## 4. Block Elements (base spec, unmodified)

The following elements follow the base rendering spec **without override**:

- Paragraph `<p>`
- Headings `<h1>`–`<h6>` — full size & weight hierarchy, top breathing room via `padding-top`
- Blockquote `<blockquote>` — 2px left border, 20px left padding
- Lists `<ul>` / `<ol>` — flex-baseline markers, tabular-nums for ordered numbers, marker-width unification
- Code block `<pre><code>` — 0.5px top/bottom borders, language label, horizontal scroll with gradient masks
- Table `<table>` — column cap `container × 2/3`, gradient masks on overflow
- Formula (KaTeX) — inline wraps at operator boundaries; block formula gets horizontal scroll
- Horizontal rule `<hr>`
- Image `<img>`
- Footnotes
- Inline elements (bold / italic / strike / link / inline code / sup / sub)

---

## 5. Nesting Depth

- `--max-indent: 3` (base default)
- Blockquote or list beyond 3 levels is **flattened**: 4th-level blockquotes lose their left padding and border; 4th-level nested lists lose their left margin
- Rationale: AI mode's bubble is capped at 640px; deep nesting would crush readable line width

---

## 6. Empty State

When the editor is empty the bubble itself is hidden (`.markdown-body { display: none }`), leaving the virtual screen as a clean empty device — **not** an empty speech balloon. The `.preview-card`'s 16/64px padding keeps the centred-screen illusion intact.

---

## 7. Copy Behaviour (base spec, unmodified)

Copying rendered AI-mode output restores original Markdown syntax exactly as described in the base spec's Section 17.

---

## 8. AI Mode Invariants (summary)

1. **Left-anchored bubble with pointer tip** — the mode's visual signature
2. **Max bubble width 640px** — comfortable chat reading width
3. **Full heading hierarchy preserved** — LLM replies often include structured answers
4. **3-level max nesting** — keep line width readable inside a narrow bubble
5. **Neutral device wallpaper background** — bubble must read as foreground

---

_End of AI-mode style document._
