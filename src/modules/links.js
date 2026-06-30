import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-highlight-links';

const CSS = `
  html.anid-highlight-links body a[href],
  html.anid-highlight-links body area[href],
  html.anid-highlight-links body .anid-highlight-link {
    background-color: #ffff00 !important;
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
    padding: 2px 4px !important;
    border-radius: 3px !important;
    text-decoration: underline !important;
    outline: 2px solid #ca8a04 !important;
    outline-offset: 1px !important;
    box-decoration-break: clone !important;
    -webkit-box-decoration-break: clone !important;
  }
`;

const WIDGET_HOST_ID = 'opennagish-widget';

function isInsideWidget(el) {
  if (!el) return false;
  if (el.id === WIDGET_HOST_ID) return true;
  return !!(el.closest && el.closest('#' + WIDGET_HOST_ID));
}

function collectLinkElements() {
  const found = new Set();
  const selectors = [
    'a[href]',
    'area[href]',
    '[role="link"]',
    '[role="menuitem"]',
    'summary',
    '[aria-haspopup="true"]',
    'nav button',
    'header button',
    '[role="navigation"] button',
    'nav li > span',
    'nav li > button',
    'header li > span',
    'header li > button',
    '[class*="menu"] li > span',
    '[class*="menu"] li > button',
    '[class*="Menu"] li > span',
    '[class*="Menu"] li > button',
    '[class*="nav"] li > span',
    '[class*="nav"] li > button',
  ];

  selectors.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(el => {
        if (isInsideWidget(el)) return;
        if (el.closest && el.closest('a[href]') && el.tagName !== 'A') return;
        found.add(el);
      });
    } catch (ignored) {}
  });

  // Detect nav/menu items with sub-menus
  try {
    document.querySelectorAll('nav li, header li, [class*="menu"] li, [class*="Menu"] li, [class*="nav"] li').forEach(li => {
      if (isInsideWidget(li)) return;
      const hasSub = li.querySelector(':scope > ul, :scope > ol, :scope > [class*="sub"], :scope > [class*="dropdown"], :scope > [class*="child"]');
      if (!hasSub) return;
      const direct = li.querySelector(':scope > a, :scope > span, :scope > button');
      if (direct && !isInsideWidget(direct)) found.add(direct);
    });
  } catch (ignored) {}

  return found;
}

function scanLinks() {
  // Remove stale highlights
  document.querySelectorAll('.anid-highlight-link').forEach(el => {
    if (!isInsideWidget(el)) {
      el.classList.remove('anid-highlight-link');
    }
  });

  // Apply highlights
  collectLinkElements().forEach(el => {
    el.classList.add('anid-highlight-link');
  });
}

let scanTimer = null;
function scheduleScan() {
  clearTimeout(scanTimer);
  scanTimer = setTimeout(scanLinks, 120);
}

export class LinksModule {
  constructor(ctx) {
    this.ctx = ctx;
    this.active = false;
    this.observer = null;
  }

  enable() {
    if (this.active) return;
    this.active = true;
    injectStyleToPage(STYLE_ID, CSS);
    document.documentElement.classList.add('anid-highlight-links');
    scanLinks();

    if (!this.observer && document.body) {
      this.observer = new MutationObserver(() => {
        if (document.documentElement.classList.contains('anid-highlight-links')) {
          scheduleScan();
        }
      });
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden', 'aria-expanded', 'aria-hidden', 'open'],
      });
    }

    setTimeout(scanLinks, 400);
    setTimeout(scanLinks, 1200);
  }

  disable() {
    this.active = false;
    document.documentElement.classList.remove('anid-highlight-links');
    removePageStyle(STYLE_ID);

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    clearTimeout(scanTimer);

    document.querySelectorAll('.anid-highlight-link').forEach(el => {
      el.classList.remove('anid-highlight-link');
    });
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
