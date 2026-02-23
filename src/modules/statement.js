import { t, getLanguage } from '../i18n.js';

export class StatementModule {
  constructor(ctx) { this.ctx = ctx; this.modal = null; this.backdrop = null; }

  show() {
    const config = this.ctx.config;
    if (config.statementUrl) {
      window.open(config.statementUrl, '_blank');
      return;
    }

    this.close();
    const data = config.statementData || {};

    this.backdrop = document.createElement('div');
    this.backdrop.style.cssText = 'position:fixed;z-index:2147483644;inset:0;background:rgba(0,0,0,0.5);';
    this.backdrop.addEventListener('click', () => this.close());

    this.modal = document.createElement('div');
    const dir = getLanguage() === 'he' || getLanguage() === 'ar' ? 'rtl' : 'ltr';
    this.modal.setAttribute('dir', dir);
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-label', t('statementTitle'));
    this.modal.style.cssText = `
      position: fixed; z-index: 2147483645;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 600px; max-width: calc(100vw - 40px); max-height: calc(100vh - 80px);
      background: #fff; border-radius: 12px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.3);
      overflow-y: auto; padding: 32px;
      font-family: sans-serif; color: #1a1a2e; line-height: 1.7;
    `;

    const accommodations = data.accommodations || [
      getLanguage() === 'he' ? 'התאמת ניגודיות וצבעים' : 'Contrast and color adjustments',
      getLanguage() === 'he' ? 'שינוי גודל גופן' : 'Font size adjustment',
      getLanguage() === 'he' ? 'ניווט באמצעות מקלדת' : 'Keyboard navigation',
      getLanguage() === 'he' ? 'תאימות לקוראי מסך' : 'Screen reader compatibility',
      getLanguage() === 'he' ? 'הדגשת קישורים' : 'Link highlighting',
      getLanguage() === 'he' ? 'עצירת אנימציות' : 'Animation control',
    ];

    const accList = accommodations.map(a => `<li>${a}</li>`).join('');

    this.modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="font-size:22px;margin:0;">${t('statementTitle')}</h2>
        <button id="anid-stmt-close" style="background:none;border:none;font-size:24px;cursor:pointer;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;" aria-label="${t('close')}">✕</button>
      </div>
      <p>${t('statementIntro')}</p>
      ${data.coordinatorName ? `<p><strong>${t('statementCoordinator')}:</strong> ${data.coordinatorName}</p>` : ''}
      ${data.orgPhone ? `<p><strong>${t('statementPhone')}:</strong> <a href="tel:${data.orgPhone}">${data.orgPhone}</a></p>` : ''}
      ${data.orgEmail ? `<p><strong>${t('statementEmail')}:</strong> <a href="mailto:${data.orgEmail}">${data.orgEmail}</a></p>` : ''}
      ${data.lastAuditDate ? `<p><strong>${t('statementLastAudit')}:</strong> ${data.lastAuditDate}</p>` : ''}
      <p><strong>${t('statementAccommodations')}:</strong></p>
      <ul style="padding-inline-start:20px;margin-bottom:16px;">${accList}</ul>
      <p style="font-size:12px;color:#888;">Powered by AccessibioNid | SI 5568 + WCAG 2.1 AA</p>
    `;

    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);
    this.modal.querySelector('#anid-stmt-close').addEventListener('click', () => this.close());
    this.modal.querySelector('#anid-stmt-close').focus();

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
