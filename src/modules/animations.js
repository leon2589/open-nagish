import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-animations';
const ORIG_SRC_ATTR = 'data-anid-orig-src';

const CSS = `
  html body *:not(#opennagish-widget),
  html body *:not(#opennagish-widget)::before,
  html body *:not(#opennagish-widget)::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
`;

export class AnimationsModule {
  constructor(ctx) { this.ctx = ctx; this.active = false; }

  enable() {
    if (this.active) return;
    this.active = true;
    injectStyleToPage(STYLE_ID, CSS);

    document.querySelectorAll('img[src$=".gif"], img[src*=".gif?"]').forEach(img => {
      if (img.getAttribute(ORIG_SRC_ATTR)) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 100;
        canvas.height = img.naturalHeight || img.height || 100;
        const ctx2d = canvas.getContext('2d');
        ctx2d.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.setAttribute(ORIG_SRC_ATTR, img.src);
        img.src = canvas.toDataURL();
      } catch (_) { /* cross-origin images cannot be captured */ }
    });
  }

  disable() {
    this.active = false;
    removePageStyle(STYLE_ID);

    document.querySelectorAll(`[${ORIG_SRC_ATTR}]`).forEach(img => {
      img.src = img.getAttribute(ORIG_SRC_ATTR);
      img.removeAttribute(ORIG_SRC_ATTR);
    });
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
