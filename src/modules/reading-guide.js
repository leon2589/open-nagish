const READING_BAND_HEIGHT = 40;
const ACCENT_COLOR = '#1565c0';
const WIDGET_HOST_ID = 'opennagish-widget';

export class ReadingGuideModule {
  constructor(ctx) {
    this.ctx = ctx;
    this.active = false;
    this.guide = null;
    this._onMove = null;
    this._watchTimer = null;
  }

  enable() {
    if (this.active) return;
    this.active = true;

    document.documentElement.classList.add('anid-reading-guide-active');

    // Remove stale guides from other instances
    document.querySelectorAll('#anid-reading-guide').forEach(el => {
      if (el !== this.guide) el.remove();
    });

    if (!this.guide) {
      this.guide = this._buildGuide();
    }

    // Append to documentElement (not body) so font-size changes on body don't affect positioning
    if (!document.documentElement.contains(this.guide)) {
      document.documentElement.appendChild(this.guide);
    }

    this._positionGuide(window.innerHeight / 2);

    if (!this._onMove) {
      this._onMove = (e) => this._updateGuide(e);
      document.addEventListener('pointermove', this._onMove, { passive: true, capture: true });
      document.addEventListener('mousemove', this._onMove, { passive: true, capture: true });
      document.addEventListener('touchmove', this._onMove, { passive: true, capture: true });
      window.addEventListener('scroll', this._onMove, { passive: true, capture: true });
      window.addEventListener('resize', this._onMove, { passive: true, capture: true });
    }

    // Periodic re-check for DOM changes (SPA nav, lazy content)
    this._watchTimer = setInterval(() => {
      if (!this.active) return;
      if (!document.documentElement.contains(this.guide)) {
        document.documentElement.appendChild(this.guide);
      }
    }, 700);
  }

  disable() {
    this.active = false;
    document.documentElement.classList.remove('anid-reading-guide-active');

    if (this._onMove) {
      document.removeEventListener('pointermove', this._onMove);
      document.removeEventListener('mousemove', this._onMove);
      document.removeEventListener('touchmove', this._onMove);
      window.removeEventListener('scroll', this._onMove);
      window.removeEventListener('resize', this._onMove);
      this._onMove = null;
    }

    if (this._watchTimer) {
      clearInterval(this._watchTimer);
      this._watchTimer = null;
    }

    if (this.guide) {
      this.guide.remove();
      this.guide = null;
    }
  }

  toggle() { this.active ? this.disable() : this.enable(); }

  _buildGuide() {
    const guide = document.createElement('div');
    guide.id = 'anid-reading-guide';
    guide.setAttribute('data-anid-reading-guide', '');
    guide.setAttribute('aria-hidden', 'true');
    guide.style.cssText = `
      position: fixed !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      height: ${READING_BAND_HEIGHT}px !important;
      margin: 0 !important;
      padding: 0 !important;
      pointer-events: none !important;
      z-index: 2147483640 !important;
      filter: none !important;
      transform: none !important;
      mix-blend-mode: normal !important;
      isolation: isolate !important;
      background: transparent !important;
      border-top: 3px solid ${ACCENT_COLOR} !important;
      border-bottom: 3px solid ${ACCENT_COLOR} !important;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.34) !important;
      opacity: 1 !important;
      visibility: visible !important;
      display: block !important;
      top: 0px !important;
    `;
    return guide;
  }

  _positionGuide(y) {
    if (!this.guide) return;
    const maxTop = Math.max(0, window.innerHeight - READING_BAND_HEIGHT);
    const top = Math.max(0, Math.min(maxTop, y - (READING_BAND_HEIGHT / 2)));
    this.guide.style.top = top + 'px';
    this.guide.style.display = 'block';
    this.guide.style.visibility = 'visible';
  }

  _updateGuide(e) {
    if (!this.guide || !this.active) return;

    if (!document.documentElement.contains(this.guide)) {
      document.documentElement.appendChild(this.guide);
    }

    let y = (typeof e.clientY === 'number') ? e.clientY : null;
    if (y === null && e.touches && e.touches.length) {
      y = e.touches[0].clientY;
    }

    if (typeof y !== 'number') {
      // Scroll or resize without pointer — keep current position
      return;
    }

    this._positionGuide(y);
  }
}
