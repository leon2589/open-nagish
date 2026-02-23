const MASK_ID = 'anid-line-mask';

export class LineMaskModule {
  constructor(ctx) {
    this.ctx = ctx;
    this.active = false;
    this.maskTop = null;
    this.maskBottom = null;
    this._onMove = null;
  }

  enable() {
    this.active = true;
    if (!this.maskTop) {
      this.maskTop = this._createOverlay('top');
      this.maskBottom = this._createOverlay('bottom');
      document.body.appendChild(this.maskTop);
      document.body.appendChild(this.maskBottom);
    }
    this.maskTop.style.display = '';
    this.maskBottom.style.display = '';

    this._onMove = (e) => {
      const lineHeight = 80;
      const y = e.clientY;
      this.maskTop.style.height = `${Math.max(0, y - lineHeight / 2)}px`;
      this.maskBottom.style.top = `${y + lineHeight / 2}px`;
      this.maskBottom.style.height = `${Math.max(0, window.innerHeight - y - lineHeight / 2)}px`;
    };
    document.addEventListener('mousemove', this._onMove);
  }

  _createOverlay(position) {
    const el = document.createElement('div');
    el.className = `${MASK_ID}-${position}`;
    el.style.cssText = `
      position: fixed;
      left: 0;
      width: 100%;
      background: rgba(0, 0, 0, 0.6);
      pointer-events: none;
      z-index: 2147483640;
      transition: height 0.05s linear, top 0.05s linear;
    `;
    if (position === 'top') {
      el.style.top = '0';
      el.style.height = '0';
    } else {
      el.style.bottom = '0';
      el.style.height = '0';
    }
    return el;
  }

  disable() {
    this.active = false;
    if (this.maskTop) this.maskTop.style.display = 'none';
    if (this.maskBottom) this.maskBottom.style.display = 'none';
    if (this._onMove) document.removeEventListener('mousemove', this._onMove);
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
