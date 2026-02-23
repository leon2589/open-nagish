import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-animations';

const CSS = `
  html body *, html body *::before, html body *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
`;

export class AnimationsModule {
  constructor(ctx) { this.ctx = ctx; this.active = false; this.pausedMedia = []; }

  enable() {
    this.active = true;
    injectStyleToPage(STYLE_ID, CSS);

    document.querySelectorAll('img[src$=".gif"], img[src*=".gif?"]').forEach(img => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 100;
      canvas.height = img.naturalHeight || img.height || 100;
      const ctx2d = canvas.getContext('2d');
      try {
        ctx2d.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.dataset.anidOrigSrc = img.src;
        img.src = canvas.toDataURL();
      } catch { /* cross-origin */ }
    });
  }

  disable() {
    this.active = false;
    removePageStyle(STYLE_ID);

    document.querySelectorAll('[data-anid-orig-src]').forEach(img => {
      img.src = img.dataset.anidOrigSrc;
      delete img.dataset.anidOrigSrc;
    });
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
