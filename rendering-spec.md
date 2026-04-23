# Markdown Rendering Spec

This specification describes the **visual & typographic rules** for rendering Markdown source into a presentable result. It is independent of any specific application UI, panel layout, or theme system. Any renderer following this spec should produce visually equivalent output.

---

## 1. Base Variables

All dimensions derive from these variables. Changing a base value propagates to derived values.

| Variable | Default | Purpose |
|---|---|---|
| `--fs-base` | `17px` | Body base font size |
| `--fs-h1` | `--fs-base + 4px` | Heading 1 |
| `--fs-h2` | `--fs-base + 2px` | Heading 2 |
| `--fs-h3` / `--fs-h4` / `--fs-h5` / `--fs-h6` | `--fs-base` | Heading 3–6 |
| `--fs-code` | `--fs-base − 2px` | Code blocks, table cells |
| `--fs-code-small` | `--fs-base − 4px` | Inline code within table header |
| `--fs-lang-label` | `--fs-base − 2px` | Code block language label |
| `--sp-single` | `4px` | Vertical gap for one line break |
| `--sp-double` | `8px` | Vertical gap for two line breaks (paragraph) |
| `--mt-h1` … `--mt-h6` | `12 / 8 / 4 / 0 / 0 / 0 px` (Files/default), `8 / 4 / 0 / 0 / 0 / 0 px` (AI mode) | Per-level heading **`padding-top`** (inner top breathing room) |
| `--max-indent` | `3` | Max nesting level (blockquote + lists combined) |

- Body line-height: `1.4`
- Body font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif`
- Monospace font stack: `"SFMono-Regular", "Menlo", "Monaco", "Consolas", monospace`

---

## 2. Paragraph Spacing Semantics

- Paragraph spacing uses only `margin-bottom`, never `margin-top` (avoid margin collapsing)
- **One line break** (rendered by marked as inline `<br>`) → vertical gap `--sp-single`
- **Two line breaks** (blank line, paragraph separator) → vertical gap `--sp-double`
- The first child element of the container has `margin-top: 0` (prevents leading heading from sticking to the top)

---

## 3. Headings `<h1>`–`<h6>`

### Font sizes
| Level | Size |
|---|---|
| H1 | `--fs-h1` (17 + 4 = 21px) |
| H2 | `--fs-h2` (17 + 2 = 19px) |
| H3 | `--fs-h3` (17px) |
| H4 | `--fs-h4` (17px) |
| H5 | `--fs-h5` (17px) |
| H6 | `--fs-h6` (17px) |

### Spacing & style
- `padding-top: var(--mt-h{1..6})` — per-level top breathing room implemented
  as **inner padding**, not outer margin. Effects:
  - Text sits at the bottom of the heading's own box (visually "anchored" to the content it introduces).
  - Border-box / outline covers the full heading block including this top space.
  - Vertical distance between the previous block and the heading follows the
    single paragraph rule (`--sp-double`), because `getBoundingClientRect` on
    the heading starts at the padding edge.
- `margin-top: 0` — heading's own `padding-top` is always honored, even when
  the heading is the first child of its container (the inner breathing room
  is part of the heading itself, not a function of its position).
- `margin-bottom: var(--sp-double)` = 8px
- `padding-bottom: 0`
- `border-bottom: none` (no underline)
- `font-weight: 600`
- `line-height: 1.4`

---

## 4. Body Paragraph `<p>`

- Font size: `--fs-base`
- Line height: `1.4`
- `margin-top: 0`, `margin-bottom: var(--sp-double)`
- `word-wrap: break-word`, `overflow-wrap: break-word`
- `word-break: normal` (avoid breaking English words mid-character)
- `line-break: strict`

---

## 5. Inline Elements

### 5.1 Bold / Italic / Strikethrough / Underline
- `<strong>`, `<em>`, `<del>`, `<u>`, `<s>`, `<ins>` all use `color: inherit`
- `<strong>` font-weight `600`
- Highlight syntax (`==text==` and raw `<mark>...</mark>`) is **not** supported; both are rendered as plain text

### 5.2 Link `<a>`
- Color: theme accent color (`--accent`)
- `text-decoration: none`
- Default `border-bottom: 0.5px solid transparent`
- Hover: `border-bottom-color` = accent color

### 5.3 Inline Code `<code>`
- Background: `--inline-code-bg` (light `rgba(0,0,0,0.05)` / dark `rgba(255,255,255,0.1)`)
- Font size: `85%` of parent
- `padding: 1px 0.4em`, `margin: 0 2px`, `border-radius: 4px`
- Monospace font
- `box-decoration-break: slice` (independent rounded corners when wrapping)
- `white-space: pre-wrap` (allow breaking)
- In table cells: upgrades to `--fs-code` = 15px
- In table headers: downgrades to `--fs-code-small` = 13px, `vertical-align: baseline`

### 5.4 Superscript / Subscript
- `font-variant-position: super` / `sub`
- `font-size: inherit` (don't change numeric size)
- `vertical-align: baseline`
- `line-height: inherit`

---

## 6. Code Block `<pre><code>`

### Structure
```
<div class="code-wrapper">
  <span class="code-lang-label">JS</span>   <!-- optional: language label -->
  <div class="code-scroll">
    <pre><code class="hljs language-js">...</code></pre>
  </div>
