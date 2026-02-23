import { t } from '../i18n.js';

const LANDMARK_ROLES = {
  banner: 'header',
  navigation: 'nav',
  main: 'main',
  contentinfo: 'footer',
  complementary: 'aside',
  form: 'form',
  search: 'search',
};

export class PageStructureModule {
  constructor(ctx) { this.ctx = ctx; }

  populateList(listEl) {
    listEl.innerHTML = '';
    const landmarks = [];

    document.querySelectorAll('[role]').forEach(el => {
      const role = el.getAttribute('role');
      if (LANDMARK_ROLES[role]) {
        landmarks.push({ el, label: el.getAttribute('aria-label') || t(LANDMARK_ROLES[role]), role });
      }
    });

    ['header', 'nav', 'main', 'footer', 'aside', 'form', 'search'].forEach(tag => {
      document.querySelectorAll(tag).forEach(el => {
        if (!el.getAttribute('role')) {
          landmarks.push({ el, label: el.getAttribute('aria-label') || t(tag), role: tag });
        }
      });
    });

    if (landmarks.length === 0) {
      listEl.innerHTML = `<li style="padding:8px;color:#888;font-size:13px;">${t('noLandmarks')}</li>`;
      return;
    }

    landmarks.forEach(({ el, label, role }) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = `${role}: ${label}`;
      btn.addEventListener('click', () => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      });
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  enable() {}
  disable() {}
}
