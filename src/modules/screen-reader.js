export class ScreenReaderModule {
  constructor(ctx) { this.ctx = ctx; this.overlay = null; }

  toggle() {
    if (this.overlay) {
      this.close();
    } else {
      this.show();
    }
  }

  show() {
    const content = this.extractContent();
    this.overlay = document.createElement('div');
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
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
      position: fixed;
      top: 12px; right: 12px;
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
  }

  close() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  extractContent() {
    const lines = [];
    const title = document.title;
    if (title) lines.push(`[Page Title] ${title}\n`);

    const lang = document.documentElement.lang;
    if (lang) lines.push(`[Language] ${lang}\n`);

    const walk = (node, depth = 0) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) lines.push(text);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const el = node;
      const tag = el.tagName.toLowerCase();
      const role = el.getAttribute('role');

      if (['script', 'style', 'noscript', 'template'].includes(tag)) return;
      if (el.hidden || el.getAttribute('aria-hidden') === 'true') return;
      if (el.id === 'opennagish-widget') return;

      if (/^h[1-6]$/.test(tag)) {
        lines.push(`\n[${'#'.repeat(parseInt(tag[1]))} Heading ${tag[1]}] ${el.textContent.trim()}`);
        return;
      }
      if (tag === 'img') {
        const alt = el.alt || '(no alt text)';
        lines.push(`[Image: ${alt}]`);
        return;
      }
      if (tag === 'a' && el.href) {
        lines.push(`[Link: ${el.textContent.trim()} -> ${el.href}]`);
        return;
      }
      if (['nav', 'header', 'footer', 'main', 'aside'].includes(tag) || role) {
        lines.push(`\n--- [${role || tag}${el.getAttribute('aria-label') ? ': ' + el.getAttribute('aria-label') : ''}] ---`);
      }
      if (tag === 'li') lines.push('  • ');

      for (const child of el.childNodes) {
        walk(child, depth + 1);
      }
    };

    walk(document.body);
    return lines.join('\n');
  }

  enable() {}
  disable() { this.close(); }
}
