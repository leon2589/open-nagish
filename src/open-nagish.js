import { getWidgetStyles } from './styles.js';
import { t, setLanguage, getLanguage, getDir, getAvailableLanguages, resolveLanguage } from './i18n.js';
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
import { TTSModule } from './modules/tts.js';

const ICON_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 7h-6l-1.41-1.41A2 2 0 0 0 12.17 7H12a2 2 0 0 0-1.42.59L9 9H3a1 1 0 0 0 0 2h5l1 1v3l-2 5a1 1 0 0 0 1.8.8L11 16h2l2.2 4.8a1 1 0 0 0 1.8-.8l-2-5v-3l1-1h5a1 1 0 0 0 0-2z"/></svg>`;

const TOGGLE_MAP = {
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

const VALID_POSITIONS = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];

let activeInstance = null;

class OpenNagishWidget {
  constructor() {
    this.isOpen = false;
    this.modules = {};
    this.shadowHost = null;
    this.shadowRoot = null;
    this.panel = null;
    this.trigger = null;
    this.config = window.OpenNagishConfig || {};
    this._keydownHandler = null;
    this._resizeHandler = null;
    this._destroyed = false;
  }

  init() {
    const initialLang = storage.get('lang') || resolveLanguage(this.config.lang);
    setLanguage(initialLang);

    this.shadowHost = document.createElement('div');
    this.shadowHost.id = 'opennagish-widget';
    this.shadowHost.style.cssText = 'all:initial;';
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
    this.bindViewportListeners();
  }

  createTrigger() {
    const pos = this._getPosition();
    this.trigger = createElement('button', {
      className: 'anid-trigger',
      'aria-label': t('openPanel'),
      'aria-expanded': 'false',
      'aria-controls': 'anid-panel',
      innerHTML: ICON_SVG,
    });

    this.positionElement(this.trigger, pos);
    this.makeDraggable(this.trigger);
    this.shadowRoot.appendChild(this.trigger);
  }

  createPanel() {
    const pos = this._getPosition();
    this.panel = createElement('div', {
      className: 'anid-panel',
      id: 'anid-panel',
      role: 'dialog',
      'aria-label': t('panelTitle'),
      'aria-modal': 'false',
    });

    this.panel.setAttribute('dir', getDir());
    this.positionPanel(pos);

    this.panel.innerHTML = this.buildPanelHTML();
    this.shadowRoot.appendChild(this.panel);

    this.bindPanelEvents();
  }

  _getPosition() {
    const pos = this.config.position || 'bottom-left';
    return VALID_POSITIONS.includes(pos) ? pos : 'bottom-left';
  }

  buildPanelHTML() {
    const langs = getAvailableLanguages();
    const langOptions = langs.map(l => {
      const names = { he: 'עברית', en: 'English', ar: 'العربية', ru: 'Русский' };
      return `<option value="${l}" ${l === getLanguage() ? 'selected' : ''}>${names[l] || l}</option>`;
    }).join('');

    return `
      <div class="anid-panel-header">
        <span class="anid-panel-title">${t('panelTitle')}</span>
        <select class="anid-lang-select" aria-label="${t('language')}">${langOptions}</select>
        <button class="anid-close-btn" aria-label="${t('closePanel')}">&#x2715;</button>
      </div>
      <div class="anid-panel-body">
        ${this.buildCategory('vision', t('categoryVision'), '👁', [
          { id: 'fontSize', type: 'buttons', shortcut: 'Alt+F' },
          { id: 'highContrast', type: 'contrast', shortcut: 'Alt+C' },
          { id: 'darkMode', type: 'toggle', shortcut: 'Alt+D' },
          { id: 'monochrome', type: 'toggle' },
          { id: 'saturation', type: 'slider' },
          { id: 'textSpacing', type: 'toggle' },
          { id: 'dyslexiaFont', type: 'toggle' },
          { id: 'hideImages', type: 'toggle' },
          { id: 'colorBlindSim', type: 'colorblind' },
        ])}
        ${this.buildCategory('navigation', t('categoryNavigation'), '🧭', [
          { id: 'keyboardNav', type: 'toggle', shortcut: 'Alt+K' },
          { id: 'focusIndicators', type: 'toggle' },
          { id: 'headingStructure', type: 'headings' },
          { id: 'pageStructure', type: 'landmarks' },
          { id: 'readingGuide', type: 'toggle', shortcut: 'Alt+G' },
          { id: 'lineMask', type: 'toggle' },
          { id: 'bigCursor', type: 'toggle' },
          { id: 'screenReaderPreview', type: 'action' },
        ])}
        ${this.buildCategory('media', t('categoryMedia'), '🔊', [
          { id: 'ttsHover', type: 'toggle' },
          { id: 'ttsSelection', type: 'toggle' },
          { id: 'ttsReadPage', type: 'action', shortcut: 'Alt+T' },
          { id: 'linkHighlight', type: 'toggle', shortcut: 'Alt+L' },
          { id: 'imageAltText', type: 'toggle' },
          { id: 'stopAnimations', type: 'toggle' },
          { id: 'muteSounds', type: 'toggle', shortcut: 'Alt+M' },
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
          <span class="anid-category-chevron">&#x25BC;</span>
        </button>
        <div class="anid-category-content" role="region">
          ${content}
        </div>
      </div>
    `;
  }

