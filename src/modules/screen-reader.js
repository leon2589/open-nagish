import { t } from '../i18n.js';
import { escapeHtml } from '../utils.js';

export class ScreenReaderModule {
  constructor(ctx) { this.ctx = ctx; this.overlay = null; this._escHandler = null; }

  toggle() {
    this.overlay ? this.close() : this.show();
  }

  show() {
    const content = this.extractContent();
    this.overlay = document.createElement('div');
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', t('screenReaderPreview'));
    this.overlay.style.cssText = `
      position: fixed;
      z-index: 2147483645;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.92);
      color: #e0e0e0;
      overflow-y: auto;
      padding: 60px 40px 40px;
      font-family: 'Courier New', monospace;
      font-size: 15px;
      line-height: 2;
      white-space: pre-wrap;
    `;
    this.overlay.textContent = content;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = `\u2715 ${t('close')}`;
    closeBtn.setAttribute('aria-label', t('close'));
    closeBtn.style.cssText = `
      position: fixed;
      top: 12px; inset-inline-end: 12px;
      z-index: 2147483646;
      background: #c62828;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      min-width: 44px;
      min-height: 44px;
    `;
    closeBtn.addEventListener('click', () => this.close());

    this.overlay.appendChild(closeBtn);
    document.body.appendChild(this.overlay);
    closeBtn.focus();

    this._escHandler = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', this._escHandler);
  }

  close() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
  }

  extractContent() {
    const lines = [];
    const title = document.title;
    if (title) lines.push(`[Page Title] ${title}\n`);

    const lang = document.documentElement.lang;
    if (lang) lines.push(`[Language] ${lang}\n`);

    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) lines.push(text);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const tag = node.tagName.toLowerCase();
      const role = node.getAttribute('role');

      if (['script', 'style', 'noscript', 'template'].includes(tag)) return;
      if (node.hidden || node.getAttribute('aria-hidden') === 'true') return;
      if (node.id === 'opennagish-widget') return;

      if (/^h[1-6]$/.test(tag)) {
        lines.push(`\n[${'#'.repeat(parseInt(tag[1]))} Heading ${tag[1]}] ${node.textContent.trim()}`);
        return;
      }
      if (tag === 'img') {
        const alt = node.alt || t('noAltText');
        lines.push(`[Image: ${alt}]`);
        return;
      }
      if (tag === 'a' && node.href) {
        lines.push(`[Link: ${node.textContent.trim()} -> ${node.href}]`);
        return;
      }
      if (['nav', 'header', 'footer', 'main', 'aside'].includes(tag) || role) {
        const ariaLabel = node.getAttribute('aria-label');
        lines.push(`\n--- [${role || tag}${ariaLabel ? ': ' + ariaLabel : ''}] ---`);
      }
      if (tag === 'li') lines.push('  \u2022 ');

      for (const child of node.childNodes) {
        walk(child);
      }
    };

    walk(document.body);
    return lines.join('\n');
  }

  enable() {}
  disable() { this.close(); }
}
