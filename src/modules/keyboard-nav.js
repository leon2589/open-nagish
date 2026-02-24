import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-keyboard-nav';

const CSS = `
  html body *:focus {
    outline: 3px solid #1565c0 !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 4px rgba(21,101,192,0.3) !important;
  }
`;

export class KeyboardNavModule {
  constructor(ctx) { this.ctx = ctx; this.active = false; this._onTab = null; }

  enable() {
    if (this.active) return;
    this.active = true;
    document.body.dataset.anidKeyboardNav = 'true';
    injectStyleToPage(STYLE_ID, CSS);
    this._onTab = (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('anid-using-keyboard');
      }
    };
    document.addEventListener('keydown', this._onTab);
  }

  disable() {
    this.active = false;
    delete document.body.dataset.anidKeyboardNav;
    document.body.classList.remove('anid-using-keyboard');
    removePageStyle(STYLE_ID);
    if (this._onTab) {
      document.removeEventListener('keydown', this._onTab);
      this._onTab = null;
    }
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
