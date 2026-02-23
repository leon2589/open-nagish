import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-links';

const CSS = `
  html body a {
    text-decoration: underline !important;
    text-decoration-thickness: 2px !important;
    text-underline-offset: 3px !important;
    outline: 2px solid transparent !important;
    border-bottom: 2px solid #1565c0 !important;
    background-color: rgba(21, 101, 192, 0.08) !important;
    padding: 1px 3px !important;
    border-radius: 2px !important;
  }
  html body a:hover {
    background-color: rgba(21, 101, 192, 0.18) !important;
  }
`;

export class LinksModule {
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
