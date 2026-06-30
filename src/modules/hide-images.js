import { injectStyleToPage, removePageStyle } from '../utils.js';

const STYLE_ID = 'anid-hide-images';

const CSS = `
  html.anid-hide-images body img.anid-hidden-img,
  html.anid-hide-images body picture.anid-hidden-img {
    opacity: 0.08 !important;
    filter: blur(10px) !important;
    pointer-events: none !important;
  }
  html.anid-hide-images body .anid-hidden-bg {
    background-image: none !important;
  }
`;

const WIDGET_HOST_ID = 'opennagish-widget';
const READING_GUIDE_ID = 'anid-reading-guide';

function isInsideWidget(el) {
  if (!el) return false;
  if (el.id === WIDGET_HOST_ID) return true;
  if (el.id === READING_GUIDE_ID) return true;
  return !!(el.closest && el.closest('#' + WIDGET_HOST_ID));
}

function getImgDimensions(img) {
  if (!img) return { w: 0, h: 0 };
  const rect = img.getBoundingClientRect ? img.getBoundingClientRect() : { width: 0, height: 0 };
  return {
    w: Math.max(img.naturalWidth || 0, img.offsetWidth || 0, rect.width || 0, parseInt(img.getAttribute('width'), 10) || 0),
    h: Math.max(img.naturalHeight || 0, img.offsetHeight || 0, rect.height || 0, parseInt(img.getAttribute('height'), 10) || 0),
  };
}

function isLikelyIconSrc(src) {
  if (!src) return true;
  const s = src.toLowerCase();
  return s.startsWith('data:image/svg') ||
    /(?:^|[\\/_-])(?:icon|favicon|sprite|emoji|logo-sm|badge)(?:[\\/_.-]|$)/.test(s);
}

function shouldHideImage(el) {
  const tag = el.tagName.toLowerCase();
  if (tag !== 'img' && tag !== 'picture') return false;
  if (isInsideWidget(el)) return false;

  const img = tag === 'picture' ? el.querySelector('img') : el;
  if (!img) return false;

  const dims = getImgDimensions(img);
  const w = Math.round(dims.w);
  const h = Math.round(dims.h);

  // Small icons — don't hide
  if (w > 0 && h > 0 && w <= 36 && h <= 36) return false;

  const src = img.currentSrc || img.src || '';
  if (isLikelyIconSrc(src) && w <= 64 && h <= 64) return false;

  // Lazy / not yet loaded — hide by src (will re-scan after load)
  if (w === 0 && h === 0) {
    return src.length > 0 && !isLikelyIconSrc(src);
  }

  const inButton = el.closest('button, [role="button"], label, input, select, textarea');
  if (inButton && w <= 64 && h <= 64) return false;

  // Inside a link: hide large images (decorative wrappers), keep small icons
  const inLink = el.closest('a, [role="link"]');
  if (inLink) {
    if (w <= 56 && h <= 56) return false;
    return true;
  }

  return w > 36 || h > 36;
}

function shouldHideBackground(el) {
  if (!el || el.nodeType !== 1 || isInsideWidget(el)) return false;
  const tag = el.tagName.toLowerCase();
  if (['button', 'input', 'select', 'textarea', 'label', 'svg', 'path', 'style', 'script'].includes(tag)) return false;

  const role = (el.getAttribute('role') || '').toLowerCase();
  if (role === 'button' || role === 'link' || role === 'menuitem' || role === 'tab') return false;

  if (tag === 'a' || tag === 'button') {
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const onlyImg = el.children.length <= 1 && el.querySelector('img');
    if (text.length > 0 && !onlyImg) return false;
  }

  let bg = '';
  try {
    bg = window.getComputedStyle(el).backgroundImage || '';
  } catch (e) {
    return false;
  }
  if (!bg || bg === 'none' || bg.indexOf('url(') === -1) return false;

  const rect = el.getBoundingClientRect();
  if (rect.width < 40 || rect.height < 40) return false;

  // Element with meaningful text — don't hide (styled button)
  const ownText = Array.from(el.childNodes)
    .filter(n => n.nodeType === 3)
    .map(n => (n.textContent || '').trim())
    .join('');
  if (ownText.length > 1) return false;

  const parentInteractive = el.closest('a, button, [role="button"]');
  if (parentInteractive && parentInteractive !== el) {
    const pt = (parentInteractive.textContent || '').trim();
    const et = (el.textContent || '').trim();
    if (pt.length > 1 && et.length > 1) return false;
  }

  return true;
}

function scanImages() {
  document.querySelectorAll('body img, body picture').forEach(el => {
    if (isInsideWidget(el)) return;
    if (shouldHideImage(el)) {
      el.classList.add('anid-hidden-img');
    } else {
      el.classList.remove('anid-hidden-img');
    }
  });
}

function scanBackgrounds() {
  document.querySelectorAll('body div, body span, body figure, body section, body article, body a, body li, body header, body main, body aside').forEach(el => {
    if (isInsideWidget(el)) return;
    if (shouldHideBackground(el)) {
      el.classList.add('anid-hidden-bg');
    } else {
      el.classList.remove('anid-hidden-bg');
    }
  });
}

function scanAll() {
  scanImages();
  scanBackgrounds();
}

let scanTimer = null;
function scheduleScan() {
  clearTimeout(scanTimer);
  scanTimer = setTimeout(scanAll, 250);
}

export class HideImagesModule {
  constructor(ctx) {
    this.ctx = ctx;
    this.active = false;
    this.observer = null;
    this._imgLoadHandlers = [];
  }

  enable() {
    if (this.active) return;
    this.active = true;
    injectStyleToPage(STYLE_ID, CSS);
    document.documentElement.classList.add('anid-hide-images');
    scanAll();

    if (!this.observer && document.body) {
      this.observer = new MutationObserver(() => {
        if (document.documentElement.classList.contains('anid-hide-images')) {
          scheduleScan();
        }
      });
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'srcset', 'style', 'class', 'loading'],
      });
    }

    // Track lazy-loaded images
    document.querySelectorAll('body img').forEach(img => {
      if (isInsideWidget(img)) return;
      if (!img.complete) {
        const onLoad = () => scheduleScan();
        img.addEventListener('load', onLoad, { once: true });
        img.addEventListener('error', onLoad, { once: true });
        this._imgLoadHandlers.push({ img, onLoad });
      }
    });

    // Re-scan after layout settles (lazy images)
    setTimeout(scanAll, 600);
    setTimeout(scanAll, 1500);
  }

  disable() {
    this.active = false;
    document.documentElement.classList.remove('anid-hide-images');
    removePageStyle(STYLE_ID);

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    clearTimeout(scanTimer);

    this._imgLoadHandlers.forEach(({ img, onLoad }) => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onLoad);
    });
    this._imgLoadHandlers = [];

    document.querySelectorAll('.anid-hidden-img, .anid-hidden-bg').forEach(el => {
      el.classList.remove('anid-hidden-img');
      el.classList.remove('anid-hidden-bg');
    });
  }

  toggle() { this.active ? this.disable() : this.enable(); }
}
