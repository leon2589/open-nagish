export class MuteSoundsModule {
  constructor(ctx) { this.ctx = ctx; this.active = false; this.mutedElements = []; }

  enable() {
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
        if (src.includes('youtube') || src.includes('vimeo') || src.includes('dailymotion')) {
          if (!src.includes('mute=1') && !src.includes('muted=1')) {
            iframe.dataset.anidOrigSrc = src;
            const separator = src.includes('?') ? '&' : '?';
            iframe.src = src + separator + 'mute=1';
          }
        }
      } catch { /* cross-origin */ }
    });
  }

  disable() {
    this.active = false;
    this.mutedElements.forEach(el => {
      el.muted = false;
    });
    this.mutedElements = [];

    document.querySelectorAll('iframe[data-anid-orig-src]').forEach(iframe => {
      iframe.src = iframe.dataset.anidOrigSrc;
      delete iframe.dataset.anidOrigSrc;
    });
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
