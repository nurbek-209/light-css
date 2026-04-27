
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