</div>
```

### Styling
- `margin-bottom: var(--sp-double)`
- Top and bottom borders `0.5px solid` (theme border color), no left/right borders, no background
- Wrapper `padding: 4px 0`
- **Language label**: `font-weight: 600`, `--fs-lang-label` = 15px, `text-transform: uppercase`, `letter-spacing: 0.5px`, secondary text color
- **Code body**: font size `--fs-code` = 15px, `white-space: pre` (no wrapping), horizontal scroll
- Scrollbar completely hidden
- On horizontal overflow, 24px-wide gradient mask on left/right edges (from background color to transparent)

### Syntax highlighting
- Use highlight.js or equivalent
- Light theme: GitHub Light colors
- Dark theme: GitHub Dark colors

### Code block isolation rules (important)
- `$...$`, `$$...$$` inside code blocks must **not** trigger formula rendering
- `#`, `>`, `*`, `-`, `|` inside code blocks must **not** trigger secondary Markdown parsing
- Implementation: during post-processing, skip all descendant text nodes of `<pre>` and `<code>`

---

## 7. Blockquote `<blockquote>`

- `padding: 0 0 0 20px`
- `margin: 0 0 var(--sp-double) 0`
- Left border `2px solid` (light `rgba(0,0,0,0.15)` / dark `rgba(255,255,255,0.15)`)
- Transparent background
- First child `margin-top: 0`, last child `margin-bottom: 0`

---

## 8. Lists

### 8.1 Basics
- `<ul>` / `<ol>` remove default markers (`list-style: none`), `padding-left: 0`, `margin-bottom: var(--sp-double)`
- `<li>` uses `display: flex; align-items: baseline; flex-wrap: wrap`
  - Marker and text aligned on baseline
  - Long text wraps while maintaining alignment
- Task list: `[x]` / `[ ]` kept as plain text, no checkbox rendering

### 8.2 Ordered list numbers
- Use real DOM nodes for numbers (not `::before`)
- `font-variant-numeric: tabular-nums` (monospaced digits)
- `text-align: right`
- `min-width: var(--ol-num-width, auto)`: measure the widest number in the same `<ol>`, apply uniformly
- `margin-right: 0.25em`
- Result: periods of `10.` and `2.` aligned in the same column

### 8.3 Unordered list bullets
- Use real DOM nodes wrapping `•` (`font-weight: 900`)
- Font size `--fs-base`
- `text-align: center`
- `min-width: var(--ul-bullet-width, auto)`: ensure `<ul>` / `<ol>` marker widths match

### 8.4 List item spacing
- `<li>` itself `margin-bottom: 0`
- Adjacent `li + li`: `margin-top: var(--sp-single)`
- `<p>` inside `<li>`: `margin-bottom: var(--sp-single)` (last `<p>` is 0)

### 8.5 Nested list indentation alignment
- Nested `<ul>` / `<ol>` uses `flex-basis: 100%` (wraps to full line)
- `margin-top: 4px`, `margin-bottom: 4px`
- `margin-left: calc(var(--ol-num-width, 1.2em) + 0.25em)`: child marker start aligns with parent text start
- `padding-left: 0`

