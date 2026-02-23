import { getWidgetStyles } from './styles.js';
import { t, setLanguage, getLanguage, getDir, getAvailableLanguages } from './i18n.js';
import * as storage from './storage.js';
import { createElement, announceToScreenReader } from './utils.js';

import { FontSizeModule } from './modules/font-size.js';
import { ContrastModule } from './modules/contrast.js';
import { DarkModeModule } from './modules/dark-mode.js';
import { MonochromeModule } from './modules/monochrome.js';
import { SaturationModule } from './modules/saturation.js';
import { SpacingModule } from './modules/spacing.js';
import { DyslexiaFontModule } from './modules/dyslexia-font.js';
import { HideImagesModule } from './modules/hide-images.js';
import { ColorBlindModule } from './modules/color-blind.js';
import { KeyboardNavModule } from './modules/keyboard-nav.js';
import { FocusModule } from './modules/focus.js';
import { HeadingsModule } from './modules/headings.js';
import { PageStructureModule } from './modules/page-structure.js';
import { ReadingGuideModule } from './modules/reading-guide.js';
import { LineMaskModule } from './modules/line-mask.js';
import { CursorModule } from './modules/cursor.js';
import { ScreenReaderModule } from './modules/screen-reader.js';
import { LinksModule } from './modules/links.js';
import { ImagesModule } from './modules/images.js';
import { AnimationsModule } from './modules/animations.js';
import { MuteSoundsModule } from './modules/mute-sounds.js';
import { StatementModule } from './modules/statement.js';
import { BadgeModule } from './modules/badge.js';

const ICON_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 7h-6l-1.41-1.41A2 2 0 0 0 12.17 7H12a2 2 0 0 0-1.42.59L9 9H3a1 1 0 0 0 0 2h5l1 1v3l-2 5a1 1 0 0 0 1.8.8L11 16h2l2.2 4.8a1 1 0 0 0 1.8-.8l-2-5v-3l1-1h5a1 1 0 0 0 0-2z"/></svg>`;

class AccessibioNidWidget {
  constructor() {
    this.isOpen = false;
    this.modules = {};
    this.shadowHost = null;
    this.shadowRoot = null;
    this.panel = null;
    this.trigger = null;
    this.config = window.AccessibioNidConfig || {};
  }

  init() {
    const savedLang = storage.get('lang', this.config.lang || 'he');
    setLanguage(savedLang);

    this.shadowHost = document.createElement('div');
    this.shadowHost.id = 'accessibionid-widget';
    this.shadowHost.style.cssText = 'all:initial;position:fixed;z-index:2147483647;';
    document.body.appendChild(this.shadowHost);
    this.shadowRoot = this.shadowHost.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = getWidgetStyles();
    this.shadowRoot.appendChild(style);

    const liveRegion = createElement('div', {
      className: 'anid-live-region',
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    });
    this.shadowRoot.appendChild(liveRegion);

    this.createTrigger();
    this.createPanel();
    this.initModules();
    this.restoreState();
    this.bindGlobalKeys();
  }

  createTrigger() {
    const pos = this.config.position || 'bottom-left';
    this.trigger = createElement('button', {
      className: 'anid-trigger',
      'aria-label': t('openPanel'),
      'aria-expanded': 'false',
      'aria-controls': 'anid-panel',
      innerHTML: ICON_SVG,
    });

    this.positionElement(this.trigger, pos);
    this.trigger.addEventListener('click', () => this.toggle());
    this.makeDraggable(this.trigger);
    this.shadowRoot.appendChild(this.trigger);
  }

  createPanel() {
    const pos = this.config.position || 'bottom-left';
    this.panel = createElement('div', {
      className: 'anid-panel',
      id: 'anid-panel',
      role: 'dialog',
      'aria-label': t('panelTitle'),
      'aria-modal': 'false',
    });

    const dir = getDir();
    this.panel.setAttribute('dir', dir);
    this.positionPanel(pos);

    this.panel.innerHTML = this.buildPanelHTML();
    this.shadowRoot.appendChild(this.panel);

    this.bindPanelEvents();
  }

