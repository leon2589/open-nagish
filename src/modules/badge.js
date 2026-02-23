import { t } from '../i18n.js';

export class BadgeModule {
  constructor(ctx) { this.ctx = ctx; this.modal = null; this.backdrop = null; }

  show() {
    this.close();
    const siteName = this.ctx.config?.statementData?.orgName || window.location.hostname;

    const badgeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="36" viewBox="0 0 220 36">
  <rect width="220" height="36" rx="6" fill="#1565c0"/>
  <rect x="1" y="1" width="218" height="34" rx="5" fill="none" stroke="#fff" stroke-opacity="0.3"/>
  <circle cx="18" cy="18" r="10" fill="#fff" fill-opacity="0.2"/>
  <text x="18" y="22" text-anchor="middle" fill="#fff" font-size="14" font-family="sans-serif">♿</text>
  <text x="36" y="14" fill="#fff" font-size="10" font-family="sans-serif" font-weight="bold">WCAG 2.1 AA + SI 5568</text>
  <text x="36" y="28" fill="#fff" font-size="9" font-family="sans-serif" opacity="0.8">AccessibioNid Compliant</text>
</svg>`;

    const embedCode = `<a href="#" title="Accessibility"><img src="data:image/svg+xml,${encodeURIComponent(badgeSvg.trim())}" alt="WCAG 2.1 AA + SI 5568 Accessible" width="220" height="36"></a>`;

    this.backdrop = document.createElement('div');
    this.backdrop.style.cssText = 'position:fixed;z-index:2147483644;inset:0;background:rgba(0,0,0,0.5);';
    this.backdrop.addEventListener('click', () => this.close());

    this.modal = document.createElement('div');
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-label', t('complianceBadge'));
    this.modal.style.cssText = `
      position:fixed;z-index:2147483645;
      top:50%;left:50%;transform:translate(-50%,-50%);
      width:500px;max-width:calc(100vw - 40px);
      background:#fff;border-radius:12px;
      box-shadow:0 16px 48px rgba(0,0,0,0.3);
      padding:32px;font-family:sans-serif;
    `;

    this.modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="font-size:20px;margin:0;">${t('complianceBadge')}</h2>
        <button id="anid-badge-close" style="background:none;border:none;font-size:24px;cursor:pointer;width:44px;height:44px;" aria-label="${t('close')}">✕</button>
      </div>
      <div style="text-align:center;margin:20px 0;">${badgeSvg}</div>
      <p style="font-size:13px;color:#666;margin-bottom:8px;">Embed code:</p>
      <textarea readonly style="width:100%;height:80px;padding:8px;border:1px solid #ccc;border-radius:6px;font-size:12px;font-family:monospace;resize:none;">${embedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
      <button id="anid-badge-copy" style="margin-top:12px;padding:8px 20px;background:#1565c0;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;min-height:44px;">${t('copied').replace(t('copied'), 'Copy')}</button>
    `;

    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);

    this.modal.querySelector('#anid-badge-close').addEventListener('click', () => this.close());
    this.modal.querySelector('#anid-badge-copy').addEventListener('click', () => {
      const textarea = this.modal.querySelector('textarea');
      textarea.select();
      navigator.clipboard?.writeText(embedCode).then(() => {
        this.ctx.announce(t('copied'));
      });
    });

    document.addEventListener('keydown', this._escHandler = (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  close() {
    if (this.modal) { this.modal.remove(); this.modal = null; }
    if (this.backdrop) { this.backdrop.remove(); this.backdrop = null; }
    if (this._escHandler) document.removeEventListener('keydown', this._escHandler);
  }

  enable() {}
  disable() { this.close(); }
}
