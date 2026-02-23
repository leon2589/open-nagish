import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-monochrome';
const CSS = `html { filter: grayscale(100%) !important; }`;

export class MonochromeModule {
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