  buildFeature(f) {
    const label = t(f.id);
    const shortcutBadge = f.shortcut ? ` <kbd class="anid-shortcut">${f.shortcut}</kbd>` : '';
    const labelHtml = `${label}${shortcutBadge}`;
    switch (f.type) {
      case 'toggle':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${labelHtml}</span>
            <label class="anid-toggle">
              <input type="checkbox" data-toggle="${f.id}" aria-label="${label}">
              <span class="anid-toggle-slider"></span>
            </label>
          </div>`;
      case 'buttons':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${labelHtml}</span>
            <div class="anid-btn-group">
              <button class="anid-btn" data-action="fontDecrease" aria-label="${t('fontSizeDecrease')}">A-</button>
              <button class="anid-btn" data-action="fontReset" aria-label="${t('fontSizeReset')}">A</button>
              <button class="anid-btn" data-action="fontIncrease" aria-label="${t('fontSizeIncrease')}">A+</button>
            </div>
          </div>`;
      case 'contrast':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${labelHtml}</span>
            <div class="anid-btn-group">
              <button class="anid-btn" data-action="contrastDark" aria-label="${t('contrastDark')}">${t('contrastDark')}</button>
              <button class="anid-btn" data-action="contrastLight" aria-label="${t('contrastLight')}">${t('contrastLight')}</button>
              <button class="anid-btn" data-action="contrastInvert" aria-label="${t('contrastInvert')}">${t('contrastInvert')}</button>
            </div>
          </div>`;
      case 'slider':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${labelHtml}</span>
            <div class="anid-slider-wrap">
              <input type="range" class="anid-slider" data-slider="${f.id}" min="0" max="200" value="100" aria-label="${label}">
            </div>
          </div>`;
      case 'colorblind':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${labelHtml}</span>
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
            <span class="anid-feature-label">${labelHtml}</span>
            <button class="anid-btn" data-action="toggleHeadings">${t('jumpTo')}</button>
          </div>
          <ul class="anid-heading-list" data-list="headings" style="display:none"></ul>`;
      case 'landmarks':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${labelHtml}</span>
            <button class="anid-btn" data-action="toggleLandmarks">${t('jumpTo')}</button>
          </div>
          <ul class="anid-landmark-list" data-list="landmarks" style="display:none"></ul>`;
      case 'action':
        return `
          <div class="anid-feature" data-feature="${f.id}">
            <span class="anid-feature-label">${labelHtml}</span>
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
        btn.setAttribute('aria-expanded', String(!expanded));
      });
    });

    root.querySelectorAll('[data-toggle]').forEach(input => {
      input.addEventListener('change', () => {
        this.handleToggle(input.dataset.toggle, input.checked);
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
    if (id === 'ttsHover') {
      if (checked) this.modules.tts?.enableHover();
      else this.modules.tts?.disableHover();
      storage.set(id, checked);
      announceToScreenReader(`${t(id)} ${checked ? t('on') : t('off')}`, this.shadowRoot);
      return;
    }
    if (id === 'ttsSelection') {
      if (checked) this.modules.tts?.enableSelection();
      else this.modules.tts?.disableSelection();
      storage.set(id, checked);
      announceToScreenReader(`${t(id)} ${checked ? t('on') : t('off')}`, this.shadowRoot);
      return;
    }

    const modKey = TOGGLE_MAP[id];
    const mod = modKey ? this.modules[modKey] : null;
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
      case 'ttsReadPage': this.modules.tts?.readPage(); break;
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

    const label = next === 'none'
      ? `${t('highContrast')} ${t('off')}`
      : `${t('highContrast')} ${t(next === 'dark' ? 'contrastDark' : next === 'light' ? 'contrastLight' : 'contrastInvert')}`;
    announceToScreenReader(label, this.shadowRoot);
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
      tts: new TTSModule(ctx),
      statement: new StatementModule(ctx),
      badge: new BadgeModule(ctx),
    };
  }

  restoreState() {
    const prefs = storage.getAll();

    for (const [prefKey, modKey] of Object.entries(TOGGLE_MAP)) {
      if (prefKey === 'colorBlindSim') continue;
      if (prefs[prefKey]) {
        this.modules[modKey]?.enable();
        const input = this.shadowRoot.querySelector(`[data-toggle="${prefKey}"]`);
        if (input) input.checked = true;
      }
    }

    if (prefs.ttsHover) {
      this.modules.tts?.enableHover();
      const input = this.shadowRoot.querySelector('[data-toggle="ttsHover"]');
      if (input) input.checked = true;
    }
    if (prefs.ttsSelection) {
      this.modules.tts?.enableSelection();
      const input = this.shadowRoot.querySelector('[data-toggle="ttsSelection"]');
      if (input) input.checked = true;
    }

    if (prefs.fontSize) this.modules.fontSize?.setLevel(prefs.fontSize);
    if (prefs.contrast && prefs.contrast !== 'none') {
      this.modules.contrast?.setMode(prefs.contrast);
      this.updateContrastButtons(prefs.contrast);
    }
    if (prefs.saturation !== undefined && prefs.saturation !== 100) {
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
    if (this.isOpen) {
      this.updatePanelPosition();
      this.panel.classList.add('anid-open');
    }
    this.trigger.setAttribute('aria-expanded', String(this.isOpen));
    this.trigger.setAttribute('aria-label', this.isOpen ? t('closePanel') : t('openPanel'));
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.updatePanelPosition();
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
    const shortcuts = {
      'KeyD': () => this._flipToggle('darkMode'),
      'KeyF': (e) => {
        if (e.shiftKey) this.modules.fontSize?.decrease();
        else this.modules.fontSize?.increase();
      },
      'KeyK': () => this._flipToggle('keyboardNav'),
      'KeyG': () => this._flipToggle('readingGuide'),
      'KeyL': () => this._flipToggle('linkHighlight'),
      'KeyC': () => this.toggleContrast('dark'),
      'KeyM': () => this._flipToggle('muteSounds'),
      'KeyT': () => this.modules.tts?.readPage(),
      'KeyR': () => this.resetAll(),
    };

    this._keydownHandler = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        return;
      }
      if (e.altKey && e.code === 'KeyA') {
        e.preventDefault();
        this.toggle();
        return;
      }
      if (e.altKey && this.isOpen) {
        const handler = shortcuts[e.code];
        if (handler) {
          e.preventDefault();
          handler(e);
        }
      }
    };
    document.addEventListener('keydown', this._keydownHandler);
  }

  _flipToggle(id) {
    const input = this.shadowRoot.querySelector(`[data-toggle="${id}"]`);
    if (input) {
      input.checked = !input.checked;
      this.handleToggle(id, input.checked);
    }
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

  updatePanelPosition() {
    if (window.innerWidth <= 480) return;

    const triggerRect = this.trigger.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const margin = 12;
    const panelWidth = Math.min(380, vw - 2 * margin);

    const spaceAbove = triggerRect.top;
    const spaceBelow = vh - triggerRect.bottom;

    let left = triggerRect.left;
    if (left + panelWidth > vw - margin) {
      left = vw - panelWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    this.panel.style.left = `${left}px`;
    this.panel.style.right = 'auto';

    if (spaceAbove > spaceBelow) {
      const bottom = vh - triggerRect.top + margin;
      this.panel.style.bottom = `${bottom}px`;
      this.panel.style.top = 'auto';
      this.panel.style.maxHeight = `${Math.max(200, spaceAbove - 2 * margin)}px`;
    } else {
      const top = triggerRect.bottom + margin;
      this.panel.style.top = `${top}px`;
      this.panel.style.bottom = 'auto';
      this.panel.style.maxHeight = `${Math.max(200, vh - top - margin)}px`;
    }
  }

  clampTrigger() {
    const rect = this.trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = this.trigger.offsetWidth;
    const h = this.trigger.offsetHeight;

    const usesTop = this.trigger.style.top !== '' && this.trigger.style.top !== 'auto';
    const usesLeft = this.trigger.style.left !== '' && this.trigger.style.left !== 'auto';

    if (usesTop && usesLeft) {
      const curLeft = rect.left;
      const curTop = rect.top;
      const clampedLeft = Math.max(0, Math.min(curLeft, vw - w));
      const clampedTop = Math.max(0, Math.min(curTop, vh - h));
      if (curLeft !== clampedLeft) this.trigger.style.left = `${clampedLeft}px`;
      if (curTop !== clampedTop) this.trigger.style.top = `${clampedTop}px`;
    } else {
      if (rect.right > vw || rect.left < 0 || rect.bottom > vh || rect.top < 0) {
        this.trigger.style.left = `${Math.max(0, Math.min(rect.left, vw - w))}px`;
        this.trigger.style.top = `${Math.max(0, Math.min(rect.top, vh - h))}px`;
        this.trigger.style.right = 'auto';
        this.trigger.style.bottom = 'auto';
      }
    }
  }

  bindViewportListeners() {
    let resizeTimer;
    this._resizeHandler = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.clampTrigger();
        if (this.isOpen) this.updatePanelPosition();
      }, 100);
    };
    window.addEventListener('resize', this._resizeHandler);
    window.addEventListener('orientationchange', this._resizeHandler);
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
        const maxX = window.innerWidth - el.offsetWidth;
        const maxY = window.innerHeight - el.offsetHeight;
        el.style.left = `${Math.max(0, Math.min(origX + dx, maxX))}px`;
        el.style.top = `${Math.max(0, Math.min(origY + dy, maxY))}px`;
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
        this.updatePanelPosition();
      }
    };

    el.addEventListener('mousedown', onStart);
    el.addEventListener('touchstart', onStart, { passive: true });

    el.addEventListener('click', (e) => {
      if (isDragging) {
        isDragging = false;
        e.stopPropagation();
        return;
      }
      this.toggle();
    });
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    for (const mod of Object.values(this.modules)) {
      mod.disable?.();
    }

    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler);
    }
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      window.removeEventListener('orientationchange', this._resizeHandler);
    }

    if (this.shadowHost?.parentNode) {
      this.shadowHost.parentNode.removeChild(this.shadowHost);
    }

    this.modules = {};
    this.shadowRoot = null;
    this.shadowHost = null;
    this.panel = null;
    this.trigger = null;

    if (activeInstance === this) activeInstance = null;
  }
}

export function init(config) {
  if (activeInstance) {
    activeInstance.destroy();
  }
  if (config) window.OpenNagishConfig = { ...window.OpenNagishConfig, ...config };
  const widget = new OpenNagishWidget();
  widget.init();
  activeInstance = widget;
  return widget;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
}
