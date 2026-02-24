const ORIG_SRC_ATTR = 'data-anid-orig-src';

export class MuteSoundsModule {
  constructor(ctx) { this.ctx = ctx; this.active = false; this.mutedElements = []; }

  enable() {
    if (this.active) return;
    this.active = true;
    document.querySelectorAll('audio, video').forEach(el => {
      if (!el.muted) {
        el.muted = true;
        el.pause();
        this.mutedElements.push(el);
      }
    });

    document.querySelectorAll('iframe').forEach(iframe => {
      try {
        const src = iframe.src || '';
        if (!src || iframe.getAttribute(ORIG_SRC_ATTR)) return;
        if (src.includes('youtube') || src.includes('vimeo') || src.includes('dailymotion')) {
          if (!src.includes('mute=1') && !src.includes('muted=1')) {
            iframe.setAttribute(ORIG_SRC_ATTR, src);
            const separator = src.includes('?') ? '&' : '?';
            iframe.src = src + separator + 'mute=1';
          }
        }
      } catch (_) { /* cross-origin */ }
    });
  }

  disable() {
    this.active = false;
    this.mutedElements.forEach(el => {
      el.muted = false;
    });
    this.mutedElements = [];

    document.querySelectorAll(`iframe[${ORIG_SRC_ATTR}]`).forEach(iframe => {
      iframe.src = iframe.getAttribute(ORIG_SRC_ATTR);
      iframe.removeAttribute(ORIG_SRC_ATTR);
    });
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
