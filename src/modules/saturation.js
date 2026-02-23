import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-saturation';

export class SaturationModule {
  constructor(ctx) { this.ctx = ctx; this.value = 100; }

  setValue(val) {
    this.value = val;
    if (val === 100) {
      removePageStyle(STYLE_ID);
    } else {
      injectStyleToPage(STYLE_ID, `html { filter: saturate(${val}%) !important; }`);
    }
  }

  enable() { this.apply(); }

  apply() {
    if (this.value !== 100) this.setValue(this.value);
  }

  disable() {
    this.value = 100;
    removePageStyle(STYLE_ID);
  }
}
