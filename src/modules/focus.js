import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-focus';

const CSS = `
  html body a:focus-visible,
  html body button:focus-visible,
  html body input:focus-visible,
  html body select:focus-visible,
  html body textarea:focus-visible,
  html body [tabindex]:focus-visible {
    outline: 4px solid #ff6f00 !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 0 6px rgba(255,111,0,0.3) !important;
    transition: outline 0.1s ease !important;
  }
`;

export class FocusModule {
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