### 8.6 Adjacent different-type lists
- `<ol> + <ul>`, `<ul> + <ol>`, `<ol> + <ol>`, `<ul> + <ul>`: `margin-top: calc(-1 * var(--sp-single))`
- Effect: gap between lists equals `--sp-single`, consistent with intra-list item spacing

---

## 9. Max Nesting Depth

### Default (`max-indent = 3`)
Blockquote or list nesting beyond 3 levels gets **flattened** starting from level 4:
- Level 4+ blockquote: remove `padding-left`, `border-left`, `margin-left`
- Level 4+ nested lists: `margin-left: 0`

### Purpose
Prevent excessive narrowing of text width in deep nesting.

### Adjustable range
Should support 2–6 levels; users or contexts may override default.

---

## 10. Horizontal Rule `<hr>`

- `height: 0.5px`
- `background`: theme border color
- `background-clip: content-box` (line stays within content box, padding is empty space)
- `border: 0`
- `padding: 4px 0` (self-contained 4px breathing room above/below the line)
- `margin: 0 0 var(--sp-double) 0` (outer spacing follows the paragraph rule — margin-bottom only)

---

## 11. Table `<table>`

### Structure
```
<div class="table-wrapper">
  <div class="table-scroll">
    <table>...</table>
  </div>
</div>
```

### Base styling
- Container: no border, no radius, no background
- `border-collapse: collapse`, `border-spacing: 0`
- Table width: `width: max-content; min-width: 100%`
- Cells: `padding: 12px 24px 12px 0` (top/bottom 12px, right 24px as column gap, left 0)
- Last column: `padding-right: 0`
- All cells bottom border: `0.5px solid` (theme border color)
- No zebra stripes, no other borders

### Header cells `<th>`
- Font size: `--fs-code`
- Font weight: `600`
- Color: light `rgba(0,0,0,0.45)` / dark `rgba(255,255,255,0.45)`
- Transparent background
- Inline `<code>` in headers: font size `--fs-code-small`, `vertical-align: baseline`

### Column max-width
- Column `max-width` = **container width × 2/3** (rounded to integer pixels)
- Width source = the container wrapping the rendered output (e.g., viewport or virtual screen)
- Recalculated on: initial render, window resize, container width change
- Long text `word-wrap: break-word`, `vertical-align: top`

### Alignment
- Respect Markdown syntax `| :--- | :---: | ---: |`, render as `text-align: left/center/right`

### Horizontal scroll mask
- On overflow, 24px gradient masks on both sides, from background color to transparent (same mechanism as code blocks)

---

## 12. LaTeX Formulas (KaTeX)

### 12.1 Inline formula `$...$`
- Wrap in `<span class="katex-inline">`
- Container `display: inline`
- `.katex-inline .katex { white-space: normal; word-break: keep-all; overflow-wrap: normal }`
- Each `.base` (KaTeX atomic unit) `display: inline-block; white-space: nowrap; word-break: keep-all`
  - Ensures single tokens (numbers, variables, commands) are not split
- Allow line break before `.mbin` (binary operators + − × ÷) and `.mrel` (relational operators = < > ≤ ≥)
  - Set these to `display: inline-block` as break opportunities
- **Effect**: inline formulas wrap at "word" (operator-separated) boundaries, never mid-token

### 12.2 Block formula `$$...$$`
- Structure:
  ```
  <div class="formula-wrapper">
    <div class="formula-scroll">
      <div class="katex-display">...</div>
    </div>
  </div>
  ```
