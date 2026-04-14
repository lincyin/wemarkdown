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
    var html = preview.innerHTML;
    // Block formulas $$...$$ (may span across <br> tags)
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, function(_, tex) {
      // Remove <br> and HTML tags that marked may have inserted
      var clean = tex.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').trim();
      try {
        return '<div class="katex-display">' + katex.renderToString(clean, { displayMode: true, throwOnError: false }) + '</div>';
      } catch(e) { return _; }
    });
    // Inline formulas $...$
    html = html.replace(/\$([^$\n]+?)\$/g, function(_, tex) {
      var clean = tex.replace(/<[^>]+>/g, '').trim();
      try {
        return '<span class="katex-inline">' + katex.renderToString(clean, { displayMode: false, throwOnError: false }) + '</span>';
      } catch(e) { return _; }
    });
    preview.innerHTML = html;
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
    wrapCodeBlocks();
    wrapFormulas();
    wrapHeadingText();
    wrapListTextNodes();
    wrapTableCellText();
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
        // Check if it's a checkbox item
        var firstChild = li.firstChild;
        var isCheckbox = firstChild && firstChild.nodeType === 1 && firstChild.tagName === 'INPUT' && firstChild.type === 'checkbox';
        if (isCheckbox) continue; // Don't add bullet for checkbox items
        marker.textContent = '\u00B7';
        marker.classList.add('li-marker-ul');
      }

      // Wrap remaining content in li-text
      var textSpan = document.createElement('span');
      textSpan.className = 'li-text';
      // Move all children to textSpan
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
    var w = previewCard.offsetWidth;
    var maxCol = Math.round(w * 0.667);
    var cells = preview.querySelectorAll('.table-wrapper th, .table-wrapper td, table th, table td');
    for (var i = 0; i < cells.length; i++) {
      cells[i].style.maxWidth = maxCol + 'px';
    }
    var wrappers = preview.querySelectorAll('.table-wrapper');
    for (var j = 0; j < wrappers.length; j++) {
      var scroll = wrappers[j].querySelector('.table-scroll');
      if (scroll) checkScrollShadow(wrappers[j], scroll);
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

  // ===== Inspector toggle =====
  var inspectorPanel = document.getElementById('inspector-panel');
  var inspectorToggle = document.getElementById('inspector-toggle');
  var inspectorManualOpen = false;
  inspectorPanel.classList.add('collapsed');

  inspectorToggle.addEventListener('click', function() {
    var isCollapsed = inspectorPanel.classList.contains('collapsed');
    inspectorPanel.classList.toggle('collapsed');
    inspectorManualOpen = isCollapsed ? true : false;
  });

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
  var activeLineNum = null;

  preview.addEventListener('click', function(e) {
    e.stopPropagation();
    if (e.target === preview) return;
    if (highlightedEl) highlightedEl.classList.remove('inspector-highlight');
    // Clear any block outlines
    var blockOutlines = preview.querySelectorAll('.inspector-block-outline');
    for (var bo = 0; bo < blockOutlines.length; bo++) blockOutlines[bo].classList.remove('inspector-block-outline');
    clearSourceArrow();
    clearSpacingOverlays();

    var target = e.target;

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
    inspectorPanel.classList.remove('collapsed');
  });
  document.addEventListener('click', function(e) {
    if (!preview.contains(e.target) && e.target !== inspectorToggle && !inspectorPanel.contains(e.target)) {
      if (highlightedEl) { highlightedEl.classList.remove('inspector-highlight'); highlightedEl = null; }
      var bos = preview.querySelectorAll('.inspector-block-outline');
      for (var b = 0; b < bos.length; b++) bos[b].classList.remove('inspector-block-outline');
      clearSourceArrow();
      clearSpacingOverlays();
      if (hoverOutlineEl) { hoverOutlineEl.classList.remove('spacing-hover-outline'); hoverOutlineEl = null; }
      inspectorContent.innerHTML = '<div class="inspector-placeholder">Click an element in the preview to inspect its styles</div>';
      if (!inspectorManualOpen) {
        inspectorPanel.classList.add('collapsed');
      }
    }
  });

  function clearSourceArrow() {
    if (activeLineNum) { activeLineNum.classList.remove('active'); activeLineNum = null; }
  }

  function highlightSourceLine(el) {
    var text = el.textContent.trim();
    if (!text || text.length < 2) return;
    var lines = editor.value.split('\n');
    // Take first meaningful chunk of text (skip very short)
    var searchStr = text.substring(0, Math.min(40, text.length));
    var bestLine = -1;
    var bestScore = 0;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      // Strip common markdown prefixes for comparison
      var stripped = line.replace(/^#{1,6}\s+/, '')   // headings
                        .replace(/^\d+\.\s+/, '')     // ordered list
                        .replace(/^[-*+]\s+/, '')     // unordered list
                        .replace(/^>\s*/, '')          // blockquote
                        .replace(/^\[[ x]\]\s*/, '')  // checkbox
                        .trim();

      // Try exact match on stripped line
      if (stripped.indexOf(searchStr) !== -1) {
        bestLine = i; break;
      }
      // Try shorter match
      var shortSearch = text.substring(0, Math.min(15, text.length));
      if (shortSearch.length >= 3 && stripped.indexOf(shortSearch) !== -1 && bestScore < 1) {
        bestLine = i; bestScore = 1;
      }
      // Also try on raw line
      if (line.indexOf(searchStr) !== -1) {
        bestLine = i; break;
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
    '# H1 Heading \u2014 21px \u00B7 margin-top 12px',
    '',
    '## H2 Heading \u2014 19px \u00B7 margin-top 8px',
    '',
    '### H3 Heading \u2014 17px \u00B7 margin-top 4px',
    '#### H4 Heading \u2014 17px \u00B7 Semi-Bold',
    '##### H5 Heading \u2014 17px \u00B7 Semi-Bold',
    '###### H6 Heading \u2014 17px \u00B7 Semi-Bold',
    '',
    '## Code Highlighting (GitHub Theme)',
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
    '## LaTeX Math Formulas',
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
    '### Adjacent Ordered + Unordered (single line break)',
    '',
    '1. First ordered item',
    '2. Second ordered item',
    '3. Third ordered item',
    '- First unordered item',
    '- Second unordered item',
    '- Third unordered item',
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
  ].join('\n');

  editor.value = defaultContent;
  renderMarkdown();
})();
