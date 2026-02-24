export class ReadingGuideModule {
  constructor(ctx) { this.ctx = ctx; this.active = false; this.guide = null; this._onMove = null; }

  enable() {
    if (this.active) return;
    this.active = true;
    if (!this.guide) {
      this.guide = document.createElement('div');
      this.guide.id = 'anid-reading-guide';
      this.guide.style.cssText = `
        position: fixed;
        left: 0;
        width: 100%;
        height: 12px;
        background: rgba(21, 101, 192, 0.15);
        border-top: 2px solid rgba(21, 101, 192, 0.5);
        border-bottom: 2px solid rgba(21, 101, 192, 0.5);
        pointer-events: none;
        z-index: 2147483640;
        transition: top 0.05s linear;
      `;
      document.body.appendChild(this.guide);
    }
    this.guide.style.display = '';
    this._onMove = (e) => {
      this.guide.style.top = `${e.clientY - 6}px`;
    };
    document.addEventListener('mousemove', this._onMove);
  }

  disable() {
    this.active = false;
    if (this._onMove) {
      document.removeEventListener('mousemove', this._onMove);
      this._onMove = null;
    }
    if (this.guide) {
      this.guide.remove();
      this.guide = null;
    }
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