- `margin: 4px 0` (tight top & bottom gap, independent of `--sp-double`)
- Horizontal scroll (long formulas don't wrap): `white-space: nowrap; overflow: visible`
- Short formulas centered; on overflow left-aligned (`text-align: center` + `overflow-x: auto`)
- Left/right gradient masks same as code blocks

### 12.3 Isolation rules
- `$` / `$$` recognition must skip text inside `<pre>` and `<code>`
- Implementation: TreeWalker + NodeFilter, or split string by `<pre>...</pre>` / `<code>...</code>` segments and replace each non-code segment

---

## 13. Footnotes

### 13.1 References `[^N]`
- Render as icon button (link icon), not numeric superscript
- Size: `width/height = calc(var(--fs-base) * 1.4)`
- `display: inline-flex; align-items: center; justify-content: center`
- `cursor: pointer`
- Hover: `opacity: 0.3`
- Adjacent footnote references automatically merge into single icon (avoid `[^1][^2][^3]` showing three side-by-side icons)

### 13.2 Footnote panel (presentation)
- Drawer (or overlay) sliding up from the bottom of the container
- Height approximately `1/3` of container, minimum `100px`
- Font size: `--fs-code` = 15px
- Between footnotes: `border-bottom: 0.5px solid`
- Nested lists inside panel max 1 level (flatten beyond); nested blockquotes flatten
- Slide-in animation: `transform: translateY(100%) → 0`, `0.25s cubic-bezier(0.4,0,0.2,1)`

---

## 14. Image `<img>`

- `max-width: 100%`
- `height: auto`
- `border-radius: var(--radius)` (recommended 8px)

---

## 15. Post-processing pipeline

After `marked.parse()` completes, apply the following steps in order:

1. **Process footnote references**: pre-render `[^N]` into icon structure before `innerHTML` replacement (avoids subsequent wrapping affecting it)
2. **Wrap tables**: each `<table>` wrapped in `.table-wrapper > .table-scroll`
3. **Wrap code blocks**: each `<pre>` wrapped in `.code-wrapper > .code-scroll`, extract `language-xxx` as language label
4. **Wrap formulas**: each `.katex-display` wrapped in `.formula-wrapper > .formula-scroll`
5. **Wrap heading text**: inner text of h1–h6 wrapped in `<span class="heading-text">` (for precise selection/highlighting)
6. **Wrap list text nodes**: direct text nodes inside list items wrapped in `<span class="li-text">`
7. **Wrap table cell text**: inner text of `<th>` / `<td>` wrapped in `<span class="cell-text">`
8. **Calculate table column width**: set all cells `max-width` based on container width × 2/3
9. **Align list marker widths**: measure widest number across all `<ol>`, set `--ol-num-width`; same for `<ul>` `--ul-bullet-width`
10. **Scroll shadow check**: detect overflow on tables/code blocks/formulas, add `.shadow-left` / `.shadow-right` to show gradient masks

---

## 16. Theme

### 16.1 Color principles
- Global background, text, border use CSS variables (`--bg-*`, `--text-*`, `--border-*`)
- Light / dark mode toggled via `<html data-theme="light|dark">`
- Only saturated color is "accent" `--accent` (light `#07C160` / dark `#2DD272`), used for:
  - Link text
  - Hover underline for inline code
  - Quote/selection highlight color

### 16.2 Theme transition
- When toggling `data-theme`, all color-related properties transition synchronously `0.5s ease`
- Transition properties: `background-color, background, color, border-color, fill, stroke, box-shadow, outline-color`
- During transition, **do not** re-render Markdown (avoids DOM rebuilding skipping transitions)
- hljs code theme stylesheet switching is atomic and not transitionable — acceptable limitation

---

## 17. Content Copy

When rendered output is copied by the user, it should **restore to original Markdown syntax**:

| Rendered element | Restored to |
|---|---|
| `<strong>x</strong>` | `**x**` |
| `<em>x</em>` | `*x*` |
| `<del>x</del>` / `<s>x</s>` | `~~x~~` |
| `<code>x</code>` | `` `x` `` |
| `<a href="URL">text</a>` | `[text](URL)` |
| `<ul>` / `<ol>` / `<li>` | `- x` / `1. x` |
| `<blockquote>` | `> x` |
| `<pre><code class="language-js">` | ` ```js\n...\n``` ` |
| `<table>` | GFM table syntax |
| `<hr>` | `---` |
| `<h1>`–`<h6>` | `# x` – `###### x` |
| Formula | `$...$` / `$$...$$` |

---

## 18. Compatibility notes

- Support GFM (GitHub Flavored Markdown)
- Support `breaks: true` (single line break renders as `<br>`)
- Support KaTeX formulas
- Support footnotes `[^N]` / `[^N]: ...`
- Support `<sup>` / `<sub>` HTML tags
- Support task lists `- [x]` / `- [ ]` (preserve text, no checkbox rendering)

---

_End of spec._
