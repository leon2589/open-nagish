import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-dark-mode';

const CSS = `
  html body {
    background-color: #1a1a2e !important;
    color: #e0e0e0 !important;
  }
  html body *:not(#opennagish-widget) {
    background-color: transparent !important;
    color: #e0e0e0 !important;
    border-color: #444 !important;
  }
  html body a { color: #90caf9 !important; }
  html body input, html body textarea, html body select {
    background-color: #2d2d44 !important;
    color: #e0e0e0 !important;
    border-color: #555 !important;
  }
  html body button {
    background-color: #2d2d44 !important;
    color: #e0e0e0 !important;
  }
  html body img { opacity: 0.85; }
`;

export class DarkModeModule {
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

  toggle() {
    this.active ? this.disable() : this.enable();
  }
}
