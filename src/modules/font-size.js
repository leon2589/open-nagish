import { injectStyleToPage, removePageStyle } from '../utils.js';
import * as storage from '../storage.js';

const STYLE_ID = 'anid-font-size';
const MIN = -3;
const MAX = 5;
const STEP_PX = 2;

export class FontSizeModule {
  constructor(ctx) {
    this.ctx = ctx;
    this.level = 0;
  }

  setLevel(level) {
    this.level = Math.max(MIN, Math.min(MAX, level));
    this.apply();
    storage.set('fontSize', this.level);
  }

  increase() { this.setLevel(this.level + 1); }
  decrease() { this.setLevel(this.level - 1); }
  reset() { this.setLevel(0); }

  apply() {
    if (this.level === 0) {
      removePageStyle(STYLE_ID);
      return;
    }
    const pxChange = this.level * STEP_PX;
    const css = `
      html { font-size: calc(1em + ${pxChange}px) !important; }
      body, body * {
        font-size: inherit !important;
      }
    `;
    injectStyleToPage(STYLE_ID, css);
  }

  enable() { this.apply(); }
  disable() {
    this.level = 0;
    removePageStyle(STYLE_ID);
    storage.remove('fontSize');
  }
}
