import { t } from '../i18n.js';

const ATTR = 'data-anid-alt-shown';

export class ImagesModule {
  constructor(ctx) { this.ctx = ctx; this.active = false; this.overlays = []; }

  enable() {
    if (this.active) return;
    this.active = true;
    document.querySelectorAll('img').forEach(img => {
      if (img.getAttribute(ATTR)) return;
      const alt = img.alt || img.getAttribute('aria-label') || '';
      const label = alt || `\u26A0 ${t('noAltText')}`;
      const overlay = document.createElement('span');
      overlay.className = 'anid-alt-overlay';
      overlay.style.cssText = `
        position: absolute;
        bottom: 4px;
        left: 4px;
        right: 4px;
        background: ${alt ? 'rgba(21,101,192,0.9)' : 'rgba(198,40,40,0.9)'};
        color: #fff;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        z-index: 2147483630;
        pointer-events: none;
        word-break: break-word;
        max-height: 60px;
        overflow: hidden;
        font-family: sans-serif;
        line-height: 1.4;
      `;
      overlay.textContent = label;

      const wrapper = img.parentElement;
      if (wrapper) {
        const pos = getComputedStyle(wrapper).position;
        if (pos === 'static') wrapper.style.position = 'relative';
        wrapper.appendChild(overlay);
        img.setAttribute(ATTR, 'true');
        this.overlays.push({ overlay, img, wrapper, hadPosition: pos });
      }
    });
  }

  disable() {
    this.active = false;
    this.overlays.forEach(({ overlay, img, wrapper, hadPosition }) => {
      overlay.remove();
      img.removeAttribute(ATTR);
      if (hadPosition === 'static') wrapper.style.position = '';
    });
    this.overlays = [];
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
