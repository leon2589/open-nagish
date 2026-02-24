import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-hide-images';

const CSS = `
  html body img,
  html body svg,
  html body video,
  html body [role="img"],
  html body [style*="background-image"] {
    opacity: 0.05 !important;
    visibility: hidden !important;
  }
`;

export class HideImagesModule {
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
