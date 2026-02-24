import { t, getLanguage } from '../i18n.js';

const LANG_MAP = { he: 'he-IL', en: 'en-US', ar: 'ar-SA', ru: 'ru-RU' };
const HL_ATTR = 'data-anid-tts-hl';

export class TTSModule {
  constructor(ctx) {
    this.ctx = ctx;
    this.hoverActive = false;
    this.selectionActive = false;
    this.reading = false;
    this._onMouseOver = this._onMouseOver.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._highlighted = null;
    this._savedStyles = null;
    this._hoverDebounce = null;
    this._warmUpVoices();
  }

  _warmUpVoices() {
    if (!this.supported) return;
    if (this.synth.getVoices().length) return;
    this.synth.addEventListener('voiceschanged', () => {}, { once: true });
  }

  _unlockAudio() {
    if (this._audioUnlocked) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start();
      ctx.resume().then(() => ctx.close());
      this._audioUnlocked = true;
    } catch (_) {}
  }

  get synth() {
    return window.speechSynthesis;
  }

  get supported() {
    return 'speechSynthesis' in window;
  }

  _getLang() {
    const pageLang = document.documentElement.lang;
    const raw = pageLang || getLanguage() || 'en';
    return LANG_MAP[raw] || raw;
  }

  _findVoice(lang) {
    const voices = this.synth.getVoices();
    if (!voices.length) return null;
    const prefix = lang.split('-')[0].toLowerCase();
    return voices.find(v => v.lang.toLowerCase().startsWith(prefix))
      || voices.find(v => v.default)
      || voices[0];
  }

  _speak(text) {
    if (!this.supported || !text.trim()) return;
    this._unlockAudio();
    this._clearResumeTimer();

    const fire = () => {
      const utter = new SpeechSynthesisUtterance(text);
      const lang = this._getLang();
      const voice = this._findVoice(lang);
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = lang;
      }
      utter.rate = 1;
      utter.pitch = 1;
      utter.onend = () => { this.reading = false; this._clearResumeTimer(); };
      utter.onerror = () => { this.reading = false; this._clearResumeTimer(); };
      this.reading = true;
      this.synth.speak(utter);
      this._startResumeTimer();
    };

    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
      setTimeout(fire, 80);
    } else {
      fire();
    }
  }

  _startResumeTimer() {
    this._resumeTimer = setInterval(() => {
      if (this.synth.speaking && !this.synth.paused) {
        this.synth.pause();
        this.synth.resume();
      }
    }, 10000);
  }

  _clearResumeTimer() {
    if (this._resumeTimer) {
      clearInterval(this._resumeTimer);
      this._resumeTimer = null;
    }
  }

  stop() {
    if (!this.supported) return;
    this.synth.cancel();
    this.reading = false;
    this._clearResumeTimer();
    this._clearHighlight();
  }

  enableHover() {
    if (this.hoverActive) return;
    this.hoverActive = true;
    document.addEventListener('mouseover', this._onMouseOver, true);
  }

  disableHover() {
    this.hoverActive = false;
    document.removeEventListener('mouseover', this._onMouseOver, true);
    this._clearHighlight();
    clearTimeout(this._hoverDebounce);
    if (!this.selectionActive && !this.reading) this.stop();
  }

  _onMouseOver(e) {
    const el = e.target;
    if (!el || el.nodeType !== 1) return;
    if (el.closest('#opennagish-widget')) return;

    clearTimeout(this._hoverDebounce);
    this._hoverDebounce = setTimeout(() => {
      const text = this._getElementText(el);
      if (!text) return;
      this._clearHighlight();
      this._savedStyles = {
        outline: el.style.outline,
        outlineOffset: el.style.outlineOffset,
        background: el.style.background,
      };
      el.setAttribute(HL_ATTR, '');
      el.style.outline = '3px solid #1565c0';
      el.style.outlineOffset = '2px';
      el.style.background = 'rgba(21,101,192,0.08)';
      this._highlighted = el;
      this._speak(text);
    }, 300);
  }

  _getElementText(el) {
    if (el.tagName === 'IMG') return el.alt || '';
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return el.value || el.placeholder || '';
    const text = el.innerText || el.textContent || '';
    return text.trim().substring(0, 500);
  }

  _clearHighlight() {
    if (this._highlighted) {
      this._highlighted.removeAttribute(HL_ATTR);
      if (this._savedStyles) {
        this._highlighted.style.outline = this._savedStyles.outline;
        this._highlighted.style.outlineOffset = this._savedStyles.outlineOffset;
        this._highlighted.style.background = this._savedStyles.background;
      }
      this._highlighted = null;
      this._savedStyles = null;
    }
  }

  enableSelection() {
    if (this.selectionActive) return;
    this.selectionActive = true;
    document.addEventListener('mouseup', this._onMouseUp, true);
  }

  disableSelection() {
    this.selectionActive = false;
    document.removeEventListener('mouseup', this._onMouseUp, true);
    if (!this.hoverActive && !this.reading) this.stop();
  }

  _onMouseUp() {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';
    if (text.length > 0) {
      this._speak(text);
    }
  }

  readPage() {
    const content = this._extractPageText();
    if (content) {
      this.ctx.announce(t('ttsReading'));
      this._speak(content);
    }
  }

  _extractPageText() {
    const lines = [];
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) lines.push(text);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'template'].includes(tag)) return;
      if (node.hidden || node.getAttribute('aria-hidden') === 'true') return;
      if (node.id === 'opennagish-widget') return;
      for (const child of node.childNodes) walk(child);
    };
    walk(document.body);
    return lines.join(' ').substring(0, 5000);
  }

  enable() {}
  disable() {
    this.disableHover();
    this.disableSelection();
    this.stop();
  }
}
