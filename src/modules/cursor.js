import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-big-cursor';

const CSS = `
  html body, html body *:not(#opennagish-widget) {
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M8 4l28 20H20l-1 1 9 17-5 2-9-17-6 6z' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 4 4, auto !important;
  }
  html body a, html body a *, html body button, html body button *,
  html body [role="button"], html body input[type="submit"],
  html body input[type="button"], html body label, html body select {
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M20 4v28h5l-1-1 8-13h8L12 42V4z' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 14 4, pointer !important;
  }
`;

export class CursorModule {
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