  buildPanelHTML() {
    const langs = getAvailableLanguages();
    const langOptions = langs.map(l => {
      const names = { he: 'עברית', en: 'English', ar: 'العربية', ru: 'Русский' };
      return `<option value="${l}" ${l === getLanguage() ? 'selected' : ''}>${names[l]}</option>`;
    }).join('');

    return `
      <div class="anid-panel-header">
        <span class="anid-panel-title">${t('panelTitle')}</span>
        <select class="anid-lang-select" aria-label="${t('language')}">${langOptions}</select>
        <button class="anid-close-btn" aria-label="${t('closePanel')}">✕</button>
      </div>
      <div class="anid-panel-body">
        ${this.buildCategory('vision', t('categoryVision'), '👁', [
          { id: 'fontSize', type: 'buttons' },
          { id: 'highContrast', type: 'contrast' },
          { id: 'darkMode', type: 'toggle' },
          { id: 'monochrome', type: 'toggle' },
          { id: 'saturation', type: 'slider' },
          { id: 'textSpacing', type: 'toggle' },
          { id: 'dyslexiaFont', type: 'toggle' },
          { id: 'hideImages', type: 'toggle' },
          { id: 'colorBlindSim', type: 'colorblind' },
        ])}
        ${this.buildCategory('navigation', t('categoryNavigation'), '🧭', [
          { id: 'keyboardNav', type: 'toggle' },
          { id: 'focusIndicators', type: 'toggle' },
          { id: 'headingStructure', type: 'headings' },
          { id: 'pageStructure', type: 'landmarks' },
          { id: 'readingGuide', type: 'toggle' },
          { id: 'lineMask', type: 'toggle' },
          { id: 'bigCursor', type: 'toggle' },
          { id: 'screenReaderPreview', type: 'action' },
        ])}
        ${this.buildCategory('media', t('categoryMedia'), '🔊', [
          { id: 'linkHighlight', type: 'toggle' },
          { id: 'imageAltText', type: 'toggle' },
          { id: 'stopAnimations', type: 'toggle' },
          { id: 'muteSounds', type: 'toggle' },
        ])}
        ${this.buildCategory('compliance', t('categoryCompliance'), '✅', [
          { id: 'accessibilityStatement', type: 'action' },
          { id: 'complianceBadge', type: 'action' },
        ])}
      </div>
      <div class="anid-panel-footer">
        <button class="anid-reset-btn">${t('resetAll')}</button>
      </div>
    `;
  }

  buildCategory(id, title, icon, features) {
    const expanded = id === 'vision' ? 'true' : 'false';
    let content = '';
    for (const f of features) {
      content += this.buildFeature(f);
    }
    return `
      <div class="anid-category" data-category="${id}" data-expanded="${expanded}">
        <button class="anid-category-header" aria-expanded="${expanded}">
          <span class="anid-category-icon">${icon}</span>
          <span>${title}</span>
          <span class="anid-category-chevron">▼</span>
        </button>
        <div class="anid-category-content" role="region">
          ${content}
        </div>
      </div>
    `;
  }

