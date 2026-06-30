import { t, getLanguage, getDir } from '../i18n.js';
import { escapeHtml } from '../utils.js';

const ACCENT = '#1565c0';

export class StatementModule {
  constructor(ctx) {
    this.ctx = ctx;
    this.modal = null;
    this.backdrop = null;
    this._escHandler = null;
    this._triggerBtn = null;
  }

  show() {
    const config = this.ctx.config;

    if (config.statementUrl) {
      window.open(config.statementUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    this.close();

    const dir = getDir();
    const isRtl = dir === 'rtl';
    const align = isRtl ? 'right' : 'left';
    const listPad = isRtl ? 'padding-right: 20px;' : 'padding-left: 20px;';

    const data = config.statementData || {};

    // Build menu guide items from translations
    const menuItems = [];
    for (let i = 1; i <= 9; i++) {
      const key = 'stmt_menu_' + i;
      const label = t(key);
      if (label && label !== key) {
        menuItems.push(`<li>${escapeHtml(label)}</li>`);
      }
    }

    // Build keyboard shortcuts from translations
    const shortcuts = [
      { key: 'Esc', action: 'stmt_sc_esc' },
      { key: 'Ctrl +', action: 'stmt_sc_ctrl_plus' },
      { key: 'Ctrl -', action: 'stmt_sc_ctrl_minus' },
      { key: 'Ctrl 0', action: 'stmt_sc_ctrl_0' },
      { key: 'Space', action: 'stmt_sc_space' },
      { key: 'F11', action: 'stmt_sc_f11' },
    ].filter(s => {
      const actionLabel = t(s.action);
      return actionLabel && actionLabel !== s.action;
    });

    const shortcutsHtml = shortcuts.map(s => {
      const action = t(s.action);
      return `<p style="margin-bottom:8px;"><strong>${escapeHtml(s.key)}</strong> - ${escapeHtml(action)}</p>`;
    }).join('');

    // Navigation keys
    const navKeys = [
      { key: 'Tab', action: 'kb_nav_tab' },
      { key: 'Shift + Tab', action: 'kb_nav_shift_tab' },
      { key: 'Enter/Space', action: 'kb_nav_enter' },
      { key: 'ESC', action: 'kb_nav_esc' },
      { key: 'Arrow Keys', action: 'kb_nav_arrows' },
    ].filter(n => {
      const actionLabel = t(n.action);
      return actionLabel && actionLabel !== n.action;
    });

    const navKeysHtml = navKeys.map(n => {
      const action = t(n.action);
      return `<li><strong>${escapeHtml(n.key)}</strong> - ${escapeHtml(action)}</li>`;
    }).join('');

    // Accessibility shortcuts
    const accKeys = [
      { key: 'Ctrl + Plus', action: 'kb_acc_plus' },
      { key: 'Ctrl + Minus', action: 'kb_acc_minus' },
      { key: 'Ctrl + 0', action: 'kb_acc_reset' },
    ].filter(a => {
      const actionLabel = t(a.action);
      return actionLabel && actionLabel !== a.action;
    });

    const accKeysHtml = accKeys.map(a => {
      const action = t(a.action);
      return `<li><strong>${escapeHtml(a.key)}</strong> - ${escapeHtml(action)}</li>`;
    }).join('');

    // Custom statement from site config
    const customStatement = config.accessibilityStatement
      ? `<div style="border-top:1px solid #e0e0e0;margin-top:20px;padding-top:15px;">
           <h3 style="color:${ACCENT};margin-bottom:10px;">${escapeHtml(t('stmt_custom'))}</h3>
           <p>${escapeHtml(config.accessibilityStatement)}</p>
         </div>`
      : '';

    const content = `
      <div style="line-height:1.8;text-align:${align};">
        <h3 style="color:${ACCENT};margin-bottom:15px;">${escapeHtml(t('stmt_intro'))}</h3>
        <p style="margin-bottom:12px;">${escapeHtml(t('stmt_intro_p1'))}</p>
        <p style="margin-bottom:12px;">${escapeHtml(t('stmt_intro_p2'))}</p>

        <h3 style="color:${ACCENT};margin:20px 0 15px 0;">${escapeHtml(t('stmt_widget'))}</h3>
        <p style="margin-bottom:12px;">${escapeHtml(t('stmt_widget_p'))}</p>

        <h3 style="color:${ACCENT};margin:20px 0 15px 0;">${escapeHtml(t('stmt_menu'))}</h3>
        <ul style="margin-bottom:15px;${listPad}line-height:1.6;">${menuItems.join('')}</ul>

        <h3 style="color:${ACCENT};margin:20px 0 15px 0;">${escapeHtml(t('stmt_shortcuts'))}</h3>
        ${shortcutsHtml}

        <h3 style="color:${ACCENT};margin:20px 0 15px 0;">${escapeHtml(t('kb_nav_title'))}</h3>
        <ul style="margin:12px 0;${listPad}">${navKeysHtml}</ul>

        <h3 style="color:${ACCENT};margin:20px 0 15px 0;">${escapeHtml(t('kb_acc_title'))}</h3>
        <ul style="margin:12px 0;${listPad}">${accKeysHtml}</ul>

        <h3 style="color:${ACCENT};margin:20px 0 15px 0;">${escapeHtml(t('stmt_clarify'))}</h3>
        <p style="margin-bottom:12px;">${escapeHtml(t('stmt_clarify_p1'))}</p>
        <p style="margin-bottom:12px;">${escapeHtml(t('stmt_clarify_p2'))}</p>
        <p style="margin-bottom:12px;">${escapeHtml(t('stmt_clarify_p3'))}</p>

        ${customStatement}
      </div>
    `;

    this._renderModal(t('modal_statement') || t('statementTitle'), content, isRtl);
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
      width: 600px; max-width: calc(100vw - 40px); max-height: calc(100vh - 80px);
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

  enable() {}
  disable() { this.close(); }
}
