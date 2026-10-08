
document.querySelectorAll('[class*="l-w-["], [class*="l-h-["]').forEach(el => {
  let classes = el.className.split(" ");

  classes.forEach(cls => {
    let wMatch = cls.match(/^l-w-\[(.+)\]$/);
    let hMatch = cls.match(/^l-h-\[(.+)\]$/);

    if (wMatch) {
      el.style.width = wMatch[1];
    }

    if (hMatch) {
      el.style.height = hMatch[1];
    }
  });
});
const style = document.createElement("style");
document.head.appendChild(style);

const added = new Set();

document.addEventListener("DOMContentLoaded", () => {

  const style = document.createElement("style");
  document.head.appendChild(style);

  const added = new Set();
  let css = "";

  document.querySelectorAll("[class*='l-']").forEach(el => {
    el.className.split(" ").forEach(cls => {

      if (added.has(cls)) return;

      const m = cls.match(/^l-(top|left|right|bottom)-\[(.+)\]$/);
      if (!m) return;

      added.add(cls);

      const prop = m[1];
      let val = m[2];

      // agar px yozilmagan bo‘lsa → px qo‘sh
      if (!isNaN(val)) val = val + "px";

      const safe = cls.replace(/[\[\]]/g, "\\$&");

      css += `.${safe}{${prop}:${val};}`;
    });
  });

  style.textContent = css;
});
/*!
 * l-respons.js
 * Sintaksis:
 *   l-responsive-[768px]:[flex-direction:column;gap:10px]      -> @media (max-width: 768px)
 *   l-responsive-min-[1024px]:[font-size:20px;color:red]        -> @media (min-width: 1024px)
 *
 * Qoidalar:
 *   - Bir nechta style ";" bilan ajratiladi
 *   - Probel o'rniga "_" yoziladi:  margin:10px_20px  ->  margin:10px 20px
 *   - Birliklar: px, em, rem
 */
(function () {
  'use strict';

  var PREFIX = 'l-responsive-';
  var RE = /^l-responsive-(?:(min)-)?\[(\d*\.?\d+)(px|em|rem)\]:\[(.+)\]$/;

  var styleEl = document.createElement('style');
  styleEl.setAttribute('data-l-respons', '');
  (document.head || document.documentElement).appendChild(styleEl);

  var entries = {}; // class nomi -> { type, px, css }

  function toPx(n, unit) {
    return unit === 'px' ? n : n * 16;
  }

  function parse(cls) {
    var m = RE.exec(cls);
    if (!m) return null;

    var type = m[1] ? 'min' : 'max';
    var num = parseFloat(m[2]);
    var unit = m[3];
    var body = m[4];

    var decl = body
      .split(';')
      .map(function (s) { return s.trim(); })
      .filter(Boolean)
      .map(function (d) {
        var i = d.indexOf(':');
        if (i < 1) return '';
        var prop = d.slice(0, i).trim();
        var val = d.slice(i + 1).replace(/_/g, ' ').trim();
        return prop + ':' + val + ' !important';
      })
      .filter(Boolean)
      .join(';');

    if (!decl) return null;

    return {
      type: type,
      px: toPx(num, unit),
      css:
        '@media (' + type + '-width:' + num + unit + '){' +
        '.' + CSS.escape(cls) + '{' + decl + '}}'
    };
  }

  function render() {
    var list = Object.keys(entries).map(function (k) { return entries[k]; });

    // min-width: kichikdan kattaga, max-width: kattadan kichikka
    // (shunda eng mos breakpoint oxirida turib g'olib bo'ladi)
    var mins = list.filter(function (e) { return e.type === 'min'; })
      .sort(function (a, b) { return a.px - b.px; });
    var maxs = list.filter(function (e) { return e.type === 'max'; })
      .sort(function (a, b) { return b.px - a.px; });

    styleEl.textContent = mins.concat(maxs)
      .map(function (e) { return e.css; })
      .join('\n');
  }

  function scanElement(el, state) {
    if (!el.classList) return;
    for (var i = 0; i < el.classList.length; i++) {
      var cls = el.classList[i];
      if (cls.indexOf(PREFIX) !== 0 || entries[cls]) continue;
      var parsed = parse(cls);
      if (parsed) {
        entries[cls] = parsed;
        state.changed = true;
      }
    }
  }

  function scan(root) {
    var state = { changed: false };
    if (root.nodeType === 1) scanElement(root, state);
    if (root.querySelectorAll) {
      var all = root.querySelectorAll('[class*="' + PREFIX + '"]');
      for (var i = 0; i < all.length; i++) scanElement(all[i], state);
    }
    if (state.changed) render();
  }

  function init() {
    scan(document);

    // Keyinchalik qo'shilgan elementlar yoki o'zgargan class'lar uchun
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === 'attributes') scan(m.target);
        else m.addedNodes.forEach(function (n) { if (n.nodeType === 1) scan(n); });
      });
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
