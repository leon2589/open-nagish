import { injectStyleToPage, removePageStyle } from '../utils.js';
import * as storage from '../storage.js';

const STYLE_ID = 'anid-color-blind';
const SVG_ID = 'anid-color-blind-svg';

const matrices = {
  protanopia: '0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0',
  deuteranopia: '0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0',
  tritanopia: '0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0',
};

export class ColorBlindModule {
  constructor(ctx) { this.ctx = ctx; this.mode = null; }

  setMode(mode) {
    this.mode = mode;
    const matrix = matrices[mode];
    if (!matrix) { this.disable(); return; }

    let svg = document.getElementById(SVG_ID);
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = SVG_ID;
      svg.setAttribute('style', 'position:absolute;width:0;height:0;');
      svg.innerHTML = `<defs><filter id="anid-cb-filter"><feColorMatrix type="matrix" values=""/></filter></defs>`;
      document.body.appendChild(svg);
    }
    svg.querySelector('feColorMatrix').setAttribute('values', matrix);
    injectStyleToPage(STYLE_ID, `html { filter: url(#anid-cb-filter) !important; }`);
    storage.set('colorBlindMode', mode);
  }

  enable() {
    if (this.mode) this.setMode(this.mode);
  }

  disable() {
    this.mode = null;
    removePageStyle(STYLE_ID);
    const svg = document.getElementById(SVG_ID);
    if (svg) svg.remove();
    storage.remove('colorBlindMode');
  }

  toggle() { this.mode ? this.disable() : this.setMode('protanopia'); }
}
