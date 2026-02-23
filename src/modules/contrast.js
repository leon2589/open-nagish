import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-contrast';

const modes = {
  dark: `
    html { filter: invert(1) hue-rotate(180deg) !important; }
    html img, html video, html canvas, html svg image,
    html [style*="background-image"] {
      filter: invert(1) hue-rotate(180deg) !important;
    }
  `,
  light: `
    html body { background: #fff !important; color: #000 !important; }
    html body * {
      background-color: #fff !important;
      color: #000 !important;
      border-color: #000 !important;
      box-shadow: none !important;
    }
    html body a { color: #0000EE !important; }
    html body img { opacity: 0.9; }
  `,
  invert: `
    html { filter: invert(1) !important; }
    html img, html video, html canvas, html svg image {
      filter: invert(1) !important;
    }
  `,
};

export class ContrastModule {
  constructor(ctx) {
    this.ctx = ctx;
    this.mode = 'none';
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'none') {
      removePageStyle(STYLE_ID);
    } else {
      injectStyleToPage(STYLE_ID, modes[mode] || '');
    }
  }

  enable() { }
  disable() {
    this.mode = 'none';
    removePageStyle(STYLE_ID);
  }
}
