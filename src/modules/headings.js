import { t } from '../i18n.js';

export class HeadingsModule {
  constructor(ctx) { this.ctx = ctx; }

  populateList(listEl) {
    listEl.innerHTML = '';
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      listEl.innerHTML = `<li style="padding:8px;color:#888;font-size:13px;">${t('noHeadings')}</li>`;
      return;
    }
    headings.forEach((h, i) => {
      const level = h.tagName[1];
      const text = h.textContent.trim().slice(0, 60);
      const li = document.createElement('li');
      const indent = (parseInt(level) - 1) * 12;
      const btn = document.createElement('button');
      btn.style.paddingInlineStart = `${indent}px`;
      btn.textContent = `H${level}: ${text}`;
      btn.addEventListener('click', () => {
        h.scrollIntoView({ behavior: 'smooth', block: 'center' });
        h.focus({ preventScroll: true });
        h.style.outline = '3px solid #1565c0';
        h.style.outlineOffset = '4px';
        setTimeout(() => { h.style.outline = ''; h.style.outlineOffset = ''; }, 2000);
      });
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  enable() {}
  disable() {}
}
