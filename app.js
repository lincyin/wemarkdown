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

  // ===== marked =====
  marked.setOptions({ breaks: true, gfm: true });

  // ===== LaTeX 渲染 =====
  function renderLatex() {
    // 块级公式 $$...$$
    var blocks = preview.querySelectorAll('p, li');
    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i];
      var html = el.innerHTML;
      // 块级 $$...$$
      html = html.replace(/\$\$([^$]+?)\$\$/g, function(_, tex) {
        try {
          return '<div class="katex-display">' + katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }) + '</div>';
        } catch(e) { return _; }
      });
      // 行内 $...$
      html = html.replace(/\$([^$\n]+?)\$/g, function(_, tex) {
        try {
          return '<span class="katex-inline">' + katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }) + '</span>';
        } catch(e) { return _; }
      });
      el.innerHTML = html;
    }
  }

  // ===== 后处理 =====
  function postProcess() {
    // 代码高亮
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
    // LaTeX
    if (typeof katex !== 'undefined') { renderLatex(); }
    // 包裹表格并设置蒙版
    wrapTables();
    updateTableMaxWidth();
    // 列表序号宽度自适应
    adjustListWidths();
  }

  /** 动态调整每个列表的序号宽度 */
  function adjustListWidths() {
    // 1em ≈ 1 位数字宽度（tabular-nums）
    var oneDigit = '1.2em';   // "9." 
    var twoDigit = '1.8em';   // "99."
    var threeDigit = '2.4em'; // "999."

    // 处理所有 ol
    var ols = preview.querySelectorAll('ol');
    for (var i = 0; i < ols.length; i++) {
      var ol = ols[i];
      var count = 0;
      // 只计算直接子 li
      var children = ol.children;
      for (var c = 0; c < children.length; c++) {
        if (children[c].tagName === 'LI') count++;
      }
      var numWidth;
      if (count >= 100) numWidth = threeDigit;
      else if (count >= 10) numWidth = twoDigit;
      else numWidth = oneDigit;

      ol.style.setProperty('--ol-num-width', numWidth);

      // 处理同级的 ul（兄弟列表）：bullet 宽度始终与 1 位数字对齐
      // 但混排时无序列表的 padding-left 需要与有序列表对齐
      // 通过给父容器设置变量
    }

    // 处理混排场景：查找相邻的 ul 和 ol
    var allLists = preview.querySelectorAll('ul, ol');
    for (var j = 0; j < allLists.length; j++) {
      var list = allLists[j];
      if (list.tagName === 'UL') {
        // 检查是否有相邻的 ol 兄弟
        var sibling = list.previousElementSibling;
        while (sibling && sibling.tagName !== 'OL' && sibling.tagName !== 'UL') {
          sibling = sibling.previousElementSibling;
        }
        var nextSib = list.nextElementSibling;
        while (nextSib && nextSib.tagName !== 'OL' && nextSib.tagName !== 'UL') {
          nextSib = nextSib.nextElementSibling;
        }

        // 找到相邻 ol 的 num-width
        var adjacentOl = null;
        if (sibling && sibling.tagName === 'OL') adjacentOl = sibling;
        else if (nextSib && nextSib.tagName === 'OL') adjacentOl = nextSib;

        if (adjacentOl) {
          var olWidth = adjacentOl.style.getPropertyValue('--ol-num-width') || oneDigit;
          // ul bullet 始终与个位数字对齐，但需要占据与 ol 相同的总宽度
          // bullet 本身的宽度 = oneDigit，但 min-width 设为 olWidth（多出的空间在左侧留白）
          list.style.setProperty('--ul-bullet-width', olWidth);
        } else {
          list.style.setProperty('--ul-bullet-width', oneDigit);
        }

        // 嵌套的 ul 也用父 ol 的宽度
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
      // 避免重复包裹
      if (table.parentElement.classList.contains('table-scroll')) continue;

      var wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      var scroll = document.createElement('div');
      scroll.className = 'table-scroll';

      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(scroll);
      scroll.appendChild(table);

      // 初始检测蒙版
      checkTableShadow(wrapper, scroll);

      // 滚动时更新蒙版
      (function(w, s) {
        s.addEventListener('scroll', function() { checkTableShadow(w, s); });
      })(wrapper, scroll);
    }
  }

  function checkTableShadow(wrapper, scroll) {
    var sl = scroll.scrollLeft;
    var sw = scroll.scrollWidth;
    var cw = scroll.clientWidth;

    // 左侧有隐藏内容
    if (sl > 1) {
      wrapper.classList.add('shadow-left');
    } else {
      wrapper.classList.remove('shadow-left');
    }
    // 右侧有隐藏内容
    if (sw - sl - cw > 1) {
      wrapper.classList.add('shadow-right');
    } else {
      wrapper.classList.remove('shadow-right');
    }
  }

  function updateTableMaxWidth() {
    var w = previewCard.offsetWidth;
    var maxCol = Math.round(w * 0.667);
    var cells = preview.querySelectorAll('.table-wrapper th, .table-wrapper td, table th, table td');
    for (var i = 0; i < cells.length; i++) {
      cells[i].style.maxWidth = maxCol + 'px';
    }
    // 重新检测蒙版
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
    charCount.textContent = text.length + ' 字符 · ' + text.split('\n').length + ' 行';
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(function() { toastEl.classList.remove('show'); }, 2000);
  }

  // ===== 行号 =====
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

  // ===== 编辑器 =====
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

  // ===== 同步滚动 =====
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

  // ===== 编辑区/预览区 分隔拖拽 =====
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

  // ===== 卡片宽度拖拽 =====
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

  // ===== 主题 =====
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

  // ===== Inspector =====
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
      inspectorContent.innerHTML = '<div class="inspector-placeholder">点击预览区域中的元素查看样式参数</div>';
    }
  });

  function clearSourceArrow() {
    if (activeLineNum) { activeLineNum.classList.remove('active'); activeLineNum = null; }
  }

  function highlightSourceLine(el) {
    // 尝试通过文本内容在源码中查找对应行
    var text = el.textContent.trim();
    if (!text) return;
    var lines = editor.value.split('\n');
    var searchStr = text.substring(0, Math.min(30, text.length));
    var bestLine = -1;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf(searchStr) !== -1) { bestLine = i; break; }
    }
    // 模糊匹配：取前 10 个字符
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
    h += sec('排版', [
      ['font-family', shortFont(cs.fontFamily)],
      ['font-size', cs.fontSize],
      ['font-weight', cs.fontWeight],
      ['line-height', cs.lineHeight],
      ['letter-spacing', cs.letterSpacing],
      ['text-align', cs.textAlign],
      ['text-transform', cs.textTransform !== 'none' ? cs.textTransform : null],
      ['font-variant-numeric', cs.fontVariantNumeric !== 'normal' ? cs.fontVariantNumeric : null]
    ]);
    h += sec('颜色', [
      ['color', cs.color, true],
      ['background', cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : null, true]
    ]);
    h += sec('盒模型', [
      ['width', Math.round(el.offsetWidth) + 'px'],
      ['height', Math.round(el.offsetHeight) + 'px'],
      ['padding', cs.padding],
      ['margin', cs.margin],
      ['border', cs.borderWidth !== '0px' ? cs.border : null],
      ['border-radius', cs.borderRadius !== '0px' ? cs.borderRadius : null]
    ]);
    h += sec('显示', [
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

  // ===== 示例内容 =====
  var defaultContent = [
    '# Markdown 实时预览器',
    '',
    '欢迎使用 **Markdown 实时预览器**！左侧输入 Markdown 文本，右侧即时渲染排版效果。支持 GFM 扩展语法、代码高亮（GitHub 色板）、LaTeX 数学公式，以及右侧的 Inspector 面板。',
    '',
    '---',
    '',
    '## 文本格式',
    '',
    '这是一段普通正文。Markdown 支持多种内联格式：**加粗文本**、*斜体文本*、~~删除线文本~~，以及行内代码 `const x = 42;`。你可以自由组合，例如 ***加粗斜体***。',
    '',
    '一段较长的行内代码示例：`this.is.a.very.long.inline.code.that.should.automatically.wrap.when.reaching.the.container.boundary.without.scrolling`，它会自动按词换行。',
    '',
    '## 标题层级',
    '',
    '### 三级标题 — 17px · margin-top 4px',
    '#### 四级标题 — 17px · Semi-Bold · 黑色',
    '##### 五级标题 — 17px · Semi-Bold · 黑色',
    '###### 六级标题 — 17px · Semi-Bold · 黑色',
    '',
    '## 代码高亮（GitHub 色板）',
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
    '```python',
    'from functools import lru_cache',
    '',
    '@lru_cache(maxsize=None)',
    'def fibonacci(n: int) -> int:',
    '    """递归计算斐波那契数列"""',
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
    '## LaTeX 数学公式',
    '',
    '行内公式：质能方程 $E = mc^2$，勾股定理 $a^2 + b^2 = c^2$。',
    '',
    '块级公式：',
    '',
    '$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$',
    '',
    '$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$',
    '',
    '## 引用',
    '',
    '> 好的设计是尽可能少的设计。',
    '>',
    '> — Dieter Rams',
    '',
    '## 列表',
    '',
    '### 无序列表',
    '- 实时预览 — 输入即见结果',
    '- 深色 / 亮色主题切换',
    '- 同步滚动',
    '- 宽度可调卡片',
    '- Inspector 样式面板',
    '',
    '### 有序列表',
    '1. 在左侧编写 Markdown',
    '2. 右侧即时渲染排版效果',
    '3. 拖拽卡片两侧的竖线把手调整宽度',
    '4. 点击元素在右侧面板查看样式',
    '5. 切换亮色 / 暗色主题',
    '6. 代码块自动高亮',
    '7. 表格、引用、列表完整支持',
    '8. 支持 LaTeX 数学公式',
    '9. 超过一位数序号自动对齐',
    '10. 无序列表圆点与有序列表序号等宽',
    '11. 嵌套列表遵循对齐规则',
    '12. 所有文本行高 140%',
    '',
    '### 无序列表嵌套无序列表',
    '- 前端技术栈',
    '  - HTML / CSS / JavaScript',
    '  - React / Vue / Svelte',
    '  - Webpack / Vite / Rollup',
    '- 后端技术栈',
    '  - Node.js / Deno / Bun',
    '  - Python / Go / Rust',
    '',
    '### 有序列表嵌套有序列表',
    '1. 项目启动阶段',
    '   1. 需求分析与评审',
    '   2. 技术方案设计',
    '   3. 任务拆分与排期',
    '2. 开发阶段',
    '   1. 环境搭建',
    '   2. 核心功能开发',
    '   3. 联调与自测',
    '3. 上线阶段',
    '   1. 代码审查',
    '   2. 灰度发布',
    '   3. 全量上线',
    '',
    '### 有序列表嵌套无序列表',
    '1. 早餐选项',
    '   - 牛奶 + 麦片',
    '   - 豆浆 + 油条',
    '   - 咖啡 + 三明治',
    '2. 午餐选项',
    '   - 拌面',
    '   - 盖浇饭',
    '   - 沙拉',
    '',
    '### 无序列表嵌套有序列表',
    '- 学习计划',
    '  1. 阅读官方文档',
    '  2. 完成基础教程',
    '  3. 动手写一个小项目',
    '- 运动计划',
    '  1. 热身 10 分钟',
    '  2. 跑步 30 分钟',
    '  3. 拉伸 10 分钟',
    '',
    '### 任务列表',
    '- [x] 正文排版参数',
    '- [x] 代码高亮 — GitHub 色板',
    '- [x] LaTeX 公式渲染',
    '- [x] 深色模式',
    '- [ ] 导出为 PDF',
    '',
    '## 表格',
    '',
    '| 属性 | 浅色模式 | 深色模式 |',
    '|------|----------|----------|',
    '| 正文字号 | 17px | 17px |',
    '| 行高 | 140% | 140% |',
    '| 预览区背景 | #F0F0F4 | #18181B |',
    '| 卡片背景 | #FFFFFF | #252528 |',
    '| 行内代码背景 | rgba(0,0,0,0.05) | rgba(255,255,255,0.1) |',
    '| 分隔线颜色 | rgba(0,0,0,0.15) | rgba(255,255,255,0.15) |',
    '',
    '---',
    '',
    '> **提示**：点击右侧预览区中的任何元素，在 Inspector 面板中查看其完整样式参数。'
  ].join('\n');

  // ===== 初始化 =====
  editor.value = defaultContent;
  renderMarkdown();
})();
