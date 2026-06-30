import { t, getLanguage, getDir } from '../i18n.js';
import { escapeHtml } from '../utils.js';

const ACCENT = '#1565c0';

export class KeyboardNavModule {
  constructor(ctx) {
    this.ctx = ctx;
    this.modal = null;
    this.backdrop = null;
    this._escHandler = null;
  }

  show() {
    this.close();

    const dir = getDir();
    const isRtl = dir === 'rtl';
    const listPad = isRtl ? 'padding-right: 20px;' : 'padding-left: 20px;';

    // Navigation keys
    const navItems = [
      { key: 'Tab', action: 'kb_nav_tab' },
      { key: 'Shift + Tab', action: 'kb_nav_shift_tab' },
      { key: 'Enter/Space', action: 'kb_nav_enter' },
      { key: 'ESC', action: 'kb_nav_esc' },
      { key: 'Arrow Keys', action: 'kb_nav_arrows' },
    ].filter(n => {
      const actionLabel = t(n.action);
      return actionLabel && actionLabel !== n.action;
    });

    const navHtml = navItems.map(n => {
      const action = t(n.action);
      return `<li><strong>${escapeHtml(n.key)}</strong> - ${escapeHtml(action)}</li>`;
    }).join('');

    // Accessibility shortcuts
    const accItems = [
      { key: 'Ctrl + Plus', action: 'kb_acc_plus' },
      { key: 'Ctrl + Minus', action: 'kb_acc_minus' },
      { key: 'Ctrl + 0', action: 'kb_acc_reset' },
    ].filter(a => {
      const actionLabel = t(a.action);
      return actionLabel && actionLabel !== a.action;
    });

    const accHtml = accItems.map(a => {
      const action = t(a.action);
      return `<li><strong>${escapeHtml(a.key)}</strong> - ${escapeHtml(action)}</li>`;
    }).join('');

    const content = `
      <div style="line-height:1.6;">
        <p><strong>${escapeHtml(t('kb_nav_title'))}</strong></p>
        <ul style="margin:12px 0;${listPad}">${navHtml}</ul>
        <p><strong>${escapeHtml(t('kb_acc_title'))}</strong></p>
        <ul style="margin:12px 0;${listPad}">${accHtml}</ul>
      </div>
    `;

    this._renderModal(t('modal_keyboard') || 'Keyboard Navigation', content, isRtl);
  }

  _renderModal(title, content, isRtl) {
    this.backdrop = document.createElement('div');
    this.backdrop.style.cssText = `
      position: fixed; z-index: 2147483644;
      inset: 0; background: rgba(0,0,0,0.5);
    `;
    this.backdrop.addEventListener('click', () => this.close());

    this.modal = document.createElement('div');
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-label', title);
    this.modal.style.cssText = `
      position: fixed; z-index: 2147483645;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 500px; max-width: calc(100vw - 40px); max-height: calc(100vh - 80px);
      background: #fff; border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.2);
      overflow-y: auto; padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #334155; line-height: 1.7;
      direction: ${isRtl ? 'rtl' : 'ltr'};
    `;

    this.modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
        <h3 style="font-size:18px;font-weight:600;margin:0;color:#1a202c;">${escapeHtml(title)}</h3>
        <button type="button" class="anid-modal-close" style="
          width:32px;height:32px;border-radius:50%;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          font-size:18px;transition:all 0.2s ease;
          background:#f1f5f9;color:#64748b;border:none;
        ">×</button>
      </div>
      <div class="anid-modal-body">${content}</div>
    `;

    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);

    this.modal.querySelector('.anid-modal-close').addEventListener('click', () => this.close());
    this.modal.querySelector('.anid-modal-close').focus();

    this._escHandler = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', this._escHandler);
  }

  close() {
    if (this.modal) { this.modal.remove(); this.modal = null; }
    if (this.backdrop) { this.backdrop.remove(); this.backdrop = null; }
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
  }

  toggle() { this.modal ? this.close() : this.show(); }
  enable() { this.show(); }
  disable() { this.close(); }
}
