(function () {
  'use strict';

  var editor = document.getElementById('editor');
  var lineNumbers = document.getElementById('line-numbers');
  var preview = document.getElementById('preview');
  var previewBg = document.getElementById('preview-bg');
  var previewCard = document.getElementById('preview-card');
  var handleLeft = document.getElementById('card-handle-left');
  var handleRight = document.getElementById('card-handle-right');
  var widthLabel = document.getElementById('width-label');
  var charCount = document.getElementById('char-count');
  var divider = document.getElementById('divider');
  var themeToggle = document.getElementById('theme-toggle');
  var toastEl = document.getElementById('toast');
  var inspectorContent = document.getElementById('inspector-content');

  var isDragging = false;

  marked.setOptions({ breaks: true, gfm: true });

  function renderLatex() {
    var blocks = preview.querySelectorAll('p, li');
    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i];
      var html = el.innerHTML;
      html = html.replace(/\$\$([^$]+?)\$\$/g, function(_, tex) {
        try {
          return '<div class="katex-display">' + katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }) + '</div>';
        } catch(e) { return _; }
      });
      html = html.replace(/\$([^$\n]+?)\$/g, function(_, tex) {
        try {
          return '<span class="katex-inline">' + katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }) + '</span>';
        } catch(e) { return _; }
      });
      el.innerHTML = html;
    }
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
    wrapTables();
    updateTableMaxWidth();
    adjustListWidths();
  }

  function adjustListWidths() {
    var oneDigit = '1.2em';
    var twoDigit = '1.8em';
    var threeDigit = '2.4em';

    var ols = preview.querySelectorAll('ol');
    for (var i = 0; i < ols.length; i++) {
      var ol = ols[i];
      var count = 0;
      var children = ol.children;
      for (var c = 0; c < children.length; c++) {
        if (children[c].tagName === 'LI') count++;
      }
      var numWidth;
      if (count >= 100) numWidth = threeDigit;
      else if (count >= 10) numWidth = twoDigit;
      else numWidth = oneDigit;
      ol.style.setProperty('--ol-num-width', numWidth);
    }

    var allLists = preview.querySelectorAll('ul, ol');
    for (var j = 0; j < allLists.length; j++) {
      var list = allLists[j];
      if (list.tagName === 'UL') {
        var sibling = list.previousElementSibling;
        while (sibling && sibling.tagName !== 'OL' && sibling.tagName !== 'UL') {
          sibling = sibling.previousElementSibling;
        }
        var nextSib = list.nextElementSibling;
        while (nextSib && nextSib.tagName !== 'OL' && nextSib.tagName !== 'UL') {
          nextSib = nextSib.nextElementSibling;
        }
        var adjacentOl = null;
        if (sibling && sibling.tagName === 'OL') adjacentOl = sibling;
        else if (nextSib && nextSib.tagName === 'OL') adjacentOl = nextSib;

        if (adjacentOl) {
          var olWidth = adjacentOl.style.getPropertyValue('--ol-num-width') || oneDigit;
          list.style.setProperty('--ul-bullet-width', olWidth);
        } else {
          list.style.setProperty('--ul-bullet-width', oneDigit);
        }

        var parentLi = list.parentElement;
        if (parentLi && parentLi.tagName === 'LI') {
          var parentList = parentLi.parentElement;
          if (parentList && parentList.tagName === 'OL') {
            var pw = parentList.style.getPropertyValue('--ol-num-width') || oneDigit;
            list.style.setProperty('--ul-bullet-width', pw);
          }
        }
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
      checkTableShadow(wrapper, scroll);
      (function(w, s) {
        s.addEventListener('scroll', function() { checkTableShadow(w, s); });
      })(wrapper, scroll);
    }
  }

  function checkTableShadow(wrapper, scroll) {
    var sl = scroll.scrollLeft;
    var sw = scroll.scrollWidth;
    var cw = scroll.clientWidth;
    if (sl > 1) wrapper.classList.add('shadow-left');
    else wrapper.classList.remove('shadow-left');
    if (sw - sl - cw > 1) wrapper.classList.add('shadow-right');
    else wrapper.classList.remove('shadow-right');
  }

  function updateTableMaxWidth() {
    var w = previewCard.offsetWidth;
    var maxCol = Math.round(w * 0.667);
    var cells = preview.querySelectorAll('.table-wrapper th, .table-wrapper td, table th, table td');
    for (var i = 0; i < cells.length; i++) {
      cells[i].style.maxWidth = maxCol + 'px';
    }
    var wrappers = preview.querySelectorAll('.table-wrapper');
    for (var j = 0; j < wrappers.length; j++) {
      var scroll = wrappers[j].querySelector('.table-scroll');
      if (scroll) checkTableShadow(wrappers[j], scroll);
    }
  }

  function renderMarkdown() {
    var text = editor.value;
    preview.innerHTML = marked.parse(text);
    postProcess();
    updateCharCount(text);
    updateLineNumbers();
  }

  function updateCharCount(text) {
    charCount.textContent = text.length + ' chars \u00B7 ' + text.split('\n').length + ' lines';
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(function() { toastEl.classList.remove('show'); }, 2000);
  }

  function updateLineNumbers() {
    var lines = editor.value.split('\n').length;
    var html = '';
    for (var i = 1; i <= lines; i++) {
      html += '<span class="line-num" data-line="' + i + '">' +
        '<span class="source-arrow"><svg viewBox="0 0 6 8" fill="var(--accent)"><path d="M0 0 L6 4 L0 8 Z"/></svg></span>' +
        '<span class="num-text">' + i + '</span></span>';
    }
    lineNumbers.innerHTML = html;
    syncLineNumberScroll();
  }

  function syncLineNumberScroll() {
    lineNumbers.scrollTop = editor.scrollTop;
  }

  var renderTimer = null;
  editor.addEventListener('input', function() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderMarkdown, 30);
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

  var eSc = false, pSc = false;
  editor.addEventListener('scroll', function() {
    syncLineNumberScroll();
    if (pSc) return; eSc = true;
    var pct = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
    previewBg.scrollTop = pct * (previewBg.scrollHeight - previewBg.clientHeight);
    requestAnimationFrame(function() { eSc = false; });
  });
  previewBg.addEventListener('scroll', function() {
    if (eSc) return; pSc = true;
    var pct = previewBg.scrollTop / (previewBg.scrollHeight - previewBg.clientHeight || 1);
    editor.scrollTop = pct * (editor.scrollHeight - editor.clientHeight);
    requestAnimationFrame(function() { pSc = false; });
  });

  divider.addEventListener('mousedown', function(e) {
    e.preventDefault(); isDragging = true; divider.classList.add('active');
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);
  });
  function doDrag(e) {
    if (!isDragging) return;
    var rect = document.querySelector('.editor-container').getBoundingClientRect();
    var pct = ((e.clientX - rect.left) / rect.width) * 100;
    var c = Math.max(15, Math.min(70, pct));
    document.querySelector('.editor-panel').style.flex = '0 0 ' + c + '%';
  }
  function endDrag() {
    isDragging = false; divider.classList.remove('active');
    document.body.style.cursor = ''; document.body.style.userSelect = '';
    document.removeEventListener('mousemove', doDrag);
    document.removeEventListener('mouseup', endDrag);
  }

  var isCardDrag = false;
  function startCard(e) {
    e.preventDefault(); e.stopPropagation(); isCardDrag = true;
    document.body.style.cursor = 'ew-resize'; document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', doCard);
    document.addEventListener('mouseup', endCard);
  }
  handleLeft.addEventListener('mousedown', startCard);
  handleRight.addEventListener('mousedown', startCard);

  function doCard(e) {
    if (!isCardDrag) return;
    var bgRect = previewBg.getBoundingClientRect();
    var maxW = bgRect.width - 72;
    var center = bgRect.left + bgRect.width / 2;
    var half = Math.abs(e.clientX - center);
    var w = Math.max(160, Math.min(maxW, half * 2));
    previewCard.style.width = w + 'px';
    widthLabel.textContent = Math.round(w) + 'px';
    updateTableMaxWidth();
  }
  function endCard() {
    isCardDrag = false;
    document.body.style.cursor = ''; document.body.style.userSelect = '';
    document.removeEventListener('mousemove', doCard);
    document.removeEventListener('mouseup', endCard);
  }

  var sunIcon = themeToggle.querySelector('.sun-icon');
  var moonIcon = themeToggle.querySelector('.moon-icon');
  function setTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    sunIcon.style.display = dark ? 'none' : 'block';
    moonIcon.style.display = dark ? 'block' : 'none';
    document.getElementById('code-theme-light').disabled = dark;
    document.getElementById('code-theme-dark').disabled = !dark;
    localStorage.setItem('md-theme', dark ? 'dark' : 'light');
  }
  themeToggle.addEventListener('click', function() {
    setTheme(document.documentElement.getAttribute('data-theme') !== 'dark');
    renderMarkdown();
  });
  var saved = localStorage.getItem('md-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) setTheme(true);

  var highlightedEl = null;
  var activeLineNum = null;

  preview.addEventListener('click', function(e) {
    e.stopPropagation();
    if (e.target === preview) return;
    if (highlightedEl) highlightedEl.classList.remove('inspector-highlight');
    clearSourceArrow();
    e.target.classList.add('inspector-highlight');
    highlightedEl = e.target;
    showInspector(e.target);
    highlightSourceLine(e.target);
  });
  document.addEventListener('click', function(e) {
    if (!preview.contains(e.target)) {
      if (highlightedEl) { highlightedEl.classList.remove('inspector-highlight'); highlightedEl = null; }
      clearSourceArrow();
      inspectorContent.innerHTML = '<div class="inspector-placeholder">Click an element in the preview to inspect its styles</div>';
    }
  });

  function clearSourceArrow() {
    if (activeLineNum) { activeLineNum.classList.remove('active'); activeLineNum = null; }
  }

  function highlightSourceLine(el) {
    var text = el.textContent.trim();
    if (!text) return;
    var lines = editor.value.split('\n');
    var searchStr = text.substring(0, Math.min(30, text.length));
    var bestLine = -1;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf(searchStr) !== -1) { bestLine = i; break; }
    }
    if (bestLine === -1) {
      searchStr = text.substring(0, Math.min(10, text.length));
      for (var j = 0; j < lines.length; j++) {
        if (lines[j].indexOf(searchStr) !== -1) { bestLine = j; break; }
      }
    }
    if (bestLine >= 0) {
      var lineEl = lineNumbers.querySelector('.line-num[data-line="' + (bestLine + 1) + '"]');
      if (lineEl) {
        lineEl.classList.add('active');
        activeLineNum = lineEl;
      }
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
      ['padding', cs.padding],
      ['margin', cs.margin],
      ['border', cs.borderWidth !== '0px' ? cs.border : null],
      ['border-radius', cs.borderRadius !== '0px' ? cs.borderRadius : null]
    ]);
    h += sec('Display', [
      ['display', cs.display],
      ['position', cs.position !== 'static' ? cs.position : null],
      ['overflow', cs.overflow !== 'visible' ? cs.overflow : null]
    ]);
    inspectorContent.innerHTML = h;
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

  var defaultContent = [
    '# WeMarkdown Live Preview',
    '',
    'Welcome to **WeMarkdown**! Type Markdown on the left, see the rendered output on the right in real time. Supports GFM syntax, code highlighting (GitHub color scheme), LaTeX math formulas, and a style Inspector panel.',
    '',
    '---',
    '',
    '## Text Formatting',
    '',
    'This is a regular paragraph. Markdown supports various inline formats: **bold text**, *italic text*, ~~strikethrough~~, and inline code `const x = 42;`. You can also combine them, like ***bold italic***.',
    '',
    'A long inline code example: `this.is.a.very.long.inline.code.that.should.automatically.wrap.when.reaching.the.container.boundary.without.scrolling` which wraps automatically.',
    '',
    '## Heading Levels',
    '',
    '### H3 Heading \u2014 17px \u00B7 margin-top 4px',
    '#### H4 Heading \u2014 17px \u00B7 Semi-Bold',
    '##### H5 Heading \u2014 17px \u00B7 Semi-Bold',
    '###### H6 Heading \u2014 17px \u00B7 Semi-Bold',
    '',
    '## Code Highlighting (GitHub Theme)',
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
    '## LaTeX Math Formulas',
    '',
    'Inline formulas: the mass-energy equivalence $E = mc^2$, the Pythagorean theorem $a^2 + b^2 = c^2$.',
    '',
    'Block formulas:',
    '',
    '$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$',
    '',
    '$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$',
    '',
    '## Blockquote',
    '',
    '> Good design is as little design as possible.',
    '>',
    '> \u2014 Dieter Rams',
    '',
    '## Lists',
    '',
    '### Unordered List',
    '- Live preview \u2014 instant rendering',
    '- Dark / light theme toggle',
    '- Synchronized scrolling',
    '- Adjustable card width',
    '- Inspector style panel',
    '',
    '### Ordered List',
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
    '12. All text uses 140% line height',
    '',
    '### Unordered Nested in Unordered',
    '- Frontend Stack',
    '  - HTML / CSS / JavaScript',
    '  - React / Vue / Svelte',
    '  - Webpack / Vite / Rollup',
    '- Backend Stack',
    '  - Node.js / Deno / Bun',
    '  - Python / Go / Rust',
    '',
    '### Ordered Nested in Ordered',
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
    '### Ordered with Nested Unordered',
    '1. Breakfast Options',
    '   - Milk + cereal',
    '   - Coffee + sandwich',
    '   - Juice + toast',
    '2. Lunch Options',
    '   - Pasta',
    '   - Rice bowl',
    '   - Salad',
    '',
    '### Unordered with Nested Ordered',
    '- Study Plan',
    '  1. Read official documentation',
    '  2. Complete basic tutorials',
    '  3. Build a small project',
    '- Workout Plan',
    '  1. Warm up for 10 minutes',
    '  2. Run for 30 minutes',
    '  3. Stretch for 10 minutes',
    '',
    '### Task List',
    '- [x] Text layout parameters',
    '- [x] Code highlighting \u2014 GitHub theme',
    '- [x] LaTeX formula rendering',
    '- [x] Dark mode',
    '- [ ] Export to PDF',
    '',
    '## Table',
    '',
    '| Property | Light Mode | Dark Mode |',
    '|----------|------------|-----------|',
    '| Body font size | 17px | 17px |',
    '| Line height | 140% | 140% |',
    '| Preview background | #F0F0F4 | #18181B |',
    '| Card background | #FFFFFF | #252528 |',
    '| Inline code bg | rgba(0,0,0,0.05) | rgba(255,255,255,0.1) |',
    '| Separator color | rgba(0,0,0,0.15) | rgba(255,255,255,0.15) |',
    '',
    '---',
    '',
    '> **Tip**: Click any element in the preview area to inspect its full style parameters in the Inspector panel on the right.'
  ].join('\n');

  editor.value = defaultContent;
  renderMarkdown();
})();
