# Files Mode Rendering Style

This document describes the **visual & typographic rules** for the **Files** preview mode of WeMarkdown. It inherits from [`rendering-spec.md`](./rendering-spec.md) and only records what Files mode **adds** or **overrides**. Any renderer following this document together with the base spec should produce visually equivalent Files-mode output.

Files mode is designed to preview a **standalone document** — a note, an article, a README. The bubble metaphor is dropped: content fills the virtual screen edge-to-edge as a single flat page, and the full six-level heading hierarchy is preserved so long structural documents render correctly.

---

## 1. Scene Intent

| Property | Value |
|---|---|
| Scene | Standalone document / note / article |
| DOM selector | `.preview-panel[data-mode="files"]` |
| Role | Secondary mode; opt-in from the mode switcher |
| Reading pattern | Document-style; long-form; outline-driven navigation |

Files mode removes every "chat message" affordance: no pointer tip, no rounded bubble, no horizontal gap between content and the virtual screen edge. What remains is the page.

---

## 2. Container

### 2.1 Virtual screen background — `.preview-outer`
- Background: `var(--card-bg)` — **same colour as the bubble**, because in Files mode the bubble *is* the page
- There is no visible seam between the outer and the content; the virtual screen reads as a sheet of paper

### 2.2 Page container — `.preview-card`
- `padding: 16px` vertical (`padding-top: 64px`, `padding-bottom: 64px`)
- **`padding-left: 0`, `padding-right: 0`** — no horizontal gap; content touches the virtual-screen side edges
- Vertical scroll, horizontal clip
- Scrollbar fully hidden

### 2.3 Page body — `.markdown-body`
Overrides from the base spec:

| Property | Base | Files mode |
|---|---|---|
| `border-radius` | `8px` | `0` |
| `padding` | `8px 12px` | `16px` (uniform) |
| `max-width` | `640px` | `100%` — fill the virtual screen |
| `::before` pointer tip | visible | **hidden** (`display: none`) |

```css
.preview-panel[data-mode="files"] .preview-card { padding-left: 0; padding-right: 0 }
.preview-panel[data-mode="files"] .markdown-body { max-width: 100%; border-radius: 0; padding: 16px }
.preview-panel[data-mode="files"] .markdown-body::before { display: none }
```

**Effect**: content is a flat page with 16px inner padding, flush with the virtual-screen left/right edges.

---

## 3. Typography (base spec, unmodified)

Files mode uses the base variables verbatim:

| Variable | Value | Applies to |
|---|---|---|
| `--fs-base` | `17px` | Body paragraphs |
| `--fs-h1` | `21px` | `<h1>` |
| `--fs-h2` | `19px` | `<h2>` |
| `--fs-h3…h6` | `17px` | `<h3>`–`<h6>` |
| `--fs-code` | `15px` | Code, cells |
| `--fs-code-small` | `13px` | Inline code in table headers |
| `--fs-lang-label` | `15px` | Code block language label |

The full six-level heading hierarchy (size differences between H1/H2, per-level top padding `--mt-h1…h6` = 12/8/4/0/0/0px) is preserved — Files mode is the only mode where a long outlined document reads correctly.

---

## 4. Block Elements

All block elements follow the base spec. Specific confirmations for Files mode:

- **Paragraph `<p>`** — `margin-bottom: var(--sp-double)`, `line-height: 1.4`
- **Headings `<h1>`–`<h6>`** — full size hierarchy, per-level `padding-top` for breathing room
- **Blockquote `<blockquote>`** — 2px left border, 20px left padding (overridden at depth 4 — see §5)
- **Lists `<ul>` / `<ol>`** — flex-baseline markers, tabular-nums, marker-width unification
- **Code block `<pre><code>`** — 0.5px top/bottom borders, language label, horizontal scroll with gradient masks
- **Table `<table>`** — column cap `container × 2/3`, gradient masks on overflow
- **Formula (KaTeX)** — inline wrap, block scroll
- **Horizontal rule `<hr>`**
- **Image `<img>`**
- **Footnotes**

---

## 5. Nesting Depth — extended

Files mode is the **only** mode that raises the nesting cap:

| Depth | Base spec | Files mode |
|---|---|---|
| 1–3 | Rendered normally | Rendered normally |
| 4 | **Flattened** (no padding / border / margin) | **Still rendered** (20px padding + 2px left border) |
| 5 | Flattened | Still rendered |
| 6 | Flattened | Still rendered |
| 7+ | Flattened | **Flattened** (hard cap) |

Implementation snippets (already in `style.css`):

```css
/* Allow depth 4 blockquote */
.preview-panel[data-mode="files"] .markdown-body blockquote blockquote blockquote blockquote {
  padding-left: 20px; border-left: 2px solid rgba(0,0,0,0.15);
}
[data-theme="dark"] .preview-panel[data-mode="files"] .markdown-body blockquote blockquote blockquote blockquote {
  border-left-color: rgba(255,255,255,0.15);
}

/* Keep nested-list indentation aligned beyond the base's 3-level cap */
.preview-panel[data-mode="files"] .markdown-body li>ul li>ul li>ul,
.preview-panel[data-mode="files"] .markdown-body li>ol li>ol li>ol /* …etc combinatorial selectors */ {
  margin-left: calc(var(--ol-num-width, 1.2em) + 0.25em);
}

/* Hard cap at level 7 */
.preview-panel[data-mode="files"] .markdown-body blockquote blockquote blockquote blockquote blockquote blockquote blockquote {
  padding-left: 0; border-left: none; margin-left: 0;
}
.preview-panel[data-mode="files"] .markdown-body li>ul li>ul li>ul li>ul li>ul li>ul,
.preview-panel[data-mode="files"] .markdown-body li>ol li>ol li>ol li>ol li>ol li>ol {
  margin-left: 0;
}
```

**Rationale**: long-form documents (meeting notes, specs, tutorials) routinely nest lists and quotes deeper than three levels. Files mode also runs edge-to-edge (no 640px bubble cap), so there is enough horizontal room to afford the extra indentation.

---

## 6. Empty State

Same as base: when the editor is empty `.markdown-body` is hidden, leaving a blank page on the virtual screen. Because Files mode shares the virtual-screen background with the page body, the empty state reads as "a blank document".

---

## 7. Copy Behaviour (base spec, unmodified)

Unchanged from the base spec's Section 17. Full document structure (headings `#…######`, nested lists, nested blockquotes up to 6 levels) round-trips to Markdown.

---

## 8. Files Mode Invariants (summary)

1. **Page, not bubble** — no pointer tip, no rounded corners, no horizontal gap, same background as the virtual screen
2. **Full six-level heading hierarchy preserved** — documents read like documents
3. **6-level nesting cap** (vs. base 3) — long-form content nests deeper
4. **`max-width: 100%`** — content uses the full virtual-screen width
5. **`padding: 16px`** — uniform inner breathing room on all four sides

---

_End of Files-mode style document._
