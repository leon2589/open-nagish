import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-spacing';

const CSS = `
  html body *:not(#opennagish-widget) {
    line-height: 1.8 !important;
    letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important;
  }
  html body p, html body li, html body dd {
    margin-bottom: 1em !important;
  }
`;

export class SpacingModule {
  constructor(ctx) { this.ctx = ctx; this.active = false; }

  enable() {
    if (this.active) return;
    this.active = true;
    injectStyleToPage(STYLE_ID, CSS);
  }

  disable() {
    this.active = false;
    removePageStyle(STYLE_ID);
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