  buildFeature(f) {
    const label = t(f.id);
    switch (f.type) {
      case 'toggle':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${label}</span>
            <label class="anid-toggle">
              <input type="checkbox" data-toggle="${f.id}" aria-label="${label}">
              <span class="anid-toggle-slider"></span>
            </label>
          </div>`;
      case 'buttons':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${label}</span>
            <div class="anid-btn-group">
              <button class="anid-btn" data-action="fontDecrease" aria-label="${t('fontSizeDecrease')}">A-</button>
              <button class="anid-btn" data-action="fontReset" aria-label="${t('fontSizeReset')}">A</button>
              <button class="anid-btn" data-action="fontIncrease" aria-label="${t('fontSizeIncrease')}">A+</button>
            </div>
          </div>`;
      case 'contrast':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${label}</span>
            <div class="anid-btn-group">
              <button class="anid-btn" data-action="contrastDark" aria-label="${t('contrastDark')}">${t('contrastDark')}</button>
              <button class="anid-btn" data-action="contrastLight" aria-label="${t('contrastLight')}">${t('contrastLight')}</button>
              <button class="anid-btn" data-action="contrastInvert" aria-label="${t('contrastInvert')}">${t('contrastInvert')}</button>
            </div>
          </div>`;
      case 'slider':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${label}</span>
            <div class="anid-slider-wrap">
              <input type="range" class="anid-slider" data-slider="${f.id}" min="0" max="200" value="100" aria-label="${label}">
            </div>
          </div>`;
      case 'colorblind':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${label}</span>
            <label class="anid-toggle">
              <input type="checkbox" data-toggle="${f.id}" aria-label="${label}">
              <span class="anid-toggle-slider"></span>
            </label>
          </div>
          <div class="anid-sub-options" data-sub="${f.id}" style="display:none">
            <div class="anid-btn-group">
              <button class="anid-btn" data-action="cbProtanopia">${t('protanopia')}</button>
              <button class="anid-btn" data-action="cbDeuteranopia">${t('deuteranopia')}</button>
              <button class="anid-btn" data-action="cbTritanopia">${t('tritanopia')}</button>
            </div>
          </div>`;
      case 'headings':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${label}</span>
            <button class="anid-btn" data-action="toggleHeadings">${t('jumpTo')}</button>
          </div>
          <ul class="anid-heading-list" data-list="headings" style="display:none"></ul>`;
      case 'landmarks':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${label}</span>
            <button class="anid-btn" data-action="toggleLandmarks">${t('jumpTo')}</button>
          </div>
          <ul class="anid-landmark-list" data-list="landmarks" style="display:none"></ul>`;
      case 'action':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${label}</span>
            <button class="anid-btn" data-action="${f.id}">${label}</button>
          </div>`;
      default:
        return '';
    }
  }

