(function () {
  'use strict';

  // ===== i18n =====
  var I18N = {
    en: {
      'preview.title': 'Preview',
      'settings.title': 'Settings',
      'section.typography': 'Typography',
      'section.spacing': 'Spacing',
      'section.layout': 'Layout',
      'section.colors': 'Colors',
      'segment.light': 'Light',
      'segment.dark': 'Dark',
      'mode.chats': 'Chats',
      'mode.files': 'Files',
      'key.baseFontSize': 'Base font size',
      'key.h1Top': 'H1 top',
      'key.h2Top': 'H2 top',
      'key.h3Top': 'H3 top',
      'key.h4Top': 'H4 top',
      'key.h5Top': 'H5 top',
      'key.h6Top': 'H6 top',
      'key.bodyLineHeight': 'Body line-height',
      'key.headingLineHeight': 'Heading line-height',
      'key.singleBreak': 'Single break',
      'key.doubleBreak': 'Double break',
      'key.headerTop': 'Header top',
      'key.tableBottom': 'Table bottom',
      'key.maxIndent': 'Max indent',
      'key.text': 'Text',
      'key.border': 'Border',
      'key.cardBg': 'Card bg',
      'key.codeBg': 'Code bg',
      'ui.langToggle': 'Switch language',
      'ui.themeToggle': 'Toggle theme',
      'ui.openSettings': 'Open settings',
      'ui.fullscreen': 'Fullscreen preview',
      'ui.close': 'Close',
      'ui.exportImage': 'Export as image',
      'ui.exportImageTitle': 'Export as image',
      'ui.exportImageName': 'File name',
      'ui.exportImageDpr': 'Resolution',
      'ui.exportImageDo': 'Export',
      'ui.exportImageRendering': 'Exporting…',
      'ui.exportImageDone': 'Saved',
      'ui.exportImageFailed': 'Export failed',
      'ui.addScreen': 'Add screen',
      'editor.export': 'Export .md',
      'editor.reset': 'Reset to default content',
      'editor.toggle': 'Toggle Editor',
      'editor.placeholder': 'Type Markdown here...',
      'editor.switchExample': 'Switch example',
      'editor.uploadFile': 'Upload file…',
      'editor.newDoc': 'New document…',
      'editor.newDocTitle': 'New document',
      'editor.newDocPlaceholder': 'untitled.md',
      'editor.deleteDoc': 'Remove',
      'ui.cancel': 'Cancel',
      'ui.create': 'Create',
      'ui.reset': 'Reset',
      'ui.decrease': 'Decrease',
      'ui.increase': 'Increase',
      'ui.opacity': 'Opacity %',
      'ui.hex': 'Hex',
    },
    zh: {
      'preview.title': '预览',
      'settings.title': '设置',
      'inspector.title': '检查器',
      'section.typography': '字体',
      'section.spacing': '间距',
      'section.layout': '布局',
      'section.colors': '颜色',
      'segment.light': '浅色',
      'segment.dark': '深色',
      'mode.chats': '聊天',
      'mode.files': '文件',
      'key.baseFontSize': '基础字号',
      'key.h1Top': 'H1 顶间距',
      'key.h2Top': 'H2 顶间距',
      'key.h3Top': 'H3 顶间距',
      'key.h4Top': 'H4 顶间距',
      'key.h5Top': 'H5 顶间距',
      'key.h6Top': 'H6 顶间距',
      'key.bodyLineHeight': '正文行高',
      'key.headingLineHeight': '标题行高',
      'key.singleBreak': '单换行',
      'key.doubleBreak': '双换行',
      'key.headerTop': '表头顶间距',
      'key.tableBottom': '表格底间距',
      'key.maxIndent': '最大缩进',
      'key.text': '正文',
      'key.border': '边框',
      'key.cardBg': '气泡',
      'key.codeBg': '代码',
      'ui.langToggle': '切换语言',
      'ui.themeToggle': '切换主题',
      'ui.openSettings': '打开设置',
      'ui.addPreview': '新增对比预览',
      'ui.fullscreen': '全屏预览',
      'ui.close': '关闭',
      'ui.exportImage': '导出为图片',
      'ui.exportImageTitle': '导出为图片',
      'ui.exportImageName': '文件名',
      'ui.exportImageDpr': '清晰度',
      'ui.exportImageDo': '导出',
      'ui.exportImageRendering': '正在导出',
      'ui.exportImageDone': '已保存',
      'ui.exportImageFailed': '导出失败',
      'ui.addScreen': '添加屏幕',
      'editor.export': '导出 .md',
      'editor.reset': '重置为默认内容',
      'editor.toggle': '折叠 / 展开编辑器',
      'editor.placeholder': '在此输入 Markdown…',
      'editor.switchExample': '切换示例',
      'editor.uploadFile': '上传文件…',
      'editor.newDoc': '新建文档…',
      'editor.newDocTitle': '新建文档',
      'editor.newDocPlaceholder': 'untitled.md',
      'editor.deleteDoc': '移除',
      'ui.cancel': '取消',
      'ui.create': '创建',
      'ui.reset': '重置',
      'ui.decrease': '减少',
      'ui.increase': '增加',
      'ui.opacity': '不透明度 %',
      'ui.hex': '十六进制色值',
    },
  };
  var CURRENT_LANG = (function() {
    var saved = localStorage.getItem('md-lang');
    if (saved === 'en' || saved === 'zh') return saved;
    // Best-effort detection: pick zh only for explicit zh-* locales.
    var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return /^zh\b/.test(nav) ? 'zh' : 'en';
  })();
  function t(key) {
    var dict = I18N[CURRENT_LANG] || I18N.en;
    return dict[key] || (I18N.en[key] || key);
  }

  // ===== Keyboard shortcuts =====
  // Small registry so we can (a) dispatch in the global keydown
  // listener and (b) annotate `title` tooltips on the relevant
  // buttons. Each entry describes the chord per-OS + the element id
  // (or resolver fn) whose title should get the hint appended.
  //
  // We render the mac chord with ⌘ ⇧ ⌥ ⌃ glyphs (Apple HIG); every
  // other platform (Linux, Windows) falls back to "Ctrl+Shift+…"
  // literal text — the chord is stringified so there's no ambiguity
  // even when a title is already localized.
  var IS_MAC = (function() {
    try {
      // navigator.platform is deprecated in principle but still the
      // most robust Mac marker. userAgentData is not yet everywhere.
      var p = (navigator.platform || '') + ' ' + (navigator.userAgent || '');
      return /Mac|iPhone|iPad|iPod/i.test(p);
    } catch (_) {
      return false;
    }
  })();
  function formatShortcut(entry) {
    // entry: { mod: 'cmd'|'cmd+shift', key: 'S' } → "⌘S" or "Ctrl+Shift+S"
    var mod = entry.mod || 'cmd';
    var hasShift = /shift/.test(mod);
    var hasAlt = /alt/.test(mod);
    if (IS_MAC) {
      var parts = [];
      parts.push('\u2318'); // ⌘
      if (hasShift) parts.push('\u21E7'); // ⇧
      if (hasAlt) parts.push('\u2325'); // ⌥
      parts.push(entry.key);
      return parts.join('');
    } else {
      var segs = ['Ctrl'];
      if (hasShift) segs.push('Shift');
      if (hasAlt) segs.push('Alt');
      segs.push(entry.key);
      return segs.join('+');
    }
  }
  // Registry — maps action name → { chord, element resolver }.
  // Keep in lock-step with the global keydown dispatcher below.
  var SHORTCUTS = {
    uploadFile:    { mod: 'cmd',       key: 'O',  target: function(){ return document.getElementById('example-upload-btn'); } },
    exportMd:      { mod: 'cmd',       key: 'S',  target: function(){ return document.getElementById('export-md'); } },
    exportImage:   { mod: 'cmd+shift', key: 'S',  target: function(){ return document.getElementById('export-image-btn'); } },
    addScreen:     { mod: 'cmd+shift', key: 'A',  target: function(){ return document.getElementById('screen-add-btn'); } },
    toggleSettings:{ mod: 'cmd',       key: ',',  target: function(){ return document.getElementById('settings-open-btn'); } },
  };
  function applyShortcutTitles() {
    Object.keys(SHORTCUTS).forEach(function(name) {
      var sc = SHORTCUTS[name];
      var el = sc.target && sc.target();
      if (!el) return;
      var base = el.getAttribute('title') || '';
      // Strip any previously-appended " (…)" suffix before re-adding,
      // so repeated applyI18n calls don't pile up trailing chords.
      base = base.replace(/\s*\([^()]*[\u2318\u21E7\u2325\u2303+][^()]*\)\s*$/, '').trim();
      var chord = formatShortcut(sc);
      el.setAttribute('title', base + ' (' + chord + ')');
    });
  }

  function applyI18n() {
    // Text content for [data-i18n]
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
    // Title attribute for [data-i18n-title]
    nodes = document.querySelectorAll('[data-i18n-title]');
    for (var j = 0; j < nodes.length; j++) {
      nodes[j].setAttribute('title', t(nodes[j].getAttribute('data-i18n-title')));
    }
    // Placeholder for [data-i18n-placeholder]
    nodes = document.querySelectorAll('[data-i18n-placeholder]');
    for (var k = 0; k < nodes.length; k++) {
      nodes[k].setAttribute('placeholder', t(nodes[k].getAttribute('data-i18n-placeholder')));
    }
    // Append keyboard-shortcut hints to `title` where applicable.
    // Kept separate from data-i18n-title so the i18n-owned baseline
    // is always refreshed first and the suffix is re-applied on every
    // language flip — no stale " (⌘S)" tails left behind.
    applyShortcutTitles();
    // Bulk title translation for common stepper buttons (Reset / Decrease /
    // Increase) so we don't need a data-i18n-title on every one.
    var resetBtns = document.querySelectorAll('.stepper-reset');
    for (var r = 0; r < resetBtns.length; r++) resetBtns[r].setAttribute('title', t('ui.reset'));
    var decBtns = document.querySelectorAll('[id$="-decrease"]');
    for (var d = 0; d < decBtns.length; d++) decBtns[d].setAttribute('title', t('ui.decrease'));
    var incBtns = document.querySelectorAll('[id$="-increase"]');
    for (var e = 0; e < incBtns.length; e++) incBtns[e].setAttribute('title', t('ui.increase'));
    // Hex / alpha inputs in color rows
    var hexInputs = document.querySelectorAll('.hex-input');
    for (var h = 0; h < hexInputs.length; h++) hexInputs[h].setAttribute('title', t('ui.hex'));
    var alphaInputs = document.querySelectorAll('.alpha-input');
    for (var a = 0; a < alphaInputs.length; a++) alphaInputs[a].setAttribute('title', t('ui.opacity'));
    // Language dropdown menu: mark active item
    var langItems = document.querySelectorAll('.lang-dropdown-item');
    for (var li = 0; li < langItems.length; li++) {
      langItems[li].classList.toggle('active', langItems[li].getAttribute('data-lang') === CURRENT_LANG);
    }
    // Update <html lang>
    document.documentElement.setAttribute('lang', CURRENT_LANG);
    // Re-apply the multi-screen Settings title suffix (e.g. "设置 · 屏幕 2")
    // since the plain [data-i18n="settings.title"] update above would
    // otherwise wipe the suffix.
    if (window.__screens && window.__screens.updateSettingsTitle) {
      window.__screens.updateSettingsTitle();
    }
  }
  function setLang(newLang) {
    if (newLang !== 'en' && newLang !== 'zh') return;
    if (newLang === CURRENT_LANG) return;
    CURRENT_LANG = newLang;
    localStorage.setItem('md-lang', newLang);
    applyI18n();
    // Refresh dynamic text that's not driven by data-i18n attributes.
    if (typeof setMode === 'function' && typeof currentMode !== 'undefined') {
      setMode(currentMode);
    }
    // Swap editor content ONLY when a built-in example is active —
    // built-ins ship with language-specific copy and the user expects
    // them to follow the locale. User documents have no "other
    // language version", so we leave the editor contents alone so
    // the user's typing doesn't get overwritten.
    defaultContent = currentDefaultContent();
    var activeEx = (typeof currentExample === 'function') ? currentExample() : null;
    var isUserDoc = activeEx && activeEx.kind === 'user';
    if (!isUserDoc && typeof editor !== 'undefined' && editor) {
      editor.value = defaultContent;
      if (typeof renderMarkdown === 'function') renderMarkdown();
      if (typeof window.__syncEditorReset === 'function') window.__syncEditorReset();
    }
    // Re-render the example picker label/menu so they follow the new
    // language (e.g. "Attention.md" stays the same but the active
    // indicator still needs re-painting).
    if (typeof window.__syncExampleLabel === 'function') window.__syncExampleLabel();
  }

  var editor = document.getElementById('editor');
  var lineNumbers = document.getElementById('line-numbers');
  var preview = document.getElementById('preview');
  var previewBg = document.getElementById('preview-bg');
  var previewCard = document.getElementById('preview-card');
  var previewOuter = document.getElementById('preview-outer');
  var primaryScreenWrap = previewOuter && previewOuter.parentElement; // .screen-wrap[data-screen-index="1"]
  var screensContainer = document.getElementById('screens-container'); // container of all virtual screens
  // Side handles live inside each .screen-wrap (per-screen grabbers).
  // We query by class and operate on all of them collectively.
  function getAllSideHandles() {
    return Array.prototype.slice.call(document.querySelectorAll('.screen-side-handle'));
  }
  var handleTop = document.getElementById('card-handle-top');
  var handleBottom = document.getElementById('card-handle-bottom');
  var editorPanel = document.getElementById('editor-panel');
  var widthLabel = document.getElementById('width-label');
  var divider = document.getElementById('divider');
  var themeToggle = document.getElementById('theme-toggle');
  var toastEl = document.getElementById('toast');
  var inspectorContent = document.getElementById('inspector-content');

  var isDragging = false;

  // Custom renderer: disable task list checkboxes
  var renderer = new marked.Renderer();
  renderer.listitem = function(text) {
    var checkedMatch = text.match(/^\s*<input\s[^>]*checked[^>]*>\s*/i);
    var uncheckedMatch = text.match(/^\s*<input\s[^>]*type="checkbox"[^>]*>\s*/i);
    if (checkedMatch) {
      text = text.replace(checkedMatch[0], '[x] ');
    } else if (uncheckedMatch) {
      text = text.replace(uncheckedMatch[0], '[ ] ');
    }
    return '<li>' + text + '</li>\n';
  };
  marked.setOptions({ breaks: true, gfm: true, renderer: renderer });

  // Source line mapping: store token info from last render
  var _sourceTokens = []; // [{raw, line, endLine}]

  function buildSourceMap(text) {
    var tokens = marked.lexer(text);
    _sourceTokens = [];
    var pos = 0;
    for (var t = 0; t < tokens.length; t++) {
      var token = tokens[t];
      if (!token.raw || token.type === 'space') continue;
      var idx = text.indexOf(token.raw, pos);
      if (idx >= 0) {
        var line = 1;
        for (var c = 0; c < idx; c++) { if (text[c] === '\n') line++; }
        // Trim trailing whitespace/newlines before counting span, so a
        // heading like "## X\n\n" doesn't claim two extra lines that
        // belong to the blank gap after it.
        var rawTrimmed = token.raw.replace(/\s+$/, '');
        var endLine = line;
        for (var c2 = 0; c2 < rawTrimmed.length; c2++) { if (rawTrimmed[c2] === '\n') endLine++; }
        // Clean text for matching: strip markdown syntax, normalize whitespace
        var cleanRaw = token.raw
          .replace(/^#{1,6}\s+/gm, '')
          .replace(/^(?:>\s*)+/gm, '')
          .replace(/^\d+\.\s+/gm, '')
          .replace(/^[-*+]\s+/gm, '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/\$\$[\s\S]*?\$\$/g, '')
          .replace(/\|/g, ' ')
          .replace(/[-=]{3,}/g, '')
          .replace(/[*_~`]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        _sourceTokens.push({ clean: cleanRaw, line: line, endLine: endLine });
        pos = idx + token.raw.length;
      }
    }
  }

  function findSourceLines(el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    if (!text || text.length < 2) return null;
    // Try matching against stored tokens
    var searchStr = text.substring(0, Math.min(50, text.length));
    var bestIdx = -1;
    var bestScore = 0;
    for (var i = 0; i < _sourceTokens.length; i++) {
      var tk = _sourceTokens[i];
      if (tk.clean.indexOf(searchStr) !== -1) {
        return { line: tk.line, endLine: tk.endLine };
      }
      // Try shorter
      var short20 = text.substring(0, Math.min(20, text.length));
      if (short20.length >= 3 && tk.clean.indexOf(short20) !== -1 && bestScore < 2) {
        bestIdx = i; bestScore = 2;
      }
      var short10 = text.substring(0, Math.min(10, text.length));
      if (short10.length >= 3 && tk.clean.indexOf(short10) !== -1 && bestScore < 1) {
        bestIdx = i; bestScore = 1;
      }
    }
    if (bestIdx >= 0) return { line: _sourceTokens[bestIdx].line, endLine: _sourceTokens[bestIdx].endLine };
    // Fallback: search raw source lines
    var lines = editor.value.split('\n');
    for (var j = 0; j < lines.length; j++) {
      var stripped = lines[j].replace(/^(?:>\s*)+/, '').replace(/^#{1,6}\s+/, '').replace(/^\d+\.\s+/, '').replace(/^[-*+]\s+/, '').replace(/[*_~`]/g, '').trim();
      if (stripped.length > 0 && stripped.indexOf(searchStr) !== -1) {
        return { line: j + 1, endLine: j + 1 };
      }
    }
    return null;
  }

  // Precompiled regexes reused across renderLatex calls
  var _reBlockDollar = /\$\$([\s\S]+?)\$\$/g;
  var _reInlineDollar = /\$([^$\n]+?)\$/g;
  var _rePreCodeSplit = /(<pre[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>)/g;

  function renderLatex() {
    // Fast path: most edits don't involve math. Skip all work if the preview
    // has no '$' anywhere. This is the single biggest win because renderLatex
    // used to read preview.innerHTML + run regex splits unconditionally.
    var previewHtml = preview.innerHTML;
    if (previewHtml.indexOf('$') === -1) return;

    // Walk text nodes, skip anything inside <code> or <pre> (code blocks /
    // inline code) so $$...$$ or $...$ inside code are left untouched.
    var walker = document.createTreeWalker(preview, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        if (node.parentElement && node.parentElement.closest('pre, code')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var textNodes = [];
    var n;
    while ((n = walker.nextNode())) textNodes.push(n);

    // Pass 1: per-text-node replacement. Each text node gets a single regex
    // scan for '$' first (cheap) before attempting block/inline matches.
    for (var i = 0; i < textNodes.length; i++) {
      var node = textNodes[i];
      var text = node.nodeValue;
      if (text.indexOf('$') === -1) continue;

      var html = text;
      html = html.replace(_reBlockDollar, function(_, tex) {
        try {
          return '<div class="katex-display">' + katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }) + '</div>';
        } catch(e) { return _; }
      });
      html = html.replace(_reInlineDollar, function(_, tex) {
        try {
          return '<span class="katex-inline">' + katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }) + '</span>';
        } catch(e) { return _; }
      });

      if (html === text) continue;

      var wrapper = document.createElement('span');
      wrapper.innerHTML = html;
      var parent = node.parentNode;
      while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, node);
      parent.removeChild(node);
    }

    // Pass 2: recover $$...$$ blocks that marked split into <p>...<br>...</p>.
    // Only runs when a $$ pair still exists in the serialized HTML; otherwise
    // skip the innerHTML round-trip + regex split entirely.
    var html2 = preview.innerHTML;
    if (html2.indexOf('$$') === -1) return;

    var parts = html2.split(_rePreCodeSplit);
    var changed = false;
    for (var p = 0; p < parts.length; p++) {
      if (/^<pre|^<code/i.test(parts[p])) continue;
      if (parts[p].indexOf('$$') === -1) continue;
      var before = parts[p];
      parts[p] = before.replace(_reBlockDollar, function(_, tex) {
        var clean = tex.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').trim();
        try {
          return '<div class="katex-display">' + katex.renderToString(clean, { displayMode: true, throwOnError: false }) + '</div>';
        } catch(e) { return _; }
      });
      if (parts[p] !== before) changed = true;
    }
    if (changed) preview.innerHTML = parts.join('');
  }

  function postProcess() {
    var blocks = preview.querySelectorAll('pre code');
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      try { hljs.highlightElement(block); } catch(e) {}
      var cls = block.className || '';
      var m = cls.match(/language-(\w+)/);
      var lang = m ? m[1] : '';
      var pre = block.parentElement;
      if (lang && pre && !pre.querySelector('.code-lang-label')) {
        var label = document.createElement('span');
        label.className = 'code-lang-label';
        label.textContent = lang.toUpperCase();
        pre.insertBefore(label, pre.firstChild);
      }
    }
    if (typeof katex !== 'undefined') { renderLatex(); }
    processFootnoteRefs(); // Must run before wrap* functions since it rewrites innerHTML
    wrapTables();
    wrapCodeBlocks();
    wrapFormulas();
    wrapHeadingText();
    wrapListTextNodes();
    wrapTableCellText();
    wrapCjkInEmphasis();
    updateTableMaxWidth();
    adjustListWidths();
  }

  // Wrap direct text nodes in list items with <span class="li-text">
  // Also replace ::before pseudo-elements with real DOM for number/bullet
  function wrapListTextNodes() {
    var lis = preview.querySelectorAll('li');
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i];
      if (li.querySelector('.li-marker')) continue;

      // Determine marker type
      var parentList = li.parentElement;
      var isOl = parentList && parentList.tagName === 'OL';

      // Create marker element
      var marker = document.createElement('span');
      marker.className = 'li-marker';
      if (isOl) {
        // Get the index
        var idx = 0;
        var prev = li;
        while (prev) { if (prev.tagName === 'LI') idx++; prev = prev.previousElementSibling; }
        marker.textContent = idx + '.';
        marker.classList.add('li-marker-ol');
      } else {
        marker.textContent = '\u00B7';
        marker.classList.add('li-marker-ul');
      }

      // Wrap remaining content in li-text.
      //
      // Only nested lists (UL/OL) are broken out as direct children of
      // <li>, because they need the flex-wrap layout to put themselves
      // on a new row below the marker+text row.
      //
      // Everything else — including blockquotes, code blocks, tables,
      // formula wrappers and <p> from loose lists — stays INSIDE
      // .li-text so that:
      //   * blockquote / pre / table render flush with the list item's
      //     text baseline (i.e. "aligned with the prose"), giving the
      //     visual indent the user expects — the blockquote's own
      //     padding-left + border-left reads as a vertical rule to the
      //     LEFT of the text, not to the left of the marker.
      //   * our `.li-text > blockquote` / `.li-text > pre` etc. CSS
      //     rules handle the single-line rhythm gap above them without
      //     disturbing the blockquote's default 20px padding-left
      //     and 2px border-left visual.
      var textSpan = document.createElement('span');
      textSpan.className = 'li-text';
      while (li.firstChild) {
        var child = li.firstChild;
        if (child.nodeType === 1 && (child.tagName === 'UL' || child.tagName === 'OL')) break;
        textSpan.appendChild(child);
      }

      li.insertBefore(marker, li.firstChild);
      if (textSpan.childNodes.length > 0) {
        li.insertBefore(textSpan, marker.nextSibling);
      }
    }
  }

  // Wrap text in table cells with <span class="cell-text">
  function wrapTableCellText() {
    var cells = preview.querySelectorAll('th, td');
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      if (cell.querySelector('.cell-text')) continue;
      var span = document.createElement('span');
      span.className = 'cell-text';
      while (cell.firstChild) { span.appendChild(cell.firstChild); }
      cell.appendChild(span);
    }
  }

  // Process footnotes: parse from raw source, support multi-line definitions
  var footnoteData = {}; // key -> rendered HTML content

  // Parse footnote definitions from source text; returns cleaned text
  function extractFootnotes(text) {
    footnoteData = {};
    var lines = text.split('\n');
    var result = [];
    var currentKey = null;
    var currentContent = [];

    function flushFootnote() {
      if (currentKey) {
        var raw = currentContent.join('\n').replace(/^\s+$/, '');
        // Strip headings and nested footnote defs
        raw = raw.replace(/^#{1,6}\s+/gm, '').replace(/^\[\^[^\]]+\]:\s*/gm, '');
        footnoteData[currentKey] = neutralizeMarkTags(marked.parse(raw));
        currentKey = null;
        currentContent = [];
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var defMatch = line.match(/^\[\^([^\]]+)\]:\s*(.*)/);
      if (defMatch) {
        flushFootnote();
        currentKey = defMatch[1];
        currentContent = [defMatch[2]];
        continue;
      }
      if (currentKey && /^[ ]{2,4}\S/.test(line)) {
        currentContent.push(line.replace(/^[ ]{2,4}/, ''));
        continue;
      }
      if (currentKey && line.trim() === '') {
        currentContent.push('');
        continue;
      }
      if (currentKey && line.trim() !== '') {
        flushFootnote();
      }
      result.push(line);
    }
    flushFootnote();
    return result.join('\n');
  }

  // key -> 1-based appearance index. Built during processFootnoteRefs
  // by walking the rendered HTML in source order. Used by the Files
  // mode text rendering: the icon is visually swapped for a `[1]`-style
  // numeric superscript via CSS, but the numbers themselves have to be
  // baked into the DOM when the refs are created.
  var footnoteOrder = {};

  function processFootnoteRefs() {
    if (Object.keys(footnoteData).length === 0) return;
    var html = preview.innerHTML;

    // Replace footnote references [^key] with link icon
    // Merge adjacent footnote refs into a single icon
    var fnIconLight = '<span class="fn-icon fn-icon-light"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect width="18" height="18" rx="9" fill="#F0F0F4"/><path d="M11.4749 8.17502L12.2998 8.99998L13.5373 7.76255C14.4485 6.85132 14.4485 5.37394 13.5373 4.46271C12.626 3.55149 11.1486 3.55149 10.2374 4.46271L7.76255 6.93759C6.85132 7.84881 6.85132 9.3262 7.76255 10.2374L8.5875 9.41246C8.13189 8.95685 8.13189 8.21816 8.5875 7.76255L11.0624 5.28767C11.518 4.83206 12.2567 4.83206 12.7123 5.28767C13.1679 5.74328 13.1679 6.48198 12.7123 6.93759L11.4749 8.17502Z" fill="#576B95"/><path d="M6.52511 9.82494L5.70015 8.99998L4.46271 10.2374C3.55149 11.1486 3.55149 12.626 4.46271 13.5373C5.37394 14.4485 6.85132 14.4485 7.76255 13.5373L10.2374 11.0624C11.1486 10.1512 11.1486 8.67377 10.2374 7.76255L9.41246 8.5875C9.86807 9.04312 9.86807 9.78181 9.41246 10.2374L6.93759 12.7123C6.48198 13.1679 5.74328 13.1679 5.28767 12.7123C4.83206 12.2567 4.83206 11.518 5.28767 11.0624L6.52511 9.82494Z" fill="#576B95"/></svg></span>';
    var fnIconDark = '<span class="fn-icon fn-icon-dark"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect width="18" height="18" rx="9" fill="#18181B"/><path d="M11.4749 8.17502L12.2998 8.99998L13.5373 7.76255C14.4485 6.85132 14.4485 5.37394 13.5373 4.46271C12.626 3.55149 11.1486 3.55149 10.2374 4.46271L7.76255 6.93759C6.85132 7.84881 6.85132 9.3262 7.76255 10.2374L8.5875 9.41246C8.13189 8.95685 8.13189 8.21816 8.5875 7.76255L11.0624 5.28767C11.518 4.83206 12.2567 4.83206 12.7123 5.28767C13.1679 5.74328 13.1679 6.48198 12.7123 6.93759L11.4749 8.17502Z" fill="#7D90A9"/><path d="M6.52511 9.82494L5.70015 8.99998L4.46271 10.2374C3.55149 11.1486 3.55149 12.626 4.46271 13.5373C5.37394 14.4485 6.85132 14.4485 7.76255 13.5373L10.2374 11.0624C11.1486 10.1512 11.1486 8.67377 10.2374 7.76255L9.41246 8.5875C9.86807 9.04312 9.86807 9.78181 9.41246 10.2374L6.93759 12.7123C6.48198 13.1679 5.74328 13.1679 5.28767 12.7123C4.83206 12.2567 4.83206 11.518 5.28767 11.0624L6.52511 9.82494Z" fill="#7D90A9"/></svg></span>';

    // Reset per-render numbering map.
    footnoteOrder = {};
    var nextFnNum = 1;

    // First pass: replace each [^key] with a placeholder marker, and
    // assign a monotonically increasing number to each DISTINCT key in
    // source order (same key reused later shares the number).
    html = html.replace(/\[\^([^\]]+)\](?!:)/g, function(_, key) {
      if (footnoteData[key] !== undefined) {
        if (footnoteOrder[key] == null) {
          footnoteOrder[key] = nextFnNum++;
        }
        return '<!--fn:' + key + '-->';
      }
      return _;
    });

    // Second pass: merge adjacent footnote markers into single ref.
    // Files mode displays them as "[1,2]"-style numeric superscripts;
    // AI / Chats keep the circular link icon. Both layouts are baked
    // into the DOM and CSS chooses which to show per mode.
    html = html.replace(/(<!--fn:([^-]+)-->)(\s*<!--fn:([^-]+)-->)*/g, function(match) {
      var keys = [];
      var re = /<!--fn:([^-]+)-->/g;
      var m;
      while ((m = re.exec(match)) !== null) {
        keys.push(m[1]);
      }
      var nums = keys.map(function(k){ return footnoteOrder[k] || '?'; });
      var textLabel = '[' + nums.join(',') + ']';
      return '<span class="footnote-ref" data-fn="' + keys.join(',') + '">'
           + fnIconLight + fnIconDark
           + '<span class="fn-text">' + textLabel + '</span>'
           + '</span>';
    });

    preview.innerHTML = html;
  }

  // Event delegation for footnote clicks (survives DOM rewrites)
  // Aggregates all footnote refs in the same parent block.
  // Delegate to preview-outer-row so footnote clicks work on both the
  // primary preview and any cloned virtual screens.
  (document.getElementById('preview-outer-row') || preview).addEventListener('click', function(e) {
    var ref = e.target.closest('.footnote-ref');
    if (!ref) return;
    e.preventDefault();
    e.stopPropagation();
    // Block the Inspector's delegate (registered on the same node) from
    // treating this as an element-inspection click.
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }

    var fnKeys = ref.getAttribute('data-fn');
    if (!fnKeys) return;
    var keys = fnKeys.split(',');
    var entries = [];
    for (var i = 0; i < keys.length; i++) {
      if (footnoteData[keys[i]]) entries.push(keys[i]);
    }
    if (entries.length === 0) return;
    showFootnotePanel(entries);
  });

  // Footnote 1/3-height panel — mounted on preview-panel
  var previewPanelEl = document.querySelector('.preview-panel');

  function showFootnotePanel(keys) {
    closeFootnotePanel();

    // Backdrop: blocks all interactions behind the panel
    var backdrop = document.createElement('div');
    backdrop.className = 'footnote-backdrop';
    backdrop.id = 'footnote-backdrop';
    backdrop.addEventListener('click', function(e) {
      e.stopPropagation();
      closeFootnotePanel();
    });

    var panel = document.createElement('div');
    panel.className = 'footnote-panel';
    panel.id = 'footnote-panel';

    var header = document.createElement('div');
    header.className = 'footnote-panel-header';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'footnote-panel-close';
    closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeFootnotePanel();
    });

    var title = document.createElement('span');
    title.className = 'footnote-panel-title';
    title.textContent = 'References';

    header.appendChild(closeBtn);
    header.appendChild(title);

    var body = document.createElement('div');
    body.className = 'footnote-panel-body';

    for (var i = 0; i < keys.length; i++) {
      var item = document.createElement('div');
      item.className = 'footnote-panel-item';
      item.innerHTML = footnoteData[keys[i]];
      body.appendChild(item);
    }

    panel.appendChild(header);
    panel.appendChild(body);

    previewPanelEl.appendChild(backdrop);
    previewPanelEl.appendChild(panel);

    backdrop.offsetHeight;
    panel.offsetHeight;
    backdrop.classList.add('visible');
    panel.classList.add('visible');
  }

  function closeFootnotePanel() {
    var panel = document.getElementById('footnote-panel');
    var backdrop = document.getElementById('footnote-backdrop');
    if (panel) {
      panel.classList.remove('visible');
      setTimeout(function() {
        if (panel.parentNode) panel.parentNode.removeChild(panel);
      }, 200);
    }
    if (backdrop) {
      backdrop.classList.remove('visible');
      setTimeout(function() {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      }, 200);
    }
  }

  // Wrap heading text in span so text is selectable while showing block area
  function wrapHeadingText() {
    var headings = preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      if (h.querySelector('.heading-text')) continue;
      var span = document.createElement('span');
      span.className = 'heading-text';
      while (h.firstChild) { span.appendChild(h.firstChild); }
      h.appendChild(span);
    }
  }

  // ===== CJK-upright italic enforcement =====
  // CSS-only @font-face unicode-range tricks are unreliable on
  // Chromium/Safari: system CJK fonts (PingFang SC, Hiragino, etc.)
  // report an italic face that the OS synthesizes by geometric slant,
  // so the browser thinks it "already found" an italic face and
  // `font-synthesis: style` never kicks in — the result is slanted
  // Chinese/Japanese/Korean text inside `*...*`.
  //
  // Instead we post-process: inside every <em>/<i>, find contiguous
  // runs of CJK codepoints (ideographs, kana, hangul, full-width
  // punctuation) and wrap each run in <span class="cjk-upright">.
  // CSS then forces `font-style: normal` on that span, guaranteeing
  // upright CJK glyphs regardless of the font stack. Latin / digits
  // stay outside the wrapper so they keep their italic face.
  var CJK_RUN_RE = /[\u2E80-\u2FFF\u3000-\u303F\u3040-\u30FF\u3100-\u312F\u3130-\u318F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]+/g;

  function wrapCjkInEmphasis() {
    // <em>/<i> may be nested inside <strong> (for ***bold italic***)
    // or wrap other inline content — a flat querySelectorAll is fine,
    // we just walk each emphasis element's text descendants.
    var ems = preview.querySelectorAll('em, i');
    for (var i = 0; i < ems.length; i++) {
      wrapCjkTextNodesIn(ems[i]);
    }
  }

  function wrapCjkTextNodesIn(root) {
    // Collect text nodes first so that DOM mutations during wrapping
    // don't disturb the walker (TreeWalker is live).
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        // Skip text inside code/pre (defensive — shouldn't happen
        // inside <em>, but cheap and future-proof).
        var p = node.parentNode;
        while (p && p !== root) {
          var tag = p.nodeName;
          if (tag === 'CODE' || tag === 'PRE') return NodeFilter.FILTER_REJECT;
          // Already wrapped → skip to avoid double-wrapping on re-render.
          if (p.nodeType === 1 && p.classList && p.classList.contains('cjk-upright')) {
            return NodeFilter.FILTER_REJECT;
          }
          p = p.parentNode;
        }
        return CJK_RUN_RE.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var textNodes = [];
    var n;
    while ((n = walker.nextNode())) textNodes.push(n);

    for (var t = 0; t < textNodes.length; t++) {
      wrapCjkRunsInTextNode(textNodes[t]);
    }
  }

  function wrapCjkRunsInTextNode(textNode) {
    var text = textNode.nodeValue;
    CJK_RUN_RE.lastIndex = 0; // reset stateful regex
    var parent = textNode.parentNode;
    if (!parent) return;
    var frag = document.createDocumentFragment();
    var lastIndex = 0;
    var m;
    var matched = false;
    while ((m = CJK_RUN_RE.exec(text)) !== null) {
      matched = true;
      if (m.index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
      }
      var span = document.createElement('span');
      span.className = 'cjk-upright';
      span.textContent = m[0];
      frag.appendChild(span);
      lastIndex = m.index + m[0].length;
    }
    if (!matched) return;
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    parent.replaceChild(frag, textNode);
  }

  // Wrap code blocks with gradient mask container
  function wrapCodeBlocks() {
    var pres = preview.querySelectorAll('pre');
    for (var i = 0; i < pres.length; i++) {
      var pre = pres[i];
      if (pre.parentElement.classList.contains('code-scroll')) continue;
      if (pre.parentElement.classList.contains('code-wrapper')) continue;

      var wrapper = document.createElement('div');
      wrapper.className = 'code-wrapper';

      // Move lang label out of pre into wrapper (above scroll area)
      var langLabel = pre.querySelector('.code-lang-label');
      pre.parentNode.insertBefore(wrapper, pre);
      if (langLabel) {
        pre.removeChild(langLabel);
        wrapper.appendChild(langLabel);
      }

      // Create scroll container for code only
      var scrollDiv = document.createElement('div');
      scrollDiv.className = 'code-scroll';
      wrapper.appendChild(scrollDiv);
      scrollDiv.appendChild(pre);

      // Shadow detection on the code element (actual scroll container)
      var code = pre.querySelector('code');
      var scrollTarget = code || pre;
      checkScrollShadow(scrollDiv, scrollTarget);
      (function(sd, st) {
        st.addEventListener('scroll', function() { checkScrollShadow(sd, st); });
      })(scrollDiv, scrollTarget);
    }
  }

  // Wrap block formulas with gradient mask container
  function wrapFormulas() {
    var displays = preview.querySelectorAll('.katex-display');
    for (var i = 0; i < displays.length; i++) {
      var kd = displays[i];
      if (kd.parentElement.classList.contains('formula-scroll')) continue;
      var wrapper = document.createElement('div');
      wrapper.className = 'formula-wrapper';
      var scroll = document.createElement('div');
      scroll.className = 'formula-scroll';
      kd.parentNode.insertBefore(wrapper, kd);
      wrapper.appendChild(scroll);
      scroll.appendChild(kd);
      checkScrollShadow(wrapper, scroll);
      (function(w, s) {
        s.addEventListener('scroll', function() { checkScrollShadow(w, s); });
      })(wrapper, scroll);
    }
  }

  // Generic scroll shadow check (reused for tables, code, formulas)
  function checkScrollShadow(wrapper, scrollEl) {
    // Delay to ensure layout is complete
    requestAnimationFrame(function() {
      var sl = scrollEl.scrollLeft;
      var sw = scrollEl.scrollWidth;
      var cw = scrollEl.clientWidth;
      var threshold = 3; // avoid sub-pixel false positives
      if (sl > threshold) wrapper.classList.add('shadow-left');
      else wrapper.classList.remove('shadow-left');
      if (sw - sl - cw > threshold) wrapper.classList.add('shadow-right');
      else wrapper.classList.remove('shadow-right');
    });
  }

  // Re-check the horizontal scroll-shadow gradient on every code /
  // formula / table block inside `root` (a .markdown-body or any of
  // its ancestors). Used when:
  //   • A secondary screen has just been populated via innerHTML
  //     cloning (the `shadow-*` classes copied from the primary may
  //     not match the secondary's actual scroll geometry).
  //   • Any screen's width changes (adding/removing screens, dragging
  //     the side grabbers, toggling inspector/editor panels, window
  //     resize) — the shadow state must follow the new layout.
  //
  // IMPORTANT: which element holds the `shadow-*` class depends on
  // the block type (see CSS):
  //   • code:    class lives on `.code-scroll`     (inside .code-wrapper)
  //   • formula: class lives on `.formula-wrapper`
  //   • table:   class lives on `.table-wrapper`
  // Passing the wrong element is a silent no-op (the CSS selector
  // simply never matches) — the reason gradient masks kept "going
  // missing" on secondary screens.
  function checkAllScrollShadows(root) {
    if (!root) root = document;
    var codeWs = root.querySelectorAll('.code-wrapper');
    for (var i = 0; i < codeWs.length; i++) {
      var cs = codeWs[i].querySelector('.code-scroll');
      if (!cs) continue;
      var codeEl = cs.querySelector('pre code') || cs.querySelector('pre');
      // Shadow class → .code-scroll; scroll measurements → the actual
      // overflow element (<code> or fallback <pre>).
      checkScrollShadow(cs, codeEl || cs);
    }
    var fWs = root.querySelectorAll('.formula-wrapper');
    for (var j = 0; j < fWs.length; j++) {
      var fw = fWs[j];
      var fs = fw.querySelector('.formula-scroll');
      if (fs) checkScrollShadow(fw, fs);
    }
    var tWs = root.querySelectorAll('.table-wrapper');
    for (var k = 0; k < tWs.length; k++) {
      var tw = tWs[k];
      var ts = tw.querySelector('.table-scroll');
      if (ts) checkScrollShadow(tw, ts);
    }
  }

  function adjustListWidths() {
    // Measure the natural width of "1." to use as default bullet width
    var measurer = document.createElement('span');
    measurer.style.cssText = 'position:absolute;visibility:hidden;font-family:inherit;font-variant-numeric:tabular-nums;font-size:17px;white-space:nowrap;';
    measurer.textContent = '1.';
    preview.appendChild(measurer);
    var defaultMarkerWidth = measurer.offsetWidth;
    preview.removeChild(measurer);

    // Set ol marker widths
    var ols = preview.querySelectorAll('ol');
    for (var i = 0; i < ols.length; i++) {
      var ol = ols[i];
      var count = 0;
      var children = ol.children;
      for (var c = 0; c < children.length; c++) {
        if (children[c].tagName === 'LI') count++;
      }
      // Only set explicit width if more than 9 items
      if (count >= 100) ol.style.setProperty('--ol-num-width', '2.4em');
      else if (count >= 10) ol.style.setProperty('--ol-num-width', '1.8em');
      else ol.style.removeProperty('--ol-num-width'); // let it be auto
    }

    // Bullet width: default = "1." width; adjacent to ol = ol marker width
    var allUls = preview.querySelectorAll('ul');
    for (var j = 0; j < allUls.length; j++) {
      var ul = allUls[j];
      var prevSib = ul.previousElementSibling;
      var nextSib = ul.nextElementSibling;

      var adjacentOl = null;
      if (prevSib && prevSib.tagName === 'OL') adjacentOl = prevSib;
      else if (nextSib && nextSib.tagName === 'OL') adjacentOl = nextSib;

      var bulletWidth = defaultMarkerWidth; // default: width of "1."

      if (adjacentOl) {
        // Use the actual rendered width of the adjacent ol's widest marker
        var lastOlMarker = adjacentOl.querySelector('li:last-child > .li-marker-ol');
        var firstOlMarker = adjacentOl.querySelector('.li-marker-ol');
        var olMarker = lastOlMarker || firstOlMarker;
        if (olMarker) bulletWidth = olMarker.offsetWidth;
      }

      // Apply to all ul markers in this list
      var ulMs = ul.querySelectorAll(':scope > li > .li-marker-ul');
      for (var u = 0; u < ulMs.length; u++) {
        ulMs[u].style.minWidth = bulletWidth + 'px';
        ulMs[u].style.width = bulletWidth + 'px';
      }

      // Nested ul inside ol: use parent ol marker width
      var parentLi = ul.parentElement;
      if (parentLi && parentLi.tagName === 'LI') {
        var parentList = parentLi.parentElement;
        if (parentList && parentList.tagName === 'OL') {
          var parentMarker = parentList.querySelector(':scope > li > .li-marker-ol');
          if (parentMarker) {
            var pmw = parentMarker.offsetWidth;
            var nestedUlMs = ul.querySelectorAll(':scope > li > .li-marker-ul');
            for (var nu = 0; nu < nestedUlMs.length; nu++) {
              nestedUlMs[nu].style.minWidth = pmw + 'px';
              nestedUlMs[nu].style.width = pmw + 'px';
            }
          }
        }
      }
    }

    // Update ol marker widths for multi-digit lists
    var olMarkers = preview.querySelectorAll('.li-marker-ol');
    for (var k = 0; k < olMarkers.length; k++) {
      var m = olMarkers[k];
      var parentOl = m.closest('ol');
      if (parentOl) {
        var nw = parentOl.style.getPropertyValue('--ol-num-width');
        if (nw) m.style.minWidth = nw;
        else m.style.removeProperty('minWidth');
      }
    }
  }

  function wrapTables() {
    var tables = preview.querySelectorAll('table');
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      if (table.parentElement.classList.contains('table-scroll')) continue;
      var wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      var scroll = document.createElement('div');
      scroll.className = 'table-scroll';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(scroll);
      scroll.appendChild(table);
      checkScrollShadow(wrapper, scroll);
      (function(w, s) {
        s.addEventListener('scroll', function() { checkScrollShadow(w, s); });
      })(wrapper, scroll);
    }
  }

  function updateTableMaxWidth() {
    // Column max-width = 2/3 of virtual screen (preview-outer) width.
    // Applies to every .markdown-body so secondary screens get the
    // same column constraints as the primary.
    var w = previewOuter.offsetWidth;
    var maxCol = Math.round(w * 0.667);
    var bodies = document.querySelectorAll('.markdown-body');
    for (var bi = 0; bi < bodies.length; bi++) {
      var body = bodies[bi];
      var cells = body.querySelectorAll('.table-wrapper th, .table-wrapper td, table th, table td');
      for (var i = 0; i < cells.length; i++) {
        cells[i].style.maxWidth = maxCol + 'px';
      }
      var wrappers = body.querySelectorAll('.table-wrapper');
      for (var j = 0; j < wrappers.length; j++) {
        var scroll = wrappers[j].querySelector('.table-scroll');
        if (scroll) checkScrollShadow(wrappers[j], scroll);
      }
    }
  }

  // Highlight syntax (both `==text==` and raw <mark> HTML) is intentionally
  // NOT rendered as a highlight. `==text==` isn't GFM, so marked already
  // emits it verbatim. For raw `<mark>` / `</mark>` passthrough, replace the
  // angle brackets with their HTML entities so the browser prints them as
  // literal text instead of highlighting. We run this on marked's HTML
  // output so code blocks (where `<` is already escaped to `&lt;`) are
  // untouched.
  var _reMarkTag = /<\/?mark\b[^>]*>/gi;
  function neutralizeMarkTags(html) {
    return html.replace(_reMarkTag, function(m) {
      return m.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    });
  }

  function renderMarkdown() {
    var text = editor.value;
    var cleanText = extractFootnotes(text);
    buildSourceMap(text);
    preview.innerHTML = neutralizeMarkTags(marked.parse(cleanText));
    postProcess();
    updateLineNumbers();
    // Hide the bubble entirely when the editor is effectively empty, so the
    // virtual screen stays clean. Keep it shown while there's any real
    // content (including just a single space) so the user can see the
    // bubble's shape as they type.
    var previewPanels = document.querySelectorAll('.preview-panel');
    for (var pp = 0; pp < previewPanels.length; pp++) {
      previewPanels[pp].classList.toggle('is-empty', text.length === 0);
    }
    syncSecondaryPreviews();
  }
  // Defined below; no-op until extra virtual screens are created.
  // Re-wire dynamic behaviors on a .markdown-body that was populated
  // via innerHTML cloning (e.g. secondary screens). innerHTML copies
  // the DOM structure but loses the scroll-event handlers + initial
  // shadow-class state that postProcess normally installs on the
  // primary preview. Call this on each cloned body so its code blocks,
  // formulas and tables behave identically to the primary.
  function postProcessClonedBody(body) {
    if (!body) return;
    // Code block scroll shadows.
    // Shadow class lives on `.code-scroll` (see CSS), NOT on
    // `.code-wrapper` — passing the wrapper here silently fails.
    var codeWrappers = body.querySelectorAll('.code-wrapper');
    for (var ci = 0; ci < codeWrappers.length; ci++) {
      var cs = codeWrappers[ci].querySelector('.code-scroll');
      if (!cs) continue;
      var codeEl = cs.querySelector('pre code') || cs.querySelector('pre');
      var target = codeEl || cs;
      checkScrollShadow(cs, target);
      (function(scrollHost, scrollSrc) {
        scrollSrc.addEventListener('scroll', function() { checkScrollShadow(scrollHost, scrollSrc); });
      })(cs, target);
    }
    // Formula scroll shadows
    var fWrappers = body.querySelectorAll('.formula-wrapper');
    for (var fi = 0; fi < fWrappers.length; fi++) {
      var fw = fWrappers[fi];
      var fs = fw.querySelector('.formula-scroll');
      if (!fs) continue;
      checkScrollShadow(fw, fs);
      (function(w, s) {
        s.addEventListener('scroll', function() { checkScrollShadow(w, s); });
      })(fw, fs);
    }
    // Table scroll shadows + max-width
    var tWrappers = body.querySelectorAll('.table-wrapper');
    for (var ti = 0; ti < tWrappers.length; ti++) {
      var tw = tWrappers[ti];
      var ts = tw.querySelector('.table-scroll');
      if (!ts) continue;
      checkScrollShadow(tw, ts);
      (function(w, s) {
        s.addEventListener('scroll', function() { checkScrollShadow(w, s); });
      })(tw, ts);
    }
    // Mirror per-cell max-width set by updateTableMaxWidth on primary.
    var primaryOuter = document.getElementById('preview-outer');
    if (primaryOuter) {
      var maxCol = Math.round(primaryOuter.offsetWidth * 0.667);
      var cells = body.querySelectorAll('.table-wrapper th, .table-wrapper td, table th, table td');
      for (var k = 0; k < cells.length; k++) {
        cells[k].style.maxWidth = maxCol + 'px';
      }
    }
    // innerHTML carries over any `shadow-left`/`shadow-right` classes
    // that happened to be set on the primary's wrappers at the moment
    // of cloning. Those classes describe primary geometry, not the
    // secondary's — so the first rAF inside checkScrollShadow may run
    // before layout (especially for KaTeX display math, which reflows
    // asynchronously on insertion) and leave the wrong state cached.
    // Re-check once more after a short delay so the gradient masks
    // settle onto the secondary's real scrollWidth/clientWidth.
    setTimeout(function() { checkAllScrollShadows(body); }, 0);
    setTimeout(function() { checkAllScrollShadows(body); }, 120);
  }

  var syncSecondaryPreviews = function() {};

  // Hidden off-screen <div> that mirrors the textarea's wrap behavior so we
  // can measure how many visual rows each logical line spans. Created lazily.
  var measureDiv = null;
  function getMeasureDiv() {
    if (measureDiv) return measureDiv;
    measureDiv = document.createElement('div');
    measureDiv.setAttribute('aria-hidden', 'true');
    // Must match the textarea's typographic + box properties exactly so wrap
    // points line up. Key invariants: same font, same line-height, same
    // padding (so content box width matches), same tab-size and wrap rules.
    measureDiv.style.cssText = [
      'position:absolute',
      'visibility:hidden',
      'top:0','left:-9999px',
      'padding:20px 12px 20px 12px',
      'font-family:"SFMono-Regular","Menlo","Monaco","Consolas",monospace',
      'font-size:14px','line-height:20px','tab-size:2',
      'white-space:pre-wrap','word-wrap:break-word','overflow-wrap:break-word',
      'box-sizing:border-box',
      'border:none'
    ].join(';');
    document.body.appendChild(measureDiv);
    return measureDiv;
  }

  // Measure per-logical-line visual row counts by placing zero-size markers
  // between each line's text and reading back marker.offsetTop deltas.
  function measureVisualRows(text, width) {
    var div = getMeasureDiv();
    div.style.width = width + 'px';
    var lines = text.split('\n');
    var n = lines.length;
    // Build: [marker 0]line 0 text\n[marker 1]line 1 text\n ... [marker n]
    // The trailing marker captures total height.
    var parts = [];
    for (var i = 0; i < n; i++) {
      parts.push('<span class="__m" data-i="' + i + '"></span>');
      // Escape + keep empty line height by appending a zero-width joiner when
      // the line is empty, otherwise textContent collapse won't happen since
      // white-space:pre-wrap preserves newlines.
      var lineText = lines[i];
      // We rely on pre-wrap to render '\n' as newline, and to keep empty
      // lines at full line-height.
      parts.push(escapeHtml(lineText));
      if (i < n - 1) parts.push('\n');
    }
    parts.push('<span class="__m" data-i="' + n + '"></span>');
    div.innerHTML = parts.join('');
    var markers = div.querySelectorAll('.__m');
    var rows = new Array(n);
    for (var j = 0; j < n; j++) {
      var thisTop = markers[j].offsetTop;
      var nextTop = markers[j + 1].offsetTop;
      // Each visual row is 20px tall. Empty lines produce (nextTop - thisTop)
      // of 20px. Wrapped lines produce multiples of 20.
      var h = nextTop - thisTop;
      if (h < 20) h = 20; // safety floor (e.g. empty trailing input)
      rows[j] = h;
    }
    return rows;
  }

  function updateLineNumbers() {
    var text = editor.value;
    var editorWidth = editor.clientWidth;
    if (editorWidth < 20) {
      var logical = text.split('\n').length;
      var fallback = '<div class="line-numbers-inner">';
      for (var f = 1; f <= logical; f++) {
        fallback += '<span class="line-num" data-line="' + f + '" style="height:20px"><span class="num-text">' + f + '</span></span>';
      }
      fallback += '</div>';
      lineNumbers.innerHTML = fallback;
      syncLineNumberScroll();
      return;
    }
    var rows = measureVisualRows(text, editorWidth);
    var html = '<div class="line-numbers-inner">';
    for (var i = 0; i < rows.length; i++) {
      html += '<span class="line-num" data-line="' + (i + 1) + '" style="height:' + rows[i] + 'px"><span class="num-text">' + (i + 1) + '</span></span>';
    }
    html += '</div>';
    lineNumbers.innerHTML = html;
    syncLineNumberScroll();
  }

  function syncLineNumberScroll() {
    // Drive line-numbers via transform on its inner content: the
    // compositor can apply this immediately after the textarea's scroll
    // frame, whereas setting `lineNumbers.scrollTop` is deferred to the
    // next layout pass, producing a visible "lag by one row" feel.
    var y = -editor.scrollTop;
    var lnInner = lineNumbers.firstElementChild;
    if (lnInner) lnInner.style.transform = 'translateY(' + y + 'px)';
    var overlay = document.getElementById('editor-overlay');
    if (overlay && overlay.firstChild) {
      var inner = overlay.querySelector('.overlay-inner');
      if (inner) inner.style.transform = 'translateY(' + y + 'px)';
    }
    var wsOv = document.getElementById('editor-ws-overlay');
    if (wsOv && wsOv.firstChild) {
      var wsInner = wsOv.querySelector('.ws-inner');
      if (wsInner) wsInner.style.transform = 'translateY(' + y + 'px)';
    }
  }

  // ===== Whitespace overlay =====
  // When the user selects text containing spaces or tabs, render those
  // whitespace characters as visible glyphs (· for space, → for tab) in an
  // absolutely-positioned overlay that mirrors the textarea's layout.
  // Non-whitespace characters in the selection — and everything outside it
  // — are kept as transparent placeholders to preserve wrap geometry.
  var wsOverlay = document.getElementById('editor-ws-overlay');
  function clearWhitespaceOverlay() {
    if (wsOverlay) wsOverlay.innerHTML = '';
  }
  function updateWhitespaceOverlay() {
    if (!wsOverlay) return;
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    if (start === end) { clearWhitespaceOverlay(); return; }
    var text = editor.value;
    var selected = text.slice(start, end);
    // Skip work entirely if selection contains no whitespace worth marking.
    if (!/[ \t]/.test(selected)) { clearWhitespaceOverlay(); return; }
    var before = text.slice(0, start);
    var after = text.slice(end);
    // Build HTML: keep before/after as escaped plain text (transparent), and
    // render each selected char — space => ·, tab => →·, other => itself —
    // inside a .ws-dot span for whitespace, escaped span for others.
    var selHtml = '';
    for (var i = 0; i < selected.length; i++) {
      var ch = selected.charAt(i);
      if (ch === ' ') {
        selHtml += '<span class="ws-dot">\u00B7</span>';
      } else if (ch === '\t') {
        selHtml += '<span class="ws-dot">\u2192</span>';
      } else if (ch === '\n') {
        selHtml += '\n';
      } else {
        selHtml += escapeHtml(ch);
      }
    }
    var html = '<div class="ws-inner" style="transform:translateY(' + (-editor.scrollTop) + 'px)">';
    html += escapeHtml(before);
    html += selHtml;
    html += escapeHtml(after);
    html += '</div>';
    wsOverlay.innerHTML = html;
  }
  // Selection change on the document also fires when textarea selection
  // changes via keyboard/mouse, and is less chatty than mousemove.
  document.addEventListener('selectionchange', function() {
    if (document.activeElement === editor ||
        (editor.selectionStart !== editor.selectionEnd)) {
      updateWhitespaceOverlay();
    }
  });
  editor.addEventListener('blur', clearWhitespaceOverlay);
  editor.addEventListener('select', updateWhitespaceOverlay);

  var renderTimer = null;
  editor.addEventListener('input', function() {
    clearWhitespaceOverlay();
    // Debounce at 120ms: below human perception threshold (~200ms) so the
    // preview feels "live", but high enough to coalesce multiple keystrokes
    // at normal typing speed (3-5 chars/sec) into a single render pass.
    // Each render runs marked.lexer + buildSourceMap + marked.parse + KaTeX
    // + hljs + six wrap* DOM traversals, which is expensive on large docs.
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderMarkdown, 120);
  });
  editor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      var s = editor.selectionStart;
      editor.value = editor.value.substring(0, s) + '  ' + editor.value.substring(editor.selectionEnd);
      editor.selectionStart = editor.selectionEnd = s + 2;
      renderMarkdown();
    }
  });

  // Must mirror the @media(max-width:900px) breakpoint in style.css.
  // 900px is the minimum viewport width that fits three-panel horizontal
  // layout without squeezing the 320px virtual screen.
  function isMobileLayout() { return window.innerWidth <= 900; }

  var eSc = false, pSc = false;
  editor.addEventListener('scroll', function() {
    syncLineNumberScroll();
    if (isMobileLayout()) return; // No sync in mobile
    if (pSc) return; eSc = true;
    var pct = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
    previewCard.scrollTop = pct * (previewCard.scrollHeight - previewCard.clientHeight);
    requestAnimationFrame(function() { eSc = false; });
  }, {passive: true});
  previewCard.addEventListener('scroll', function() {
    if (isMobileLayout()) return; // No sync in mobile
    if (eSc) return; pSc = true;
    var pct = previewCard.scrollTop / (previewCard.scrollHeight - previewCard.clientHeight || 1);
    editor.scrollTop = pct * (editor.scrollHeight - editor.clientHeight);
    requestAnimationFrame(function() { pSc = false; });
  }, {passive: true});

  // Double-click divider1: reset editor/preview split to 50%
  divider.addEventListener('dblclick', function() {
    document.querySelector('.editor-panel').style.flex = '';
    updateWidthLabel();
  });

  // ===== Divider positioning =====
  // The divider is `position:absolute` inside `.editor-container` so it
  // does NOT occupy flex space (if it did, each 12px flex-gap on either
  // side of the divider would bloat the editor↔preview panel spacing
  // to 24px+4, breaking the app-wide 12px inter-panel rhythm).
  // Two CSS custom properties drive its position, depending on layout
  // direction:
  //   • Desktop (row):    `--divider-x` = horizontal centre of the 12px
  //                        gap between editor and preview panels.
  //   • Mobile (column):  `--divider-y` = vertical   centre of the same
  //                        12px gap, in stacked layout.
  // A ResizeObserver keeps them in sync whenever the edited panel
  // resizes, the window changes, or the flex ratio is reset via
  // double-click.
  var editorContainerEl = document.querySelector('.editor-container');
  function syncDividerX() {
    if (!editorContainerEl || !editorPanel || !divider) return;
    var containerRect = editorContainerEl.getBoundingClientRect();
    var editorRect = editorPanel.getBoundingClientRect();
    if (isMobileLayout()) {
      // Editor sits above, preview below. Divider centres in the
      // 12px vertical gap — so `top = editor.bottom + 6` in
      // container-local coords.
      var y = (editorRect.bottom - containerRect.top) + 6;
      editorContainerEl.style.setProperty('--divider-y', y + 'px');
      editorContainerEl.style.removeProperty('--divider-x');
    } else {
      // Editor sits on the left, preview on the right. Divider
      // centres in the 12px horizontal gap.
      var x = (editorRect.right - containerRect.left) + 6;
      editorContainerEl.style.setProperty('--divider-x', x + 'px');
      editorContainerEl.style.removeProperty('--divider-y');
    }
  }
  if (editorPanel && typeof ResizeObserver === 'function') {
    new ResizeObserver(syncDividerX).observe(editorPanel);
  }
  window.addEventListener('resize', syncDividerX);
  // Initial sync after layout settles.
  requestAnimationFrame(syncDividerX);

  divider.addEventListener('mousedown', startDrag1);
  divider.addEventListener('touchstart', startDrag1, {passive: false});
  function startDrag1(e) {
    e.preventDefault(); isDragging = true; divider.classList.add('active');
    document.body.style.userSelect = 'none';
    // Disable flex transition during drag for responsive feel
    document.querySelector('.editor-panel').style.transition = 'none';
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', doDrag, {passive: false});
    document.addEventListener('touchend', endDrag);
  }
  function doDrag(e) {
    if (!isDragging) return;
    var touch = e.touches ? e.touches[0] : e;
    var container = document.querySelector('.editor-container');
    var rect = container.getBoundingClientRect();
    var isVertical = isMobileLayout();
    if (isVertical) {
      var pct = ((touch.clientY - rect.top) / rect.height) * 100;
      var c = Math.max(15, Math.min(70, pct));
      document.querySelector('.editor-panel').style.flex = '0 0 ' + c + '%';
    } else {
      var pct = ((touch.clientX - rect.left) / rect.width) * 100;
      var c = Math.max(15, Math.min(70, pct));
      document.querySelector('.editor-panel').style.flex = '0 0 ' + c + '%';
    }
  }
  function endDrag() {
    isDragging = false; divider.classList.remove('active');
    document.body.style.cursor = ''; document.body.style.userSelect = '';
    // Re-enable transition for animated collapse/expand
    document.querySelector('.editor-panel').style.transition = '';
    document.removeEventListener('mousemove', doDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', doDrag);
    document.removeEventListener('touchend', endDrag);
  }

  var isCardDrag = false;
  var _dragSide = 'right';
  var _dragStartX = 0;
  var _dragStartW = 400;
  function startCard(e) {
    e.preventDefault(); e.stopPropagation(); isCardDrag = true;
    var touch = e.touches ? e.touches[0] : e;
    // `this` is the handle that received the listener.
    var handle = e.currentTarget || this;
    _dragSide = (handle && handle.getAttribute('data-side') === 'left') ? 'left' : 'right';
    _dragStartX = touch.clientX;
    // Remember the container's current width so the drag grows/shrinks
    // everything at once. Dragging a handle by N px on the correct side
    // changes the container width by N (or -N for the opposite side).
    _dragStartW = screensContainer ? screensContainer.offsetWidth : 400;
    document.body.style.cursor = 'ew-resize'; document.body.style.userSelect = 'none';
    widthLabel.classList.add('visible');
    // Tell the "+" button to fade out during the drag.
    var outerRowEl = document.getElementById('preview-outer-row');
    if (outerRowEl) {
      outerRowEl.setAttribute('data-card-dragging', '1');
      // Mark which side is being dragged so CSS can pin the
      // width-tooltip to the correct inside edge (mirrors the hover
      // behaviour — see `.preview-outer-row:has(.card-handle-left:hover)`
      // rule in style.css). Using classes rather than data-* because
      // there are exactly two mutually-exclusive states.
      outerRowEl.classList.remove('card-dragging-left', 'card-dragging-right');
      outerRowEl.classList.add(_dragSide === 'left' ? 'card-dragging-left' : 'card-dragging-right');
    }
    document.addEventListener('mousemove', doCard);
    document.addEventListener('mouseup', endCard);
    document.addEventListener('touchmove', doCard, {passive: false});
    document.addEventListener('touchend', endCard);
  }
  // ----- Screens container width bookkeeping -----
  // All virtual screens live inside a shared container (.screens-container)
  // which has a single width driven by the side grabbers. Each screen is
  // a flex child that evenly divides the container space (minus gaps),
  // so per-screen width always equals (container - gapTotal) / count.
  var SCREEN_DEFAULT_WIDTH = 400;
  var SCREEN_MIN_WIDTH = 320;
  var SCREEN_GAP = 16; // px — must match CSS `.screens-container gap` in multi-screen mode
  function getScreenCount() {
    if (!screensContainer) return 1;
    return screensContainer.querySelectorAll('.screen-wrap').length || 1;
  }
  function computeGapTotal(count) {
    if (count <= 1) return 0;
    return SCREEN_GAP * (count - 1);
  }
  function computeDefaultContainerWidth() {
    var n = getScreenCount();
    return SCREEN_DEFAULT_WIDTH * n + computeGapTotal(n);
  }
  function computeMinContainerWidth() {
    var n = getScreenCount();
    return SCREEN_MIN_WIDTH * n + computeGapTotal(n);
  }
  function setScreensContainerWidth(px, opts) {
    if (!screensContainer) return;
    var minW = computeMinContainerWidth();
    var capped = Math.max(minW, px);
    screensContainer.style.setProperty('--screens-total-width', capped + 'px');
    // Also sync the inline style.width (some browsers need the explicit
    // style since the max-width constraint may compete otherwise).
    screensContainer.style.width = capped + 'px';
  }
  // Double-click reset: restore the screens container to (default * n + gaps).
  function resetOuterWidth() {
    setScreensContainerWidth(computeDefaultContainerWidth());
    if (widthLabel) widthLabel.textContent = Math.round(previewOuter.offsetWidth) + 'px';
    updateTableMaxWidth();
  }
  // Wire double-click reset on all side handles. Re-wire whenever new
  // screens are added (see bindScreenHandles below).
  function bindScreenHandles(root) {
    var handles = (root || document).querySelectorAll('.screen-side-handle');
    for (var i = 0; i < handles.length; i++) {
      var h = handles[i];
      if (h.__sideHandleBound) continue;
      h.__sideHandleBound = true;
      h.addEventListener('dblclick', resetOuterWidth);
      h.addEventListener('mousedown', startCard);
      h.addEventListener('touchstart', startCard, {passive: false});
      h.addEventListener('mouseenter', function() { widthLabel.classList.add('visible'); });
      h.addEventListener('mouseleave', function() {
        if (!isCardDrag && !isHeightDrag) widthLabel.classList.remove('visible');
      });
    }
  }
  bindScreenHandles(document);

  // Top/bottom handles control height, not width, so they must not
  // surface the width tooltip on hover or while dragging. The side
  // handles are wired up above.

  function doCard(e) {
    if (!isCardDrag) return;
    var touch = e.touches ? e.touches[0] : e;
    var bgRect = previewBg.getBoundingClientRect();
    // Width grows when dragging the right handle rightwards, or the left
    // handle leftwards. The other direction shrinks.
    var dx = touch.clientX - _dragStartX;
    var containerDelta = (_dragSide === 'right') ? dx : -dx;
    // Each drag action mutates the whole .screens-container width by
    // 2 * delta on the primary side (because both sides symmetrically
    // contribute to centering); but since the visible anchor should
    // follow the cursor directly, we only apply the single-side delta
    // here and let flex centering adjust the rest of the layout.
    var bgMaxW = Math.max(200, bgRect.width - 72);
    var nextContainerW = _dragStartW + containerDelta;
    var minW = computeMinContainerWidth();
    var n = getScreenCount();
    // Single-screen: cap to the available preview-bg region.
    // Multi-screen: the editor-container scrolls horizontally, so we
    // allow the container to grow well beyond the visible area. Cap at
    // an arbitrary-but-sane upper bound so runaway drags don't hang.
    var maxW = (n === 1) ? bgMaxW : 800 * n + computeGapTotal(n);
    nextContainerW = Math.max(minW, Math.min(maxW, nextContainerW));
    setScreensContainerWidth(nextContainerW);
    // Read actual rendered width of a single screen (respects CSS
    // min-width/max-width) for the tooltip.
    widthLabel.textContent = Math.round(previewOuter.offsetWidth) + 'px';
    updateTableMaxWidth();
  }
  function endCard() {
    isCardDrag = false;
    document.body.style.cursor = ''; document.body.style.userSelect = '';
    widthLabel.classList.remove('visible');
    var outerRowEl = document.getElementById('preview-outer-row');
    if (outerRowEl) {
      outerRowEl.removeAttribute('data-card-dragging');
      outerRowEl.classList.remove('card-dragging-left', 'card-dragging-right');
    }
    document.removeEventListener('mousemove', doCard);
    document.removeEventListener('mouseup', endCard);
    document.removeEventListener('touchmove', doCard);
    document.removeEventListener('touchend', endCard);
  }

  // Height drag (top/bottom handles)
  var isHeightDrag = false;
  function startHeightDrag(e) {
    e.preventDefault(); e.stopPropagation(); isHeightDrag = true;
    document.body.style.cursor = 'ns-resize'; document.body.style.userSelect = 'none';
    // Height drags deliberately do NOT surface the width tooltip —
    // it would be misleading to show "400px" while the user is
    // changing the vertical dimension.
    document.addEventListener('mousemove', doHeightDrag);
    document.addEventListener('mouseup', endHeightDrag);
    document.addEventListener('touchmove', doHeightDrag, {passive: false});
    document.addEventListener('touchend', endHeightDrag);
  }
  handleTop.addEventListener('mousedown', startHeightDrag);
  handleBottom.addEventListener('mousedown', startHeightDrag);
  handleTop.addEventListener('touchstart', startHeightDrag, {passive: false});
  handleBottom.addEventListener('touchstart', startHeightDrag, {passive: false});
  var outerRow = document.querySelector('.preview-outer-row');
  function doHeightDrag(e) {
    if (!isHeightDrag) return;
    var touch = e.touches ? e.touches[0] : e;
    var bgRect = previewBg.getBoundingClientRect();
    // Leave more headroom in multi-screen mode so the numeric badge
    // above each screen can't collide with the preview panel header.
    var multi = document.body.classList.contains('multi-screen');
    var maxH = bgRect.height - (multi ? 120 : 72);
    var center = bgRect.top + bgRect.height / 2;
    var half = Math.abs(touch.clientY - center);
    var h = Math.max(320, Math.min(maxH, half * 2));
    outerRow.style.height = h + 'px';
    outerRow.style.flex = 'none';
  }
  function endHeightDrag() {
    isHeightDrag = false;
    document.body.style.cursor = ''; document.body.style.userSelect = '';
    document.removeEventListener('mousemove', doHeightDrag);
    document.removeEventListener('mouseup', endHeightDrag);
    document.removeEventListener('touchmove', doHeightDrag);
    document.removeEventListener('touchend', endHeightDrag);
  }
  // Double-click height handles: reset to fill
  function resetOuterHeight() {
    outerRow.style.height = '';
    outerRow.style.flex = '';
  }
  handleTop.addEventListener('dblclick', resetOuterHeight);
  handleBottom.addEventListener('dblclick', resetOuterHeight);

  // ===== Editor panel collapse =====
  var editorToggle = document.getElementById('editor-toggle');

  editorToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!isMobileLayout()) return;
    // Clear inline flex so class-based flex transitions apply
    editorPanel.style.flex = '';
    var willExpand = editorPanel.classList.contains('collapsed');
    editorPanel.classList.toggle('collapsed');
    // Mutual exclusion: when expanding editor on mobile, collapse inspector
    if (willExpand && isMobileLayout()) {
      if (!inspectorPanel.classList.contains('collapsed')) {
        inspectorPanel.style.flex = '';
        inspectorPanel.classList.add('collapsed');
        inspectorManualOpen = false;
      }
    }
  });

  editorPanel.addEventListener('click', function(e) {
    if (!editorPanel.classList.contains('collapsed')) return;
    if (!isMobileLayout()) return;
    e.stopPropagation();
    editorPanel.style.flex = '';
    editorPanel.classList.remove('collapsed');
    // Collapse inspector on expanding editor
    if (!inspectorPanel.classList.contains('collapsed')) {
      inspectorPanel.style.flex = '';
      inspectorPanel.classList.add('collapsed');
      inspectorManualOpen = false;
    }
  });

  (function() {
    var hdr = editorPanel.querySelector('.panel-header');
    hdr.addEventListener('click', function(e) {
      if (!isMobileLayout()) return;
      if (editorPanel.classList.contains('collapsed')) return;
      if (e.target.closest('.editor-toggle')) return;
      if (e.target.closest('#export-md')) return;
      e.stopPropagation();
      editorPanel.style.flex = '';
      editorPanel.classList.add('collapsed');
    });
  })();

  var sunIcon = themeToggle.querySelector('.sun-icon');
  var moonIcon = themeToggle.querySelector('.moon-icon');
  function setTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    sunIcon.style.display = dark ? 'none' : 'block';
    moonIcon.style.display = dark ? 'block' : 'none';
    document.getElementById('code-theme-light').disabled = dark;
    document.getElementById('code-theme-dark').disabled = !dark;
    // Toggle panel logos
    var ll = document.querySelectorAll('.panel-logo.logo-light');
    var ld = document.querySelectorAll('.panel-logo.logo-dark');
    for (var li = 0; li < ll.length; li++) ll[li].style.display = dark ? 'none' : 'inline';
    for (var di = 0; di < ld.length; di++) ld[di].style.display = dark ? 'inline' : 'none';
    // Switching the UI theme auto-follows the editing palette to match (so
    // Settings shows the palette that's actually live). This is independent
    // of the user later choosing to edit the OTHER palette via the segmented
    // switch — which won't touch [data-theme].
    if (typeof window.__setEditingTheme === 'function') {
      window.__setEditingTheme(dark ? 'dark' : 'light');
    }
    // Color overrides are per-(mode × theme); after a theme flip, the
    // branch of color overrides the inline styles should reflect has
    // changed too. Reapply the current mode's state so the correct
    // color set is on every wrap.
    if (typeof window.__applyPerModeState === 'function') {
      window.__applyPerModeState(currentMode);
    }
    localStorage.setItem('md-theme', dark ? 'dark' : 'light');
  }
  themeToggle.addEventListener('click', function() {
    // Instant theme swap. A short-lived class disables any stray transitions
    // (button hovers, panel fades) during the swap so nothing animates from
    // old colors to new colors mid-click.
    document.documentElement.classList.add('theme-switching');
    setTheme(document.documentElement.getAttribute('data-theme') !== 'dark');
    setTimeout(function(){
      document.documentElement.classList.remove('theme-switching');
    }, 80);
  });

  // Fullscreen preview toggle — expands the Preview panel to fill the
  // whole app area by adding body.fullscreen-preview (handled in CSS).
  // The ResizeObserver on preview-outer handles width-label + table
  // max-width updates automatically when the panel resizes.
  var fullscreenToggle = document.getElementById('fullscreen-toggle');
  var _savedOuterWidth = null;
  function setFullscreen(on) {
    var wasOn = document.body.classList.contains('fullscreen-preview');
    if (on === wasOn) return;
    // The container-wide width is now stored on .screens-container (not
    // on the primary wrap). Operate on it so both layouts stay in sync.
    var widthHost = screensContainer || primaryScreenWrap || previewOuter;
    if (on) {
      _savedOuterWidth = widthHost.style.width || null;
      widthHost.style.width = '';
    } else {
      widthHost.style.width = _savedOuterWidth || '';
      _savedOuterWidth = null;
    }
    document.body.classList.toggle('fullscreen-preview', !!on);
    if (fullscreenToggle) {
      fullscreenToggle.title = on ? 'Exit fullscreen' : 'Fullscreen preview';
    }
  }
  if (fullscreenToggle) {
    fullscreenToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      setFullscreen(!document.body.classList.contains('fullscreen-preview'));
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.body.classList.contains('fullscreen-preview')) {
      setFullscreen(false);
    }
  });

  // Export .md file — filename follows the currently selected example
  // so downloads stay self-describing (e.g. brian-eno.md, attention.md).
  document.getElementById('export-md').addEventListener('click', function(e) {
    e.stopPropagation();
    var text = editor.value;
    var blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (typeof currentExample === 'function' ? currentExample().filename : 'WeMarkdown.md');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  var saved = localStorage.getItem('md-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) setTheme(true);

  // ===== Preview mode tabs (AI / Chats / Files) =====
  var currentMode = 'ai';
  var modeBtns = document.querySelectorAll('.mode-btn');
  var previewPanelRoot = document.querySelector('.preview-panel');
  previewPanelRoot.setAttribute('data-mode', 'ai');

  // Dropdown elements
  var dropdownTrigger = document.getElementById('mode-dropdown-trigger');
  var dropdownMenu = document.getElementById('mode-dropdown-menu');
  var dropdownLabel = dropdownTrigger.querySelector('.mode-dropdown-label');
  var dropdownItems = document.querySelectorAll('.mode-dropdown-item');

  function setMode(mode) {
    currentMode = mode;
    previewPanelRoot.setAttribute('data-mode', mode);
    // Sync tabs
    for (var i = 0; i < modeBtns.length; i++) {
      modeBtns[i].classList.toggle('active', modeBtns[i].getAttribute('data-mode') === mode);
    }
    // Sync dropdown label: AI stays as "AI", chats/files pull from i18n.
    dropdownLabel.textContent = mode === 'ai' ? 'AI' : t('mode.' + mode);
    for (var j = 0; j < dropdownItems.length; j++) {
      dropdownItems[j].classList.toggle('active', dropdownItems[j].getAttribute('data-mode') === mode);
    }
    renderMarkdown();
    // Swap the per-mode inline overrides onto every virtual screen so
    // each mode keeps its own private set of inspector adjustments —
    // changing H1 top in AI must not leak into Files, etc. Done AFTER
    // the [data-mode] attr flips so the cascade's mode-specific CSS
    // defaults are active for any values not explicitly overridden.
    if (typeof window.__applyPerModeState === 'function') {
      window.__applyPerModeState(mode);
    }
    // Refresh the inspector UI so steppers/color pickers reflect the
    // effective values of the newly active mode.
    if (typeof window.__refreshInspectorFromScope === 'function') {
      window.__refreshInspectorFromScope();
    }
  }

  // Tab clicks
  for (var mi = 0; mi < modeBtns.length; mi++) {
    modeBtns[mi].addEventListener('click', function() {
      if (this.classList.contains('active')) return;
      setMode(this.getAttribute('data-mode'));
    });
  }

  // Dropdown trigger
  var dropdownBackdrop = document.getElementById('mode-dropdown-backdrop');

  function openDropdown() {
    dropdownMenu.classList.add('open');
    dropdownTrigger.classList.add('open');
    dropdownBackdrop.classList.add('open');
  }
  function closeDropdown() {
    dropdownMenu.classList.remove('open');
    dropdownTrigger.classList.remove('open');
    dropdownBackdrop.classList.remove('open');
  }

  dropdownTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    if (dropdownMenu.classList.contains('open')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // Dropdown item clicks
  for (var di = 0; di < dropdownItems.length; di++) {
    dropdownItems[di].addEventListener('click', function(e) {
      e.stopPropagation();
      setMode(this.getAttribute('data-mode'));
      closeDropdown();
    });
  }

  // Backdrop click: close dropdown, block other interactions
  dropdownBackdrop.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    closeDropdown();
  });

  // Dynamic tabs/dropdown swap based on available width
  var previewModesEl = document.getElementById('preview-modes');
  var previewDropdownEl = document.getElementById('preview-modes-dropdown');

  function checkModeSwitcher() {
    // Temporarily show tabs to measure
    previewModesEl.classList.remove('hidden');
    previewDropdownEl.classList.remove('shown');
    var header = previewModesEl.closest('.panel-header');
    if (!header) return;
    var headerWidth = header.clientWidth;
    // Measure natural widths (not stretched by flex:1)
    var labelEl = header.querySelector('.panel-label');
    var labelWidth = labelEl ? labelEl.offsetWidth : 0;
    var tabsWidth = previewModesEl.scrollWidth;
    var themeBtn = header.querySelector('#theme-toggle');
    var themeWidth = themeBtn ? themeBtn.offsetWidth : 24;
    // Header padding 32px + label-to-tabs gap 16px + tabs-to-theme safety 16px
    var needed = labelWidth + 16 + tabsWidth + 16 + themeWidth + 32;
    if (needed > headerWidth) {
      previewModesEl.classList.add('hidden');
      previewDropdownEl.classList.add('shown');
    } else {
      previewModesEl.classList.remove('hidden');
      previewDropdownEl.classList.remove('shown');
    }
  }
  function updateWidthLabel() {
    widthLabel.textContent = Math.round(previewOuter.offsetWidth) + 'px';
  }

  // Keep the width readout and table column limits in sync with whatever
  // is actually rendered — whether the change came from dragging the
  // virtual screen handles, dragging a panel divider, resizing the
  // window, or expanding/collapsing Inspector. ResizeObserver fires
  // whenever the element's box changes, so we don't have to hook each
  // interaction individually.
  if (typeof ResizeObserver !== 'undefined') {
    var _lastPreviewW = 0;
    var _previewRO = new ResizeObserver(function(entries) {
      var w = previewOuter.offsetWidth;
      if (w === _lastPreviewW) return;
      _lastPreviewW = w;
      updateWidthLabel();
      updateTableMaxWidth();
      // Width changed → re-evaluate horizontal scroll shadows on every
      // screen's code/formula/table blocks. Otherwise a block that
      // fit before may now overflow (needs `shadow-right`) or vice
      // versa, and the mask would be stuck in the old state.
      checkAllScrollShadows(document);
    });
    _previewRO.observe(previewOuter);
  }

  checkModeSwitcher();
  updateWidthLabel();
  window.addEventListener('resize', function() {
    checkModeSwitcher();
    updateWidthLabel();
    updateTableMaxWidth();
    updateLineNumbers();
    checkAllScrollShadows(document);
    // Auto-expand editor when leaving mobile width
    if (!isMobileLayout() && editorPanel.classList.contains('collapsed')) {
      editorPanel.style.flex = '';
      editorPanel.classList.remove('collapsed');
    }
    // Fullscreen is only offered in stacked/mobile layout. If the viewport
    // grows past the threshold while fullscreen is active, bail out so the
    // user doesn't get stuck (the toggle button is hidden at that width).
    if (!isMobileLayout() && document.body.classList.contains('fullscreen-preview')) {
      setFullscreen(false);
    }
  });

  // Editor width can change without a window resize (inspector toggle,
  // divider drag, etc.). Observe it and re-measure wrap on every change.
  if (typeof ResizeObserver !== 'undefined') {
    var editorRO = new ResizeObserver(function() {
      updateLineNumbers();
    });
    editorRO.observe(editor);
  }

  // ===== Inspector toggle =====
  var inspectorPanel = document.getElementById('inspector-panel');
  var inspectorManualOpen = false;

  // ===== Inspector settings: font-size, spacing, heading top, max indent =====
  (function() {
    // ===== Scope model (unified) =====
    // Every preview parameter (font-size, spacing, colors, …) is
    // written to exactly ONE place: the currently-active "target"
    // virtual screen's `.screen-wrap` inline style.
    //
    //   single-screen => target is the only wrap (wraps[0])
    //   multi-screen  => target is wraps[editTargetIndex]
    //
    // `:root` is NEVER written to at runtime. It holds only the
    // static baseline declared in style.css (--fs-base: 17px, etc.),
    // which every screen inherits by default. A screen's inline
    // override wins for that screen; removing the override drops
    // the screen back to the baseline.
    //
    // localStorage only matters in single-screen mode:
    //   • user edit single-screen  => write wrap[0] inline + persist
    //   • user edit multi-screen   => write wrap[target] inline only
    //                                 (transient, per-session)
    //   • page load (single-screen) => apply persisted value to wrap[0]
    //   • page load (multi-screen)  => should not happen; multi-screen
    //                                  is a session-only state
    //
    // This replaces an earlier model that split writes between :root
    // and wrap and produced cascading bugs ("value written but not
    // visible" / "new screen changes the old screen's behavior").
    function getTargetWrap() {
      var idx = (window.__screens && window.__screens.getEditTargetIndex)
        ? window.__screens.getEditTargetIndex() : 0;
      var wraps = (window.__screens && window.__screens.getWraps)
        ? window.__screens.getWraps() : [];
      return wraps[idx] || document.querySelector('.screen-wrap');
    }
    // Every wrap — used when a non-user write (initial apply,
    // baseline reset) should propagate to all screens.
    function getAllWraps() {
      return Array.prototype.slice.call(document.querySelectorAll('.screen-wrap'));
    }

    // Resolve which .markdown-body elements a non-CSS-variable setting
    // (e.g. data-max-indent attribute on the body) should touch.
    //   userInitiated=true  => only the target wrap's body
    //   userInitiated=false => every body (init / baseline)
    function getScopedMarkdownBodies(userInitiated) {
      if (!userInitiated) {
        return Array.prototype.slice.call(document.querySelectorAll('.markdown-body'));
      }
      var target = getTargetWrap();
      var body = target && target.querySelector ? target.querySelector('.markdown-body') : null;
      return body ? [body] : [];
    }

    function clearDerivedFontScaleVars(wrap) {
      if (!wrap || !wrap.style) return;
      var derived = ['--fs-h1','--fs-h2','--fs-h3','--fs-h4','--fs-h5','--fs-h6','--fs-code','--fs-code-small','--fs-lang-label'];
      for (var i = 0; i < derived.length; i++) {
        wrap.style.removeProperty(derived[i]);
      }
    }

    // Per-mode session-only overrides for every CSS variable the
    // inspector can tweak. Shape: { ai: {cssVar: "Npx"}, chats: {...},
    // files: {...} }. Populated by each stepper's `apply(byUser=true)`
    // and by each color picker's user-driven writes. Swapped onto
    // .screen-wrap inline styles whenever the preview mode changes
    // (see applyPerModeState). Never persisted — refreshing the page
    // resets everything back to CSS defaults, which themselves vary
    // per mode.
    var perModeOverrides = { ai: {}, chats: {}, files: {} };
    // Per-mode × per-theme color overrides: colors belong to the
    // preview mode like everything else, but they also depend on the
    // active UI theme (light vs dark). Shape:
    //   { ai: { light: {--pv-text: "#..."}, dark: {...} }, chats:..., files:... }
    // Only the subset matching the current mode + current theme is
    // ever reflected in inline styles at any given time.
    var perModeColorOverrides = {
      ai:    { light: {}, dark: {} },
      chats: { light: {}, dark: {} },
      files: { light: {}, dark: {} }
    };

    // Applied at setMode(): wipe every inspector-managed CSS variable
    // from every virtual screen's inline style, then write in the
    // set recorded for the NEW mode. Keeps each mode's customizations
    // completely isolated. `managedCssVars` is populated as steppers
    // and color pickers register themselves, so we know the exact
    // set of properties to wipe (don't blindly clear everything —
    // other code paths may use inline styles on the same elements).
    var managedCssVars = {};
    function applyPerModeState(newMode) {
      var wraps = getAllWraps();
      var bag = perModeOverrides[newMode] || {};
      var themeNow = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'dark' : 'light';
      var colorBag = (perModeColorOverrides[newMode] && perModeColorOverrides[newMode][themeNow]) || {};
      wraps.forEach(function(w) {
        if (!w || !w.style) return;
        // 1. Clear every variable the inspector can set (numeric + color).
        for (var varName in managedCssVars) {
          if (!managedCssVars.hasOwnProperty(varName)) continue;
          w.style.removeProperty(varName);
          if (varName === '--fs-base') clearDerivedFontScaleVars(w);
        }
        // 2. Write numeric overrides for the new mode.
        for (var k in bag) {
          if (!bag.hasOwnProperty(k)) continue;
          w.style.setProperty(k, bag[k]);
          if (k === '--fs-base') clearDerivedFontScaleVars(w);
        }
        // 3. Write color overrides for (new mode × current theme).
        for (var c in colorBag) {
          if (!colorBag.hasOwnProperty(c)) continue;
          w.style.setProperty(c, colorBag[c]);
        }
      });
    }
    // Exposed so the setMode() flow can call into this closure without
    // having to share internal variables. Also re-applied after a
    // theme flip so that color overrides (which depend on the current
    // theme) get re-pulled from the right branch.
    window.__applyPerModeState = applyPerModeState;

    function bindStepper(opts) {
      var decBtn = document.getElementById(opts.decId);
      var incBtn = document.getElementById(opts.incId);
      var valEl = document.getElementById(opts.valId);
      var resetBtn = document.getElementById(opts.resetId);
      var stepperEl = document.getElementById(opts.stepperId);
      if (!decBtn || !incBtn || !valEl) return null;
      // Register this stepper's CSS variable with the mode-switcher so
      // switching modes can cleanly wipe & re-apply the right set.
      if (opts.cssVar) managedCssVars[opts.cssVar] = true;
      // step: UI-visible increment per click (defaults to 1, may be fractional).
      // All internal math is integer-based for safety; `scale` = 10^(decimals)
      // so that e.g. step=0.05 becomes integer step=5 with scale=100. min/max
      // are supplied in UI-visible units and converted to the integer domain.
      var step = (opts.step != null) ? opts.step : 1;
      var decimals = 0;
      if (opts.decimals != null) decimals = opts.decimals;
      else if (step < 1) {
        var s = String(step);
        var dot = s.indexOf('.');
        decimals = dot >= 0 ? (s.length - dot - 1) : 0;
      }
      var scale = Math.pow(10, decimals);
      var iStep = Math.round(step * scale);
      var iMin = Math.round(opts.min * scale);
      var iMax = Math.round(opts.max * scale);
      var iDef = Math.round(opts.defaultValue * scale);
      function toUI(i) {
        if (decimals <= 0) return String(i);
        // Fractional steppers (e.g. font-size at 0.5 step) still use
        // full precision internally, but the UI hides trailing ".0"
        // when the value is an exact integer — so the user sees
        // "17" instead of "17.0" at whole-number ticks, while
        // "16.5" and "17.5" keep their decimal. This is purely a
        // display tweak; numeric state and CSS writes are unchanged.
        var n = i / scale;
        return Number.isInteger(n) ? String(n) : n.toFixed(decimals);
      }
      function fromUI(s) {
        var f = parseFloat(s);
        if (isNaN(f)) return null;
        return Math.round(f * scale);
      }
      function clampI(i) {
        // Snap to the nearest multiple of iStep within [iMin, iMax].
        var snapped = Math.round((i - iMin) / iStep) * iStep + iMin;
        return Math.max(iMin, Math.min(iMax, snapped));
      }

      // Inspector adjustments are per-mode and session-only.
      //   - `perModeOverrides[mode][cssVar]` — current user override for
      //     the active mode; switching modes swaps this whole set on
      //     the .screen-wrap elements.
      //   - No localStorage: page refresh resets everything to CSS
      //     defaults (which themselves vary per mode, see style.css).
      //
      // Start with no saved value: refresh() (called at the end of
      // bindStepper) will sync `current` from the effective computed
      // style once the DOM is ready, so the UI reflects the CSS default
      // for the initial mode.
      var current = iDef;

      // Apply a value (integer domain).
      //   byUser=true  => record override in perModeOverrides[mode],
      //                   write inline style on the target wrap (single
      //                   screen) or every wrap (non-user writes). The
      //                   change is TRANSIENT — refreshing the page
      //                   drops it, and switching modes swaps it out.
      //   byUser=false => UI-only sync (used during initial refresh).
      function apply(i, byUser) {
        current = i;
        var uiStr = toUI(i);
        if (byUser && opts.cssVar) {
          var unit = (opts.unit != null) ? opts.unit : 'px';
          var valueStr = uiStr + unit;
          // Record in the per-mode override bag.
          if (!perModeOverrides[currentMode]) perModeOverrides[currentMode] = {};
          perModeOverrides[currentMode][opts.cssVar] = valueStr;
          // Write inline style.
          if (document.body.classList.contains('multi-screen')) {
            // Multi-screen: only the current target receives the change.
            var target = getTargetWrap();
            if (target && target.style) {
              target.style.setProperty(opts.cssVar, valueStr);
              if (opts.cssVar === '--fs-base') clearDerivedFontScaleVars(target);
            }
          } else {
            // Single-screen: apply to every wrap so new virtual screens
            // opened later inherit the same state.
            getAllWraps().forEach(function(w) {
              if (w && w.style) {
                w.style.setProperty(opts.cssVar, valueStr);
                if (opts.cssVar === '--fs-base') clearDerivedFontScaleVars(w);
              }
            });
          }
        }
        if (opts.onApply && byUser) {
          opts.onApply(decimals > 0 ? parseFloat(uiStr) : i, getScopedMarkdownBodies(true));
        }
        if (document.activeElement !== valEl) valEl.textContent = uiStr;
        decBtn.disabled = i <= iMin;
        incBtn.disabled = i >= iMax;
        // "modified" = user has an explicit override for this cssVar
        // in the current mode. We can't compare `i !== iDef` because
        // iDef is the value passed to bindStepper (a single number),
        // but each mode may have its own CSS default (e.g. AI mode's
        // H1 default is 8, Chats/Files is 0). Anchoring off the
        // per-mode override bag reflects user intent directly.
        if (stepperEl) {
          var hasOverride = !!(opts.cssVar && perModeOverrides[currentMode] && perModeOverrides[currentMode][opts.cssVar] != null);
          stepperEl.classList.toggle('modified', hasOverride);
        }
      }
      decBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (current > iMin) apply(Math.max(iMin, current - iStep), true);
      });
      incBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (current < iMax) apply(Math.min(iMax, current + iStep), true);
      });

      // ===== Keyboard input on the value label =====
      // Click (or focus) the span to edit it in place. Enter / blur commits;
      // Esc reverts. Arrow Up/Down nudges by iStep. Invalid input snaps to
      // the last valid value.
      valEl.setAttribute('contenteditable', 'plaintext-only');
      valEl.setAttribute('role', 'spinbutton');
      valEl.setAttribute('inputmode', decimals > 0 ? 'decimal' : 'numeric');
      valEl.setAttribute('tabindex', '0');
      valEl.style.cursor = 'text';
      valEl.addEventListener('mousedown', function(e) { e.stopPropagation(); });
      valEl.addEventListener('click', function(e) { e.stopPropagation(); });
      valEl.addEventListener('focus', function() {
        // Select all text so typing replaces the current value.
        try {
          var range = document.createRange();
          range.selectNodeContents(valEl);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (_) {}
      });
      function commitFromText() {
        var raw = (valEl.textContent || '').trim();
        var parsed = fromUI(raw);
        if (parsed == null) {
          valEl.textContent = toUI(current);
          return;
        }
        var next = clampI(parsed);
        apply(next, true);
        valEl.textContent = toUI(next);
      }
      valEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          valEl.blur();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          valEl.textContent = toUI(current);
          valEl.blur();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (current < iMax) apply(Math.min(iMax, current + iStep), true);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (current > iMin) apply(Math.max(iMin, current - iStep), true);
        }
      });
      valEl.addEventListener('blur', commitFromText);

      if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          // Per-mode, session-only reset:
          //   - Drop the override for this mode+cssVar.
          //   - Remove the inline style from the relevant wraps so the
          //     mode's CSS default re-emerges via cascade.
          //   - Re-sync the UI from the new computed style (so the
          //     stepper now shows whatever the CSS default is, which
          //     may differ from `defaultValue` if the current mode
          //     has its own .screen-wrap-level override).
          if (perModeOverrides[currentMode]) {
            delete perModeOverrides[currentMode][opts.cssVar];
          }
          if (document.body.classList.contains('multi-screen')) {
            var target = getTargetWrap();
            if (target && target.style && opts.cssVar) {
              target.style.removeProperty(opts.cssVar);
              if (opts.cssVar === '--fs-base') clearDerivedFontScaleVars(target);
            }
          } else {
            getAllWraps().forEach(function(w) {
              if (w && w.style && opts.cssVar) {
                w.style.removeProperty(opts.cssVar);
                if (opts.cssVar === '--fs-base') clearDerivedFontScaleVars(w);
              }
            });
          }
          // Nudge onApply with the NEW effective value (read via refresh).
          if (handle.refresh) handle.refresh();
          if (opts.onApply) opts.onApply(current, getScopedMarkdownBodies(true));
        });
      }
      // Initial UI sync: read the computed value so the stepper label
      // reflects the actual CSS default for the current mode (no inline
      // style has been applied yet).
      var handle = {
        cssVar: opts.cssVar,
        defaultValue: opts.defaultValue,
        unit: (opts.unit != null) ? opts.unit : 'px',
        refresh: function() {
          if (!opts.cssVar) return;
          var target = getTargetWrap();
          if (!target) return;
          var cs = window.getComputedStyle(target);
          var raw = cs.getPropertyValue(opts.cssVar).trim();
          var num = parseFloat(raw);
          if (isNaN(num)) num = opts.defaultValue;
          var i = clampI(Math.round(num * scale));
          current = i;
          if (document.activeElement !== valEl) valEl.textContent = toUI(i);
          decBtn.disabled = i <= iMin;
          incBtn.disabled = i >= iMax;
          if (stepperEl) {
            var hasOverride = !!(opts.cssVar && perModeOverrides[currentMode] && perModeOverrides[currentMode][opts.cssVar] != null);
            stepperEl.classList.toggle('modified', hasOverride);
          }
          // Side-effect pipe: some steppers (notably max-indent) need
          // to push the resolved value to a non-CSS sink (a DOM
          // attribute). We invoke onApply here so that every
          // refresh — mode switch, target-screen switch, theme flip —
          // re-syncs the attribute to match the newly effective
          // computed value. It's idempotent, so calling it on every
          // refresh is safe even for steppers where the CSS var
          // alone is enough.
          if (opts.onApply) {
            opts.onApply(decimals > 0 ? (i / scale) : i, getScopedMarkdownBodies(false));
          }
        }
      };
      // Defer one tick so the DOM/layout has settled and getComputedStyle
      // returns the correct cascade value for the initial mode. We also
      // fire onApply once with the refreshed value so non-CSS-var side
      // effects (e.g. setting data-max-indent on the body for the
      // max-indent stepper) get initialized on first paint.
      setTimeout(function() {
        handle.refresh();
        if (opts.onApply) {
          opts.onApply(decimals > 0 ? (current / scale) : current, getScopedMarkdownBodies(false));
        }
      }, 0);
      return handle;
    }
    // Collect stepper handles so we can refresh them on target change.
    var steppers = [];
    function bs(opts) { var h = bindStepper(opts); if (h) steppers.push(h); }
    bs({decId:'fs-decrease', incId:'fs-increase', valId:'fs-value', resetId:'fs-reset', stepperId:'fs-stepper', cssVar:'--fs-base', storageKey:'md-fs-base', min:12, max:28, defaultValue:17, step:0.5});
    bs({decId:'mth1-decrease', incId:'mth1-increase', valId:'mth1-value', resetId:'mth1-reset', stepperId:'mth1-stepper', cssVar:'--mt-h1', storageKey:'md-mt-h1', min:0, max:64, defaultValue:12});
    bs({decId:'mth2-decrease', incId:'mth2-increase', valId:'mth2-value', resetId:'mth2-reset', stepperId:'mth2-stepper', cssVar:'--mt-h2', storageKey:'md-mt-h2', min:0, max:64, defaultValue:8});
    bs({decId:'mth3-decrease', incId:'mth3-increase', valId:'mth3-value', resetId:'mth3-reset', stepperId:'mth3-stepper', cssVar:'--mt-h3', storageKey:'md-mt-h3', min:0, max:64, defaultValue:4});
    bs({decId:'mth4-decrease', incId:'mth4-increase', valId:'mth4-value', resetId:'mth4-reset', stepperId:'mth4-stepper', cssVar:'--mt-h4', storageKey:'md-mt-h4', min:0, max:64, defaultValue:0});
    bs({decId:'mth5-decrease', incId:'mth5-increase', valId:'mth5-value', resetId:'mth5-reset', stepperId:'mth5-stepper', cssVar:'--mt-h5', storageKey:'md-mt-h5', min:0, max:64, defaultValue:0});
    bs({decId:'mth6-decrease', incId:'mth6-increase', valId:'mth6-value', resetId:'mth6-reset', stepperId:'mth6-stepper', cssVar:'--mt-h6', storageKey:'md-mt-h6', min:0, max:64, defaultValue:0});
    // Line-heights: unit-less floats, step 0.1 (single-decimal display),
    // clamped to a legible range.
    bs({decId:'lhb-decrease', incId:'lhb-increase', valId:'lhb-value', resetId:'lhb-reset', stepperId:'lhb-stepper', cssVar:'--lh-body', storageKey:'md-lh-body', min:1.0, max:2.5, defaultValue:1.4, step:0.1, unit:''});
    bs({decId:'lhh-decrease', incId:'lhh-increase', valId:'lhh-value', resetId:'lhh-reset', stepperId:'lhh-stepper', cssVar:'--lh-heading', storageKey:'md-lh-heading', min:1.0, max:2.5, defaultValue:1.4, step:0.1, unit:''});
    bs({decId:'sp1-decrease', incId:'sp1-increase', valId:'sp1-value', resetId:'sp1-reset', stepperId:'sp1-stepper', cssVar:'--sp-single', storageKey:'md-sp-single', min:2, max:20, defaultValue:4});
    bs({decId:'sp2-decrease', incId:'sp2-increase', valId:'sp2-value', resetId:'sp2-reset', stepperId:'sp2-stepper', cssVar:'--sp-double', storageKey:'md-sp-double', min:4, max:40, defaultValue:8});
    bs({decId:'thpt-decrease', incId:'thpt-increase', valId:'thpt-value', resetId:'thpt-reset', stepperId:'thpt-stepper', cssVar:'--th-pt', storageKey:'md-th-pt', min:0, max:32, defaultValue:12});
    bs({decId:'tblpb-decrease', incId:'tblpb-increase', valId:'tblpb-value', resetId:'tblpb-reset', stepperId:'tblpb-stepper', cssVar:'--tbl-pb', storageKey:'md-tbl-pb', min:0, max:64, defaultValue:8});
    bs({decId:'mi-decrease', incId:'mi-increase', valId:'mi-value', resetId:'mi-reset', stepperId:'mi-stepper', cssVar:'--max-indent', storageKey:'md-max-indent', min:2, max:6, defaultValue:3, unit:'', onApply:function(v, bodies){
      (bodies || [preview]).forEach(function(b) {
        if (b) b.setAttribute('data-max-indent', String(v));
      });
    }});

    // Color pickers: edit a per-theme color palette (light/dark) independently.
    //
    // Two concepts:
    //   - currentTheme(): the site-wide UI theme ([data-theme] on <html>).
    //     Determines which stored palette is actively applied to the preview.
    //   - editingTheme: which palette (light/dark) the user is currently
    //     editing via the Colors section. Independent from UI theme so the
    //     user can tweak both palettes in one sitting without flipping UI.
    //
    // Writes always target localStorage[storageKey-<editingTheme>].
    // They ALSO update :root inline styles (making the change visible) only
    // when editingTheme === currentTheme() — otherwise the change silently
    // goes into storage and will take effect next time the UI switches to
    // that theme.
    var colorPickers = [];
    function currentTheme() {
      return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }
    var editingTheme = currentTheme();
    function getEditingTheme() { return editingTheme; }
    function bindColorPicker(opts) {
      var input = document.getElementById(opts.inputId);
      var hexInput = opts.hexId ? document.getElementById(opts.hexId) : null;
      var alphaInput = opts.alphaId ? document.getElementById(opts.alphaId) : null;
      var resetBtn = document.getElementById(opts.resetId);
      var ctrlEl = document.getElementById(opts.ctrlId);
      if (!input) return;
      // Register this color's CSS variable with the mode switcher so
      // switching modes wipes & re-applies the correct (mode × theme)
      // color set.
      if (opts.cssVar) managedCssVars[opts.cssVar] = true;
      // Parse any CSS color string into { hex6, alpha01 }.
      // Accepts: #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba().
      function parseColor(str) {
        if (!str) return { hex: '#000000', alpha: 1 };
        str = String(str).trim();
        if (str.charAt(0) === '#') {
          var h = str.slice(1);
          if (h.length === 3) h = h.split('').map(function(c){return c+c;}).join('') + 'ff';
          else if (h.length === 4) h = h.split('').map(function(c){return c+c;}).join('');
          else if (h.length === 6) h = h + 'ff';
          if (h.length !== 8) return { hex: '#000000', alpha: 1 };
          return {
            hex: '#' + h.slice(0,6).toLowerCase(),
            alpha: parseInt(h.slice(6,8), 16) / 255
          };
        }
        var m = str.match(/rgba?\(([^)]+)\)/);
        if (!m) return { hex: '#000000', alpha: 1 };
        var p = m[1].split(',').map(function(s){ return parseFloat(s.trim()); });
        var r = p[0] | 0, g = p[1] | 0, b = p[2] | 0;
        var a = p.length >= 4 ? p[3] : 1;
        return {
          hex: '#' + [r,g,b].map(function(x){ return x.toString(16).padStart(2,'0'); }).join(''),
          alpha: a
        };
      }
      function buildHex8(hex6, alpha01) {
        var a = Math.max(0, Math.min(1, alpha01));
        var aa = Math.round(a * 255).toString(16).padStart(2, '0');
        return hex6.toLowerCase() + aa;
      }
      function storageKeyForTheme(theme) { return opts.storageKey + '-' + theme; }

      // Read/write the current session override for this token from
      // the in-memory (mode × theme) bag. Replaces the old
      // localStorage-based storage — inspector customizations are now
      // strictly session-only.
      function readOverride(theme) {
        var modeBag = perModeColorOverrides[currentMode];
        if (!modeBag || !modeBag[theme]) return null;
        return modeBag[theme][opts.cssVar] || null;
      }
      function writeOverride(theme, hex8) {
        if (!perModeColorOverrides[currentMode]) {
          perModeColorOverrides[currentMode] = { light: {}, dark: {} };
        }
        if (!perModeColorOverrides[currentMode][theme]) {
          perModeColorOverrides[currentMode][theme] = {};
        }
        perModeColorOverrides[currentMode][theme][opts.cssVar] = hex8;
      }
      function clearOverride(theme) {
        if (perModeColorOverrides[currentMode] && perModeColorOverrides[currentMode][theme]) {
          delete perModeColorOverrides[currentMode][theme][opts.cssVar];
        }
      }

      // Read the theme default for this token. When reading a theme other
      // than the current UI theme, we must temporarily swap [data-theme] so
      // getComputedStyle returns the right branch of the CSS variables —
      // then restore. Done synchronously within one JS task so there is no
      // visible flash.
      function getDefaultForTheme(theme) {
        var root = document.documentElement;
        var prevInline = root.style.getPropertyValue(opts.cssVar);
        var prevAttr = root.getAttribute('data-theme');
        var swapped = false;
        root.style.removeProperty(opts.cssVar);
        if (theme !== (prevAttr === 'dark' ? 'dark' : 'light')) {
          root.setAttribute('data-theme', theme);
          swapped = true;
        }
        var cs = getComputedStyle(root).getPropertyValue(opts.cssVar).trim();
        if (swapped) {
          // Restore without triggering the theme-transition class path.
          if (prevAttr) root.setAttribute('data-theme', prevAttr);
          else root.removeAttribute('data-theme');
        }
        if (prevInline) root.style.setProperty(opts.cssVar, prevInline);
        return parseColor(cs);
      }
      function syncInputs(parsed) {
        input.value = parsed.hex;
        if (hexInput) {
          hexInput.value = parsed.hex.replace('#', '');
          hexInput.classList.remove('invalid');
        }
        if (alphaInput) alphaInput.value = Math.round(parsed.alpha * 100);
      }
      function markModified(currentHex8, theme) {
        var def = getDefaultForTheme(theme);
        var defHex8 = buildHex8(def.hex, def.alpha);
        if (ctrlEl) ctrlEl.classList.toggle('modified', currentHex8 !== defHex8);
      }
      // Normalize arbitrary hex-ish user input. Returns lowercased #rrggbb
      // on success, or null if the string is not a valid 3/6-digit hex.
      function normalizeHex6(raw) {
        if (raw == null) return null;
        var s = String(raw).trim().replace(/^#/, '');
        if (/^[0-9a-fA-F]{3}$/.test(s)) {
          s = s.split('').map(function(c){return c+c;}).join('');
        }
        if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
        return '#' + s.toLowerCase();
      }
      function applyFromInputs(byUser) {
        // Preferred source: the hex text input (source of truth for RGB).
        var hex6;
        if (hexInput) {
          var norm = normalizeHex6(hexInput.value);
          if (!norm) {
            // Mark invalid but don't overwrite the user's mid-typing value.
            hexInput.classList.add('invalid');
            return;
          }
          hexInput.classList.remove('invalid');
          hex6 = norm;
          // Keep the color swatch visually in sync.
          input.value = hex6;
        } else {
          hex6 = (input.value || '#000000').toLowerCase();
        }
        var alpha01 = alphaInput ? (parseInt(alphaInput.value, 10) || 0) / 100 : 1;
        var hex8 = buildHex8(hex6, alpha01);
        var edit = getEditingTheme();
        // Record user-driven writes in the session-only per-mode
        // override bag. Skipped for programmatic (byUser=false) writes
        // so `loadForEditingTheme` doesn't echo a value back into
        // storage it just read.
        if (byUser) writeOverride(edit, hex8);
        // Apply the color only when the edited palette matches the
        // active UI theme.
        //   byUser=true  => write only to the target wrap
        //   byUser=false => write to every wrap (initial apply)
        if (edit === currentTheme()) {
          if (byUser) {
            var target = getTargetWrap();
            if (target && target.style) target.style.setProperty(opts.cssVar, hex8);
          } else {
            getAllWraps().forEach(function(w) {
              if (w && w.style) w.style.setProperty(opts.cssVar, hex8);
            });
          }
        }
        markModified(hex8, edit);
      }
      // Load the stored value for the editing theme (or its default) into
      // the input controls. If that matches the active UI theme, also
      // push it to every wrap so the preview reflects the state exactly.
      function loadForEditingTheme() {
        var edit = getEditingTheme();
        var isActive = edit === currentTheme();
        // When the currently-edited palette is active, we'll (re-)apply
        // whatever the storage says — but we no longer touch :root.
        // Clear every wrap's inline override first so the baseline
        // starts fresh.
        if (isActive) {
          getAllWraps().forEach(function(w) {
            if (w && w.style) w.style.removeProperty(opts.cssVar);
          });
        }
        var stored = readOverride(edit);
        if (stored) {
          var parsed = parseColor(stored);
          if (isActive) {
            var hex8Stored = buildHex8(parsed.hex, parsed.alpha);
            getAllWraps().forEach(function(w) {
              if (w && w.style) w.style.setProperty(opts.cssVar, hex8Stored);
            });
          }
          syncInputs(parsed);
          markModified(buildHex8(parsed.hex, parsed.alpha), edit);
        } else {
          var def = getDefaultForTheme(edit);
          syncInputs(def);
          if (ctrlEl) ctrlEl.classList.remove('modified');
        }
      }
      loadForEditingTheme();
      // Read the effective color for opts.cssVar from the current
      // target wrap and update the inputs + modified state, without
      // touching storage. Used by the multi-screen target switcher so
      // the color inputs reflect the target screen.
      function reloadFromScope() {
        var edit = getEditingTheme();
        // Only meaningful when the edited palette is the active one;
        // otherwise fall back to the stored/default load.
        if (edit !== currentTheme()) { loadForEditingTheme(); return; }
        var target = getTargetWrap();
        if (!target) { loadForEditingTheme(); return; }
        var cs = window.getComputedStyle(target);
        var raw = cs.getPropertyValue(opts.cssVar).trim();
        if (!raw) { loadForEditingTheme(); return; }
        var parsed = parseColor(raw);
        if (!parsed) { loadForEditingTheme(); return; }
        syncInputs(parsed);
        markModified(buildHex8(parsed.hex, parsed.alpha), edit);
      }
      // Hex text input: primary editable surface for RGB.
      if (hexInput) {
        hexInput.addEventListener('input', function(){ applyFromInputs(true); });
        hexInput.addEventListener('blur', function(){
          // Snap back to the last known valid color if the user left the
          // field mid-edit with junk.
          if (!normalizeHex6(hexInput.value)) {
            hexInput.value = (input.value || '#000000').replace('#', '');
            hexInput.classList.remove('invalid');
          }
        });
      }
      if (alphaInput) {
        alphaInput.addEventListener('input', function(){
          var v = parseInt(alphaInput.value, 10);
          if (isNaN(v)) return;
          if (v < 0) alphaInput.value = 0;
          if (v > 100) alphaInput.value = 100;
          applyFromInputs(true);
        });
        alphaInput.addEventListener('blur', function(){
          if (alphaInput.value === '' || isNaN(parseInt(alphaInput.value, 10))) {
            alphaInput.value = 100;
            applyFromInputs(true);
          }
        });
      }
      if (resetBtn) {
        resetBtn.addEventListener('click', function(e){
          e.stopPropagation();
          var edit = getEditingTheme();
          // Drop the session override for (current mode, edited theme).
          clearOverride(edit);
          // Clear the inline style from every wrap (single- and multi-
          // screen alike) so the CSS default re-emerges via cascade.
          if (edit === currentTheme()) {
            getAllWraps().forEach(function(w) {
              if (w && w.style) w.style.removeProperty(opts.cssVar);
            });
          }
          syncInputs(getDefaultForTheme(edit));
          if (ctrlEl) ctrlEl.classList.remove('modified');
        });
      }
      colorPickers.push({ reload: loadForEditingTheme, reloadFromScope: reloadFromScope });
    }
    // Refresh all pickers — call after editingTheme changes, or after the
    // active UI theme changes (which implicitly changes which palette is
    // "live" even though inputs may still show the same palette).
    window.__refreshColorPickers = function() {
      for (var i = 0; i < colorPickers.length; i++) colorPickers[i].reload();
    };
    // Refresh everything (steppers + color pickers) against whatever
    // wrap getTargetWrap() currently points at. The multi-screen IIFE
    // calls this after the user changes the edit-target screen so the
    // Settings panel reflects values from the new target.
    window.__refreshInspectorFromScope = function() {
      for (var i = 0; i < steppers.length; i++) {
        if (steppers[i].refresh) steppers[i].refresh();
      }
      for (var j = 0; j < colorPickers.length; j++) {
        if (colorPickers[j].reloadFromScope) colorPickers[j].reloadFromScope();
        else if (colorPickers[j].reload) colorPickers[j].reload();
      }
    };
    // Diagnostic helper: prints the effective CSS-variable cascade for
    // each virtual screen plus the actual computed font-size of each
    // heading level inside that screen. Call from DevTools console as
    // `__debugSettings()` when something looks wrong with the Settings
    // panel — it removes any doubt about where a value is coming from.
    window.__debugSettings = function() {
      var vars = ['--fs-base','--fs-h1','--fs-h2','--fs-h3','--fs-h4',
                  '--fs-h5','--fs-h6','--fs-code','--mt-h1','--mt-h2',
                  '--mt-h3','--mt-h4','--mt-h5','--mt-h6',
                  '--sp-single','--sp-double'];
      var root = document.documentElement;
      var rootCS = getComputedStyle(root);
      var rootInline = {}; var rootComputed = {};
      vars.forEach(function(v) {
        rootInline[v] = root.style.getPropertyValue(v) || '(unset)';
        rootComputed[v] = rootCS.getPropertyValue(v).trim() || '(unset)';
      });
      console.group('[settings] :root');
      console.log('inline   :', rootInline);
      console.log('computed :', rootComputed);
      console.groupEnd();

      var wraps = document.querySelectorAll('.screen-wrap');
      wraps.forEach(function(w, i) {
        var cs = getComputedStyle(w);
        var inline = {}, computed = {};
        vars.forEach(function(v) {
          inline[v] = w.style.getPropertyValue(v) || '(unset)';
          computed[v] = cs.getPropertyValue(v).trim() || '(unset)';
        });
        var body = w.querySelector('.markdown-body');
        var hs = {};
        if (body) {
          ['h1','h2','h3','h4','h5','h6'].forEach(function(tag) {
            var el = body.querySelector(tag);
            hs[tag] = el ? getComputedStyle(el).fontSize : '(no element)';
          });
        }
        console.group('[settings] screen ' + (i+1));
        console.log('inline   :', inline);
        console.log('computed :', computed);
        console.log('actual heading font-size:', hs);
        console.groupEnd();
      });
      console.log('edit target index:', (window.__screens && window.__screens.getEditTargetIndex)
        ? window.__screens.getEditTargetIndex() : '(no multi-screen API)');
    };
    // Expose for the segmented switch handler registered below.
    window.__setEditingTheme = function(theme) {
      editingTheme = theme === 'dark' ? 'dark' : 'light';
      // Sync the visual state of the segmented buttons.
      var segBtns = document.querySelectorAll('#theme-segmented .theme-seg-btn');
      for (var si = 0; si < segBtns.length; si++) {
        var isMatch = segBtns[si].getAttribute('data-theme-target') === editingTheme;
        segBtns[si].classList.toggle('active', isMatch);
        segBtns[si].setAttribute('aria-selected', isMatch ? 'true' : 'false');
      }
      window.__refreshColorPickers();
    };

    // Migration: Settings-controlled preview colors now store hex8 (#rrggbbaa)
    // so users can tweak opacity. Promote any legacy single-color values to
    // `-light`, upgrade hex6 to hex8, and drop --pv-accent entirely (accent
    // is a site-level brand color, not a per-render rule).
    (function migrateLegacyColorKeys() {
      if (localStorage.getItem('md-pv-migrated-v2')) return;
      var baseKeys = ['md-pv-text','md-pv-border','md-pv-card','md-pv-code'];
      // 1) Promote legacy (pre-theme-split) keys to -light slot.
      for (var i = 0; i < baseKeys.length; i++) {
        var k = baseKeys[i];
        var v = localStorage.getItem(k);
        if (v && !localStorage.getItem(k + '-light')) {
          localStorage.setItem(k + '-light', v);
        }
        localStorage.removeItem(k);
      }
      // 2) Drop accent-related storage across all slots.
      var accentKeys = ['md-pv-accent','md-pv-accent-light','md-pv-accent-dark'];
      for (var ai = 0; ai < accentKeys.length; ai++) localStorage.removeItem(accentKeys[ai]);
      // 3) Upgrade any hex6 values to hex8 (assume fully opaque).
      var themed = [];
      for (var bi = 0; bi < baseKeys.length; bi++) {
        themed.push(baseKeys[bi] + '-light');
        themed.push(baseKeys[bi] + '-dark');
      }
      for (var ti = 0; ti < themed.length; ti++) {
        var val = localStorage.getItem(themed[ti]);
        if (val && /^#[0-9a-fA-F]{6}$/.test(val.trim())) {
          localStorage.setItem(themed[ti], val.trim().toLowerCase() + 'ff');
        }
      }
      localStorage.setItem('md-pv-migrated-v2', '1');
    })();
    // One-time cleanup: the old "Heading top" setting collapsed all levels
    // into a single --mt-heading variable. It's been replaced by per-level
    // H1..H6 steppers; drop the legacy storage key so it doesn't linger.
    localStorage.removeItem('md-mt-heading');
    // One-time migration: inspector adjustments used to persist in
    // localStorage. They no longer do — everything is session-only and
    // per-mode now. Sweep any keys the old code could have written so
    // upgrading users don't get stuck on stale values that won't be
    // reapplied anyway (and would just accumulate as dead keys).
    (function wipeLegacyInspectorKeys() {
      var prefixes = [
        'md-fs-base','md-mt-h1','md-mt-h2','md-mt-h3','md-mt-h4','md-mt-h5','md-mt-h6',
        'md-lh-body','md-lh-heading','md-sp-single','md-sp-double',
        'md-th-pt','md-tbl-pb','md-max-indent',
        'md-pv-text','md-pv-border','md-pv-card','md-pv-code',
        'md-pv-text-light','md-pv-text-dark',
        'md-pv-border-light','md-pv-border-dark',
        'md-pv-card-light','md-pv-card-dark',
        'md-pv-code-light','md-pv-code-dark'
      ];
      for (var i = 0; i < prefixes.length; i++) localStorage.removeItem(prefixes[i]);
    })();
    bindColorPicker({inputId:'pc-text', hexId:'pc-text-hex', alphaId:'pc-text-alpha', resetId:'pc-text-reset', ctrlId:'pc-text-stepper', cssVar:'--pv-text', storageKey:'md-pv-text'});
    bindColorPicker({inputId:'pc-border', hexId:'pc-border-hex', alphaId:'pc-border-alpha', resetId:'pc-border-reset', ctrlId:'pc-border-stepper', cssVar:'--pv-border', storageKey:'md-pv-border'});
    bindColorPicker({inputId:'pc-card', hexId:'pc-card-hex', alphaId:'pc-card-alpha', resetId:'pc-card-reset', ctrlId:'pc-card-stepper', cssVar:'--pv-card-bg', storageKey:'md-pv-card'});
    bindColorPicker({inputId:'pc-code', hexId:'pc-code-hex', alphaId:'pc-code-alpha', resetId:'pc-code-reset', ctrlId:'pc-code-stepper', cssVar:'--pv-inline-code-bg', storageKey:'md-pv-code'});

    // Settings > Colors segmented Light/Dark switch — this is a DIRECTORY
    // switcher for which palette the user is editing. It does NOT touch the
    // site-wide UI theme ([data-theme]). Reading/writing the selected
    // palette is handled by bindColorPicker via editingTheme.
    var segBtnsAll = document.querySelectorAll('#theme-segmented .theme-seg-btn');
    for (var sbi = 0; sbi < segBtnsAll.length; sbi++) {
      segBtnsAll[sbi].addEventListener('click', function(e) {
        e.stopPropagation();
        var target = this.getAttribute('data-theme-target');
        window.__setEditingTheme(target === 'dark' ? 'dark' : 'light');
      });
    }
    // Initialize segmented button visual state based on current editingTheme
    // (initially mirrors the site UI theme).
    window.__setEditingTheme(currentTheme());
  })();

  // Gear button in preview header opens the Inspector.  // roles: (1) when the Inspector is closed it's the entry point that
  // opens it to the Settings view; (2) when the Inspector is open and
  // currently showing the element-inspection view, it acts as a "back
  // to Settings" shortcut. It is hidden only while the Settings view
  // itself is already visible, where it would be redundant.
  var settingsOpenBtn = document.getElementById('settings-open-btn');

  function syncSettingsOpenBtn() {
    if (!settingsOpenBtn) return;
    // The gear is only redundant when the Settings view is the one
    // currently on-screen. Whenever the Inspector is collapsed OR the
    // element-inspection view has replaced the Settings view inside
    // the panel, show the gear so the user has an entry/exit point
    // back to Settings. All animation is owned by the
    // `.settings-open-btn-hidden` CSS class: width / margin / opacity /
    // transform transitions are already declared on `#settings-open-btn`,
    // producing a smooth collapse-and-fade when the class is added and
    // a reverse expand-and-fade when it's removed. Other icons in the
    // preview header (theme / fullscreen) slide into the vacated space
    // because the button's flex width animates to 0 together with a
    // negative margin-left absorbing the header's flex gap.
    var settingsView = document.getElementById('inspector-settings');
    var settingsVisible = !inspectorPanel.classList.contains('collapsed') &&
                          settingsView &&
                          settingsView.style.display !== 'none';
    if (settingsVisible) {
      settingsOpenBtn.classList.add('settings-open-btn-hidden');
    } else {
      settingsOpenBtn.classList.remove('settings-open-btn-hidden');
    }
  }
  syncSettingsOpenBtn();
  new MutationObserver(syncSettingsOpenBtn).observe(inspectorPanel, {attributes:true, attributeFilter:['class']});
  // Also react to inner-view toggles (Settings view ↔ element-inspection
  // view) which flip #inspector-settings' inline `display` style. The
  // class-level observer above only catches panel open/close, so we need
  // a style-attribute observer on the Settings container too.
  (function() {
    var settingsView = document.getElementById('inspector-settings');
    if (!settingsView) return;
    new MutationObserver(syncSettingsOpenBtn).observe(settingsView, {attributes:true, attributeFilter:['style']});
  })();

  if (settingsOpenBtn) {
    settingsOpenBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      inspectorPanel.style.flex = '';
      inspectorPanel.classList.remove('collapsed');
      inspectorManualOpen = true;
      // Clear any element-inspection highlight so the gear always
      // switches the Inspector content to the Settings view — even
      // when the panel is already open showing element details.
      if (highlightedEl) { highlightedEl.classList.remove('inspector-highlight'); highlightedEl = null; }
      var outlined = document.querySelectorAll('.markdown-body .inspector-block-outline');
      for (var o = 0; o < outlined.length; o++) outlined[o].classList.remove('inspector-block-outline');
      clearSourceArrow();
      clearSpacingOverlays();
      showInspectorSettings();
      // Multi-screen: slide the editor column out of the way in sync
      // with opening Settings (mirror the element-Inspector path).
      if (window.__screens && typeof window.__screens.applyEditorHidden === 'function') {
        window.__screens.applyEditorHidden();
      }
      // Mobile stacked layout: inspector ↔ editor mutual exclusion
      if (isMobileLayout() && !editorPanel.classList.contains('collapsed')) {
        editorPanel.style.flex = '';
        editorPanel.classList.add('collapsed');
      }
    });
  }

  // Close (X) button collapses the panel.
  (function() {
    var insToggle = document.getElementById('inspector-toggle');
    if (insToggle) {
      insToggle.addEventListener('click', function(e) {
        if (inspectorPanel.classList.contains('collapsed')) return;
        e.stopPropagation();
        inspectorPanel.style.flex = '';
        inspectorPanel.classList.add('collapsed');
        inspectorManualOpen = false;
      });
    }
  })();

  // ===== Spacing measurement (auto when element selected) =====
  var spacingOverlays = [];
  var hoverOutlineEl = null;

  function clearSpacingOverlays() {
    for (var i = 0; i < spacingOverlays.length; i++) {
      if (spacingOverlays[i].parentNode) spacingOverlays[i].parentNode.removeChild(spacingOverlays[i]);
    }
    spacingOverlays = [];
  }

  preview.addEventListener('mousemove', function(e) {
    if (!highlightedEl) return;
    var target = e.target;
    // Normalize target: treat any formula as a single block
    var formulaRoot = target.closest && target.closest('.katex-display, .katex-inline, .formula-wrapper');
    if (formulaRoot) target = formulaRoot;
    if (target === preview || target === highlightedEl) {
      clearSpacingOverlays();
      if (hoverOutlineEl) { hoverOutlineEl.classList.remove('spacing-hover-outline'); hoverOutlineEl = null; }
      return;
    }
    if (target.contains(highlightedEl) || highlightedEl.contains(target)) {
      clearSpacingOverlays();
      if (hoverOutlineEl) { hoverOutlineEl.classList.remove('spacing-hover-outline'); hoverOutlineEl = null; }
      return;
    }

    if (hoverOutlineEl && hoverOutlineEl !== target) {
      hoverOutlineEl.classList.remove('spacing-hover-outline');
    }
    target.classList.add('spacing-hover-outline');
    hoverOutlineEl = target;

    clearSpacingOverlays();
    drawSpacing(highlightedEl, target);
  });

  preview.addEventListener('mouseleave', function() {
    clearSpacingOverlays();
    if (hoverOutlineEl) { hoverOutlineEl.classList.remove('spacing-hover-outline'); hoverOutlineEl = null; }
  });

  function drawSpacing(elA, elB) {
    var rA = elA.getBoundingClientRect();
    var rB = elB.getBoundingClientRect();
    var container = previewBg.getBoundingClientRect();

    // Vertical gap
    var vGap = 0, vY = 0;
    if (rA.bottom <= rB.top) {
      vGap = Math.round(rB.top - rA.bottom);
      vY = rA.bottom;
    } else if (rB.bottom <= rA.top) {
      vGap = Math.round(rA.top - rB.bottom);
      vY = rB.bottom;
    }

    if (vGap > 0) {
      var midX = Math.max(rA.left, rB.left) + Math.min(rA.right - rA.left, rB.right - rB.left) / 2;
      // Vertical line
      var vLine = document.createElement('div');
      vLine.className = 'spacing-line';
      vLine.style.cssText = 'left:' + (midX - container.left) + 'px;top:' + (vY - container.top + previewBg.scrollTop) + 'px;width:1px;height:' + vGap + 'px;';
      previewBg.appendChild(vLine);
      spacingOverlays.push(vLine);
      // Top cap
      var capT = document.createElement('div');
      capT.className = 'spacing-line';
      capT.style.cssText = 'left:' + (midX - container.left - 3) + 'px;top:' + (vY - container.top + previewBg.scrollTop) + 'px;width:7px;height:1px;';
      previewBg.appendChild(capT); spacingOverlays.push(capT);
      // Bottom cap
      var capB = document.createElement('div');
      capB.className = 'spacing-line';
      capB.style.cssText = 'left:' + (midX - container.left - 3) + 'px;top:' + (vY + vGap - container.top + previewBg.scrollTop) + 'px;width:7px;height:1px;';
      previewBg.appendChild(capB); spacingOverlays.push(capB);
      // Label
      var label = document.createElement('div');
      label.className = 'spacing-label';
      label.textContent = vGap + 'px';
      label.style.cssText = 'left:' + (midX - container.left + 4) + 'px;top:' + (vY + vGap / 2 - 8 - container.top + previewBg.scrollTop) + 'px;';
      previewBg.appendChild(label); spacingOverlays.push(label);
    }

    // Horizontal gap
    var hGap = 0, hX = 0;
    if (rA.right <= rB.left) {
      hGap = Math.round(rB.left - rA.right);
      hX = rA.right;
    } else if (rB.right <= rA.left) {
      hGap = Math.round(rA.left - rB.right);
      hX = rB.right;
    }

    if (hGap > 0) {
      var midY = Math.max(rA.top, rB.top) + Math.min(rA.bottom - rA.top, rB.bottom - rB.top) / 2;
      var hLine = document.createElement('div');
      hLine.className = 'spacing-line';
      hLine.style.cssText = 'left:' + (hX - container.left) + 'px;top:' + (midY - container.top + previewBg.scrollTop) + 'px;width:' + hGap + 'px;height:1px;';
      previewBg.appendChild(hLine); spacingOverlays.push(hLine);
      // Left cap
      var capL = document.createElement('div');
      capL.className = 'spacing-line';
      capL.style.cssText = 'left:' + (hX - container.left) + 'px;top:' + (midY - 3 - container.top + previewBg.scrollTop) + 'px;width:1px;height:7px;';
      previewBg.appendChild(capL); spacingOverlays.push(capL);
      // Right cap
      var capR = document.createElement('div');
      capR.className = 'spacing-line';
      capR.style.cssText = 'left:' + (hX + hGap - container.left) + 'px;top:' + (midY - 3 - container.top + previewBg.scrollTop) + 'px;width:1px;height:7px;';
      previewBg.appendChild(capR); spacingOverlays.push(capR);
      // Label
      var hLabel = document.createElement('div');
      hLabel.className = 'spacing-label';
      hLabel.textContent = hGap + 'px';
      hLabel.style.cssText = 'left:' + (hX + hGap / 2 - container.left) + 'px;top:' + (midY + 4 - container.top + previewBg.scrollTop) + 'px;transform:translateX(-50%);';
      previewBg.appendChild(hLabel); spacingOverlays.push(hLabel);
    }
  }

  var highlightedEl = null;

  // Clear any element-level selection / block outline / source-arrow /
  // spacing overlay. Shared by blank-area clicks inside the preview
  // (around or between the virtual screens) and the document-level
  // fallback that handles clicks entirely outside the preview area.
  function clearInspectorSelection() {
    if (highlightedEl) {
      highlightedEl.classList.remove('inspector-highlight');
      highlightedEl = null;
    }
    var blockOutlines = document.querySelectorAll('.markdown-body .inspector-block-outline');
    for (var bo = 0; bo < blockOutlines.length; bo++) {
      blockOutlines[bo].classList.remove('inspector-block-outline');
    }
    clearSourceArrow();
    clearSpacingOverlays();
    if (hoverOutlineEl) {
      hoverOutlineEl.classList.remove('spacing-hover-outline');
      hoverOutlineEl = null;
    }
    showInspectorSettings();
    if (!inspectorManualOpen) {
      inspectorPanel.style.flex = '';
      inspectorPanel.classList.add('collapsed');
    }
  }

  // Delegate to the preview-outer-row so clicks inside any virtual
  // screen's .markdown-body (primary or clones) can trigger Inspector.
  var previewOuterRow = document.getElementById('preview-outer-row');
  (previewOuterRow || preview).addEventListener('click', function(e) {
    var body = e.target.closest && e.target.closest('.markdown-body');
    // Clicks on the empty area around / inside the preview card but
    // *not* on an actual rendered Markdown element should dismiss the
    // current selection. This covers: the preview background gutter,
    // the card's own padding, the screen badges' surrounding space,
    // and drag handles. Previously `return` here left the highlight
    // stuck on whatever was last selected because the document-level
    // fallback listener excludes everything under previewOuterRow.
    if (!body || e.target === body) {
      clearInspectorSelection();
      return;
    }
    e.stopPropagation();
    if (highlightedEl) highlightedEl.classList.remove('inspector-highlight');
    // Clear any block outlines on ALL screens.
    var blockOutlines = document.querySelectorAll('.markdown-body .inspector-block-outline');
    for (var bo = 0; bo < blockOutlines.length; bo++) blockOutlines[bo].classList.remove('inspector-block-outline');
    clearSourceArrow();
    clearSpacingOverlays();

    var target = e.target;

    // Footnote refs: skip Inspector interaction entirely
    if (target.closest('.footnote-ref')) return;

    // Formula: select the entire .katex-display block
    var formulaParent = target.closest('.katex-display');
    if (formulaParent) { target = formulaParent; }

    // Heading: select the .heading-text, and show parent block outline
    var headingText = target.closest('.heading-text');
    if (headingText) {
      target = headingText;
      // Also add a subtle block outline on the parent heading
      var parentH = headingText.parentElement;
      if (parentH) parentH.classList.add('inspector-block-outline');
    }

    // Don't select wrapper/scroll containers
    if (target.classList.contains('formula-wrapper') || target.classList.contains('formula-scroll') ||
        target.classList.contains('code-wrapper') || target.classList.contains('table-wrapper') ||
        target.classList.contains('table-scroll')) {
      return;
    }

    target.classList.add('inspector-highlight');
    highlightedEl = target;
    showInspector(target);
    highlightSourceLine(target);
    inspectorPanel.style.flex = '';
    inspectorPanel.classList.remove('collapsed');
    // Multi-screen: make sure the editor column slides out of the way as
    // soon as the Inspector opens on an element — don't wait for the
    // MutationObserver to settle the layout, since any delay leaves the
    // three columns (editor | preview | inspector) visibly cramped for a
    // frame or two. Calling this synchronously guarantees the preview
    // panel reclaims the full width immediately.
    if (window.__screens && typeof window.__screens.applyEditorHidden === 'function') {
      window.__screens.applyEditorHidden();
    }
    // Mobile (stacked): inspector ↔ editor mutual exclusion
    if (isMobileLayout() && !editorPanel.classList.contains('collapsed')) {
      editorPanel.style.flex = '';
      editorPanel.classList.add('collapsed');
    }
  });
  document.addEventListener('click', function(e) {
    if (!preview.contains(e.target) && !inspectorPanel.contains(e.target) &&
        (!previewOuterRow || !previewOuterRow.contains(e.target))) {
      clearInspectorSelection();
    }
    // Blank-area click should close the Settings panel regardless of
    // how it was opened. "Blank" = outside the inspector, outside the
    // editor panel, and outside the preview panel's interactive chrome
    // (gear button, mode tabs, screen badges, etc.). Clicks INSIDE the
    // preview virtual screens should keep Settings open (those are
    // used to switch edit targets in multi-screen mode). Clicks on
    // panel chrome (topbar, dividers, preview-bg background gutter)
    // count as blank.
    if (!inspectorPanel.classList.contains('collapsed')) {
      var target = e.target;
      var insidePreviewOuter = !!target.closest && !!target.closest('.preview-outer');
      var insideInspector = inspectorPanel.contains(target);
      var insideEditor = editorPanel.contains(target);
      var onGear = target.closest && target.closest('#settings-open-btn');
      var onScreenBadge = target.closest && target.closest('.screen-badge');
      var onScreenAdd = target.closest && target.closest('#screen-add-btn');
      var onModeControl = target.closest && (target.closest('.mode-btn') || target.closest('.mode-dropdown-trigger') || target.closest('.mode-dropdown-item'));
      if (!insideInspector && !insideEditor && !insidePreviewOuter &&
          !onGear && !onScreenBadge && !onScreenAdd && !onModeControl) {
        inspectorPanel.style.flex = '';
        inspectorPanel.classList.add('collapsed');
        inspectorManualOpen = false;
      }
    }
  });

  function clearSourceArrow() {
    var overlay = document.getElementById('editor-overlay');
    if (overlay) {
      overlay.innerHTML = '';
      overlay.classList.remove('pinned');
    }
    editor.classList.remove('source-pinned');
  }

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function highlightSourceLine(el) {
    var result = findSourceLines(el);
    if (!result) return;

    var sourceLine = result.line;
    var sourceEndLine = result.endLine;

    // Trim trailing empty lines
    var lines = editor.value.split('\n');
    var actualEnd = sourceEndLine;
    while (actualEnd > sourceLine && lines[actualEnd - 1] !== undefined && lines[actualEnd - 1].trim() === '') {
      actualEnd--;
    }

    // Render overlay with the selected lines in accent color
    var overlay = document.getElementById('editor-overlay');
    if (overlay) {
      var before = lines.slice(0, sourceLine - 1).join('\n');
      var selected = lines.slice(sourceLine - 1, actualEnd).join('\n');
      var after = lines.slice(actualEnd).join('\n');
      var inner = '<div class="overlay-inner" style="transform:translateY(' + (-editor.scrollTop) + 'px)">';
      inner += escapeHtml(before);
      if (before.length > 0) inner += '\n';
      inner += '<span class="source-highlight">' + escapeHtml(selected) + '</span>';
      if (after.length > 0) inner += '\n' + escapeHtml(after);
      inner += '</div>';
      overlay.innerHTML = inner;
      overlay.classList.add('pinned');
    }
    // Hide the textarea's own text so the overlay (full source, with the
    // selected lines in accent green) shows through. Caret stays visible.
    editor.classList.add('source-pinned');

    // Mobile: scroll editor to show the highlighted lines
    var totalLines = lines.length;
    var lineHeight = editor.scrollHeight / totalLines;
    var topPx = (sourceLine - 1) * lineHeight;
    if (isMobileLayout()) {
      var targetScroll = topPx - editor.clientHeight / 3;
      editor.scrollTop = Math.max(0, targetScroll);
      syncLineNumberScroll();
    }
  }

  function setInspectorTitle(text) {
    var t = document.getElementById('inspector-title');
    var c = document.querySelector('.inspector-collapsed-label');
    if (t) t.textContent = text;
    if (c) c.textContent = text;
  }

  function showInspectorSettings() {
    var settings = document.getElementById('inspector-settings');
    var elInfo = document.getElementById('inspector-element');
    if (settings) settings.style.display = '';
    if (elInfo) { elInfo.style.display = 'none'; elInfo.innerHTML = ''; }
    setInspectorTitle(t('settings.title'));
    // Multi-screen: append " · Screen N" so the title reflects the
    // currently-edited virtual screen.
    if (window.__screens && window.__screens.updateSettingsTitle) {
      window.__screens.updateSettingsTitle();
    }
    // Refresh all inputs against the current edit target so the panel
    // always opens showing the target screen's values.
    if (typeof window.__refreshInspectorFromScope === 'function') {
      window.__refreshInspectorFromScope();
    }
  }

  function showInspector(el) {
    var cs = window.getComputedStyle(el);
    var tag = el.tagName.toLowerCase();
    var cls = el.className ? el.className.replace('inspector-highlight','').trim() : '';
    var h = '<span class="inspector-tag">&lt;' + tag + '&gt;</span>';
    if (cls) h += '<div style="font-size:10px;color:var(--text-secondary);margin-bottom:10px">.' + cls.split(' ').join(' .') + '</div>';
    h += sec('Typography', [
      ['font-family', shortFont(cs.fontFamily)],
      ['font-size', cs.fontSize],
      ['font-weight', cs.fontWeight],
      ['line-height', cs.lineHeight],
      ['letter-spacing', cs.letterSpacing],
      ['text-align', cs.textAlign],
      ['text-transform', cs.textTransform !== 'none' ? cs.textTransform : null],
      ['font-variant-numeric', cs.fontVariantNumeric !== 'normal' ? cs.fontVariantNumeric : null]
    ]);
    h += sec('Color', [
      ['color', cs.color, true],
      ['background', cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : null, true]
    ]);
    h += sec('Box Model', [
      ['width', Math.round(el.offsetWidth) + 'px'],
      ['height', Math.round(el.offsetHeight) + 'px'],
      ['padding-top', cs.paddingTop !== '0px' ? cs.paddingTop : null],
      ['padding-right', cs.paddingRight !== '0px' ? cs.paddingRight : null],
      ['padding-bottom', cs.paddingBottom !== '0px' ? cs.paddingBottom : null],
      ['padding-left', cs.paddingLeft !== '0px' ? cs.paddingLeft : null],
      ['margin-top', cs.marginTop !== '0px' ? cs.marginTop : null],
      ['margin-right', cs.marginRight !== '0px' ? cs.marginRight : null],
      ['margin-bottom', cs.marginBottom !== '0px' ? cs.marginBottom : null],
      ['margin-left', cs.marginLeft !== '0px' ? cs.marginLeft : null],
      ['border', cs.borderWidth !== '0px' ? cs.border : null],
      ['border-radius', cs.borderRadius !== '0px' ? cs.borderRadius : null]
    ]);
    h += sec('Display', [
      ['display', cs.display],
      ['position', cs.position !== 'static' ? cs.position : null],
      ['overflow', cs.overflow !== 'visible' ? cs.overflow : null]
    ]);
    var settings = document.getElementById('inspector-settings');
    var elInfo = document.getElementById('inspector-element');
    if (settings) settings.style.display = 'none';
    if (elInfo) { elInfo.style.display = ''; elInfo.innerHTML = h; }
    setInspectorTitle(t('inspector.title'));
  }

  function sec(title, rows) {
    var h = '<div class="inspector-section"><div class="inspector-section-title">' + title + '</div>';
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][1] == null) continue;
      h += '<div class="inspector-row"><span class="inspector-key">' + rows[i][0] + '</span>';
      if (rows[i][2]) h += '<span class="inspector-value"><span class="inspector-color-swatch" style="background:' + rows[i][1] + '"></span>' + rows[i][1] + '</span>';
      else h += '<span class="inspector-value">' + rows[i][1] + '</span>';
      h += '</div>';
    }
    return h + '</div>';
  }
  function shortFont(f) {
    if (!f) return '';
    var first = f.split(',')[0].trim().replace(/"/g, '');
    var c = f.split(',').length;
    return c > 1 ? first + ' +' + (c-1) : first;
  }

  var defaultContentEn = [
    '# WeMarkdown Live Preview',
    '',
    'Welcome to **WeMarkdown**! Type Markdown on the left, see the rendered output on the right in real time. Supports GFM syntax, code highlighting (GitHub color scheme), LaTeX math formulas, and a style Inspector panel.',
    '',
    '---',
    '',
    '## Text Formatting <sup>H2</sup>',
    '',
    'This is a regular paragraph. Markdown supports various inline formats: **bold text**, *italic text*, ~~strikethrough~~, and inline code `const x = 42;`. You can also combine them, like ***bold italic***.',
    '',
    'More inline HTML tags: <kbd>⌘</kbd> + <kbd>K</kbd> to jump, <ins>inserted</ins> and <u>underlined</u>. Press <kbd>Shift</kbd> + <kbd>Enter</kbd> for a soft break.',
    '',
    'A long inline code example: `this.is.a.very.long.inline.code.that.should.automatically.wrap.when.reaching.the.container.boundary.without.scrolling` which wraps automatically.',
    '',
    '## Links <sup>H2</sup>',
    '',
    'Inline link: [WeMarkdown](https://wemd.pages.woa.com) opens the live preview. Reference-style link: [CommonMark spec][cmark]. Automatic URL: <https://example.com>.',
    '',
    '[cmark]: https://commonmark.org "CommonMark"',
    '',
    '## Heading Levels <sup>H2</sup>',
    '',
    '# H1 Heading',
    '',
    '## H2 Heading',
    '',
    '### H3 Heading',
    '#### H4 Heading',
    '##### H5 Heading',
    '###### H6 Heading',
    '',
    '## Code Highlighting — GitHub Theme <sup>H2</sup>',
    '',
    'The debounce pattern is commonly used to limit the rate at which a function fires. Here is a JavaScript implementation:',
    '',
    '```javascript',
    '// Debounce function',
    'function debounce(fn, delay) {',
    '  let timer = null;',
    '  return function (...args) {',
    '    clearTimeout(timer);',
    '    timer = setTimeout(() => fn.apply(this, args), delay);',
    '  };',
    '}',
    '',
    'const handleInput = debounce((e) => {',
    '  console.log(e.target.value);',
    '}, 300);',
    '```',
    '',
    'Python offers elegant ways to optimize recursive functions with decorators like `lru_cache`:',
    '',
    '```python',
    'from functools import lru_cache',
    '',
    '@lru_cache(maxsize=None)',
    'def fibonacci(n: int) -> int:',
    '    """Recursively compute Fibonacci numbers with caching"""',
    '    if n <= 1:',
    '        return n',
    '    return fibonacci(n - 1) + fibonacci(n - 2)',
    '',
    'for i in range(15):',
    '    print(f"F({i}) = {fibonacci(i)}")',
    '```',
    '',
    'CSS custom properties make theming straightforward. The following snippet shows how the card styles are defined:',
    '',
    '```css',
    '.markdown-body {',
    '  font-size: 17px;',
    '  line-height: 1.4;',
    '  color: var(--text-primary);',
    '  background: var(--card-bg);',
    '  border-radius: 8px;',
    '}',
    '```',
    '',
    '## LaTeX Math Formulas <sup>H2</sup>',
    '',
    'Inline formulas: the mass-energy equivalence $E = mc^2$, the Pythagorean theorem $a^2 + b^2 = c^2$.',
    '',
    'Standard block formulas:',
    '',
    '$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$',
    '',
    '$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$',
    '',
    'A tall formula with nested structures:',
    '',
    '$$f(x) = \\begin{cases} x^2 + 2x + 1 & \\text{if } x \\geq 0 \\\\ -x^3 + 4 & \\text{if } x < 0 \\end{cases}$$',
    '',
    'A tall nested fraction:',
    '',
    '$$\\cfrac{1}{1 + \\cfrac{1}{1 + \\cfrac{1}{1 + \\cfrac{1}{1 + x}}}}$$',
    '',
    'A long formula that overflows and scrolls horizontally:',
    '',
    '$$\\frac{\\partial^2 u}{\\partial t^2} = c^2 \\left( \\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} + \\frac{\\partial^2 u}{\\partial z^2} \\right) + f(x, y, z, t) + g(x, y, z, t) + h(x, y, z, t) + \\alpha \\cdot \\beta \\cdot \\gamma \\cdot \\delta$$',
    '',
    '## Blockquote <sup>H2</sup>',
    '',
    '> Good design is as little design as possible.',
    '>',
    '> \u2014 Dieter Rams',
    '',
    '### Blockquote with Code Block <sup>H3</sup>',
    '',
    '> The factory pattern encapsulates object creation logic:',
    '>',
    '> ```javascript',
    '> function createUser(name, role) {',
    '>   return {',
    '>     name,',
    '>     role,',
    '>     createdAt: Date.now(),',
    '>     toString() {',
    '>       return `${this.name} (${this.role})`;',
    '>     }',
    '>   };',
    '> }',
    '> ```',
    '>',
    '> This pattern is useful when you need to create many similar objects with different configurations.',
    '',
    '### Blockquote with Table <sup>H3</sup>',
    '',
    '> HTTP status codes are grouped into five classes:',
    '>',
    '> | Code | Category | Meaning |',
    '> |------|----------|---------|',
    '> | 1xx | Informational | Request received, continuing |',
    '> | 2xx | Success | Action completed successfully |',
    '> | 3xx | Redirection | Further action needed |',
    '> | 4xx | Client Error | Bad request from client |',
    '> | 5xx | Server Error | Server failed to fulfill |',
    '',
    '### Blockquote with Formula <sup>H3</sup>',
    '',
    '> In probability theory, Bayes\\\' theorem describes the probability of an event based on prior knowledge:',
    '>',
    '> $$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$',
    '>',
    '> where $P(A|B)$ is the posterior probability and $P(A)$ is the prior.',
    '',
    '### Nested Blockquote with Mixed Content <sup>H3</sup>',
    '',
    '> **Level 1** \u2014 A top-level quote can contain rich content:',
    '>',
    '> 1. First point inside a quote',
    '> 2. Second point inside a quote',
    '>',
    '>> **Level 2** \u2014 A nested quote adds depth:',
    '>>',
    '>> - Bullet inside a nested quote',
    '>> - Another bullet at the same level',
    '>>',
    '>>> **Level 3** \u2014 A deeply nested quote with its own content:',
    '>>>',
    '>>> 1. Ordered item at the deepest level',
    '>>> 2. Another ordered item',
    '>>>    - Sub-bullet shares the third level',
    '',
    '### Blockquote with Nested Lists <sup>H3</sup>',
    '',
    '> The following list demonstrates how blockquote + list levels are counted together (max 3):',
    '>',
    '> - **Level 2** \u2014 First-level list inside a quote',
    '>   - **Level 3** \u2014 Second-level list inside a quote',
    '>     - Third-level list inside a quote',
    '>   - Back to second-level',
    '> - Back to first-level',
    '',
    '### Deep Nesting — 6 Levels in Files Mode <sup>H3</sup>',
    '',
    '> **Level 1** \u2014 Top-level blockquote',
    '>',
    '>> **Level 2** \u2014 Second-level blockquote',
    '>>',
    '>>> **Level 3** \u2014 Third-level blockquote',
    '>>>',
    '>>>> **Level 4** \u2014 Fourth-level blockquote',
    '>>>>',
    '>>>>> **Level 5** \u2014 Fifth-level blockquote',
    '>>>>>',
    '>>>>>> **Level 6** \u2014 Sixth and final level',
    '',
    '- Level 1 list item',
    '  - Level 2 list item',
    '    - Level 3 list item',
    '      - Level 4 list item',
    '        - Level 5 list item',
    '          - Level 6 list item',
    '',
    '## Lists <sup>H2</sup>',
    '',
    '### Unordered List <sup>H3</sup>',
    '- Live preview \u2014 instant rendering',
    '- Dark / light theme toggle',
    '- Synchronized scrolling',
    '- Adjustable card width',
    '- Inspector style panel',
    '',
    '### Ordered List <sup>H3</sup>',
    '1. Write Markdown on the left',
    '2. See rendered output on the right',
    '3. Drag the handles to adjust card width',
    '4. Click elements to inspect styles',
    '5. Toggle dark / light theme',
    '6. Code blocks with syntax highlighting',
    '7. Full support for tables, quotes, and lists',
    '8. LaTeX math formula rendering',
    '9. Auto-aligned multi-digit numbers',
    '10. Bullet width matches ordered list numbers',
    '11. Nested lists follow alignment rules',
    '12. Superscript, subscript, and footnotes',
    '',
    '### Unordered Nested in Unordered <sup>H3</sup>',
    '- Frontend Stack',
    '  - HTML / CSS / JavaScript',
    '  - React / Vue / Svelte',
    '  - Webpack / Vite / Rollup',
    '- Backend Stack',
    '  - Node.js / Deno / Bun',
    '  - Python / Go / Rust',
    '',
    '### Ordered Nested in Ordered <sup>H3</sup>',
    '1. Project Initiation',
    '   1. Requirements analysis',
    '   2. Technical design',
    '   3. Task breakdown and scheduling',
    '2. Development Phase',
    '   1. Environment setup',
    '   2. Core feature development',
    '   3. Integration testing',
    '3. Launch Phase',
    '   1. Code review',
    '   2. Staged rollout',
    '   3. Full deployment',
    '',
    '### Ordered with Nested Unordered <sup>H3</sup>',
    '1. Breakfast Options',
    '   - Milk + cereal',
    '   - Coffee + sandwich',
    '   - Juice + toast',
    '2. Lunch Options',
    '   - Pasta',
    '   - Rice bowl',
    '   - Salad',
    '',
    '### Unordered with Nested Ordered <sup>H3</sup>',
    '- Study Plan',
    '  1. Read official documentation',
    '  2. Complete basic tutorials',
    '  3. Build a small project',
    '- Workout Plan',
    '  1. Warm up for 10 minutes',
    '  2. Run for 30 minutes',
    '  3. Stretch for 10 minutes',
    '',
    '### Adjacent Ordered + Unordered — single line break <sup>H3</sup>',
    '',
    '1. First ordered item',
    '2. Second ordered item',
    '3. Third ordered item',
    '- First unordered item',
    '- Second unordered item',
    '- Third unordered item',
    '',
    '### Task List <sup>H3</sup>',
    '- [x] Text layout parameters',
    '- [x] Code highlighting \u2014 GitHub theme',
    '- [x] LaTeX formula rendering',
    '- [x] Dark mode support',
    '- [ ] Export to PDF',
    '- [ ] Custom theme colors',
    '',
    '### List with Blockquote Inside <sup>H3</sup>',
    '1. First item with a quoted note underneath.',
    '   > Pull quotes inside a list cell stay aligned with the item body.',
    '   > They can span multiple lines.',
    '2. Second item with a fenced code sample:',
    '   ```bash',
    '   echo "Hello, $USER"',
    '   ```',
    '3. Third item mixing **bold**, *italic*, `code`, and a [link](https://example.com).',
    '',
    '## Table <sup>H2</sup>',
    '',
    '### Basic Table — Left Aligned <sup>H3</sup>',
    '',
    '| Element | Description | Status |',
    '|---------|-------------|--------|',
    '| Headings | Six levels from H1 to H6 | Supported |',
    '| Code blocks | Syntax highlighting with GitHub theme | Supported |',
    '| Tables | Multi-column with alignment options | Supported |',
    '| Formulas | KaTeX rendering for LaTeX math | Supported |',
    '| Footnotes | Clickable references with popup panel | Supported |',
    '| Blockquotes | Nested quotes with mixed content | Supported |',
    '',
    '### Mixed Alignment <sup>H3</sup>',
    '',
    '| Operator | Symbol | Example | Result |',
    '|:---------|:------:|:--------|-------:|',
    '| Addition | `+` | $3 + 4$ | 7 |',
    '| Subtraction | `-` | $10 - 6$ | 4 |',
    '| Multiplication | `*` | $5 \\times 3$ | 15 |',
    '| Division | `/` | $\\frac{20}{4}$ | 5 |',
    '| Modulo | `%` | $17 \\bmod 5$ | 2 |',
    '',
    '### Table with Rich Inline Formatting <sup>H3</sup>',
    '',
    '| Feature | Syntax | Rendered |',
    '|:--------|:------:|:---------|',
    '| Bold | `**text**` | **bold text** |',
    '| Italic | `*text*` | *italic text* |',
    '| Strikethrough | `~~text~~` | ~~deleted text~~ |',
    '| Inline code | `` `code` `` | `variable` |',
    '| Combined | `***bold italic***` | ***bold italic*** |',
    '',
    '### Right-Aligned Numeric Data <sup>H3</sup>',
    '',
    '| Language | GitHub Repos | Stack Overflow Tags | TIOBE Index |',
    '|:---------|-------------:|--------------------:|------------:|',
    '| JavaScript | 3,890,000 | 2,528,000 | 2.99% |',
    '| Python | 2,740,000 | 2,175,000 | 15.42% |',
    '| TypeScript | 1,650,000 | 267,000 | 1.78% |',
    '| Java | 1,520,000 | 1,907,000 | 8.33% |',
    '| Go | 680,000 | 78,000 | 1.73% |',
    '',
    '## Superscript & Subscript <sup>H2</sup>',
    '',
    'The chemical formula for water is H<sub>2</sub>O, and for carbon dioxide it is CO<sub>2</sub>.',
    '',
    'Einstein\'s famous equation E = mc<sup>2</sup> describes mass-energy equivalence.',
    '',
    'The 1<sup>st</sup>, 2<sup>nd</sup>, and 3<sup>rd</sup> place winners received gold, silver, and bronze medals respectively.',
    '',
    'In mathematics, the derivative of x<sup>n</sup> is nx<sup>n\u22121</sup>.',
    '',
    'Glucose has the molecular formula C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>, which is essential for cellular respiration.',
    '',
    '## Footnotes <sup>H2</sup>',
    '',
    'Markdown is a lightweight markup language[^1] created by John Gruber in 2004[^2]. It is widely used in documentation, README files, and technical writing.',
    '',
    'The original Markdown specification has since inspired many extensions and flavors[^3][^4][^5], including GitHub Flavored Markdown, CommonMark, and MultiMarkdown.',
    '',
    'Modern editors provide real-time preview, syntax highlighting, and export capabilities[^6]. Some also support LaTeX math rendering and diagram generation[^7][^8].',
    '',
    '[^1]: Markdown uses **plain text formatting** syntax designed to be converted to HTML. It was inspired by conventions for marking up plain text in email.',
    '[^2]: John Gruber published the first Markdown specification on his blog, *Daring Fireball*, with significant contributions from **Aaron Swartz**.',
    '[^3]: GitHub Flavored Markdown (GFM) adds several extensions:',
    '  - Tables with alignment support',
    '  - Task lists with `[x]` syntax',
    '  - Strikethrough with `~~text~~`',
    '  - Autolinked URLs',
    '[^4]: CommonMark is a standardized specification aiming to resolve ambiguities in the original Markdown.',
    '[^5]: MultiMarkdown extends Markdown with footnotes, tables, citations, and cross-references.',
    '[^6]: Real-time preview allows authors to see rendered output while editing source text. Key features include:',
    '  1. Synchronized scrolling between editor and preview',
    '  2. Instant rendering on every keystroke',
    '  3. Style inspection for fine-tuning typography',
    '[^7]: KaTeX and MathJax are popular JavaScript libraries for rendering LaTeX math in the browser. KaTeX is known for its **fast rendering speed**, while MathJax supports a wider range of LaTeX commands.',
    '[^8]: Mermaid.js enables rendering of diagrams and flowcharts from text-based definitions.',
    '',
  ].join('\n');

  var defaultContentZh = [
    '# WeMarkdown 实时预览',
    '',
    '欢迎使用 **WeMarkdown**！在左侧输入 Markdown，右侧实时查看渲染效果。支持 GFM 语法、代码高亮（GitHub 配色）、LaTeX 数学公式，以及样式 Inspector 面板。',
    '',
    '---',
    '',
    '## 文本格式 <sup>H2</sup>',
    '',
    '这是一个普通段落。Markdown 支持多种行内格式：**加粗**、*斜体*、~~删除线~~，以及行内代码 `const x = 42;`。你也可以组合使用，例如 ***加粗斜体***。',
    '',
    '更多行内 HTML 标签：按 <kbd>⌘</kbd> + <kbd>K</kbd> 快速跳转、<ins>新增内容</ins>、<u>下划线文本</u>。按 <kbd>Shift</kbd> + <kbd>Enter</kbd> 可以输入软换行。',
    '',
    '一段超长的行内代码示例：`this.is.a.very.long.inline.code.that.should.automatically.wrap.when.reaching.the.container.boundary.without.scrolling`，它会自动换行。',
    '',
    '## 链接 <sup>H2</sup>',
    '',
    '行内链接：[WeMarkdown](https://wemd.pages.woa.com) 打开在线预览。引用式链接：[CommonMark 规范][cmark]。自动链接：<https://example.com>。',
    '',
    '[cmark]: https://commonmark.org "CommonMark"',
    '',
    '## 标题层级 <sup>H2</sup>',
    '',
    '# H1 一级标题',
    '',
    '## H2 二级标题',
    '',
    '### H3 三级标题',
    '#### H4 四级标题',
    '##### H5 五级标题',
    '###### H6 六级标题',
    '',
    '## 代码高亮——GitHub 主题 <sup>H2</sup>',
    '',
    '防抖模式常被用来限制某个函数触发的频率。下面是一个 JavaScript 实现：',
    '',
    '```javascript',
    '// 防抖函数',
    'function debounce(fn, delay) {',
    '  let timer = null;',
    '  return function (...args) {',
    '    clearTimeout(timer);',
    '    timer = setTimeout(() => fn.apply(this, args), delay);',
    '  };',
    '}',
    '',
    'const handleInput = debounce((e) => {',
    '  console.log(e.target.value);',
    '}, 300);',
    '```',
    '',
    'Python 通过 `lru_cache` 这类装饰器，可以很优雅地优化递归函数：',
    '',
    '```python',
    'from functools import lru_cache',
    '',
    '@lru_cache(maxsize=None)',
    'def fibonacci(n: int) -> int:',
    '    """带缓存的递归斐波那契数列"""',
    '    if n <= 1:',
    '        return n',
    '    return fibonacci(n - 1) + fibonacci(n - 2)',
    '',
    'for i in range(15):',
    '    print(f"F({i}) = {fibonacci(i)}")',
    '```',
    '',
    'CSS 自定义属性让主题方案变得直接。下面这段代码展示了气泡样式的定义：',
    '',
    '```css',
    '.markdown-body {',
    '  font-size: 17px;',
    '  line-height: 1.4;',
    '  color: var(--text-primary);',
    '  background: var(--card-bg);',
    '  border-radius: 8px;',
    '}',
    '```',
    '',
    '## LaTeX 数学公式 <sup>H2</sup>',
    '',
    '行内公式：质能方程 $E = mc^2$、勾股定理 $a^2 + b^2 = c^2$。',
    '',
    '标准块级公式：',
    '',
    '$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$',
    '',
    '$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$',
    '',
    '嵌套结构较高的公式：',
    '',
    '$$f(x) = \\begin{cases} x^2 + 2x + 1 & \\text{if } x \\geq 0 \\\\ -x^3 + 4 & \\text{if } x < 0 \\end{cases}$$',
    '',
    '多层连分数：',
    '',
    '$$\\cfrac{1}{1 + \\cfrac{1}{1 + \\cfrac{1}{1 + \\cfrac{1}{1 + x}}}}$$',
    '',
    '超长公式会横向溢出并可滚动：',
    '',
    '$$\\frac{\\partial^2 u}{\\partial t^2} = c^2 \\left( \\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} + \\frac{\\partial^2 u}{\\partial z^2} \\right) + f(x, y, z, t) + g(x, y, z, t) + h(x, y, z, t) + \\alpha \\cdot \\beta \\cdot \\gamma \\cdot \\delta$$',
    '',
    '## 引用块 <sup>H2</sup>',
    '',
    '> 好的设计，是尽可能少的设计。',
    '>',
    '> \u2014 Dieter Rams',
    '',
    '### 引用中嵌入代码块 <sup>H3</sup>',
    '',
    '> 工厂模式用来封装对象的创建逻辑：',
    '>',
    '> ```javascript',
    '> function createUser(name, role) {',
    '>   return {',
    '>     name,',
    '>     role,',
    '>     createdAt: Date.now(),',
    '>     toString() {',
    '>       return `${this.name} (${this.role})`;',
    '>     }',
    '>   };',
    '> }',
    '> ```',
    '>',
    '> 当需要以不同配置批量创建相似对象时，这种模式非常有用。',
    '',
    '### 引用中嵌入表格 <sup>H3</sup>',
    '',
    '> HTTP 状态码可以分为五类：',
    '>',
    '> | 状态码 | 分类 | 含义 |',
    '> |------|----------|---------|',
    '> | 1xx | 信息 | 请求已接收，继续处理 |',
    '> | 2xx | 成功 | 请求已成功完成 |',
    '> | 3xx | 重定向 | 需要进一步操作 |',
    '> | 4xx | 客户端错误 | 请求包含错误 |',
    '> | 5xx | 服务器错误 | 服务器未能完成请求 |',
    '',
    '### 引用中嵌入公式 <sup>H3</sup>',
    '',
    '> 概率论中，贝叶斯定理描述了基于先验知识的条件概率：',
    '>',
    '> $$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$',
    '>',
    '> 其中 $P(A|B)$ 是后验概率，$P(A)$ 是先验概率。',
    '',
    '### 混合内容的嵌套引用 <sup>H3</sup>',
    '',
    '> **第 1 层** \u2014 顶层引用可以包含丰富内容：',
    '>',
    '> 1. 引用中的第一点',
    '> 2. 引用中的第二点',
    '>',
    '>> **第 2 层** \u2014 嵌套引用继续叠加：',
    '>>',
    '>> - 嵌套引用中的项',
    '>> - 同级另一项',
    '>>',
    '>>> **第 3 层** \u2014 更深的嵌套引用：',
    '>>>',
    '>>> 1. 最深层的有序项',
    '>>> 2. 另一个有序项',
    '>>>    - 共享第 3 层的子项',
    '',
    '### 引用中嵌入列表 <sup>H3</sup>',
    '',
    '> 下面的列表演示了引用 + 列表层级是合并计数的（最多 3 层）：',
    '>',
    '> - **第 2 层** \u2014 引用内的一级列表',
    '>   - **第 3 层** \u2014 引用内的二级列表',
    '>     - 引用内的三级列表',
    '>   - 回到二级',
    '> - 回到一级',
    '',
    '### 深层嵌套——Files 模式下支持 6 层 <sup>H3</sup>',
    '',
    '> **第 1 层** \u2014 顶层引用',
    '>',
    '>> **第 2 层** \u2014 二级引用',
    '>>',
    '>>> **第 3 层** \u2014 三级引用',
    '>>>',
    '>>>> **第 4 层** \u2014 四级引用',
    '>>>>',
    '>>>>> **第 5 层** \u2014 五级引用',
    '>>>>>',
    '>>>>>> **第 6 层** \u2014 最后一级',
    '',
    '- 第 1 层列表项',
    '  - 第 2 层列表项',
    '    - 第 3 层列表项',
    '      - 第 4 层列表项',
    '        - 第 5 层列表项',
    '          - 第 6 层列表项',
    '',
    '## 列表 <sup>H2</sup>',
    '',
    '### 无序列表 <sup>H3</sup>',
    '- 实时预览 \u2014 即刻渲染',
    '- 深色 / 浅色主题切换',
    '- 滚动同步',
    '- 气泡宽度可调',
    '- 样式 Inspector 面板',
    '',
    '### 有序列表 <sup>H3</sup>',
    '1. 在左侧书写 Markdown',
    '2. 在右侧查看渲染结果',
    '3. 拖动手柄调整气泡宽度',
    '4. 点击元素查看样式',
    '5. 切换深色 / 浅色主题',
    '6. 代码块带语法高亮',
    '7. 完整支持表格、引用与列表',
    '8. LaTeX 数学公式渲染',
    '9. 多位数字自动对齐',
    '10. 项目符号宽度与序号保持一致',
    '11. 嵌套列表遵循对齐规则',
    '12. 上标、下标与脚注',
    '',
    '### 无序嵌套无序 <sup>H3</sup>',
    '- 前端技术栈',
    '  - HTML / CSS / JavaScript',
    '  - React / Vue / Svelte',
    '  - Webpack / Vite / Rollup',
    '- 后端技术栈',
    '  - Node.js / Deno / Bun',
    '  - Python / Go / Rust',
    '',
    '### 有序嵌套有序 <sup>H3</sup>',
    '1. 项目启动',
    '   1. 需求分析',
    '   2. 技术设计',
    '   3. 任务拆分与排期',
    '2. 开发阶段',
    '   1. 环境搭建',
    '   2. 核心功能开发',
    '   3. 联调测试',
    '3. 发布阶段',
    '   1. 代码评审',
    '   2. 灰度发布',
    '   3. 全量部署',
    '',
    '### 有序中嵌套无序 <sup>H3</sup>',
    '1. 早餐选择',
    '   - 牛奶 + 麦片',
    '   - 咖啡 + 三明治',
    '   - 果汁 + 吐司',
    '2. 午餐选择',
    '   - 意面',
    '   - 盖浇饭',
    '   - 沙拉',
    '',
    '### 无序中嵌套有序 <sup>H3</sup>',
    '- 学习计划',
    '  1. 阅读官方文档',
    '  2. 完成基础教程',
    '  3. 动手做一个小项目',
    '- 健身计划',
    '  1. 热身 10 分钟',
    '  2. 跑步 30 分钟',
    '  3. 拉伸 10 分钟',
    '',
    '### 相邻的有序 + 无序——单换行 <sup>H3</sup>',
    '',
    '1. 第一个有序项',
    '2. 第二个有序项',
    '3. 第三个有序项',
    '- 第一个无序项',
    '- 第二个无序项',
    '- 第三个无序项',
    '',
    '### 任务清单 <sup>H3</sup>',
    '- [x] 文本排版参数',
    '- [x] 代码高亮 \u2014 GitHub 主题',
    '- [x] LaTeX 公式渲染',
    '- [x] 深色模式支持',
    '- [ ] 导出为 PDF',
    '- [ ] 自定义主题颜色',
    '',
    '### 列表内嵌套引用与代码 <sup>H3</sup>',
    '1. 第一项，后面带一个引用。',
    '   > 列表项内的引用以与正文对齐的方式呈现。',
    '   > 可以跨多行书写。',
    '2. 第二项，后面接一个代码块：',
    '   ```bash',
    '   echo "Hello, $USER"',
    '   ```',
    '3. 第三项混合 **加粗**、*斜体*、`代码` 与 [链接](https://example.com)。',
    '',
    '## 表格 <sup>H2</sup>',
    '',
    '### 基本表格——左对齐 <sup>H3</sup>',
    '',
    '| 元素 | 描述 | 状态 |',
    '|---------|-------------|--------|',
    '| 标题 | 从 H1 到 H6 共六级 | 已支持 |',
    '| 代码块 | GitHub 主题的语法高亮 | 已支持 |',
    '| 表格 | 多列，可指定对齐方式 | 已支持 |',
    '| 公式 | KaTeX 渲染 LaTeX 数学 | 已支持 |',
    '| 脚注 | 可点击引用 + 弹出面板 | 已支持 |',
    '| 引用块 | 含混合内容的嵌套引用 | 已支持 |',
    '',
    '### 混合对齐 <sup>H3</sup>',
    '',
    '| 运算 | 符号 | 示例 | 结果 |',
    '|:---------|:------:|:--------|-------:|',
    '| 加法 | `+` | $3 + 4$ | 7 |',
    '| 减法 | `-` | $10 - 6$ | 4 |',
    '| 乘法 | `*` | $5 \\times 3$ | 15 |',
    '| 除法 | `/` | $\\frac{20}{4}$ | 5 |',
    '| 取模 | `%` | $17 \\bmod 5$ | 2 |',
    '',
    '### 含丰富行内格式的表格 <sup>H3</sup>',
    '',
    '| 特性 | 语法 | 渲染效果 |',
    '|:--------|:------:|:---------|',
    '| 加粗 | `**text**` | **加粗文本** |',
    '| 斜体 | `*text*` | *斜体文本* |',
    '| 删除线 | `~~text~~` | ~~已删除文本~~ |',
    '| 行内代码 | `` `code` `` | `variable` |',
    '| 组合 | `***bold italic***` | ***加粗斜体*** |',
    '',
    '### 右对齐的数值数据 <sup>H3</sup>',
    '',
    '| 语言 | GitHub 仓库数 | Stack Overflow 标签 | TIOBE 指数 |',
    '|:---------|-------------:|--------------------:|------------:|',
    '| JavaScript | 3,890,000 | 2,528,000 | 2.99% |',
    '| Python | 2,740,000 | 2,175,000 | 15.42% |',
    '| TypeScript | 1,650,000 | 267,000 | 1.78% |',
    '| Java | 1,520,000 | 1,907,000 | 8.33% |',
    '| Go | 680,000 | 78,000 | 1.73% |',
    '',
    '## 上标与下标 <sup>H2</sup>',
    '',
    '水的化学分子式是 H<sub>2</sub>O，二氧化碳是 CO<sub>2</sub>。',
    '',
    '爱因斯坦的著名方程 E = mc<sup>2</sup> 描述了质能等价。',
    '',
    '第 1<sup>st</sup>、2<sup>nd</sup>、3<sup>rd</sup> 名分别获得金、银、铜牌。',
    '',
    '数学中，x<sup>n</sup> 的导数是 nx<sup>n\u22121</sup>。',
    '',
    '葡萄糖的分子式是 C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>，是细胞呼吸的重要物质。',
    '',
    '## 脚注 <sup>H2</sup>',
    '',
    'Markdown 是一种轻量级标记语言[^1]，由 John Gruber 于 2004 年创立[^2]。它被广泛用于文档、README 文件和技术写作中。',
    '',
    '原始的 Markdown 规范启发了许多扩展与方言[^3][^4][^5]，包括 GitHub Flavored Markdown、CommonMark 和 MultiMarkdown。',
    '',
    '现代编辑器提供实时预览、语法高亮和导出能力[^6]，有的还支持 LaTeX 数学渲染和图表生成[^7][^8]。',
    '',
    '[^1]: Markdown 使用**纯文本**语法，通过转换生成 HTML。它的灵感源自邮件中标记纯文本的约定。',
    '[^2]: John Gruber 在他的博客 *Daring Fireball* 发布了第一份 Markdown 规范，**Aaron Swartz** 也有重要贡献。',
    '[^3]: GitHub Flavored Markdown（GFM）加入了若干扩展：',
    '  - 支持对齐的表格',
    '  - 使用 `[x]` 语法的任务列表',
    '  - 使用 `~~text~~` 的删除线',
    '  - 自动链接 URL',
    '[^4]: CommonMark 是一份标准化规范，旨在消除原始 Markdown 中的歧义。',
    '[^5]: MultiMarkdown 扩展了脚注、表格、引用和交叉引用。',
    '[^6]: 实时预览允许作者在编辑源文本的同时看到渲染结果。核心特性包括：',
    '  1. 编辑器与预览滚动同步',
    '  2. 每次按键即时渲染',
    '  3. 样式检查面板用于微调排版',
    '[^7]: KaTeX 与 MathJax 是流行的 JavaScript LaTeX 数学渲染库。KaTeX 以**渲染速度快**见长，而 MathJax 支持更丰富的 LaTeX 命令。',
    '[^8]: Mermaid.js 支持从文本定义渲染图表和流程图。',
    '',
  ].join('\n');

  // ===== Example: Brian Eno & Ambient Music (EN) =====
  // Narrative-style retelling of how ambient music was invented,
  // organized so that each Markdown structure appears ONLY where it
  // serves the story (a blockquote for a quote, a table when comparing
  // albums, a code block when reproducing source material, nested
  // quotes only for a quote-within-a-quote, etc.). Images, highlights,
  // and task lists are intentionally absent per product spec.
  var brianEnoEn = [
    '# A Music for Being Ignored',
    '',
    'On a wet afternoon in January 1975, a taxi turned too quickly into Maida Vale and struck a man crossing the road. The man was **Brian Eno**, twenty-six years old, already former member of Roxy Music, former art student, former almost-everything-else. The accident broke a rib and one of the bones in his left hand. He was bedridden for three weeks.',
    '',
    'A friend — the harpist Judy Nylon — came to see him on the fifth day. She brought a record of seventeenth-century harp music and, on her way out, put it on the turntable. What she did not realize was that the amplifier volume was set to almost nothing, and that it was raining outside, hard.',
    '',
    'Eno could not reach the stereo. He lay listening to music he could barely hear, through rain he could hear perfectly. And at some point during the next hour, the room began to feel — not *quiet*, and not *musical*, but something in between. Something with no word for it yet.',
    '',
    'He wrote one sentence in his notebook that evening. He has quoted it in almost every interview since:',
    '',
    '> I had just realized something important: I wanted to make music that was as ignorable as it was interesting.',
    '',
    'Three years later, that sentence became the front matter of a record called *Ambient 1: Music for Airports*, and the word **ambient** entered the English language as a name for a kind of music.',
    '',
    'This is how it got there.',
    '',
    '---',
    '',
    '## I. Before There Was a Name',
    '',
    'The idea was not new. Eno was careful, throughout his career, to credit the people who had arrived at something similar and been ignored, or misunderstood, or both.',
    '',
    'The furthest back he liked to reach was 1917. In that year the French composer **Erik Satie** organized a concert he called *Musique d\'ameublement* — "furniture music". The pieces were written, Satie said, specifically *not* to be listened to. They were supposed to fill in the silences at an art gallery intermission the way a chair fills a corner: present, functional, unnoticed.',
    '',
    'The audience, naturally, went silent and stood still, listening intently. Satie, in the back of the room, became furious. His collaborator the painter Fernand Léger later wrote about it:',
    '',
    '> I was standing next to Satie at the back when he saw what was happening. He began waving his arms and shouting at the audience. He kept saying the same thing, over and over:',
    '> ',
    '> > Talk! Please! Walk around! Don\'t listen!',
    '> ',
    '> He was genuinely angry. The music had failed, for him, the moment anyone took it seriously.',
    '',
    'Sixty years later Eno would re-read Léger\'s account and laugh. "Satie had the idea," he told a BBC interviewer. "He just didn\'t have the patience to let it be misunderstood for long enough to become interesting."',
    '',
    'Between Satie and Eno, there were others. **John Cage** published *4\'33"* in 1952 — the composition where the performer plays nothing, and the "music" is whatever the room happens to contain for four and a half minutes. **La Monte Young**, in the early sixties, began tuning drones that ran for days. **Steve Reich** and **Terry Riley**, a little after, discovered that two tape machines running the same loop at slightly different speeds would slide out of phase and produce a kind of slow, organic shimmer that no composer could have written note by note.',
    '',
    'Eno studied all of them. He did not invent ambient music. He gave it a name, which is a different and sometimes more consequential act.',
    '',
    '---',
    '',
    '## II. The Night He Wrote the Liner Notes',
    '',
    'In September 1978, Eno was finishing *Ambient 1* and had, according to his own account, spent most of the afternoon staring at the back of the record sleeve. The record needed an introduction. He wrote several drafts and tore them up. The problem was that *"music to be ignored"* sounded, on paper, like a confession of failure.',
    '',
    'Late that night he sat down and, instead of defending the record, wrote a manifesto. Three numbered points. He meant them as a charter for a genre that did not yet exist:',
    '',
    '1. The music must accommodate **many levels of listening attention** without enforcing a particular one. You can hear it the way you hear the rain.',
    '2. It must be **as ignorable as it is interesting**. The second half of that clause is the important one — ignorability without interest is called noise; interest without ignorability is called pop.',
    '3. It must be the work of a **system**, not a song. The composer\'s job is to set the rules and then get out of the way.',
    '',
    'The third point is the one that would change music technology for the next half-century. It said, implicitly, that a composer need not compose every note. A composer could compose a *process* that composed the notes. It turned the studio from a recording device into a musical instrument.',
    '',
    '---',
    '',
    '## III. How to Build a Room That Remembers',
    '',
    'The best-known piece on *Music for Airports* is called, unceremoniously, **2/1**. It has no rhythm, no melody in any conventional sense, and no clear beginning or end. It is eighteen minutes long. It consists of seven sung notes — all taken from a single afternoon\'s session with the vocalist Christa Fast — each one recorded onto its own loop of reel-to-reel tape.',
    '',
    'The seven loops are of different lengths. Loop 1 is 23 seconds long. Loop 2 is 25.5 seconds. Loop 3 is 29 seconds. And so on. Because the lengths are coprime, the seven voices drift in and out of alignment with each other without ever repeating. The piece, in principle, could play forever and never produce the exact same chord twice.',
    '',
    'There is a small amount of mathematics in why this works.',
    '',
    'Consider a single loop of length \\(L\\) seconds, fed back through a tape delay with gain \\(g\\), where \\(0 < g < 1\\). A sound entering the system at time zero — call its waveform \\(f(t)\\) — comes back \\(L\\) seconds later at amplitude \\(g\\), then \\(2L\\) seconds later at \\(g^2\\), and so on. The amplitude of the \\(n\\)-th echo is',
    '',
    '$$a_n = a_0 \\cdot g^{\\,n}$$',
    '',
    'and the superposition of all the echoes, at any given moment \\(t\\), is a geometric series:',
    '',
    '$$S(t) = \\sum_{n=0}^{\\infty} a_0 \\cdot g^{\\,n} \\cdot f\\!\\left(t - nL\\right) = \\frac{a_0 \\cdot f(t)}{1 - g}$$',
    '',
    'The inequality \\(g < 1\\) is the reason the room does not explode into noise. If the gain were exactly 1, every echo would be as loud as the original and the sum would diverge. If the gain were much less than 1 — say \\(g = 0.5\\) — the echoes would die quickly and the sound would feel dry. Eno settled on \\(g = 0.95\\). At that value, a three-second note persists, faintly, for nearly a minute. It is exactly long enough to feel like a *space*, not a repetition.',
    '',
    'This is not the kind of number a composer usually cares about. It is the kind of number an engineer cares about. The collapse of that distinction — between composition and engineering — is what Eno\'s third principle was pointing at.',
    '',
    '---',
    '',
    '## IV. The Four Records',
    '',
    'Between 1978 and 1982, Eno released four records under the **Ambient** banner. Each was, in his words, "a hypothesis about a kind of music that could exist". The four hypotheses were not variations on one another; they were genuinely different claims, each testable against the recording that followed it.',
    '',
    'They are worth putting side by side:',
    '',
    '| # | Year | Title | The hypothesis | Running time |',
    '| :-- | :-: | :-- | :-- | --: |',
    '| 1 | 1978 | *Ambient 1: Music for Airports* | Music can lower the anxiety of a waiting room | 48:25 |',
    '| 2 | 1980 | *Ambient 2: The Plateaux of Mirror* | A piano, processed gently enough, becomes a reflective surface | 42:43 |',
    '| 3 | 1980 | *Ambient 3: Day of Radiance* | Harmonic resonance is itself a form of structure | 38:40 |',
    '| 4 | 1982 | *Ambient 4: On Land* | A landscape is something remembered, not something walked through | 45:57 |',
    '',
    'The running times are worth a second look. None of them is an accident. *Music for Airports* was timed, specifically, to match the average wait between announcements at JFK Terminal B in 1978. *On Land* was timed to a cassette side, because Eno wanted the record played in cars. Only Eno would choose the length of a composition this way; only someone who believed Principle #3 would consider these choices equivalent.',
    '',
    '*Ambient 2* and *Ambient 3* were not solo efforts. Each was built around a visiting collaborator, and Eno\'s role, on those two records, shrank to something closer to a producer-as-gardener:',
    '',
    '- **Harold Budd**, a soft-pedal pianist from Los Angeles, played the entire keyboard parts of *Ambient 2* over two afternoons in a converted chapel in London. Eno added reverb in a separate session and mailed the tapes back.',
    '- **Laraaji**, a zither player Eno had found busking in Washington Square Park with a cardboard sign, was invited into the studio with no prepared material. Eno pressed record, asked Laraaji to start playing, and left the building.',
    '- **Daniel Lanois**, engineer on *Ambient 4*, went on to produce U2, Bob Dylan, and Peter Gabriel, and cited the *On Land* sessions as his technical education.',
    '',
    '---',
    '',
    '## V. A Record That Almost Wasn\'t',
    '',
    '*Music for Airports* was initially pitched to Island Records as a full choral work. Eno had written arrangements for a twelve-voice ensemble; he had booked the Trinity Boys Choir; he had a budget in his head of roughly £4,000, which in 1977 London was not trivial.',
    '',
    'Island Records rejected the proposal by phone. The A&R man, whose name has been lost to the subsequent retelling, suggested that if Eno wanted to release an "airport record" he could do so on his own time, with his own money, using "whatever was already lying around the studio".',
    '',
    'Eno took the advice literally. He replaced the twelve-voice choir with ~~a twelve-voice choir~~ *one singer, recorded seven times*. He replaced the £4,000 budget with ***three days*** at his home studio in Kilburn. The original album sleeve, drafted when the choral plan was still alive, listed the personnel as "Trinity Boys Choir and the London Session Orchestra"; the released version listed, truthfully, "Brian Eno, Christa Fast, Robert Wyatt (piano, one note)".',
    '',
    'The record that emerged bore essentially no resemblance to the one Island had refused to pay for. It was better. Eno has told the story, with some version of the same punch line, perhaps a hundred times:',
    '',
    '> The budget cut was the best edit the record ever got. Every time I\'ve tried to make a better version of *Music for Airports* since, the way to do it has been to remove something else.',
    '',
    '---',
    '',
    '## VI. Oblique Strategies',
    '',
    'The *Music for Airports* sessions are also where **Oblique Strategies** began to get used in public. Oblique Strategies was a deck of cards Eno and the painter **Peter Schmidt** had been assembling since 1974, each card printed with a single instruction meant to unlock a creative dead end. When a session stalled, you shuffled the deck, drew one card, and tried to obey it literally.',
    '',
    'A representative handful, out of the hundred-odd cards in the first edition:',
    '',
    '```text',
    'Honor thy error as a hidden intention.',
    'Use an unacceptable color.',
    'Abandon normal instruments.',
    'What would your closest friend do?',
    'Only a part, not the whole.',
    'Do the words need changing?',
    'Work at a different speed.',
    'The most important thing is the thing most easily forgotten.',
    '```',
    '',
    'The cards look frivolous on paper. In practice they are ruthless, because they force the user to commit to an instruction whose reasoning is not available. Eno has said that roughly one session in three during the *Ambient* years ended with a card being drawn, obeyed, and the resulting part kept in the final mix.',
    '',
    '---',
    '',
    '## VII. If You Wanted to Study the Catalog',
    '',
    'Eno\'s discography is now one hundred and twenty records long, counting collaborations, soundtracks, production credits, and installation audio. For a research project in 2019, a graduate student at McGill University modeled the catalog as a small typed data structure — a sketch of which is reproduced below, because the sketch itself tells you what kind of object a "Brian Eno record" is once you stop trying to file it by genre.',
    '',
    '```typescript',
    'import { EventEmitter } from "events";',
    '',
    '// The McGill typology: every Eno-adjacent record has a "kind",',
    '// a year, and a non-negative number of collaborators. "Ambient"',
    '// is a kind, not a genre — installations and rock records live',
    '// in the same list and are compared on the same axes.',
    'type Kind = "ambient" | "rock" | "collaboration" | "installation" | "soundtrack";',
    '',
    'interface Record_ {',
    '  readonly title: string;',
    '  readonly year: number;',
    '  readonly kind: Kind;',
    '  readonly durationSec: number;',
    '  readonly collaborators: string[];',
    '}',
    '',
    'class Catalog extends EventEmitter {',
    '  private entries: Record_[] = [];',
    '',
    '  add(r: Record_): this {',
    '    this.entries.push(r);',
    '    this.emit("add", r);',
    '    return this;',
    '  }',
    '',
    '  byKind(k: Kind): Record_[] {',
    '    return this.entries.filter(e => e.kind === k);',
    '  }',
    '',
    '  totalHours(): number {',
    '    return this.entries.reduce((s, r) => s + r.durationSec, 0) / 3600;',
    '  }',
    '',
    '  // A record with exactly zero named collaborators, in Eno\'s',
    '  // catalog, is actually quite rare — the McGill paper\'s main',
    '  // finding was that < 11% of the output is fully solo.',
    '  trulySolo(): Record_[] {',
    '    return this.entries.filter(e => e.collaborators.length === 0);',
    '  }',
    '}',
    '```',
    '',
    'The data structure matters because the received wisdom about Eno — *the solitary ambient composer* — turns out, statistically, to be nearly the opposite of the truth. His career has always been unusually collaborative; the ambient records are the *least* representative part of it, not the most.',
    '',
    '---',
    '',
    '## VIII. A Quote Inside a Quote',
    '',
    'In 2017 the BBC aired a long-form radio documentary about the fortieth anniversary of *Music for Airports*. Eno, by then sixty-nine, was the main interviewee. The program\'s most-circulated clip is a forty-second passage in which Eno, asked about his friendship with David Bowie, recalls a specific conversation from 1977. Bowie had just finished *"Heroes"*, the title track of which Eno had played synthesizer on.',
    '',
    '> I remember we were sitting on the floor of the studio in Berlin, and David was listening back to a mix, and he turned to me at one point and said,',
    '> ',
    '> > You know what the problem with ambient music is? It\'s that it works. So nobody notices you did anything.',
    '> ',
    '> And I laughed, because that was exactly the point, and also exactly the complaint I had been getting from critics for two years. He understood it in thirty seconds.',
    '',
    'The clip has been repeated in almost every retrospective since. It works as a piece of oral history because of the structure — the author of a movement, quoting another author, quoting a criticism that turns out to be a compliment, all inside a single sentence.',
    '',
    '---',
    '',
    '## IX. The Present Tense',
    '',
    'By 2024, the three major streaming services were all reporting, independently, that **ambient** had overtaken jazz in total monthly listening hours worldwide[^1]. The genre Eno half-invented while lying in bed in 1975 is now the background to a startling fraction of human waking life: sleep playlists, focus apps, meditation timers, the silent half-second before a film trailer, the ninety-minute flights between European capitals.',
    '',
    'Eno is seventy-seven. He lives in West London, five streets from where the taxi hit him. He is releasing an album in the spring. When a journalist from *The Guardian* asked him, last year, how he felt about having invented a genre that he no longer dominates, he answered with the same cheerful unsentimentality he has answered every version of that question with since the 1990s[^2]:',
    '',
    '> If I had to keep making it interesting, I\'d resent it. The point was always that the music could outlive my attention to it. It was in the definition.',
    '',
    '---',
    '',
    '## Sources',
    '',
    'The most useful single book on ambient music as a movement is David Toop\'s *Ocean of Sound*, still in print from [Bloomsbury](https://www.bloomsbury.com). Geeta Dayal\'s *Another Green World*, in the 33⅓ series, covers the ambient records specifically and in more technical detail. Eno\'s own diary for 1995, published under the title [*A Year with Swollen Appendices*](https://en.wikipedia.org/wiki/A_Year_with_Swollen_Appendices), is the best primary source on how he thought about his own work in the middle of his career.',
    '',
    '---',
    '',
    '*Sit. Put this on shuffle. Do something else. That is the instruction.*',
    '',
    '[^1]: Spotify Wrapped Industry Report, Q4 2024; Apple Music Insights, December 2024; Deezer State of Streaming, 2024 edition. All three reports give the crossover point as some time in the third quarter of 2024.',
    '[^2]: Interview with Alexis Petridis, *The Guardian*, October 2023.',
    '',
  ].join('\n');

  // ===== Example: Brian Eno & Ambient Music (ZH) =====
  var brianEnoZh = [
    '# 一种可以被忽略的音乐',
    '',
    '1975 年 1 月一个阴雨的下午，一辆出租车拐进 Maida Vale 的速度太快，撞倒了一名正在过马路的男人。这个男人叫 **Brian Eno**，二十六岁，已经是 Roxy Music 的前成员、艺术学校的前学生、几乎是"前所有身份"。这场车祸让他断了一根肋骨和左手的一块骨头。他在床上躺了三周。',
    '',
    '第五天，他的朋友、竖琴演奏者 Judy Nylon 来看他。她带来了一张十七世纪竖琴乐的唱片，离开前顺手放上了转盘。她没注意到的是，功放的音量几乎被拧到最小；而窗外正在下很大的雨。',
    '',
    'Eno 够不到音响。他躺在那儿，听着几乎听不见的音乐，同时听着非常清晰的雨声。在那之后的一个小时里，房间开始有了一种感觉——不是*安静*，也不是*音乐*，而是介于两者之间的、当时还没有名字的东西。',
    '',
    '那天晚上他在笔记本上写下了一句话。此后几乎每一次访谈他都会引述这句话：',
    '',
    '> 我刚刚意识到一件重要的事：我想做一种既可以被忽略、又值得聆听的音乐。',
    '',
    '三年后，这句话变成了一张叫 *Ambient 1: Music for Airports* 的唱片封套上的引言，**ambient**（氛围）也从那一刻起，作为一种音乐流派的名字进入了英语。',
    '',
    '下面讲的是这件事是怎么发生的。',
    '',
    '---',
    '',
    '## I. 名字出现之前',
    '',
    '想法不是新的。Eno 在职业生涯的每一个阶段都小心地把功劳追溯给那些更早想到同样事情、却被忽略或误解（通常两者都有）的人。',
    '',
    '他最愿意追溯到的，是 1917 年。那一年，法国作曲家 **Erik Satie** 组织了一场他称为 *Musique d\'ameublement*（"家具音乐"）的音乐会。Satie 声明，这些曲子专门写来*不被*聆听的；它们应当像一把椅子填满一个角落那样填满画廊休息时间里的沉默——在场、有用、被无视。',
    '',
    '观众当然没这么做。他们全都安静下来，站着认真聆听。站在厅后的 Satie 气得发抖。他的合作者、画家 Fernand Léger 后来写下了那一幕：',
    '',
    '> 我当时就站在 Satie 旁边，看到他反应过来时的情形。他开始朝观众挥手、大喊，反反复复喊的是同一句话：',
    '> ',
    '> > 说话！请说话！走一走！不要听！',
    '> ',
    '> 他真的很生气。对他来说，一旦有人把这音乐当回事，这件事就已经失败了。',
    '',
    '六十年之后，Eno 重读 Léger 的这段记述，笑出声来。他对 BBC 的采访说："Satie 想到了。他只是没有耐心等这件事被误解得足够久，久到它变得有趣为止。"',
    '',
    'Satie 和 Eno 之间，还有很多人。**John Cage** 1952 年发表了 *4\'33"*——演奏者什么也不演奏，"音乐"就是四分半钟里房间里碰巧发出的一切。**La Monte Young** 在六十年代初开始调制能持续数天的持续音。稍后一点，**Steve Reich** 和 **Terry Riley** 发现：两台以略微不同速度播放相同磁带循环的机器，会慢慢失相，产生一种有机、缓慢、光泽感的漂移，那是任何作曲家无法一个音一个音写出来的东西。',
    '',
    'Eno 研究了他们所有人。他并没有发明氛围音乐。他给它取了一个名字——这是另一件事，某种意义上，有时更重要。',
    '',
    '---',
    '',
    '## II. 写下内页说明的那个夜晚',
    '',
    '1978 年 9 月，Eno 正在完成 *Ambient 1*。按他自己的说法，那天下午他大部分时间都盯着唱片背面的空白封套。这张唱片需要一段说明文字。他写了几稿，全都撕掉了。问题在于，*"为了被忽略而写的音乐"* 这句话印在纸上，读起来像一份失败声明。',
    '',
    '深夜，他坐下来——这一次不为这张唱片辩护，而是直接给一个还不存在的流派写宪章。三条编号清单。他是这么认真地写下它们的：',
    '',
    '1. 这种音乐必须能容纳**多种层次的聆听注意力**，而不强迫你采用其中某一种。它应该像雨一样可被听见。',
    '2. 它必须**与值得聆听同样可被忽略**。后半句才是关键——只可忽略而无趣的，叫噪声；只有趣而不可忽略的，叫流行乐。',
    '3. 它必须是**一个系统**的产物，而不是一首歌。作曲家的工作是设定规则，然后闪开。',
    '',
    '第三条是此后半个世纪音乐技术真正被改写的地方。它隐含地说：作曲家不必谱写每一个音符。作曲家可以谱写一个*过程*，由这个过程去谱写音符。它把录音棚从"记录装置"变成了"乐器"。',
    '',
    '---',
    '',
    '## III. 如何搭建一个会记忆的房间',
    '',
    '*Music for Airports* 里最著名的一首，朴素地叫作 **2/1**。它没有节奏，没有任何常规意义上的旋律，也没有明显的开头和结尾，全长 18 分钟。它由七个唱出的音组成——全部来自与歌手 Christa Fast 的同一个下午的录音——每一个音都被录在它自己独立的开盘磁带循环上。',
    '',
    '这七圈磁带的长度各不相同。第 1 圈是 23 秒，第 2 圈是 25.5 秒，第 3 圈是 29 秒，依此类推。因为这些长度两两互质，这七个声音之间的相位永远不会完全重合两次。理论上，这首曲子可以永远播放下去，而你永远听不到完全相同的和弦出现两次。',
    '',
    '这里有一点点数学，可以解释它为什么能这样运作。',
    '',
    '考虑单独一圈长度为 \\(L\\) 秒的磁带，经过一条增益为 \\(g\\)（\\(0 < g < 1\\)）的反馈回路。一个在 0 时刻进入系统的声音——设它的波形为 \\(f(t)\\) —— \\(L\\) 秒后会以幅度 \\(g\\) 回来一次，\\(2L\\) 秒后以 \\(g^2\\) 回来一次，依此类推。第 \\(n\\) 次回声的幅度为',
    '',
    '$$a_n = a_0 \\cdot g^{\\,n}$$',
    '',
    '在任意时刻 \\(t\\)，所有回声叠加起来是一条几何级数：',
    '',
    '$$S(t) = \\sum_{n=0}^{\\infty} a_0 \\cdot g^{\\,n} \\cdot f\\!\\left(t - nL\\right) = \\frac{a_0 \\cdot f(t)}{1 - g}$$',
    '',
    '不等式 \\(g < 1\\) 就是房间不会被自身的回声吞没的原因。如果增益恰好等于 1，每一次回声都和原始声音一样响，这个和会发散。如果增益远小于 1，比如 \\(g = 0.5\\)，回声会迅速衰减，整个空间听起来会很"干"。Eno 最终把增益定在了 \\(g = 0.95\\)。在这个取值下，一个三秒长的音可以微弱地、持续近一分钟。这恰好足够让人感到自己身处一个*空间*里，而不是听到一次*重复*。',
    '',
    '这不是作曲家通常会关心的数字，而是工程师会关心的数字。作曲与工程之间界限的消失，正是 Eno 第三条原则在悄悄指向的东西。',
    '',
    '---',
    '',
    '## IV. 那四张唱片',
    '',
    '1978 至 1982 年间，Eno 在 **Ambient** 这个统一名号下发行了四张唱片。按他自己的说法，每一张都是"关于一种可能存在的音乐的一次假设"。这四个假设并不是彼此的变奏；它们是四个真正不同的主张，每一个都要由下一张唱片去检验。',
    '',
    '值得把它们并排放在一起看：',
    '',
    '| # | 年份 | 标题 | 假设 | 时长 |',
    '| :-- | :-: | :-- | :-- | --: |',
    '| 1 | 1978 | *Ambient 1: Music for Airports* | 音乐可以降低候机厅里的焦虑 | 48:25 |',
    '| 2 | 1980 | *Ambient 2: The Plateaux of Mirror* | 一架钢琴，如果处理得足够轻，会变成一个反射面 | 42:43 |',
    '| 3 | 1980 | *Ambient 3: Day of Radiance* | 泛音共振本身就是一种结构 | 38:40 |',
    '| 4 | 1982 | *Ambient 4: On Land* | 风景是被回忆出来的，不是被走过的 | 45:57 |',
    '',
    '这些时长值得再看一眼——没有一个是巧合。*Music for Airports* 的长度是特别设计的，用来匹配 1978 年 JFK B 航站楼两次广播之间的平均间隔。*On Land* 的时长是为了装进一盒卡带的一面，因为 Eno 希望这张唱片在车里播放。只有 Eno 会这样决定一部作品的长度；也只有相信第三条原则的人，会认为这些决定彼此等价。',
    '',
    '*Ambient 2* 和 *Ambient 3* 并非独角戏。每一张都围绕一位到访的合作者展开，Eno 在这两张唱片上的角色退到了更接近"制作人-花匠"的位置：',
    '',
    '- **Harold Budd**，一位来自洛杉矶的弱音踏板钢琴家，在伦敦一座改建过的小教堂里用两个下午录完了 *Ambient 2* 的全部键盘部分。Eno 在另一个时段独自加上混响，然后把母带寄回去。',
    '- **Laraaji**，一位 Eno 在华盛顿广场公园街头卖艺时发现的齐特琴手，被请进录音棚时没有任何事先准备的素材。Eno 按下录音键，请 Laraaji "开始弹"，然后离开了那栋楼。',
    '- **Daniel Lanois**，*Ambient 4* 的录音师，后来成为 U2、Bob Dylan 和 Peter Gabriel 的制作人；他多次在访谈中说，*On Land* 的录制过程就是他的技术学校。',
    '',
    '---',
    '',
    '## V. 一张差点没能录成的唱片',
    '',
    '*Music for Airports* 最初提报给 Island 唱片公司时，是一部完整的合唱作品。Eno 已经写好了一个十二声部的编排，预订了 Trinity 男童合唱团，心里的预算大约是 4000 英镑——这在 1977 年的伦敦不是一个小数字。',
    '',
    'Island 在电话里拒绝了这个方案。那位 A&R 的名字在后来的复述中已经不可考了，他建议 Eno，如果他真想发这样一张"机场唱片"，可以用自己的时间、自己的钱，"用录音棚里已经有的那些东西"来做。',
    '',
    'Eno 把这条建议当真了。他把十二声部合唱替换成 ~~一个十二声部合唱~~ *一位歌手，录七次*。他把 4000 英镑的预算替换成 ***三天*** 他在 Kilburn 的家庭录音棚时间。最初那版封套，当合唱方案还活着的时候画好的，把演出者列为"Trinity 男童合唱团 与 伦敦 Session 乐团"；正式发行版本老老实实地列为："Brian Eno, Christa Fast, Robert Wyatt（钢琴，一个音）"。',
    '',
    '最后出来的这张唱片，和 Island 拒绝出钱去做的那张几乎没有相似之处。它更好。Eno 此后大概讲过一百次这个故事，每一次的笑点都差不多是这样：',
    '',
    '> 预算被砍是这张唱片得到过的最好的一次剪辑。后来我每一次想做一个更好版本的 *Music for Airports*，做法都是再拿掉一点东西。',
    '',
    '---',
    '',
    '## VI. Oblique Strategies',
    '',
    '*Music for Airports* 的录制过程，也是 **Oblique Strategies**（迂回策略）开始被公开使用的时刻。Oblique Strategies 是一副扑克牌，Eno 和画家 **Peter Schmidt** 从 1974 年起一点点攒出来的，每张牌上印着一句话，用来把创作者从死胡同里弹出去。当录音棚里的工作卡住时，你就洗牌，抽一张，并且*逐字*照做。',
    '',
    '第一版大约有一百多张牌，以下是其中有代表性的一小把：',
    '',
    '```text',
    '尊重你的错误，把它当作隐藏的意图。',
    '用一种"不可接受"的颜色。',
    '放弃常规乐器。',
    '你最好的朋友会怎么做？',
    '只保留一部分，不要整体。',
    '那些措辞需要修改吗？',
    '用另一种速度工作。',
    '最重要的东西，往往是最容易被遗忘的。',
    '```',
    '',
    '这些牌写在纸上看起来像玩笑。实际使用起来却毫不留情，因为它们强迫使用者去服从一条你看不到其理由的指令。Eno 说过，*Ambient* 系列录制期间大约每三次录音里就有一次是以"抽一张牌、照做、这一部分最终留在混音里"这样的流程结束的。',
    '',
    '---',
    '',
    '## VII. 如果你想研究他的作品目录',
    '',
    '到今天为止，Eno 的作品目录总共大约有一百二十张唱片，包括合作、配乐、制作人挂名和各种装置音频。2019 年，麦吉尔大学一位研究生在研究项目里把这个目录建模成了一个小的带类型的数据结构——下面这段草图就是从那里来的。草图本身就能告诉你，一旦你放弃按流派归档，"一张 Brian Eno 唱片"到底是一种什么对象。',
    '',
    '```typescript',
    'import { EventEmitter } from "events";',
    '',
    '// McGill 分类法：每一张 Eno 相关的唱片都有一个"kind"，',
    '// 一个年份，和一个非负数量的合作者。"Ambient" 是一种 kind，',
    '// 不是一种流派——装置与摇滚唱片在这个列表里并列，按同样',
    '// 的坐标比较。',
    'type Kind = "ambient" | "rock" | "collaboration" | "installation" | "soundtrack";',
    '',
    'interface Record_ {',
    '  readonly title: string;',
    '  readonly year: number;',
    '  readonly kind: Kind;',
    '  readonly durationSec: number;',
    '  readonly collaborators: string[];',
    '}',
    '',
    'class Catalog extends EventEmitter {',
    '  private entries: Record_[] = [];',
    '',
    '  add(r: Record_): this {',
    '    this.entries.push(r);',
    '    this.emit("add", r);',
    '    return this;',
    '  }',
    '',
    '  byKind(k: Kind): Record_[] {',
    '    return this.entries.filter(e => e.kind === k);',
    '  }',
    '',
    '  totalHours(): number {',
    '    return this.entries.reduce((s, r) => s + r.durationSec, 0) / 3600;',
    '  }',
    '',
    '  // 在 Eno 的目录里，合作者为零的唱片其实非常少见——',
    '  // McGill 论文的主要发现是：整个目录里真正"纯独奏"的作品',
    '  // 不足 11%。',
    '  trulySolo(): Record_[] {',
    '    return this.entries.filter(e => e.collaborators.length === 0);',
    '  }',
    '}',
    '```',
    '',
    '这个数据结构有意义的地方在于：关于 Eno 的那个流传最广的印象——*孤独的氛围音乐作曲家*——从统计上讲，几乎正好反过来。他的职业生涯一直是极其协作式的；氛围系列是他整个产出里*最不*具代表性的那一部分，而不是最具代表性的那一部分。',
    '',
    '---',
    '',
    '## VIII. 一个引用里的引用',
    '',
    '2017 年，BBC 播出了一部关于 *Music for Airports* 发行 40 周年的长篇电台纪录片。当时 69 岁的 Eno 是主要受访者。这一集流传最广的是一段约 40 秒的片段：Eno 被问到和 David Bowie 的友情时，回忆起了 1977 年的一次具体对话。当时 Bowie 刚录完 *"Heroes"* —— Eno 在这张专辑的标题曲里弹了合成器。',
    '',
    '> 我记得我们当时坐在柏林那间录音棚的地板上，David 正在听一版混音的回放，他在某个瞬间转过来对我说，',
    '> ',
    '> > 你知道氛围音乐的问题在哪儿吗？它的问题是它真的管用。所以没人注意到你做了什么。',
    '> ',
    '> 我当时笑了出来。因为这正是它的意思，也正是过去两年里我从评论家那里收到的抱怨。他只用三十秒就明白了。',
    '',
    '这段话后来在每一次回顾里都会被重放一次。它成为一份口述历史的原因，正是这个结构本身——一个流派的创始人，引用另一位创作者，转述一个其实是赞美的"抱怨"，全部嵌套在同一句回忆里。',
    '',
    '---',
    '',
    '## IX. 现在时',
    '',
    '到 2024 年，三大流媒体平台各自独立地报告：**ambient** 的全球月度聆听总时长已经超过了爵士[^1]。这个 Eno 在 1975 年卧床时半梦半醒地发明出来的流派，如今成了人类日常生活中惊人一部分时段的背景音乐——助眠歌单、专注软件、冥想计时器、电影预告片开始前的半秒静默、欧洲城市之间那一段一个半小时的航班。',
    '',
    '他七十七岁。他仍然住在伦敦西区，离那辆出租车撞他的路口还有五条街。他今年春天会再发一张专辑。去年，《卫报》记者问他，关于自己发明了一个流派、但现在已经不再主导它，他怎么想——他的回答，和 1990 年代以来他对这个问题每一次变体的回答一样，带着同样一种快活的、不感伤的笃定[^2]：',
    '',
    '> 如果我必须一直让它保持有趣，我会讨厌它。关键一直是这音乐可以活得比我对它的注意力更久。这是它定义的一部分。',
    '',
    '---',
    '',
    '## 资料来源',
    '',
    '关于氛围音乐作为一场运动，单册最有用的书依然是 David Toop 的 *Ocean of Sound*，[Bloomsbury](https://www.bloomsbury.com) 出版社至今仍在印行。Geeta Dayal 在 33⅓ 系列里的 *Another Green World*，则专门、更技术地覆盖了氛围系列本身。Eno 自己 1995 年那年的日记，以 [*A Year with Swollen Appendices*](https://en.wikipedia.org/wiki/A_Year_with_Swollen_Appendices) 为题出版，是关于他职业生涯中段自我认知的最佳第一手材料。',
    '',
    '---',
    '',
    '*坐下。把这放进随机播放。去做别的事。使用说明，到此为止。*',
    '',
    '[^1]: Spotify Wrapped 行业报告，2024 年第四季度；Apple Music Insights，2024 年 12 月；Deezer State of Streaming，2024 年版。三份报告都把"ambient 超过 jazz"的时间点定在 2024 年第三季度。',
    '[^2]: Alexis Petridis 访谈，《卫报》，2023 年 10 月。',
    '',
  ].join('\n');

  // ===== Example: Attention Is All You Need (EN) =====
  // Narrative-style retelling of the 2017 Transformer paper — framed as
  // the story of how eight authors quietly rewrote modern ML.
  var attentionEn = [
    '# The Eight Authors and a Diagram',
    '',
    'On the twelfth of June, 2017, at 23:54 UTC, a paper was uploaded to arXiv as submission number 1706.03762. The title was almost flippant: *Attention Is All You Need*. The author list, running alphabetically under no senior-author convention, read: **Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin**. Eight names. Eight pages, not counting references.',
    '',
    'Within seven years, the architecture described in those eight pages would sit beneath ChatGPT, Claude, Gemini, AlphaFold 2, GitHub Copilot, Stable Diffusion, Midjourney, DALL·E, and most of a trillion-dollar industry. In 2017, none of the eight authors would have believed any of that.',
    '',
    'Below is the story of how the paper came to exist, what it actually said, and why the idea turned out to be a much bigger claim than its authors intended.',
    '',
    '---',
    '',
    '## I. The Problem They Were Trying to Solve',
    '',
    'The prize in late-2016 machine learning, if there was one, was machine translation. Google Translate had shipped a neural model in September 2016; Facebook was racing to catch up; Microsoft and Baidu each had competitive systems. The architecture everyone used was the same: a **recurrent neural network**, usually an LSTM, with an encoder on one side reading the source sentence one word at a time and a decoder on the other side producing the target sentence one word at a time. It worked, and it was slow.',
    '',
    'The slowness was not a matter of engineering. It was a mathematical fact about the model. To produce the hidden state at step \\(t\\), the network had to consult the hidden state at step \\(t-1\\):',
    '',
    '$$h_t = f(h_{t-1}, x_t)$$',
    '',
    'That equation is a strict chain. To compute \\(h_{100}\\) you must first have \\(h_{99}\\); to compute \\(h_{99}\\) you need \\(h_{98}\\); and so on back to \\(h_0\\). There is no shortcut, because \\(h_t\\) depends on *all* of the words before position \\(t\\), arranged in order, funneled through a single vector. A sentence of length \\(n\\) takes \\(n\\) sequential steps on a GPU — and modern GPUs earn their keep by running thousands of operations in parallel. A model that refuses to parallelize, on hardware built for parallelism, is a model leaving most of its chip idle at every step. Doubling the sentence length doubles the wall-clock time, full stop. This was the tax everyone was paying in 2016.',
    '',
    'A second, subtler cost of the RNN was that "all previous information" was squeezed into that single hidden state vector. For short sentences this was fine. For long sentences the vector became a bottleneck — the equivalent of asking a translator to listen to a ten-minute speech and then translate it from memory with no notes.',
    '',
    'By late 2014 the field had invented a patch for the second problem, called **attention**. In the Bahdanau paper (*Neural Machine Translation by Jointly Learning to Align and Translate*, 2014), the decoder, at each output step, was allowed to re-examine a weighted average of *all* encoder states, not just the final one. The weights were learned end-to-end. Bahdanau was generous about the lineage; in the paper he wrote:',
    '',
    '> Our approach borrows from a line of work on soft content-based addressing, most directly from Graves (2013), who wrote,',
    '> ',
    '> > It is possible to have the read head attend to multiple locations simultaneously, weighted by a learned distribution over memory positions.',
    '> ',
    '> We adapt this mechanism to the encoder–decoder setting, where the "memory" is the sequence of encoder hidden states and the "read head" is the decoder at each output step.',
    '',
    'Attention improved translation quality, substantially. But it was, in the architectures of 2014–2016, a *side dish*. The main course — the thing that processed the sequence, step by step, in order — was still the recurrent network. The Transformer team\'s heretical idea was to ask what would happen if you kept the side dish and threw away the main course.',
    '',
    '---',
    '',
    '## II. How the Paper Came Together',
    '',
    'The project did not begin as a deliberate attempt to reinvent deep learning. It began, according to later interviews with several of the authors, with **Jakob Uszkoreit**\'s frustration at how long his experiments were taking to run. In late 2016 he had been working on a non-recurrent encoder — a stack of self-attention layers, no LSTMs at all — as an engineering optimization, not a research direction. It trained about five times faster than the recurrent baseline on the same hardware. The translation quality was, to his surprise, no worse. He circulated the result internally and several people came to look at the code.',
    '',
    'The core group that then assembled around the idea did so in a rough order. **Noam Shazeer** is the one who, in the team\'s later telling, pushed the "throw everything else away" framing hardest. **Niki Parmar** built out the decoder. **Łukasz Kaiser** and **Aidan Gomez** rewrote the code from scratch inside Google\'s Tensor2Tensor framework so that experiments could be reproduced by anyone on the team. **Llion Jones** owned the positional encoding. **Ashish Vaswani** drove the writing and kept the project disciplined. **Illia Polosukhin** joined late and contributed the final benchmarks. The eighth name on the paper belongs, alphabetically, between positions three and four, and, as noted above, there was no senior-author convention — a rare and in retrospect consequential editorial choice.',
    '',
    'The timeline of the project, compressed:',
    '',
    '1. **January 2017** — Uszkoreit\'s engineering note about a non-recurrent encoder.',
    '2. **Mid-February 2017** — first working end-to-end prototype: an attention-only encoder and decoder with no recurrence, tested on WMT English–German, already within 1 BLEU of the state of the art.',
    '3. **March 2017** — Shazeer introduces the "scaled" modification (dividing by \\(\\sqrt{d_k}\\) before the softmax). Training stability improves immediately.',
    '4. **April 2017** — multi-head attention becomes the default configuration. The team names the architecture internally as "The Transformer".',
    '5. **May 2017** — the final training runs begin on an 8-GPU machine. The "big" model takes 3.5 days; the "base" model takes 12 hours.',
    '6. **June 1, 2017** — paper draft circulates inside Google Brain and Google Research.',
    '7. **June 12, 2017** — arXiv submission.',
    '8. **December 4, 2017** — the paper is presented at NeurIPS in Long Beach, to a poster session of about two hundred people.',
    '',
    'It is worth remembering that a "poster session of about two hundred people" was, at the time, considered a modest reception. The paper was not the buzz of the conference. It was reviewed well but not spectacularly. The reviewers recommended acceptance.',
    '',
    '---',
    '',
    '## III. The Equation',
    '',
    'The paper\'s central idea fits in one line:',
    '',
    '$$\\text{Attention}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{QK^\\top}{\\sqrt{d_k}}\\right) V$$',
    '',
    'To read this line correctly, it helps to give the three matrices human-friendly names. They are usually translated as:',
    '',
    '- **Q**, the *queries*, is "what am I looking for?" There is one query per position in the sequence.',
    '- **K**, the *keys*, is "what does each position advertise itself as?" Also one per position.',
    '- **V**, the *values*, is "if I find a match, what do I actually retrieve?" One per position as well.',
    '',
    'The product \\(QK^\\top\\) is then a matrix of scores: how well does query *i* match key *j* for every pair \\((i, j)\\)? The softmax converts each row of scores into a probability distribution over positions. The final multiplication by \\(V\\) says: for each position \\(i\\), produce a weighted average of all the values, where the weights are the probabilities from the softmax. Every output position is therefore a blended view of every input position, and the blend is data-dependent.',
    '',
    'The crucial detail — the one that makes the whole thing work at scale — is the factor of \\(1/\\sqrt{d_k}\\) in the denominator. It looks cosmetic. It is not. If \\(Q\\) and \\(K\\) are drawn from independent zero-mean, unit-variance distributions, the variance of the dot product \\(q \\cdot k\\) grows linearly with the key dimension \\(d_k\\). In a model with \\(d_k = 64\\), the raw dot products will routinely reach magnitudes where the softmax saturates — it pushes nearly all of its probability mass onto whichever single score happens to be largest, and the gradient with respect to every other pair vanishes. Training silently stalls. Dividing by \\(\\sqrt{d_k}\\) keeps the pre-softmax variance at roughly unity for any \\(d_k\\), which keeps the softmax in its responsive region, which keeps gradients flowing. Without this single line, the Transformer would have trained badly and been dismissed. Shazeer added it after an afternoon of bewildered debugging.',
    '',
    '### Multi-head, and why it matters',
    '',
    'One pass of \\(\\text{Attention}(Q, K, V)\\) computes a single kind of averaging. The paper proposed running the attention operation \\(h = 8\\) times in parallel, with a different learned linear projection of \\(Q\\), \\(K\\), and \\(V\\) for each of the eight heads, and concatenating the outputs:',
    '',
    '$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) \\, W^O$$',
    '',
    'The motivation is easy to state but hard to prove: different heads learn to attend to different *kinds* of relationship inside the sentence. The paper\'s appendix contained attention-weight visualizations showing, for a specific sentence, that',
    '',
    '- head 1 had specialized on matching verbs to their subjects,',
    '- head 3 had specialized on coreference (tracking which pronoun points at which noun),',
    '- head 5 had specialized on matching words to their immediate left neighbor, acting effectively as a one-step convolution.',
    '',
    'No one had told the heads to do any of this. The specializations were emergent — the product of eight independent heads each looking for whatever distinction in the input would best reduce the final training loss.',
    '',
    '---',
    '',
    '## IV. The Code',
    '',
    'It is genuinely remarkable how little code the central operation takes. The following is a stripped-down, batched, mask-aware implementation in PyTorch, equivalent to Equation 1 of the paper. It is the code that lives, essentially unchanged, inside every large language model in production today.',
    '',
    '```python',
    'import math',
    'import torch',
    'import torch.nn.functional as F',
    '',
    'def scaled_dot_product_attention(Q, K, V, mask=None):',
    '    """Eq. 1 of Vaswani et al., 2017.',
    '',
    '    Shapes:',
    '      Q:    (batch, heads, seq_q, d_k)',
    '      K:    (batch, heads, seq_k, d_k)',
    '      V:    (batch, heads, seq_k, d_v)',
    '      mask: (batch, 1,    seq_q, seq_k)  — 0 where forbidden, 1 elsewhere',
    '    Returns:',
    '      output:  (batch, heads, seq_q, d_v)',
    '      weights: (batch, heads, seq_q, seq_k)',
    '    """',
    '    d_k = Q.size(-1)',
    '    scores = (Q @ K.transpose(-2, -1)) / math.sqrt(d_k)',
    '    if mask is not None:',
    '        # Positions we don\'t want to attend to get -inf, so they',
    '        # receive zero probability after the softmax.',
    '        scores = scores.masked_fill(mask == 0, float("-inf"))',
    '    weights = F.softmax(scores, dim=-1)',
    '    return weights @ V, weights',
    '```',
    '',
    'The entire operation is three matrix multiplications and a softmax. There is no recurrence anywhere — no step that depends on the previous step. A GPU can execute all of this in parallel across every position and every attention head. That single property is what let the Transformer train ten times faster than its recurrent predecessors.',
    '',
    '---',
    '',
    '## V. The Results',
    '',
    'The paper\'s core empirical claim was demonstrated on the WMT 2014 English-to-German and English-to-French translation benchmarks, the two standard beauty contests of the time. The table below reproduces the key numbers. Focus especially on the rightmost column.',
    '',
    '| Model | BLEU (En→De) | BLEU (En→Fr) | Training Cost (FLOPs) |',
    '| :-- | :-: | :-: | --: |',
    '| ByteNet (2016) | 23.75 | — | — |',
    '| GNMT + RL (2016) | 24.6 | 39.92 | 1.4 × 10²⁰ |',
    '| ConvS2S (2017) | 25.16 | 40.46 | 1.5 × 10²⁰ |',
    '| **Transformer (base)** | **27.3** | **38.1** | **3.3 × 10¹⁸** |',
    '| **Transformer (big)** | **28.4** | **41.8** | **2.3 × 10¹⁹** |',
    '',
    'The "big" Transformer beat the previous state of the art on both language pairs — by a comfortable margin on English-to-German, by a narrower one on English-to-French — while training for roughly one order of magnitude *less* compute. This was not a Pareto improvement along a single axis. It was a simultaneous improvement in both quality and cost, which is the rarest kind of result in the field. It is the sort of number that gets a paper accepted.',
    '',
    'The authors draft of Section 7, however, contained a second claim the group ultimately ~~overstated~~ ***removed***: an early version had proposed that attention-only architectures would generalize beyond translation to speech recognition and image classification. Shazeer and Vaswani, in the final editing pass, cut the paragraph. The published Section 7 restricts itself to a careful sentence or two about future work. It has since been quoted more often than any other part of the paper, for reasons that become clear on a second reading.',
    '',
    '---',
    '',
    '## VI. What the Authors Did Not Predict',
    '',
    'Section 7 of *Attention Is All You Need*, the "Conclusion", is eleven lines long. Its final paragraph is a carefully hedged forecast — and as a piece of technological prediction, it is one of the most accurate paragraphs of the 21st century. In a 2023 podcast, Ashish Vaswani read it out loud and then said, somewhat sheepishly:',
    '',
    '> I was reading back through the paper recently and hit the last paragraph, and I started laughing because we\'d written:',
    '> ',
    '> > We are excited about the future of attention-based models and plan to apply them to other tasks. We plan to extend the Transformer to problems involving input and output modalities other than text and to investigate local, restricted attention mechanisms to efficiently handle large inputs and outputs such as images, audio and video.',
    '> ',
    '> Every single clause of that sentence is now a billion-dollar research program. We had no idea. We thought we were writing polite standard-issue future work.',
    '',
    'Extending to "input and output modalities other than text" describes, among other things, the entire vision-language model industry. "Local, restricted attention mechanisms" describes FlashAttention, linear attention, Longformer, Big Bird, and the whole sub-field of efficient long-context models. "Images, audio and video" describes Stable Diffusion, Whisper, and Sora. None of these systems existed in 2017. All of them rest on the Transformer. The paragraph reads, from 2026, like a table of contents for the AI industry.',
    '',
    '---',
    '',
    '## VII. Where the Eight Authors Went',
    '',
    'None of the eight original authors is still at Google Research as of 2026. The diaspora itself has become a minor historical artifact — arguably the most consequential single research team ever to walk out a company\'s front door:',
    '',
    '- **Ashish Vaswani** co-founded Essential AI in 2022.',
    '- **Noam Shazeer** co-founded Character.AI; returned to Google in mid-2024 as part of a reported $2.7 billion arrangement.',
    '- **Niki Parmar** co-founded Essential AI alongside Vaswani.',
    '- **Jakob Uszkoreit** left to co-found Inceptive, applying transformer models to RNA therapeutics design.',
    '- **Llion Jones** co-founded Sakana AI in Tokyo.',
    '- **Aidan N. Gomez** co-founded Cohere; led its Series D at a reported valuation above $5 billion.',
    '- **Łukasz Kaiser** joined OpenAI and is part of the core modeling team.',
    '- **Illia Polosukhin** co-founded NEAR Protocol.',
    '',
    'Every one of these companies exists because the paper worked; in several cases it would be accurate to say every one of these companies exists *as the paper worked*. Whether that pattern represents a triumph of open publication or a cautionary tale for research labs depends, largely, on who you ask.',
    '',
    '---',
    '',
    '## VIII. One More Footnote',
    '',
    'There is a second-order story inside the first one. "Attention is all you need" turned out to be an overstatement the moment someone tried to apply it at scale, because the cost of attention is \\(O(n^2 \\cdot d)\\) in the sequence length \\(n\\), and that quadratic is exactly the reason "long context" remains a hard research problem to this day. A decade\'s worth of follow-up work has been, essentially, an argument with the paper\'s own title[^1].',
    '',
    'None of that, of course, diminishes the paper. A claim does not have to be the last word to be a foundational one. The Wright brothers\' plane does not fly anymore. We still call it an airplane.',
    '',
    '---',
    '',
    '*Eight pages, eight authors, one diagram. That, in the end, was all it took.*',
    '',
    '[^1]: The 2023–2024 wave of state-space models — notably Mamba (Gu & Dao, 2023) and RWKV — revisited the core assumption of the Transformer. They argue, with some evidence, that attention is *one* of the things you need, but not the only one.',
    '',
  ].join('\n');

  // ===== Example: Attention Is All You Need (ZH) =====
  var attentionZh = [
    '# 八位作者与一幅示意图',
    '',
    '2017 年 6 月 12 日 UTC 时间 23:54，一篇论文被上传到 arXiv，编号 1706.03762。标题近乎轻佻：*Attention Is All You Need*。作者名单按字母序排列，没有采用"资深作者"的惯例：**Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin**。八个名字。不计参考文献的话，八页。',
    '',
    '在此后的七年里，这八页所描述的架构将会坐在 ChatGPT、Claude、Gemini、AlphaFold 2、GitHub Copilot、Stable Diffusion、Midjourney、DALL·E 的底下，支撑起一个接近万亿美元规模的产业。2017 年的时候，这八位作者没有一个会相信上面这句话。',
    '',
    '下面讲的是这篇论文如何诞生、它到底说了什么，以及为什么它的观点最终远比作者们打算的主张更大。',
    '',
    '---',
    '',
    '## I. 他们在解决的问题',
    '',
    '如果说 2016 年末机器学习界有一个"第一名奖品"，那就是机器翻译。Google Translate 在 2016 年 9 月上线了神经机器翻译；Facebook 正在追赶；微软和百度各自有自己的系统。大家用的架构是同一个：**循环神经网络**，通常是 LSTM，一侧编码器一次读一个词、另一侧解码器一次输出一个词。它能用，而且很慢。',
    '',
    '这种慢不是工程上的原因，而是模型本身的数学事实。要计算第 \\(t\\) 步的隐状态，网络必须先拿到第 \\(t-1\\) 步的隐状态：',
    '',
    '$$h_t = f(h_{t-1}, x_t)$$',
    '',
    '这是一条严格的链。要算 \\(h_{100}\\)，你必须先有 \\(h_{99}\\)；要算 \\(h_{99}\\) 就得先有 \\(h_{98}\\)；一直回到 \\(h_0\\)。没有捷径，因为 \\(h_t\\) 依赖它之前*所有*词按顺序被压进一个向量的过程。一个长度为 \\(n\\) 的句子，在 GPU 上需要 \\(n\\) 个顺序步骤——而现代 GPU 的价值正在于它能并行执行成千上万个操作。一个拒绝并行的模型跑在为并行而生的硬件上，就意味着每一步都让大部分芯片闲着。句长翻倍，墙钟时间翻倍，就这么简单。这是 2016 年整个行业都在交的税。',
    '',
    'RNN 的第二个、更隐秘的代价是："所有此前信息"都被压进了那个单一的隐状态向量。对短句而言没问题；对长句而言，这个向量就成了瓶颈——相当于让一位译员听完十分钟的演讲后，不许记笔记，完全凭记忆翻译。',
    '',
    '为了缓解第二个问题，2014 年底这个领域发明了一个补丁，叫 **注意力**。在 Bahdanau 的论文（*Neural Machine Translation by Jointly Learning to Align and Translate*，2014）里，解码器在每一次输出时，被允许回头重新*查看*所有编码器状态的一个加权平均值，而不是只看最后一个。权重是端到端学出来的。Bahdanau 在论文里对这条脉络很慷慨地承认了出处：',
    '',
    '> 我们的方法借鉴了一条关于"软内容寻址"的研究线索，最直接地来自 Graves（2013）：',
    '> ',
    '> > 读头可以同时对多个位置进行关注，权重由在记忆位置上学到的一个分布决定。',
    '> ',
    '> 我们把这一机制改编到编码器-解码器的设定里，其中"记忆"是编码器隐状态的序列，"读头"是每一个输出步骤上的解码器。',
    '',
    '注意力切实地改进了翻译质量，幅度相当大。但在 2014 到 2016 的架构里，它是*配菜*。主菜——那个按顺序逐步处理序列的东西——依然是循环网络。Transformer 团队那个近乎叛逆的念头，就是问：如果我们留下配菜、扔掉主菜会怎样？',
    '',
    '---',
    '',
    '## II. 论文是怎么被拼出来的',
    '',
    '这个项目并不是一次精心策划的、试图重塑深度学习的尝试。据多位作者后来在访谈中的回忆，它开始于 **Jakob Uszkoreit** 对自己实验跑得太慢的沮丧。2016 年末他一直在做一个非循环的编码器——一摞自注意力层，完全没有 LSTM——作为一项工程优化，而不是一个研究方向。在同样的硬件上，它训练速度大约是循环基线的五倍。让他意外的是，翻译质量并没有变差。他在内部把结果发了出来，几个人陆续来看代码。',
    '',
    '然后围绕这个想法聚起来的核心小组，粗略按以下顺序加入：按团队后来的叙述，**Noam Shazeer** 是那个最坚决推动"把其他所有东西都扔掉"这种叙事的人。**Niki Parmar** 把解码器完整实现了出来。**Łukasz Kaiser** 和 **Aidan Gomez** 在 Google 的 Tensor2Tensor 框架里把所有代码重写了一遍，让任何人都能复现实验。**Llion Jones** 负责位置编码。**Ashish Vaswani** 推动写作、让项目保持纪律。**Illia Polosukhin** 较晚加入，贡献了最终的 benchmark。署名栏上第八个名字按字母序落在第三和第四之间——而且如前所述，这篇论文没有采用资深作者惯例，这是一个在当时很少见、事后看非常关键的编辑决定。',
    '',
    '把整个项目的时间线压缩一下：',
    '',
    '1. **2017 年 1 月**：Uszkoreit 发出关于非循环编码器的那份工程记录。',
    '2. **2 月中旬**：第一个端到端的原型跑起来了——注意力编码器 + 注意力解码器，没有循环，直接在 WMT 英德任务上跑，离当时的 SOTA 已经只差 1 BLEU。',
    '3. **3 月**：Shazeer 引入"缩放"改动（softmax 之前除以 \\(\\sqrt{d_k}\\)）。训练稳定性立即改善。',
    '4. **4 月**：多头注意力成为默认配置。团队内部给这个架构起名叫"Transformer"。',
    '5. **5 月**：最终的训练在一台 8 卡机器上启动。"big" 模型跑了 3.5 天；"base" 模型跑了 12 小时。',
    '6. **6 月 1 日**：论文草稿在 Google Brain 和 Google Research 内部传阅。',
    '7. **6 月 12 日**：提交 arXiv。',
    '8. **12 月 4 日**：论文在 NeurIPS 长滩会议上的海报环节被展示，观众大约两百人。',
    '',
    '值得提醒一下的是，"大约两百人的海报环节"在当时被视为一个不错但不算轰动的接待。这篇论文并不是那届大会的热点。评审意见很好，但谈不上惊艳。审稿人给了"接收"的建议。',
    '',
    '---',
    '',
    '## III. 那条公式',
    '',
    '这篇论文的核心想法能压进一行：',
    '',
    '$$\\text{Attention}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{QK^\\top}{\\sqrt{d_k}}\\right) V$$',
    '',
    '要正确地读这一行，给这三个矩阵一些人话名字会有帮助。它们通常被翻译成：',
    '',
    '- **Q**，*queries*（查询），问的是"我在找什么？"。序列里的每一个位置各自有一个。',
    '- **K**，*keys*（键），问的是"每个位置把自己标榜成什么？"。也是每个位置一个。',
    '- **V**，*values*（值），问的是"如果匹配上了，我到底取回什么？"。同样每个位置一个。',
    '',
    '乘积 \\(QK^\\top\\) 于是构成一个分数矩阵：对每一对 \\((i, j)\\)，查询 *i* 与键 *j* 有多匹配？softmax 把每一行的分数变成一条在位置上的概率分布。最后再乘以 \\(V\\) 的含义是：对每个位置 \\(i\\)，对所有 values 做一次加权平均，权重就是 softmax 给出的那条概率分布。于是每一个输出位置都是所有输入位置的一种融合视角，而这个融合是依赖于数据本身的。',
    '',
    '最关键的细节——也是让整件事在大规模下真正跑得起来的那个细节——是分母里的 \\(1/\\sqrt{d_k}\\)。它看起来像是化妆品，其实不是。如果 \\(Q\\) 和 \\(K\\) 来自独立的零均值、单位方差分布，那么点积 \\(q \\cdot k\\) 的方差会随着键的维度 \\(d_k\\) 线性增长。在 \\(d_k = 64\\) 的模型里，原始点积会经常达到一个 softmax 会饱和的幅度——它会把几乎所有概率质量压给碰巧最大的那一个分数，而对其他所有对的梯度就消失了。训练会安静地停滞。除以 \\(\\sqrt{d_k}\\) 让 softmax 之前的方差在任意 \\(d_k\\) 下都大致保持为 1，让 softmax 停留在它的响应区间里，让梯度继续流动。没有这一行，Transformer 会训得很差然后被忽略。Shazeer 是在一个下午的迷茫 debug 之后加上它的。',
    '',
    '### 多头，以及它为什么重要',
    '',
    '一次 \\(\\text{Attention}(Q, K, V)\\) 只计算出一种平均方式。论文提出并行跑 \\(h = 8\\) 次注意力，每一次都用一组不同的、学出来的线性投影，最后把八路的输出拼接起来：',
    '',
    '$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) \\, W^O$$',
    '',
    '动机说起来容易，证明起来困难：不同的头学到去关注句子内部不同*种类*的关系。论文的附录里有一组注意力权重可视化图，对于一条具体的句子显示出来：',
    '',
    '- 第 1 头专门匹配动词与它的主语；',
    '- 第 3 头专门做指代（追踪哪一个代词指向哪一个名词）；',
    '- 第 5 头专门匹配每个词与它左侧的邻词，实际上充当了一种单步卷积。',
    '',
    '没有人告诉过任何一个头要这么做。这些专业化是涌现出来的——八个独立的头，各自为政地在输入里寻找那个最能降低训练 loss 的区分维度。',
    '',
    '---',
    '',
    '## IV. 那段代码',
    '',
    '这个核心操作用的代码之少，其实非常惊人。下面是它的精简版本——带 batching、带 mask——在 PyTorch 里等价于论文的 Equation 1。这段代码几乎不作改动地活在今天每一个产线上的大语言模型里。',
    '',
    '```python',
    'import math',
    'import torch',
    'import torch.nn.functional as F',
    '',
    'def scaled_dot_product_attention(Q, K, V, mask=None):',
    '    """Vaswani 等（2017）的 Equation 1。',
    '',
    '    形状：',
    '      Q:    (batch, heads, seq_q, d_k)',
    '      K:    (batch, heads, seq_k, d_k)',
    '      V:    (batch, heads, seq_k, d_v)',
    '      mask: (batch, 1,    seq_q, seq_k)  — 禁止处为 0，其他为 1',
    '    返回：',
    '      output:  (batch, heads, seq_q, d_v)',
    '      weights: (batch, heads, seq_q, seq_k)',
    '    """',
    '    d_k = Q.size(-1)',
    '    scores = (Q @ K.transpose(-2, -1)) / math.sqrt(d_k)',
    '    if mask is not None:',
    '        # 禁止位置得到 -inf，经过 softmax 后概率为 0。',
    '        scores = scores.masked_fill(mask == 0, float("-inf"))',
    '    weights = F.softmax(scores, dim=-1)',
    '    return weights @ V, weights',
    '```',
    '',
    '整个操作是三次矩阵乘法加一次 softmax。没有任何循环——没有哪一步依赖上一步。GPU 可以在所有位置、所有注意力头上并行执行完全部计算。这一个性质本身，就是 Transformer 能比它那些循环的前辈快十倍训练的原因。',
    '',
    '---',
    '',
    '## V. 结果',
    '',
    '论文的核心实证主张在 WMT 2014 英译德与英译法这两个当时标准的选美赛道上得到展示。下面这张表复现的是最关键的几组数字。请特别留意最右那一列。',
    '',
    '| 模型 | BLEU（En→De） | BLEU（En→Fr） | 训练成本（FLOPs） |',
    '| :-- | :-: | :-: | --: |',
    '| ByteNet (2016) | 23.75 | — | — |',
    '| GNMT + RL (2016) | 24.6 | 39.92 | 1.4 × 10²⁰ |',
    '| ConvS2S (2017) | 25.16 | 40.46 | 1.5 × 10²⁰ |',
    '| **Transformer（base）** | **27.3** | **38.1** | **3.3 × 10¹⁸** |',
    '| **Transformer（big）** | **28.4** | **41.8** | **2.3 × 10¹⁹** |',
    '',
    '"big" 版的 Transformer 在两个语种对上都刷新了前 SOTA——英译德幅度较大，英译法窄一些——同时所用的算力比前者少了大约一个数量级。这不是沿单一维度的帕累托改进，而是质量与成本的*同时*改进，是这一领域最罕见的那种结果。这是足以让一篇论文被接收的数字。',
    '',
    '顺便值得一提的是，论文第 7 节最初那版草稿里还包含一个更大胆、被小组最终 ~~保留~~ ***删除*** 的主张：早期版本提出，注意力式架构会推广到翻译之外，包括语音识别和图像分类。Shazeer 和 Vaswani 在终稿的打磨过程中把这段话删掉了。最后发表的第 7 节只用几句非常克制的"未来工作"把它带过。有趣的是，这段被删过的段落，反而是后来被引用最多的部分——原因第二遍读的时候就很清楚了。',
    '',
    '---',
    '',
    '## VI. 作者们没有预料到的事',
    '',
    '*Attention Is All You Need* 的第 7 节"结论"一共十一行。它的最后一段是一段小心翼翼的预测，而作为一段技术预言，它是 21 世纪最精准的段落之一。2023 年的一次播客里，Ashish Vaswani 朗读了这一段，然后有点不好意思地说：',
    '',
    '> 我最近翻回去读这篇论文，读到最后一段时我笑了出来，因为我们当时写的是：',
    '> ',
    '> > 我们对基于注意力的模型未来的前景感到兴奋，计划把它们应用到其他任务上。我们计划把 Transformer 推广到文本以外的输入输出模态，并研究局部受限的注意力机制，以高效处理图像、音频、视频这类大输入输出。',
    '> ',
    '> 这句话的每一个从句，如今都是一个数十亿美元的研究计划。我们当时完全没有概念。我们以为自己写的是那种客套的、标配的"未来工作"。',
    '',
    '"推广到文本以外的输入输出模态"—— 几乎描述了整个视觉-语言模型行业。"局部受限的注意力机制"—— 描述了 FlashAttention、线性注意力、Longformer、Big Bird，以及整个"高效长上下文模型"子领域。"图像、音频、视频" —— 描述了 Stable Diffusion、Whisper、Sora。这些系统 2017 年全都不存在。它们全都建立在 Transformer 之上。从 2026 年回头读这段话，它像是 AI 行业的一份目录。',
    '',
    '---',
    '',
    '## VII. 八位作者去了哪里',
    '',
    '截至 2026 年，这篇论文最初的八位作者，没有一位还留在 Google Research。这场外溢本身已经成为一件小的历史文物——可以说是史上最重要的单个研究团队从一家公司前门走出去的案例：',
    '',
    '- **Ashish Vaswani** 2022 年联合创办 Essential AI。',
    '- **Noam Shazeer** 联合创办 Character.AI；2024 年中回到 Google，据报道交易规模达到 27 亿美元。',
    '- **Niki Parmar** 与 Vaswani 共同创办 Essential AI。',
    '- **Jakob Uszkoreit** 离开去联合创办 Inceptive，把 Transformer 模型用于 RNA 疗法设计。',
    '- **Llion Jones** 在东京联合创办 Sakana AI。',
    '- **Aidan N. Gomez** 联合创办 Cohere；在 50 亿美元以上估值的 D 轮融资中担任主导。',
    '- **Łukasz Kaiser** 加入 OpenAI，是其核心建模团队的一员。',
    '- **Illia Polosukhin** 联合创办 NEAR Protocol。',
    '',
    '这些公司里的每一家存在的前提是论文管用；其中几家更准确的说法是：这些公司本身就是*以论文管用这件事*存在的。这个现象到底代表着开放发表的胜利，还是研究机构的一次警示，取决于你问谁。',
    '',
    '---',
    '',
    '## VIII. 再加一条脚注',
    '',
    '这个故事里还套着一个二阶故事。"Attention is all you need"（注意力就是你所需要的一切）这句话，在有人开始把它推到真正的规模上时就变成了一次夸大，因为注意力的代价是序列长度 \\(n\\) 的二次方——\\(O(n^2 \\cdot d)\\)——而正是这个二次方，到今天为止依然让"长上下文"成为一个困难的研究问题。过去十年绝大部分的后续工作，本质上是在和这篇论文的标题争论[^1]。',
    '',
    '当然这些都不会削弱这篇论文本身。一个主张不必是终点，才成为起点。莱特兄弟那架飞机早已不能再飞。我们依然把它叫作飞机。',
    '',
    '---',
    '',
    '*八页论文，八位作者，一幅示意图。事实证明，这就是全部所需要的。*',
    '',
    '[^1]: 2023–2024 年的状态空间模型浪潮——尤其是 Mamba（Gu & Dao, 2023）与 RWKV——重新检视了 Transformer 的核心假设。它们用一定程度的证据主张：注意力是你所需要的*之一*，但不是唯一。',
    '',
  ].join('\n');

  // ===== Example registry =====
  // Each entry: {
  //   id       — stable key, used in the dropdown and for the active selection
  //   filename — short download name ("<id>.md")
  //   label    — dropdown label per language
  //   content  — { en: string, zh: string }
  // }
  // `currentExampleId` is session-only (page refresh always lands back on
  // the primary "WeMarkdown" example). Added this way the example list
  // is easy to extend: drop another { id, filename, label, content } in.
  var examples = [
    { id: 'welcome',   filename: 'WeMarkdown.md', label: { en: 'WeMarkdown.md', zh: 'WeMarkdown.md' }, content: { en: defaultContentEn, zh: defaultContentZh } },
    { id: 'brian-eno', filename: 'brian-eno.md',  label: { en: 'Brian Eno.md',  zh: 'Brian Eno.md'  }, content: { en: brianEnoEn,        zh: brianEnoZh        } },
    { id: 'attention', filename: 'attention.md',  label: { en: 'Attention.md',  zh: 'Attention.md'  }, content: { en: attentionEn,       zh: attentionZh       } },
  ];
  // Session-only user documents (uploads + "new document…"). Same
  // shape as a built-in example — {id, filename, label, content} —
  // so every call site (currentExample, export, dropdown render, …)
  // can treat them identically. `kind: 'user'` disambiguates them
  // from built-ins when we need to show delete buttons. Wiped on
  // every page refresh by design.
  var userDocs = [];
  var currentExampleId = 'welcome';
  function currentExample() {
    for (var i = 0; i < examples.length; i++) {
      if (examples[i].id === currentExampleId) return examples[i];
    }
    for (var j = 0; j < userDocs.length; j++) {
      if (userDocs[j].id === currentExampleId) return userDocs[j];
    }
    return examples[0];
  }

  // Active default content tracking: selected by the current UI language
  // AND by the currently selected example.
  function currentDefaultContent() {
    var ex = currentExample();
    return CURRENT_LANG === 'zh' ? ex.content.zh : ex.content.en;
  }
  // Back-compat alias — existing code reads `defaultContent` (e.g. the
  // "reset to default" handler and equality checks). We redefine this as a
  // getter-like accessor via a wrapper object so those checks stay correct.
  // Simpler: just point the variable at the current default on every language
  // change; callsites read it inline so they always see the latest.
  var defaultContent = defaultContentEn;

  // ===== Copy from preview: restore Markdown syntax =====
  // Delegate so copy works from any virtual screen's markdown-body.
  (document.getElementById('preview-outer-row') || preview).addEventListener('copy', function(e) {
    // Only handle when the current selection is inside a .markdown-body.
    var sel0 = window.getSelection();
    if (!sel0 || sel0.rangeCount === 0) return;
    var anchor = sel0.anchorNode;
    if (!anchor) return;
    var bodyNode = (anchor.nodeType === 1 ? anchor : anchor.parentElement);
    if (!bodyNode || !bodyNode.closest || !bodyNode.closest('.markdown-body')) return;
    var sel = sel0;
    if (!sel || sel.rangeCount === 0) return;

    var range = sel.getRangeAt(0);
    var fragment = range.cloneContents();
    var wrapper = document.createElement('div');
    wrapper.appendChild(fragment);

    var mdLines = [];
    var usedFootnotes = [];

    function nodeToMd(node) {
      if (node.nodeType === 3) return node.textContent;
      if (node.nodeType !== 1) return '';
      var tag = node.tagName;
      var inner = '';
      for (var c = 0; c < node.childNodes.length; c++) {
        inner += nodeToMd(node.childNodes[c]);
      }
      // Headings
      if (tag === 'H1') return '# ' + inner;
      if (tag === 'H2') return '## ' + inner;
      if (tag === 'H3') return '### ' + inner;
      if (tag === 'H4') return '#### ' + inner;
      if (tag === 'H5') return '##### ' + inner;
      if (tag === 'H6') return '###### ' + inner;
      // Bold / Italic / Strikethrough
      if (tag === 'STRONG' || tag === 'B') return '**' + inner + '**';
      if (tag === 'EM' || tag === 'I') return '*' + inner + '*';
      if (tag === 'DEL' || tag === 'S') return '~~' + inner + '~~';
      // Inline code
      if (tag === 'CODE' && node.parentElement && node.parentElement.tagName !== 'PRE') return '`' + inner + '`';
      // Superscript / Subscript
      if (tag === 'SUP') return '<sup>' + inner + '</sup>';
      if (tag === 'SUB') return '<sub>' + inner + '</sub>';
      // Links
      if (tag === 'A') {
        var href = node.getAttribute('href');
        if (href) return '[' + inner + '](' + href + ')';
        return inner;
      }
      // Footnote ref: restore [^key] syntax
      if (node.classList && node.classList.contains('footnote-ref')) {
        var fnKeys = node.getAttribute('data-fn');
        if (fnKeys) {
          var keys = fnKeys.split(',');
          var result = '';
          for (var fk = 0; fk < keys.length; fk++) {
            result += '[^' + keys[fk] + ']';
            if (usedFootnotes.indexOf(keys[fk]) === -1) usedFootnotes.push(keys[fk]);
          }
          return result;
        }
        return '';
      }
      // Skip icon spans inside footnotes
      if (node.classList && (node.classList.contains('fn-icon') || node.classList.contains('fn-icon-light') || node.classList.contains('fn-icon-dark'))) return '';
      // List markers
      if (node.classList && node.classList.contains('li-marker')) return '';
      if (node.classList && node.classList.contains('heading-text')) return inner;
      if (node.classList && node.classList.contains('li-text')) return inner;
      if (node.classList && node.classList.contains('cell-text')) return inner;
      // Paragraphs
      if (tag === 'P') return inner;
      // Blockquote
      if (tag === 'BLOCKQUOTE') {
        return inner.split('\n').map(function(l) { return '> ' + l; }).join('\n');
      }
      // List items
      if (tag === 'LI') {
        var parentList = node.parentElement;
        if (parentList && parentList.tagName === 'OL') {
          var idx = 0;
          var prev = node;
          while (prev) { if (prev.tagName === 'LI') idx++; prev = prev.previousElementSibling; }
          return idx + '. ' + inner;
        }
        return '- ' + inner;
      }
      // Code block
      if (tag === 'PRE') {
        var codeEl = node.querySelector('code');
        var lang = '';
        if (codeEl) {
          var clsMatch = (codeEl.className || '').match(/language-(\w+)/);
          if (clsMatch) lang = clsMatch[1];
        }
        var codeText = codeEl ? codeEl.textContent : inner;
        return '```' + lang + '\n' + codeText + '\n```';
      }
      if (tag === 'BR') return '\n';
      // Table
      if (tag === 'TABLE' || tag === 'THEAD' || tag === 'TBODY' || tag === 'TR' ||
          tag === 'TH' || tag === 'TD' || tag === 'UL' || tag === 'OL') return inner;
      // Wrapper divs
      if (tag === 'DIV' || tag === 'SPAN') return inner;
      return inner;
    }

    // Process each top-level child
    for (var i = 0; i < wrapper.childNodes.length; i++) {
      var md = nodeToMd(wrapper.childNodes[i]).trim();
      if (md) mdLines.push(md);
    }

    // Append footnote definitions if any were referenced
    if (usedFootnotes.length > 0) {
      mdLines.push('');
      for (var fi = 0; fi < usedFootnotes.length; fi++) {
        var fkey = usedFootnotes[fi];
        if (footnoteData[fkey]) {
          mdLines.push('[^' + fkey + ']: ' + footnoteData[fkey]);
        }
      }
    }

    var mdText = mdLines.join('\n\n');
    e.preventDefault();
    e.clipboardData.setData('text/plain', mdText);
  });

  // Initial i18n pass: pick default content for current language, apply all
  // [data-i18n*] bindings, and wire the language dropdown.
  defaultContent = currentDefaultContent();
  applyI18n();

  // ===== Global keyboard shortcut dispatcher =====
  // Registered on window at capture phase so it beats the default
  // browser "Save page" / "Open file" handlers reliably.
  // When any dialog is visible we bail early — the dialog's own
  // Enter/Esc handlers own the keyboard while it's up.
  (function() {
    function anyDialogOpen() {
      var newDoc = document.getElementById('example-name-dialog');
      var exp    = document.getElementById('export-image-dialog');
      if (newDoc && !newDoc.hidden) return true;
      if (exp && !exp.hidden) return true;
      return false;
    }
    function modMatches(e, mod) {
      // "cmd" means Cmd on Mac, Ctrl elsewhere.
      var primary = IS_MAC ? e.metaKey : e.ctrlKey;
      if (!primary) return false;
      // Reject the opposite modifier to avoid Ctrl+⌘+S firing twice
      // or similar oddities.
      if (IS_MAC && e.ctrlKey) return false;
      if (!IS_MAC && e.metaKey) return false;
      var needShift = /shift/.test(mod);
      if (needShift !== !!e.shiftKey) return false;
      var needAlt = /alt/.test(mod);
      if (needAlt !== !!e.altKey) return false;
      return true;
    }
    function run(name) {
      // Route each shortcut to the corresponding UI surface. All the
      // heavy lifting (file picker, export pipeline, dialogs) is
      // already wired to those elements' click listeners, so we
      // simply synthesize a click — this keeps behavior in lock-step
      // with direct mouse clicks, no parallel code paths.
      var el;
      if (name === 'uploadFile') {
        // Trigger the hidden file input directly so the <input>'s
        // change handler picks up the file. Clicking the visible
        // "Upload file…" menu button also works but requires the
        // dropdown to be open first; better to short-circuit.
        el = document.getElementById('example-file-input');
        if (el) el.click();
        return;
      }
      if (name === 'exportMd') {
        el = document.getElementById('export-md');
        if (el) el.click();
        return;
      }
      if (name === 'exportImage') {
        el = document.getElementById('export-image-btn');
        if (el) el.click();
        return;
      }
      if (name === 'addScreen') {
        el = document.getElementById('screen-add-btn');
        // Respect the same "max reached" gate the button uses —
        // when we're at the cap the button has pointer-events:none
        // via CSS, but .click() still fires, so we check the
        // ancestor's data-at-max attribute to stay consistent.
        var row = document.getElementById('preview-outer-row');
        if (row && row.getAttribute('data-at-max') === '1') return;
        if (el) el.click();
        return;
      }
      if (name === 'toggleSettings') {
        // Toggle the inspector panel: if it's currently open (not
        // collapsed), close it; otherwise click the gear which
        // opens it. The gear's own click handler is open-only, so
        // we have to short-circuit the close path ourselves.
        var ip = document.getElementById('inspector-panel');
        if (ip && !ip.classList.contains('collapsed')) {
          // Mimic the close flow used by the inspector's X button:
          // collapse the panel + drop any flex override.
          ip.style.flex = '';
          ip.classList.add('collapsed');
          return;
        }
        el = document.getElementById('settings-open-btn');
        if (el) el.click();
        return;
      }
    }
    window.addEventListener('keydown', function(e) {
      if (anyDialogOpen()) return;
      var match = null;
      var matchName = null;
      var matchKey = null;
      Object.keys(SHORTCUTS).forEach(function(name) {
        var sc = SHORTCUTS[name];
        if (!modMatches(e, sc.mod)) return;
        // Compare case-insensitively, but respect the exact key
        // text for punctuation (e.g. ",").
        var k = sc.key.length === 1 ? sc.key.toLowerCase() : sc.key;
        var pressed = (e.key || '').toLowerCase();
        if (pressed === k.toLowerCase()) {
          match = sc;
          matchName = name;
          matchKey = k;
        }
      });
      if (!match) return;
      e.preventDefault();
      e.stopPropagation();
      run(matchName);
    }, true);
  })();

  (function() {
    var wrap = document.getElementById('lang-dropdown');
    var trigger = document.getElementById('lang-toggle');
    var menu = document.getElementById('lang-dropdown-menu');
    if (!wrap || !trigger || !menu) return;
    function closeMenu() {
      wrap.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
    }
    function openMenu() {
      wrap.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
    }
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      if (wrap.classList.contains('open')) closeMenu(); else openMenu();
    });
    var items = menu.querySelectorAll('.lang-dropdown-item');
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener('click', function(e) {
        e.stopPropagation();
        var chosen = this.getAttribute('data-lang');
        closeMenu();
        setLang(chosen);
      });
    }
    // Close when clicking outside or pressing Escape
    document.addEventListener('click', function(e) {
      if (!wrap.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeMenu();
    });
  })();

  editor.value = defaultContent;
  renderMarkdown();

  // Reset-to-default button in the editor header. Hidden when the current
  // editor content already matches the default example; shown as soon as
  // the user has modified anything. Clicking it restores the example.
  (function() {
    var resetBtn = document.getElementById('editor-reset');
    if (!resetBtn) return;
    function sync() {
      resetBtn.classList.toggle('hidden', editor.value === defaultContent);
    }
    editor.addEventListener('input', sync);
    resetBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      editor.value = defaultContent;
      renderMarkdown();
      sync();
    });
    sync();
    // Expose so setLang() can re-sync after swapping defaultContent.
    window.__syncEditorReset = sync;
  })();

  // ===== Example picker dropdown + user docs =====
  // The dropdown shows three things, top to bottom:
  //   1. Built-in examples (WeMarkdown / Brian Eno / Attention),
  //      rendered from the `examples` array.
  //   2. User-added documents (uploads + "new document…"),
  //      rendered from the `userDocs` array. Session-only — wiped on
  //      page refresh by design. Hidden entirely when empty.
  //   3. Actions: "Upload file…" and "New document…".
  // All three lists are rebuilt by renderMenu() whenever the state
  // changes (language switch, selection change, doc add/remove).
  (function() {
    var wrap    = document.getElementById('example-dropdown');
    var trigger = document.getElementById('example-trigger');
    var menu    = document.getElementById('example-dropdown-menu');
    var labelEl = document.getElementById('example-label');
    var collapsedLabel = document.querySelector('.editor-collapsed-label');
    var builtinSection = document.getElementById('example-builtin-section');
    var userSection    = document.getElementById('example-user-section');
    var uploadBtn = document.getElementById('example-upload-btn');
    var newBtn    = document.getElementById('example-new-btn');
    var fileInput = document.getElementById('example-file-input');
    // New-doc dialog refs.
    var dialog       = document.getElementById('example-name-dialog');
    var dialogBackdrop = document.getElementById('example-name-dialog-backdrop');
    var dialogInput  = document.getElementById('example-name-dialog-input');
    var dialogCancel = document.getElementById('example-name-dialog-cancel');
    var dialogOk     = document.getElementById('example-name-dialog-ok');
    if (!wrap || !trigger || !menu || !labelEl) return;

    // ---- Menu open/close ----
    function closeMenu() {
      wrap.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function openMenu() {
      wrap.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function toggleMenu() {
      if (wrap.classList.contains('open')) closeMenu();
      else openMenu();
    }

    // ---- Filename helpers ----
    // Add a `.md` suffix if the user didn't. Case-insensitive check so
    // "notes.MD" is left alone.
    function ensureMdSuffix(name) {
      var n = (name || '').trim();
      if (!n) return 'untitled.md';
      if (/\.(md|markdown|txt)$/i.test(n)) return n;
      return n + '.md';
    }
    // Return a filename that doesn't collide with any existing doc
    // (built-in or user). "notes.md" → "notes (2).md" → "notes (3).md".
    function dedupeFilename(name) {
      function exists(n) {
        var lower = n.toLowerCase();
        for (var i = 0; i < examples.length; i++) {
          if (examples[i].filename.toLowerCase() === lower) return true;
        }
        for (var j = 0; j < userDocs.length; j++) {
          if (userDocs[j].filename.toLowerCase() === lower) return true;
        }
        return false;
      }
      if (!exists(name)) return name;
      var m = name.match(/^(.*?)(\.[^.]+)?$/);
      var stem = m ? m[1] : name;
      var ext  = m && m[2] ? m[2] : '';
      var n = 2;
      while (exists(stem + ' (' + n + ')' + ext)) n++;
      return stem + ' (' + n + ')' + ext;
    }

    // ---- Menu rendering ----
    // Build a single row (button) for either a built-in example or a
    // user doc. User rows have an inline × delete button.
    function buildRow(entry, isUser) {
      var row = document.createElement('button');
      row.className = 'example-dropdown-item';
      row.type = 'button';
      row.setAttribute('role', 'menuitem');
      row.setAttribute('data-example-id', entry.id);
      row.classList.toggle('active', entry.id === currentExampleId);
      var nameSpan = document.createElement('span');
      nameSpan.className = 'example-dropdown-item-name';
      nameSpan.textContent = entry.label
        ? (CURRENT_LANG === 'zh' ? entry.label.zh : entry.label.en)
        : entry.filename;
      row.appendChild(nameSpan);
      if (isUser) {
        var del = document.createElement('button');
        del.type = 'button';
        del.className = 'example-dropdown-item-delete';
        del.setAttribute('data-delete-id', entry.id);
        del.setAttribute('aria-label', t('editor.deleteDoc'));
        del.setAttribute('title', t('editor.deleteDoc'));
        del.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>';
        row.appendChild(del);
      }
      return row;
    }
    function renderMenu() {
      // Built-in section.
      builtinSection.innerHTML = '';
      for (var i = 0; i < examples.length; i++) {
        builtinSection.appendChild(buildRow(examples[i], false));
      }
      // User section — hide the whole container when empty so the
      // divider above it doesn't produce a double gap.
      userSection.innerHTML = '';
      if (userDocs.length === 0) {
        userSection.hidden = true;
      } else {
        userSection.hidden = false;
        for (var j = 0; j < userDocs.length; j++) {
          userSection.appendChild(buildRow(userDocs[j], true));
        }
      }
      // Action rows' visible text — keep i18n in sync without an
      // extra applyI18n pass.
      if (uploadBtn) {
        var u = uploadBtn.querySelector('span');
        if (u) u.textContent = t('editor.uploadFile');
      }
      if (newBtn) {
        var nb = newBtn.querySelector('span');
        if (nb) nb.textContent = t('editor.newDoc');
      }
    }

    function syncLabel() {
      var ex = currentExample();
      var text = ex.label
        ? (CURRENT_LANG === 'zh' ? ex.label.zh : ex.label.en)
        : ex.filename;
      labelEl.textContent = text;
      if (collapsedLabel) collapsedLabel.textContent = text;
      renderMenu();
    }

    // ---- Core switch (built-in OR user doc) ----
    function switchExample(id) {
      if (id === currentExampleId) { closeMenu(); return; }
      // Before navigating away, persist the editor buffer back into
      // the outgoing entry IF it's a user doc — otherwise the user's
      // unsaved typing would be lost on every tab switch. Built-in
      // examples are never mutated in place (they're read-only
      // templates shipped with the app); leaving them alone is the
      // reason the reset button works.
      var prev = currentExample();
      if (prev && prev.kind === 'user' && typeof editor !== 'undefined' && editor) {
        var buf = editor.value;
        prev.content = { en: buf, zh: buf };
      }
      currentExampleId = id;
      defaultContent = currentDefaultContent();
      if (typeof editor !== 'undefined' && editor) {
        editor.value = defaultContent;
        if (typeof renderMarkdown === 'function') renderMarkdown();
      }
      syncLabel();
      if (typeof window.__syncEditorReset === 'function') window.__syncEditorReset();
      closeMenu();
    }

    // ---- Add a user doc (shared by upload + "new document") ----
    // `rawName` is whatever the user typed / the file's original name.
    // `content` is the initial text (uploaded file contents, or '' for
    // a brand-new empty doc). Returns the created entry.
    function addUserDoc(rawName, content) {
      var filename = dedupeFilename(ensureMdSuffix(rawName));
      // Build a stable, URL-safe id. Collisions are astronomically
      // unlikely but we still verify against existing ids just in case.
      function makeId() {
        var base = 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
        // Dedupe id too.
        for (var k = 0; k < userDocs.length; k++) {
          if (userDocs[k].id === base) return makeId();
        }
        return base;
      }
      var entry = {
        id: makeId(),
        filename: filename,
        // No label object — we display `filename` directly via the
        // fallback branch in buildRow / syncLabel.
        kind: 'user',
        content: { en: content, zh: content }
      };
      userDocs.push(entry);
      return entry;
    }

    function removeUserDoc(id) {
      var idx = -1;
      for (var i = 0; i < userDocs.length; i++) {
        if (userDocs[i].id === id) { idx = i; break; }
      }
      if (idx < 0) return;
      userDocs.splice(idx, 1);
      // If the removed doc was selected, fall back to Welcome.
      if (currentExampleId === id) {
        switchExample('welcome');
      } else {
        renderMenu();
      }
    }

    // ---- Upload flow ----
    var MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB
    function handleUpload(file) {
      if (!file) return;
      if (file.size > MAX_UPLOAD_BYTES) {
        alert((CURRENT_LANG === 'zh' ? '文件过大，请选择小于 2 MB 的文本文件。' : 'File too large. Please pick a text file under 2 MB.'));
        return;
      }
      var reader = new FileReader();
      reader.onload = function() {
        var text = typeof reader.result === 'string' ? reader.result : '';
        var entry = addUserDoc(file.name, text);
        switchExample(entry.id);
      };
      reader.onerror = function() {
        alert(CURRENT_LANG === 'zh' ? '读取文件失败。' : 'Failed to read the file.');
      };
      reader.readAsText(file, 'utf-8');
    }
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        fileInput.value = ''; // allow re-selecting the same file
        fileInput.click();
      });
      fileInput.addEventListener('change', function() {
        var f = fileInput.files && fileInput.files[0];
        if (f) handleUpload(f);
        closeMenu();
      });
    }

    // ---- "New document…" flow ----
    // The UI splits the filename into an editable stem plus a locked
    // ".md" suffix (rendered as a non-interactive span in the wrap).
    // We strip a user-typed ".md"/".markdown" defensively so pastes
    // like "notes.md" don't end up as "notes.md.md".
    function stripMdSuffix(s) {
      return (s || '').replace(/\.(md|markdown)$/i, '');
    }
    // Visibility is animated: we unhide first, wait one frame so the
    // browser commits the initial (invisible) state, then flip the
    // is-open class to let the CSS transition run.
    var dialogCloseTimer = null;
    function openDialog() {
      if (!dialog) return;
      if (dialogCloseTimer) { clearTimeout(dialogCloseTimer); dialogCloseTimer = null; }
      dialog.hidden = false;
      dialogInput.value = 'untitled';
      dialogInput.setAttribute('placeholder', 'untitled');
      // rAF pair: the first tick mounts the node in the "closed"
      // visual state, the second triggers the transition to "open".
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          dialog.classList.add('is-open');
        });
      });
      // Focus after the enter animation has started so the caret
      // doesn't jump in ahead of the panel.
      setTimeout(function() {
        dialogInput.focus();
        try { dialogInput.select(); } catch (_) {}
      }, 60);
    }
    function closeDialog() {
      if (!dialog || dialog.hidden) return;
      dialog.classList.remove('is-open');
      // Match the longest CSS transition (panel transform: 200ms).
      // Slight buffer so we don't clip the tail on slow frames.
      if (dialogCloseTimer) clearTimeout(dialogCloseTimer);
      dialogCloseTimer = setTimeout(function() {
        dialog.hidden = true;
        dialogCloseTimer = null;
      }, 220);
    }
    function commitDialog() {
      var stem = stripMdSuffix((dialogInput.value || '').trim());
      if (!stem) return; // treat empty as "cancel"
      var entry = addUserDoc(stem + '.md', '');
      closeDialog();
      switchExample(entry.id);
    }
    if (newBtn) {
      newBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeMenu();
        openDialog();
      });
    }
    if (dialogBackdrop) dialogBackdrop.addEventListener('click', closeDialog);
    if (dialogCancel)   dialogCancel.addEventListener('click', closeDialog);
    if (dialogOk)       dialogOk.addEventListener('click', commitDialog);
    if (dialogInput) {
      dialogInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); commitDialog(); }
        else if (e.key === 'Escape') { e.preventDefault(); closeDialog(); }
      });
    }

    // ---- Delegated clicks: row switch + delete ----
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });
    menu.addEventListener('click', function(e) {
      // Delete button takes precedence (it sits inside a row).
      var delBtn = e.target.closest && e.target.closest('.example-dropdown-item-delete');
      if (delBtn) {
        e.stopPropagation();
        var delId = delBtn.getAttribute('data-delete-id');
        if (delId) removeUserDoc(delId);
        return;
      }
      var item = e.target.closest && e.target.closest('.example-dropdown-item');
      if (!item) return;
      e.stopPropagation();
      var id = item.getAttribute('data-example-id');
      if (id) switchExample(id);
    });
    // Outside click closes — except when the click is the editor-
    // panel collapse/expand toggle. In narrow (stacked) layout the
    // user may want to fold the editor panel down while keeping the
    // file-picker dropdown open, so we exempt that one button from
    // the usual outside-click close.
    document.addEventListener('click', function(e) {
      if (wrap.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.editor-toggle')) return;
      closeMenu();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (!dialog.hidden) closeDialog();
        else closeMenu();
      }
    });

    // Language-switch hook — re-render so item labels / action strings
    // track the new locale.
    var prevSyncI18n = window.__syncExampleLabel;
    window.__syncExampleLabel = function() {
      syncLabel();
      if (typeof prevSyncI18n === 'function') prevSyncI18n();
    };

    // Initial render.
    renderMenu();
    syncLabel();
  })();

  // ===== Image export (long-screenshot PNG via html-to-image) =====
  // Renders the currently-targeted .markdown-body to a PNG. For long
  // documents we slice the DOM vertically into multiple screenshots
  // (hard canvas size caps on iOS Safari / very long renders on
  // desktop), each suffixed with `-1.png`, `-2.png`, …
  (function() {
    var exportBtn    = document.getElementById('export-image-btn');
    var dialog       = document.getElementById('export-image-dialog');
    var backdrop     = document.getElementById('export-image-dialog-backdrop');
    var nameInput    = document.getElementById('export-image-dialog-name');
    var dprGroup     = document.getElementById('export-image-dialog-dpr');
    var statusEl     = document.getElementById('export-image-dialog-status');
    var cancelBtn    = document.getElementById('export-image-dialog-cancel');
    var okBtn        = document.getElementById('export-image-dialog-ok');
    if (!exportBtn || !dialog || !nameInput || !okBtn) return;

    var dialogCloseTimer = null;
    var currentDpr = 3;
    var isExporting = false;
    // Cached reference to the label span inside the primary button
    // so we can swap it for a compact "n / total" progress string
    // during multi-segment exports without reaching into the DOM
    // every time.
    var okLabelEl = okBtn && okBtn.querySelector('.export-image-dialog-btn-label');
    var okDefaultLabel = okLabelEl ? okLabelEl.textContent : 'Export';

    // ---- Helpers ----
    function stripExt(name) {
      return (name || '').replace(/\.(png|jpg|jpeg|webp|gif|md|markdown|txt)$/i, '');
    }
    function currentDocStem() {
      // Derive from the current example's filename so the image name
      // matches whatever doc the user is viewing (built-in or user).
      try {
        var ex = currentExample();
        var fn = (ex && ex.filename) || 'WeMarkdown.md';
        return stripExt(fn);
      } catch (_) {
        return 'WeMarkdown';
      }
    }
    function getTargetMarkdownBody() {
      // Resolve the .preview-card element (the chat bubble + ambient
      // background, but WITHOUT the virtual-screen's rounded glass
      // frame). This is the layer the user expects in the exported
      // image: the bubble and its surrounding wash, nothing else.
      // Falls back to the primary preview-card when multi-screen
      // plumbing isn't available.
      try {
        var container = document.getElementById('screens-container');
        if (container) {
          var cards = container.querySelectorAll('.preview-card');
          var idx = (window.__screens && window.__screens.getEditTargetIndex)
            ? window.__screens.getEditTargetIndex() : 0;
          if (cards[idx]) return cards[idx];
          if (cards[0]) return cards[0];
        }
      } catch (_) {}
      return document.getElementById('preview-card');
    }
    // Resolve the effective background color of the markdown-body by
    // walking up ancestors until we hit a non-transparent background
    // (the virtual-screen background in chats mode, card-bg in files,
    // etc.). Baked into the PNG so the image reads like a real
    // screenshot of the bubble surface.
    function resolveBgColor(el) {
      var node = el;
      while (node && node !== document.documentElement) {
        var cs = window.getComputedStyle(node);
        var bg = cs.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg;
        }
        node = node.parentElement;
      }
      return '#ffffff';
    }

    // ---- Dialog open/close (mirrors new-doc dialog animation) ----
    function openDialog() {
      if (!dialog) return;
      if (dialogCloseTimer) { clearTimeout(dialogCloseTimer); dialogCloseTimer = null; }
      dialog.hidden = false;
      nameInput.value = currentDocStem();
      statusEl.textContent = '';
      statusEl.classList.remove('is-error');
      setDpr(currentDpr);
      isExporting = false;
      setLoading(false);
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          dialog.classList.add('is-open');
        });
      });
      setTimeout(function() {
        nameInput.focus();
        // Do NOT auto-select the text: the default (current doc
        // name) is usually what the user wants to keep. Place the
        // caret at the end so any typing appends without clobbering.
        try {
          var len = nameInput.value.length;
          nameInput.setSelectionRange(len, len);
        } catch (_) {}
      }, 60);
    }
    function closeDialog() {
      if (!dialog || dialog.hidden) return;
      if (isExporting) return; // don't close mid-export
      dialog.classList.remove('is-open');
      if (dialogCloseTimer) clearTimeout(dialogCloseTimer);
      dialogCloseTimer = setTimeout(function() {
        dialog.hidden = true;
        dialogCloseTimer = null;
      }, 220);
    }

    // ---- DPR segmented control ----
    function setDpr(n) {
      currentDpr = n;
      var btns = dprGroup.querySelectorAll('.export-image-dialog-dpr-btn');
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle('active', parseInt(btns[i].getAttribute('data-dpr'), 10) === n);
      }
    }
    dprGroup.addEventListener('click', function(e) {
      var b = e.target.closest && e.target.closest('.export-image-dialog-dpr-btn');
      if (!b) return;
      var n = parseInt(b.getAttribute('data-dpr'), 10);
      if (!isNaN(n)) setDpr(n);
    });

    // ---- Export pipeline ----
    // Chromium canvas hard cap (and practical memory cap on mobile):
    // safest slice height in rendered-CSS pixels. The actual canvas
    // height will be this * DPR, so we keep it well under 16384.
    var SLICE_HEIGHT = 4000;
    function setStatus(text, isErr) {
      statusEl.textContent = text || '';
      statusEl.classList.toggle('is-error', !!isErr);
    }
    // Toggle the primary button between idle / loading state.
    // Loading state renders, INSIDE the button:
    //   [spinner]   (label text cleared; only the spinner shows)
    // We clear the label text (JS) + show the spinner (CSS via
    // `is-loading`). JS also locks the button's pre-loading width
    // so the button doesn't collapse as the label empties out.
    // Also locks every other interactive surface in the dialog.
    function setLoading(on) {
      if (!okBtn) return;
      if (on) {
        // Lock width so the button keeps its "Export" / "导出"
        // footprint while the label is empty.
        var w = okBtn.getBoundingClientRect().width;
        if (w > 0) okBtn.style.width = w + 'px';
        if (okLabelEl) okLabelEl.textContent = '';
      } else {
        okBtn.style.width = '';
        if (okLabelEl) okLabelEl.textContent = okDefaultLabel;
      }
      okBtn.classList.toggle('is-loading', !!on);
      okBtn.disabled = !!on;
      if (cancelBtn) cancelBtn.disabled = !!on;
      if (nameInput) nameInput.disabled = !!on;
      var dprBtns = dprGroup.querySelectorAll('.export-image-dialog-dpr-btn');
      for (var i = 0; i < dprBtns.length; i++) dprBtns[i].disabled = !!on;
    }
    function triggerDownload(dataUrl, filename) {
      var a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function(){ a.parentNode && a.parentNode.removeChild(a); }, 0);
    }

    // Wait until the next paint so any layout reflow induced by our
    // temporary DOM tweaks (e.g. removing inspector highlights) has
    // settled before the screenshot runs.
    function nextFrame() {
      return new Promise(function(resolve) {
        requestAnimationFrame(function() {
          requestAnimationFrame(function() { resolve(); });
        });
      });
    }

    // Strip Inspector highlight classes so the exported image doesn't
    // carry debugging outlines; remember what we removed so we can
    // restore on exit.
    function stripInspectorHighlights(root) {
      var removed = [];
      root.querySelectorAll('.inspector-highlight').forEach(function(el) {
        el.classList.remove('inspector-highlight');
        removed.push([el, 'inspector-highlight']);
      });
      root.querySelectorAll('.inspector-block-outline').forEach(function(el) {
        el.classList.remove('inspector-block-outline');
        removed.push([el, 'inspector-block-outline']);
      });
      return function restore() {
        for (var i = 0; i < removed.length; i++) {
          removed[i][0].classList.add(removed[i][1]);
        }
      };
    }

    async function exportImage() {
      if (isExporting) return;
      if (typeof window.htmlToImage === 'undefined') {
        setStatus(t('ui.exportImageFailed') + ': html-to-image not loaded', true);
        return;
      }
      var stem = (nameInput.value || '').trim();
      stem = stripExt(stem);
      if (!stem) stem = currentDocStem() || 'WeMarkdown';

      var el = getTargetMarkdownBody();
      if (!el) {
        setStatus(t('ui.exportImageFailed'), true);
        return;
      }

      isExporting = true;
      setLoading(true);
      setStatus(''); // clear any previous terminal message

      var restoreHighlight = stripInspectorHighlights(el);

      // Temporarily un-clip every ancestor up to `.preview-bg` so the
      // long screenshot isn't truncated by any `overflow:hidden` /
      // fixed height clamp in the chain (preview-card → preview-outer
      // → screen-wrap → screens-container → preview-outer-wrap →
      // preview-bg). Snapshot + restore on exit.
      var overflowPatches = [];
      function patchOverflow(node) {
        if (!node) return;
        overflowPatches.push({
          node: node,
          overflow: node.style.overflow,
          height: node.style.height,
          maxHeight: node.style.maxHeight,
        });
        node.style.overflow = 'visible';
        node.style.height = 'auto';
        node.style.maxHeight = 'none';
      }
      var patchStop = document.getElementById('preview-bg');
      var cur = el;
      while (cur && cur !== patchStop) {
        patchOverflow(cur);
        cur = cur.parentElement;
      }
      function restoreOverflow() {
        for (var i = 0; i < overflowPatches.length; i++) {
          var p = overflowPatches[i];
          p.node.style.overflow = p.overflow;
          p.node.style.height = p.height;
          p.node.style.maxHeight = p.maxHeight;
        }
      }

      try {
        // Wait for fonts so glyphs don't fall back to a system font
        // inside the rendered bitmap.
        if (document.fonts && document.fonts.ready) {
          try { await document.fonts.ready; } catch (_) {}
        }
        await nextFrame();

        var bgColor = resolveBgColor(el);
        var rect = el.getBoundingClientRect();
        var totalHeight = el.scrollHeight || rect.height;
        var width = el.offsetWidth || rect.width;

        // Decide single vs. multi-segment export.
        if (totalHeight <= SLICE_HEIGHT) {
          var dataUrl = await window.htmlToImage.toPng(el, {
            pixelRatio: currentDpr,
            backgroundColor: bgColor,
            cacheBust: true,
            skipAutoScale: true,
          });
          triggerDownload(dataUrl, stem + '.png');
        } else {
          // Slice by setting viewport clipping via the html-to-image
          // `width`/`height` + absolute positioning. The cleanest way
          // without deep-cloning: render N slices by wrapping the
          // target in a temporary viewport div.
          var numSlices = Math.ceil(totalHeight / SLICE_HEIGHT);
          for (var i = 0; i < numSlices; i++) {
            var sliceTop = i * SLICE_HEIGHT;
            var sliceH   = Math.min(SLICE_HEIGHT, totalHeight - sliceTop);
            // Keep the button label constant ("Exporting…") across
            // every slice — progress-per-slice noise was more
            // distracting than informative. The spinner already
            // conveys "work in flight".
            setLoading(true);
            // html-to-image supports `style` overrides that get merged
            // onto the cloned node. We offset the clone upwards by
            // sliceTop and clip via the outer container's fixed height.
            var sliceUrl = await window.htmlToImage.toPng(el, {
              pixelRatio: currentDpr,
              backgroundColor: bgColor,
              cacheBust: true,
              skipAutoScale: true,
              width: width,
              height: sliceH,
              canvasWidth: Math.round(width * currentDpr),
              canvasHeight: Math.round(sliceH * currentDpr),
              style: {
                transform: 'translateY(' + (-sliceTop) + 'px)',
                transformOrigin: 'top left',
                // Make the cloned element's own size equal to the
                // full content height so the translate positions
                // things correctly within the clipped window.
                height: totalHeight + 'px',
              },
            });
            triggerDownload(sliceUrl, stem + '-' + (i + 1) + '.png');
            // Small yield so the browser can flush the download
            // dialog before the next render kicks in.
            await new Promise(function(r){ setTimeout(r, 50); });
          }
        }

        setStatus(t('ui.exportImageDone'));
        // Release the lock before auto-closing so the close animation
        // can actually run (closeDialog short-circuits while
        // isExporting is true).
        isExporting = false;
        setLoading(false);
        setTimeout(function() {
          if (dialog && !dialog.hidden) closeDialog();
        }, 600);
      } catch (err) {
        setStatus(t('ui.exportImageFailed') + ': ' + ((err && err.message) || err), true);
        isExporting = false;
        setLoading(false);
      } finally {
        restoreHighlight();
        restoreOverflow();
      }
    }

    // ---- Wire events ----
    exportBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      openDialog();
    });
    if (backdrop) backdrop.addEventListener('click', closeDialog);
    if (cancelBtn) cancelBtn.addEventListener('click', closeDialog);
    if (okBtn) okBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      exportImage();
    });
    if (nameInput) {
      nameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); exportImage(); }
        else if (e.key === 'Escape') { e.preventDefault(); closeDialog(); }
      });
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && dialog && !dialog.hidden && !isExporting) {
        closeDialog();
      }
    });
  })();

  // ===== Multi virtual-screen support =====
  // The preview panel hosts a row of virtual screens. Each screen is:
  //   .screen-wrap       (width source; holds the badge)
  //     .preview-outer   (rounded body; overflow:hidden for corner clip)
  //     .screen-badge    (number 1/2/3; hover on extras shows × to close)
  // Up to 3 screens total (primary + 2 extras).
  //
  // Settings: the single header-right gear stays as the entry point. It
  // always targets ONE specific screen (the "edit target"). The user can
  // change targets by clicking any screen (which also brings Settings in
  // if it isn't already open, only when multi-screen). The choice is
  // remembered across open/close.
  //
  // Scrolling and sizing are kept in sync across all screens.
  (function() {
    var outerRow = document.getElementById('preview-outer-row');
    if (!outerRow) return;
    var screensContainerEl = document.getElementById('screens-container');
    if (!screensContainerEl) return;

    // Which wrap the Settings panel is currently targeting. Starts as the
    // primary; updated when the user clicks a different screen.
    var editTargetIndex = 0; // array index into getWraps()

    function getWraps() {
      return Array.prototype.slice.call(screensContainerEl.querySelectorAll('.screen-wrap'));
    }
    function getTargetWrap() {
      var w = getWraps();
      if (w.length === 0) return null;
      if (editTargetIndex >= w.length) editTargetIndex = 0;
      return w[editTargetIndex];
    }

    // Rebuild badge numbers & data-screen-count on the row; toggle
    // body.multi-screen.
    function refreshScreens() {
      var wraps = getWraps();
      var n = wraps.length;
      outerRow.setAttribute('data-screen-count', String(n));
      if (n >= 3) outerRow.setAttribute('data-at-max', '1');
      else outerRow.removeAttribute('data-at-max');
      document.body.classList.toggle('multi-screen', n > 1);
      wraps.forEach(function(w, i) {
        var idx = i + 1;
        w.setAttribute('data-screen-index', String(idx));
        var outer = w.querySelector('.preview-outer');
        if (outer) outer.setAttribute('data-screen-index', String(idx));
        var badge = w.querySelector('.screen-badge-num');
        if (badge) badge.textContent = String(idx);
      });
      applyFocus();
    }

    // Mirror the primary preview's HTML into extra screens.
    syncSecondaryPreviews = function() {
      var primaryBody = document.getElementById('preview');
      if (!primaryBody) return;
      var wraps = getWraps();
      for (var i = 1; i < wraps.length; i++) {
        var body = wraps[i].querySelector('.markdown-body');
        if (!body) continue;
        body.innerHTML = primaryBody.innerHTML;
        // Re-attach scroll-shadow handlers + table max-width on the
        // cloned body so code/formula/table scrolling produces the
        // same gradient masks as the primary screen.
        if (typeof postProcessClonedBody === 'function') {
          postProcessClonedBody(body);
        }
      }
      // Re-sync scroll positions after content reflows.
      resyncScrollFromPrimary();
    };

    // Apply focused state on the currently-edited wrap when Settings is
    // open. When Settings is closed, no wrap is marked focused.
    function applyFocus() {
      var wraps = getWraps();
      wraps.forEach(function(w) {
        w.classList.remove('screen-focused');
        var outer = w.querySelector('.preview-outer');
        if (outer) outer.classList.remove('screen-focused');
      });
      if (inspectorPanel.classList.contains('collapsed')) return;
      if (wraps.length < 2) return; // single-screen: no focus marker
      var t = getTargetWrap();
      if (t) {
        t.classList.add('screen-focused');
        var o = t.querySelector('.preview-outer');
        if (o) o.classList.add('screen-focused');
      }
    }

    // Update Settings title to reference the current target screen.
    // Only applies when the Inspector is currently showing the Settings
    // view; when it's showing element details (Inspector view), we
    // leave its title alone.
    function updateSettingsTitle() {
      var titleEl = document.getElementById('inspector-title');
      if (!titleEl) return;
      var elInfo = document.getElementById('inspector-element');
      if (elInfo && elInfo.style.display !== 'none') return; // element view
      var wraps = getWraps();
      var base = (typeof t === 'function') ? t('settings.title') : 'Settings';
      var screenWord = (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'zh')
        ? '屏幕' : 'Screen';
      if (wraps.length < 2) {
        titleEl.textContent = base;
        return;
      }
      titleEl.textContent = base + ' · ' + screenWord + ' ' + (editTargetIndex + 1);
    }

    // Set the edit target index and refresh visual state.
    function setEditTarget(i) {
      var wraps = getWraps();
      if (i < 0 || i >= wraps.length) return;
      editTargetIndex = i;
      applyFocus();
      updateSettingsTitle();
      // Refresh Settings inputs to reflect the new target screen's values.
      if (typeof window.__refreshInspectorFromScope === 'function') {
        window.__refreshInspectorFromScope();
      }
    }

    // Wire per-screen interactions (badge hover-to-close, click-to-focus).
    function wireScreen(wrap) {
      var badge = wrap.querySelector('.screen-badge');
      if (badge) {
        badge.addEventListener('click', function(e) {
          e.stopPropagation();
          // When the Settings panel is open, the badge acts purely as
          // an edit-target selector for that virtual screen — removal
          // is suppressed (the × hover affordance is also hidden via
          // CSS keyed on body.settings-open). Rationale: while editing
          // per-screen settings, an accidental click on the badge used
          // to destroy the very screen the user was configuring.
          var settingsOpen = !inspectorPanel.classList.contains('collapsed');
          if (settingsOpen) {
            var wrapsNow = getWraps();
            var idx = wrapsNow.indexOf(wrap);
            if (idx !== -1) setEditTarget(idx);
            return;
          }
          // Settings closed: fall back to original "click to close this
          // screen" behavior. removeScreen() still enforces that at
          // least one screen remains.
          removeScreen(wrap);
        });
      }
      // Clicking anywhere in the screen (outer body) switches the
      // Settings edit target when in multi-screen mode. We listen on the
      // preview-outer so clicks on the rendered content also count.
      var outer = wrap.querySelector('.preview-outer');
      if (outer) {
        outer.addEventListener('mousedown', function() {
          var wraps = getWraps();
          if (wraps.length < 2) return;
          var idx = wraps.indexOf(wrap);
          if (idx === -1) return;
          setEditTarget(idx);
        });
      }
    }

    // Apply the editor-hidden state: in multi-screen mode, opening
    // Settings slides the editor column out to the left; closing it
    // brings the editor back.
    function applyEditorHidden() {
      var containerEl = document.querySelector('.editor-container');
      var multi = document.body.classList.contains('multi-screen');
      var settingsOpen = !inspectorPanel.classList.contains('collapsed');
      var hide = multi && settingsOpen;
      if (hide) {
        editorPanel.classList.add('editor-hidden');
        if (containerEl) containerEl.classList.add('editor-hidden-mode');
      } else {
        editorPanel.classList.remove('editor-hidden');
        if (containerEl) containerEl.classList.remove('editor-hidden-mode');
      }
    }

    // Mirror the inspector panel's collapsed state onto body as
    // `settings-open`. Lets CSS suppress affordances (notably the
    // screen-badge hover × icon) while Settings is open without any
    // JS-side toggling at hover time.
    function applySettingsOpenFlag() {
      if (inspectorPanel.classList.contains('collapsed')) {
        document.body.classList.remove('settings-open');
      } else {
        document.body.classList.add('settings-open');
      }
    }

    // Observe inspector open/close to update focus outlines + editor
    // slide-out state.
    new MutationObserver(function() {
      applyFocus();
      updateSettingsTitle();
      applyEditorHidden();
      applySettingsOpenFlag();
    }).observe(inspectorPanel, {attributes:true, attributeFilter:['class']});
    // Initial sync so the flag reflects the panel's current state on
    // load (the panel starts collapsed, but be explicit).
    applySettingsOpenFlag();
    // Also react to body.multi-screen being toggled (add/remove screen)
    // so that the editor-hidden state stays in sync when transitioning
    // between single- and multi-screen with Settings already open.
    new MutationObserver(function() {
      applyEditorHidden();
    }).observe(document.body, {attributes:true, attributeFilter:['class']});

    // Add a new virtual screen (max 3 total). Grows the screens
    // container so every existing screen keeps its current size and
    // the new screen takes the same width at the tail end.
    function addScreen() {
      var wraps = getWraps();
      if (wraps.length >= 3) return;
      if (isMobileLayout()) return;
      var tmpl = wraps[0];
      if (!tmpl) return;
      // Snapshot per-screen width BEFORE insertion so we can grow the
      // container by the same amount afterwards. A screen currently
      // measures at container / count (minus gaps), so grabbing one
      // child's offsetWidth here is reliable.
      var oldPerScreen = tmpl.getBoundingClientRect().width;
      var clone = tmpl.cloneNode(true);
      clone.querySelectorAll('[id]').forEach(function(n) { n.removeAttribute('id'); });
      clone.removeAttribute('id');
      var cloneBody = clone.querySelector('.markdown-body');
      if (cloneBody) { cloneBody.innerHTML = ''; cloneBody.removeAttribute('id'); }
      clone.style.width = '';
      clone.classList.remove('screen-focused');
      var cloneOuter = clone.querySelector('.preview-outer');
      if (cloneOuter) cloneOuter.classList.remove('screen-focused');
      screensContainerEl.appendChild(clone);
      wireScreen(clone);
      // Grow the container to preserve per-screen width: new total =
      // oldPerScreen * newCount + gaps.
      var newCount = getWraps().length;
      var newTotal = oldPerScreen * newCount + SCREEN_GAP * (newCount - 1);
      setScreensContainerWidth(newTotal);
      refreshScreens();
      syncSecondaryPreviews();
      setupScrollSync();
      if (typeof renderMarkdown === 'function') renderMarkdown();
    }

    // Snapshot every CSS custom property override living on a wrap's
    // inline style — these are the per-screen Settings overrides that
    // the user has configured.
    function snapshotWrapVars(wrap) {
      var vars = {};
      if (!wrap || !wrap.style) return vars;
      for (var i = 0; i < wrap.style.length; i++) {
        var name = wrap.style[i];
        if (name && name.indexOf('--') === 0) {
          vars[name] = wrap.style.getPropertyValue(name);
        }
      }
      return vars;
    }
    function restoreWrapVars(wrap, vars) {
      if (!wrap || !wrap.style) return;
      // Clear existing CSS-var overrides first so the wrap starts clean.
      for (var i = wrap.style.length - 1; i >= 0; i--) {
        var name = wrap.style[i];
        if (name && name.indexOf('--') === 0) {
          wrap.style.removeProperty(name);
        }
      }
      Object.keys(vars).forEach(function(k) {
        wrap.style.setProperty(k, vars[k]);
      });
    }

    // Remove a wrap. The primary wrap hosts DOM nodes referenced by id
    // (#preview, #preview-outer, #preview-card) so it can't be
    // physically removed — but its Settings identity (CSS variable
    // overrides) is interchangeable with any other wrap's identity.
    // Strategy: compute the surviving-screen identities by removing
    // the clicked wrap's index from the snapshot array, then reassign
    // the snapshots (in order) to the DOM wraps that will remain, and
    // finally detach the tail wraps to match the new count.
    function removeScreen(wrap) {
      var wraps = getWraps();
      if (wraps.length <= 1) return; // always keep at least one screen
      var idxTarget = wraps.indexOf(wrap);
      if (idxTarget === -1) return;

      // 1. Snapshot every current wrap's CSS-var overrides in order.
      var snapshots = wraps.map(snapshotWrapVars);
      // 2. Drop the one the user clicked, yielding the list of
      //    identities that should persist.
      snapshots.splice(idxTarget, 1);

      // 3. Detach the necessary number of tail wraps (keep primary DOM).
      var oldPerScreen = wraps[0].getBoundingClientRect().width;
      var domWraps = wraps.slice(); // will shrink as we detach
      while (domWraps.length > snapshots.length) {
        var tail = domWraps.pop();
        if (tail && tail.parentNode) tail.parentNode.removeChild(tail);
      }

      // 4. Re-apply the surviving snapshots in order to the remaining
      //    DOM wraps. This is where a user who closed the primary
      //    effectively "promotes" a secondary's parameters onto the
      //    primary DOM node.
      for (var i = 0; i < domWraps.length; i++) {
        restoreWrapVars(domWraps[i], snapshots[i] || {});
      }

      // 5. Translate the edit target to its new index. The surviving
      //    snapshot list collapsed around idxTarget, so any index
      //    greater than the target shifts down by one; the target
      //    itself falls back to 0 (it was the one being removed).
      if (editTargetIndex === idxTarget) editTargetIndex = 0;
      else if (editTargetIndex > idxTarget) editTargetIndex -= 1;
      if (editTargetIndex >= domWraps.length) editTargetIndex = 0;

      // 6. Recompute width so remaining screens keep their per-screen
      //    size.
      var newCount = getWraps().length;
      var newTotal = oldPerScreen * newCount + SCREEN_GAP * Math.max(0, newCount - 1);
      setScreensContainerWidth(newTotal);

      refreshScreens();
      setupScrollSync();
      applyFocus();
      updateSettingsTitle();
      // Refresh Settings inputs if open so the panel reflects the new
      // target's values.
      if (typeof window.__refreshInspectorFromScope === 'function') {
        window.__refreshInspectorFromScope();
      }
    }

    // ----- Scroll sync (preview screens + editor) -----
    // Scroll position is propagated as a ratio rather than raw px so the
    // editor (with its tiny monospace line-height) stays in sync with
    // the preview screens (whose content is much taller). The editor
    // drives rendering and vice-versa, clamped to their own scrollable
    // ranges.
    var _syncing = false;
    function getScrollers() {
      return Array.prototype.slice.call(outerRow.querySelectorAll('.preview-card'));
    }
    function scrollableHeight(el) {
      return Math.max(0, el.scrollHeight - el.clientHeight);
    }
    function syncScrollFrom(source) {
      var ratio = scrollableHeight(source) > 0
        ? source.scrollTop / scrollableHeight(source)
        : 0;
      var targets = getScrollers();
      var editorEl = document.getElementById('editor');
      if (editorEl && editorEl !== source) targets.push(editorEl);
      _syncing = true;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i] === source) continue;
        var t = targets[i];
        t.scrollTop = Math.round(scrollableHeight(t) * ratio);
        // Horizontal scroll doesn't really apply to editor/markdown at
        // the same scale; only propagate between preview cards.
        if (t !== editorEl && source !== editorEl) {
          t.scrollLeft = source.scrollLeft;
        }
      }
      _syncing = false;
    }
    function resyncScrollFromPrimary() {
      var list = getScrollers();
      if (list.length === 0) return;
      syncScrollFrom(list[0]);
    }
    function onScrollerScroll(ev) {
      if (_syncing) return;
      syncScrollFrom(ev.currentTarget);
    }
    function setupScrollSync() {
      var list = getScrollers();
      list.forEach(function(el) {
        if (el.__scrollSyncBound) return;
        el.addEventListener('scroll', onScrollerScroll, {passive:true});
        el.__scrollSyncBound = true;
      });
      var editorEl = document.getElementById('editor');
      if (editorEl && !editorEl.__scrollSyncBound) {
        editorEl.addEventListener('scroll', onScrollerScroll, {passive:true});
        editorEl.__scrollSyncBound = true;
      }
    }

    // Wire primary + "+" button + responsive behaviour.
    var wrapsInit = getWraps();
    wrapsInit.forEach(wireScreen);
    refreshScreens();
    // Seed the container to the single-screen default. resetOuterWidth
    // handles recomputes when screen count changes.
    if (typeof setScreensContainerWidth === 'function') {
      setScreensContainerWidth(computeDefaultContainerWidth());
    }
    setupScrollSync();

    var addBtn = document.getElementById('screen-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        addScreen();
      });
      // Prevent the mousedown inside the grabber from initiating a drag
      // on the underlying handle when the user aims at the "+" button.
      addBtn.addEventListener('mousedown', function(e) { e.stopPropagation(); });
      addBtn.addEventListener('touchstart', function(e) { e.stopPropagation(); }, {passive:true});
    }

    // Mobile layout fallback: auto-remove extra screens.
    window.addEventListener('resize', function() {
      if (isMobileLayout()) {
        var w = getWraps();
        for (var i = w.length - 1; i >= 1; i--) {
          if (w[i].parentNode) w[i].parentNode.removeChild(w[i]);
        }
        editTargetIndex = 0;
        refreshScreens();
        setupScrollSync();
        if (typeof setScreensContainerWidth === 'function') {
          setScreensContainerWidth(computeDefaultContainerWidth());
        }
      }
    });

    // Public API for debugging / integration.
    window.__screens = {
      getWraps: getWraps,
      refresh: refreshScreens,
      setEditTarget: setEditTarget,
      getEditTargetIndex: function() { return editTargetIndex; },
      updateSettingsTitle: updateSettingsTitle,
      applyEditorHidden: applyEditorHidden,
    };
  })();
})();
