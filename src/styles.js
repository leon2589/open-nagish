// "anid-" prefix = Accessibility Nagish Interface Design.
// Namespaces all widget CSS classes to prevent collisions with host-page styles.
export function getWidgetStyles() {
  return `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #1a1a2e;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .anid-trigger {
      position: fixed;
      z-index: 2147483647;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #1565c0;
      border: 3px solid #fff;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      touch-action: none;
    }
    .anid-trigger:hover, .anid-trigger:focus-visible {
      transform: scale(1.1);
      box-shadow: 0 6px 24px rgba(0,0,0,0.4);
    }
    .anid-trigger:focus-visible {
      outline: 3px solid #ffab00;
      outline-offset: 2px;
    }
    .anid-trigger svg {
      width: 28px;
      height: 28px;
      fill: #fff;
    }
    .anid-trigger[aria-expanded="true"] {
      background: #c62828;
    }
    .anid-trigger[aria-expanded="true"] svg {
      display: none;
    }
    .anid-trigger[aria-expanded="true"]::after {
      content: '✕';
      color: #fff;
      font-size: 22px;
      font-weight: bold;
    }

    .anid-panel {
      position: fixed;
      z-index: 2147483646;
      width: 380px;
      max-width: calc(100vw - 24px);
      max-height: calc(100vh - 100px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.25);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px) scale(0.95);
      transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
    }
    .anid-panel.anid-open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .anid-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: #1565c0;
      color: #fff;
      gap: 8px;
      flex-shrink: 0;
    }
    .anid-panel-title {
      font-size: 18px;
      font-weight: 700;
      flex: 1;
    }
    .anid-lang-select {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.4);
      color: #fff;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
    }
    .anid-lang-select option {
      color: #1a1a2e;
      background: #fff;
    }
    .anid-close-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 22px;
      cursor: pointer;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .anid-close-btn:hover, .anid-close-btn:focus-visible {
      background: rgba(255,255,255,0.2);
    }
    .anid-close-btn:focus-visible {
      outline: 2px solid #ffab00;
    }

    .anid-panel-body {
      overflow-y: auto;
      flex: 1;
      padding: 8px 0;
      scrollbar-width: thin;
      scrollbar-color: #ccc transparent;
    }
    .anid-panel-body::-webkit-scrollbar {
      width: 6px;
    }
    .anid-panel-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .anid-panel-body::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;
    }

    .anid-category {
      border-bottom: 1px solid #eee;
    }
    .anid-category:last-child {
      border-bottom: none;
    }
    .anid-category-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      background: none;
      border: none;
      width: 100%;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      color: #1a1a2e;
      text-align: inherit;
      transition: background 0.15s;
    }
    .anid-category-header:hover {
      background: #f5f5f5;
    }
    .anid-category-header:focus-visible {
      outline: 2px solid #1565c0;
      outline-offset: -2px;
    }
    .anid-category-icon {
      font-size: 20px;
      width: 28px;
      text-align: center;
      flex-shrink: 0;
    }
    .anid-category-chevron {
      margin-inline-start: auto;
      transition: transform 0.2s;
      font-size: 12px;
    }
    .anid-category[data-expanded="true"] .anid-category-chevron {
      transform: rotate(180deg);
    }
    .anid-category-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    .anid-category[data-expanded="true"] .anid-category-content {
      max-height: 2000px;
    }

    .anid-feature {
      display: flex;
      align-items: center;
      padding: 10px 20px 10px 48px;
      gap: 12px;
      min-height: 44px;
    }
    [dir="rtl"] .anid-feature {
      padding: 10px 48px 10px 20px;
    }
    .anid-feature-label {
      flex: 1;
      font-size: 14px;
      color: #333;
    }

    .anid-toggle {
      position: relative;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }
    .anid-toggle input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }
    .anid-toggle-slider {
      position: absolute;
      inset: 0;
      background: #ccc;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .anid-toggle-slider::before {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
    }
    [dir="rtl"] .anid-toggle-slider::before {
      left: auto;
      right: 2px;
    }
    .anid-toggle input:checked + .anid-toggle-slider {
      background: #1565c0;
    }
    .anid-toggle input:checked + .anid-toggle-slider::before {
      transform: translateX(20px);
    }
    [dir="rtl"] .anid-toggle input:checked + .anid-toggle-slider::before {
      transform: translateX(-20px);
    }
    .anid-toggle input:focus-visible + .anid-toggle-slider {
      outline: 2px solid #ffab00;
      outline-offset: 2px;
    }

    .anid-btn-group {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .anid-btn {
      padding: 6px 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #f5f5f5;
      color: #333;
      cursor: pointer;
      font-size: 13px;
      min-width: 44px;
      min-height: 32px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: background 0.15s, border-color 0.15s;
    }
    .anid-btn:hover {
      background: #e0e0e0;
    }
    .anid-btn:focus-visible {
      outline: 2px solid #1565c0;
      outline-offset: 1px;
    }
    .anid-btn.anid-active {
      background: #1565c0;
      color: #fff;
      border-color: #1565c0;
    }

    .anid-slider-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 120px;
    }
    .anid-slider {
      width: 100%;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: #ddd;
      border-radius: 2px;
      outline: none;
    }
    .anid-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #1565c0;
      cursor: pointer;
    }
    .anid-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border: none;
      border-radius: 50%;
      background: #1565c0;
      cursor: pointer;
    }
    .anid-slider:focus-visible {
      outline: 2px solid #ffab00;
      outline-offset: 2px;
    }

    .anid-panel-footer {
      padding: 12px 20px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: center;
      flex-shrink: 0;
    }
    .anid-reset-btn {
      padding: 8px 24px;
      border: 2px solid #c62828;
      border-radius: 8px;
      background: transparent;
      color: #c62828;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      min-height: 44px;
      transition: background 0.15s, color 0.15s;
    }
    .anid-reset-btn:hover {
      background: #c62828;
      color: #fff;
    }
    .anid-reset-btn:focus-visible {
      outline: 2px solid #ffab00;
      outline-offset: 2px;
    }

    .anid-sub-options {
      padding: 4px 20px 8px 64px;
    }
    [dir="rtl"] .anid-sub-options {
      padding: 4px 64px 8px 20px;
    }

    .anid-heading-list, .anid-landmark-list {
      list-style: none;
      padding: 4px 20px 8px 48px;
      max-height: 200px;
      overflow-y: auto;
    }
    [dir="rtl"] .anid-heading-list, [dir="rtl"] .anid-landmark-list {
      padding: 4px 48px 8px 20px;
    }
    .anid-heading-list li, .anid-landmark-list li {
      margin: 2px 0;
    }
    .anid-heading-list button, .anid-landmark-list button {
      background: none;
      border: none;
      color: #1565c0;
      cursor: pointer;
      font-size: 13px;
      padding: 4px 8px;
      border-radius: 4px;
      text-align: inherit;
      width: 100%;
      min-height: 32px;
      transition: background 0.15s;
    }
    .anid-heading-list button:hover, .anid-landmark-list button:hover {
      background: #e3f2fd;
    }
    .anid-heading-list button:focus-visible, .anid-landmark-list button:focus-visible {
      outline: 2px solid #1565c0;
    }

    .anid-overlay {
      position: fixed;
      z-index: 2147483645;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85);
      color: #eee;
      overflow-y: auto;
      padding: 40px 20px;
      font-family: monospace;
      font-size: 14px;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .anid-overlay-close {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2147483646;
      background: #c62828;
      color: #fff;
      border: none;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
    }

    .anid-statement-modal {
      position: fixed;
      z-index: 2147483645;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 80px);
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.3);
      overflow-y: auto;
      padding: 32px;
    }
    .anid-statement-modal h2 {
      font-size: 22px;
      margin-bottom: 16px;
      color: #1a1a2e;
    }
    .anid-statement-modal p {
      margin-bottom: 12px;
      color: #333;
      line-height: 1.7;
    }
    .anid-statement-backdrop {
      position: fixed;
      z-index: 2147483644;
      inset: 0;
      background: rgba(0,0,0,0.5);
    }

    .anid-shortcut {
      display: inline-block;
      font-size: 10px;
      font-family: inherit;
      padding: 1px 5px;
      margin-inline-start: 6px;
      background: #eee;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 3px;
      vertical-align: middle;
      line-height: 1.4;
    }

    .anid-live-region {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0,0,0,0);
      white-space: nowrap;
    }

    @media (max-width: 480px) {
      .anid-panel {
        width: 100vw !important;
        max-width: 100vw !important;
        height: 100vh !important;
        max-height: 100vh !important;
        border-radius: 0 !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
      }
    }
  `;
}
