import { t, getLanguage } from '../i18n.js';
import { escapeHtml } from '../utils.js';

export class BadgeModule {
  constructor(ctx) { this.ctx = ctx; this.modal = null; this.backdrop = null; this._escHandler = null; }

  _buildSvg() {
    const label = `WCAG 2.1 AA + SI 5568`;
    const sub = `OpenNagish ${t('badgeCompliant')}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="40" viewBox="0 0 240 40">
  <defs>
    <linearGradient id="abg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1976d2"/>
      <stop offset="100%" stop-color="#0d47a1"/>
    </linearGradient>
  </defs>
  <rect width="240" height="40" rx="8" fill="url(#abg)"/>
  <rect x="1" y="1" width="238" height="38" rx="7" fill="none" stroke="#fff" stroke-opacity="0.25"/>
  <circle cx="20" cy="20" r="12" fill="#fff" fill-opacity="0.2"/>
  <text x="20" y="25" text-anchor="middle" fill="#fff" font-size="16" font-family="sans-serif">&#x267F;</text>
  <text x="40" y="16" fill="#fff" font-size="11" font-family="sans-serif" font-weight="bold">${escapeHtml(label)}</text>
  <text x="40" y="31" fill="#fff" font-size="10" font-family="sans-serif" opacity="0.85">${escapeHtml(sub)}</text>
</svg>`;
  }

  show() {
    this.close();

    const badgeSvg = this._buildSvg();
    const embedCode = `<a href="#" title="Accessibility"><img src="data:image/svg+xml,${encodeURIComponent(badgeSvg.trim())}" alt="WCAG 2.1 AA + SI 5568 Accessible" width="240" height="40"></a>`;

    const dir = getLanguage() === 'he' || getLanguage() === 'ar' ? 'rtl' : 'ltr';

    this.backdrop = document.createElement('div');
    this.backdrop.style.cssText = 'position:fixed;z-index:2147483644;inset:0;background:rgba(0,0,0,0.5);';
    this.backdrop.addEventListener('click', () => this.close());

    this.modal = document.createElement('div');
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('dir', dir);
    this.modal.setAttribute('aria-label', t('complianceBadge'));
    this.modal.style.cssText = `
      position:fixed;z-index:2147483645;
      top:50%;left:50%;transform:translate(-50%,-50%);
      width:520px;max-width:calc(100vw - 40px);
      background:#fff;border-radius:12px;
      box-shadow:0 16px 48px rgba(0,0,0,0.3);
      padding:32px;font-family:sans-serif;color:#1a1a2e;
    `;

    this.modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="font-size:20px;margin:0;">${escapeHtml(t('complianceBadge'))}</h2>
        <button id="anid-badge-close" style="background:none;border:none;font-size:24px;cursor:pointer;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;" aria-label="${escapeHtml(t('close'))}">&#x2715;</button>
      </div>
      <div style="text-align:center;padding:24px;background:#f5f5f5;border-radius:8px;margin-bottom:20px;">${badgeSvg}</div>
      <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:600;">${escapeHtml(t('embedCode'))}</label>
      <textarea readonly style="width:100%;height:80px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:12px;font-family:monospace;resize:none;background:#fafafa;direction:ltr;text-align:left;">${escapeHtml(embedCode)}</textarea>
      <button id="anid-badge-copy" style="display:block;margin-top:14px;padding:10px 24px;background:#1565c0;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;min-height:44px;font-weight:600;margin-inline-start:auto;">${escapeHtml(t('copyCode'))}</button>
    `;

    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);

    const copyBtn = this.modal.querySelector('#anid-badge-copy');
    this.modal.querySelector('#anid-badge-close').addEventListener('click', () => this.close());
    copyBtn.addEventListener('click', () => {
      this._copyToClipboard(embedCode).then(() => {
        copyBtn.textContent = t('copied');
        copyBtn.style.background = '#2e7d32';
        setTimeout(() => {
          copyBtn.textContent = t('copyCode');
          copyBtn.style.background = '#1565c0';
        }, 2000);
        this.ctx.announce(t('copied'));
      }).catch(() => {});
    });

    this._escHandler = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', this._escHandler);

    this.modal.querySelector('#anid-badge-close').focus();
  }

  _copyToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        ok ? resolve() : reject(new Error('execCommand failed'));
      } catch (e) { reject(e); }
    });
  }

  close() {
    if (this.modal) { this.modal.remove(); this.modal = null; }
    if (this.backdrop) { this.backdrop.remove(); this.backdrop = null; }
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
  }

  enable() {}
  disable() { this.close(); }
}