  bindPanelEvents() {
    const root = this.shadowRoot;

    root.querySelector('.anid-close-btn').addEventListener('click', () => this.close());

    root.querySelector('.anid-lang-select').addEventListener('change', (e) => {
      const lang = e.target.value;
      setLanguage(lang);
      storage.set('lang', lang);
      this.rebuildPanel();
      announceToScreenReader(t('panelTitle'), root);
    });

    root.querySelector('.anid-reset-btn').addEventListener('click', () => {
      this.resetAll();
      announceToScreenReader(t('resetAll'), root);
    });

    root.querySelectorAll('.anid-category-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.closest('.anid-category');
        const expanded = cat.dataset.expanded === 'true';
        cat.dataset.expanded = expanded ? 'false' : 'true';
        btn.setAttribute('aria-expanded', !expanded);
      });
    });

    root.querySelectorAll('[data-toggle]').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.dataset.toggle;
        this.handleToggle(id, input.checked);
      });
    });

    root.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleAction(btn.dataset.action);
      });
    });

    root.querySelectorAll('[data-slider]').forEach(slider => {
      slider.addEventListener('input', () => {
        this.handleSlider(slider.dataset.slider, parseInt(slider.value, 10));
      });
    });
  }

  handleToggle(id, checked) {
    const moduleMap = {
      darkMode: 'darkMode',
      monochrome: 'monochrome',
      textSpacing: 'spacing',
      dyslexiaFont: 'dyslexiaFont',
      hideImages: 'hideImages',
      colorBlindSim: 'colorBlind',
      keyboardNav: 'keyboardNav',
      focusIndicators: 'focus',
      readingGuide: 'readingGuide',
      lineMask: 'lineMask',
      bigCursor: 'cursor',
      linkHighlight: 'links',
      imageAltText: 'images',
      stopAnimations: 'animations',
      muteSounds: 'muteSounds',
    };
    const mod = this.modules[moduleMap[id]];
    if (mod) {
      if (checked) mod.enable();
      else mod.disable();
      storage.set(id, checked);
    }

    if (id === 'colorBlindSim') {
      const sub = this.shadowRoot.querySelector('[data-sub="colorBlindSim"]');
      if (sub) sub.style.display = checked ? '' : 'none';
      if (!checked) this.modules.colorBlind?.disable();
    }

    announceToScreenReader(`${t(id)} ${checked ? t('on') : t('off')}`, this.shadowRoot);
  }

  handleAction(action) {
    switch (action) {
      case 'fontIncrease': this.modules.fontSize?.increase(); break;
      case 'fontDecrease': this.modules.fontSize?.decrease(); break;
      case 'fontReset': this.modules.fontSize?.reset(); break;
      case 'contrastDark': this.toggleContrast('dark'); break;
      case 'contrastLight': this.toggleContrast('light'); break;
      case 'contrastInvert': this.toggleContrast('invert'); break;
      case 'cbProtanopia': this.modules.colorBlind?.setMode('protanopia'); break;
      case 'cbDeuteranopia': this.modules.colorBlind?.setMode('deuteranopia'); break;
      case 'cbTritanopia': this.modules.colorBlind?.setMode('tritanopia'); break;
      case 'toggleHeadings': this.toggleList('headings'); break;
      case 'toggleLandmarks': this.toggleList('landmarks'); break;
      case 'screenReaderPreview': this.modules.screenReader?.toggle(); break;
      case 'accessibilityStatement': this.modules.statement?.show(); break;
      case 'complianceBadge': this.modules.badge?.show(); break;
    }
  }

  handleSlider(id, value) {
    if (id === 'saturation') {
      this.modules.saturation?.setValue(value);
      storage.set('saturation', value);
    }
  }

  toggleContrast(mode) {
    const current = storage.get('contrast', 'none');
    const next = current === mode ? 'none' : mode;
    this.modules.contrast?.setMode(next);
    storage.set('contrast', next);
    this.updateContrastButtons(next);
    announceToScreenReader(`${t('highContrast')} ${next === 'none' ? t('off') : t(mode === 'dark' ? 'contrastDark' : mode === 'light' ? 'contrastLight' : 'contrastInvert')}`, this.shadowRoot);
  }

  updateContrastButtons(mode) {
    this.shadowRoot.querySelectorAll('[data-action^="contrast"]').forEach(btn => {
      const btnMode = btn.dataset.action.replace('contrast', '').toLowerCase();
      btn.classList.toggle('anid-active', btnMode === mode);
    });
  }

  toggleList(type) {
    const list = this.shadowRoot.querySelector(`[data-list="${type}"]`);
    if (!list) return;
    const visible = list.style.display !== 'none';
    list.style.display = visible ? 'none' : '';
    if (!visible) {
      if (type === 'headings') this.modules.headings?.populateList(list);
      else this.modules.pageStructure?.populateList(list);
    }
  }

  initModules() {
    const ctx = {
      shadowRoot: this.shadowRoot,
      config: this.config,
      announce: (msg) => announceToScreenReader(msg, this.shadowRoot),
    };
    this.modules = {
      fontSize: new FontSizeModule(ctx),
      contrast: new ContrastModule(ctx),
      darkMode: new DarkModeModule(ctx),
      monochrome: new MonochromeModule(ctx),
      saturation: new SaturationModule(ctx),
      spacing: new SpacingModule(ctx),
      dyslexiaFont: new DyslexiaFontModule(ctx),
      hideImages: new HideImagesModule(ctx),
      colorBlind: new ColorBlindModule(ctx),
      keyboardNav: new KeyboardNavModule(ctx),
      focus: new FocusModule(ctx),
      headings: new HeadingsModule(ctx),
      pageStructure: new PageStructureModule(ctx),
      readingGuide: new ReadingGuideModule(ctx),
      lineMask: new LineMaskModule(ctx),
      cursor: new CursorModule(ctx),
      screenReader: new ScreenReaderModule(ctx),
      links: new LinksModule(ctx),
      images: new ImagesModule(ctx),
      animations: new AnimationsModule(ctx),
      muteSounds: new MuteSoundsModule(ctx),
      statement: new StatementModule(ctx),
      badge: new BadgeModule(ctx),
    };
  }

  restoreState() {
    const prefs = storage.getAll();
    const toggleMap = {
      darkMode: 'darkMode',
      monochrome: 'monochrome',
      textSpacing: 'spacing',
      dyslexiaFont: 'dyslexiaFont',
      hideImages: 'hideImages',
      keyboardNav: 'keyboardNav',
      focusIndicators: 'focus',
      readingGuide: 'readingGuide',
      lineMask: 'lineMask',
      bigCursor: 'cursor',
      linkHighlight: 'links',
      imageAltText: 'images',
      stopAnimations: 'animations',
      muteSounds: 'muteSounds',
    };
    for (const [prefKey, modKey] of Object.entries(toggleMap)) {
      if (prefs[prefKey]) {
        this.modules[modKey]?.enable();
        const input = this.shadowRoot.querySelector(`[data-toggle="${prefKey}"]`);
        if (input) input.checked = true;
      }
    }

    if (prefs.fontSize) this.modules.fontSize?.setLevel(prefs.fontSize);
    if (prefs.contrast && prefs.contrast !== 'none') {
      this.modules.contrast?.setMode(prefs.contrast);
      this.updateContrastButtons(prefs.contrast);
    }
    if (prefs.saturation !== undefined) {
      this.modules.saturation?.setValue(prefs.saturation);
      const slider = this.shadowRoot.querySelector('[data-slider="saturation"]');
      if (slider) slider.value = prefs.saturation;
    }
    if (prefs.colorBlindMode) {
      this.modules.colorBlind?.setMode(prefs.colorBlindMode);
      const toggle = this.shadowRoot.querySelector('[data-toggle="colorBlindSim"]');
      if (toggle) toggle.checked = true;
      const sub = this.shadowRoot.querySelector('[data-sub="colorBlindSim"]');
      if (sub) sub.style.display = '';
    }
  }

  resetAll() {
    for (const mod of Object.values(this.modules)) {
      mod.disable?.();
    }
    storage.clearAll();
    storage.set('lang', getLanguage());
    this.rebuildPanel();
  }

  rebuildPanel() {
    this.panel.setAttribute('dir', getDir());
    this.panel.innerHTML = this.buildPanelHTML();
    this.bindPanelEvents();
    this.restoreState();
    if (this.isOpen) this.panel.classList.add('anid-open');
    this.trigger.setAttribute('aria-label', this.isOpen ? t('closePanel') : t('openPanel'));
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.panel.classList.add('anid-open');
    this.trigger.setAttribute('aria-expanded', 'true');
    this.trigger.setAttribute('aria-label', t('closePanel'));
    this.panel.querySelector('.anid-close-btn')?.focus();
  }

  close() {
    this.isOpen = false;
    this.panel.classList.remove('anid-open');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.setAttribute('aria-label', t('openPanel'));
    this.trigger.focus();
  }

  bindGlobalKeys() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  positionElement(el, pos) {
    const positions = {
      'bottom-left': { bottom: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' },
      'top-right': { top: '20px', right: '20px' },
    };
    Object.assign(el.style, positions[pos] || positions['bottom-left']);
  }

  positionPanel(pos) {
    const panelPos = {
      'bottom-left': { bottom: '88px', left: '20px' },
      'bottom-right': { bottom: '88px', right: '20px' },
      'top-left': { top: '88px', left: '20px' },
      'top-right': { top: '88px', right: '20px' },
    };
    Object.assign(this.panel.style, panelPos[pos] || panelPos['bottom-left']);
  }

  makeDraggable(el) {
    let isDragging = false;
    let startX, startY, origX, origY;

    const onStart = (e) => {
      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      const rect = el.getBoundingClientRect();
      origX = rect.left;
      origY = rect.top;
      isDragging = false;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    };

    const onMove = (e) => {
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
      if (isDragging) {
        e.preventDefault();
        el.style.left = `${origX + dx}px`;
        el.style.top = `${origY + dy}px`;
        el.style.right = 'auto';
        el.style.bottom = 'auto';
      }
    };

    const onEnd = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      if (isDragging) {
        const rect = el.getBoundingClientRect();
        this.panel.style.left = `${rect.left}px`;
        this.panel.style.top = `${Math.max(0, rect.top - 68)}px`;
        this.panel.style.right = 'auto';
        this.panel.style.bottom = 'auto';
      }
    };

    el.addEventListener('mousedown', onStart);
    el.addEventListener('touchstart', onStart, { passive: true });

    const origClick = el.onclick;
    el.onclick = (e) => {
      if (!isDragging && origClick) origClick.call(el, e);
      else if (!isDragging) this.toggle();
    };
    el.removeEventListener('click', el.onclick);
    el.addEventListener('click', (e) => {
      if (isDragging) { isDragging = false; e.preventDefault(); }
    }, true);
  }
}

export function init(config) {
  if (config) window.AccessibioNidConfig = { ...window.AccessibioNidConfig, ...config };
  const widget = new AccessibioNidWidget();
  widget.init();
  return widget;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
}
