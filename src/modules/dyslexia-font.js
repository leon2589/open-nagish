import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-dyslexia-font';

const CSS = `
  @font-face {
    font-family: 'OpenDyslexic';
    src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'OpenDyslexic';
    src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Bold.woff') format('woff');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
  }
  html body, html body * {
    font-family: 'OpenDyslexic', sans-serif !important;
  }
`;

export class DyslexiaFontModule {
  constructor(ctx) { this.ctx = ctx; this.active = false; }

  enable() {
    this.active = true;
    injectStyleToPage(STYLE_ID, CSS);
  }

  disable() {
    this.active = false;
    removePageStyle(STYLE_ID);
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
