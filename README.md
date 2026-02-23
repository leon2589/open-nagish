# OpenNagish

The most comprehensive open-source web accessibility overlay widget. One script tag gives any website a floating accessibility toolbar with **20+ assistive features** covering visual, motor, cognitive, and auditory disabilities.

Built for compliance with **Israeli Standard SI 5568** (WCAG 2.0 AA + national modifications), **Israeli Accessibility Regulations 2017**, and **[WCAG 2.1](https://www.w3.org/TR/WCAG21/)**.

Created by **Leonid Shoresh**.

## Quick Start

Add one line to your HTML — the widget auto-initializes, no extra JavaScript needed:

```html
<script src="https://cdn.jsdelivr.net/npm/open-nagish@latest/dist/open-nagish.min.js" defer></script>
```

Or pin a specific version:

```html
<script src="https://cdn.jsdelivr.net/npm/open-nagish@1.0.1/dist/open-nagish.min.js" defer></script>
```

Or self-host:

```html
<script src="/path/to/open-nagish.min.js" defer></script>
```

Or install via npm:

```bash
npm install open-nagish
```

```javascript
import { init } from 'open-nagish';
init({ lang: 'he', position: 'bottom-left' });
```

## Features

### Vision & Display
| Feature | WCAG | Helps |
|---------|------|-------|
| Font Size (+/-/reset) | 1.4.4 | Low vision, elderly |
| High Contrast (dark/light/invert) | 1.4.3 | Low vision |
| Dark Mode | 1.4.3 | Light sensitivity |
| Grayscale | 1.4.1 | Color blindness |
| Color Saturation (slider) | 1.4.1 | Color sensitivity |
| Text Spacing | 1.4.12 | Dyslexia, low vision |
| Dyslexia Font (OpenDyslexic) | Best practice | Dyslexia |
| Hide Images | Best practice | Cognitive |
| Color Blind Simulation | 1.4.1 | Developers, awareness |

### Navigation & Reading
| Feature | WCAG | Helps |
|---------|------|-------|
| Keyboard Navigation | 2.1.1 | Motor disabilities |
| Focus Indicators | 2.4.7 | Motor, low vision |
| Heading Map / TOC | 2.4.10 (AA in SI 5568) | Screen reader users |
| Page Structure (ARIA landmarks) | 2.4.1 | Screen reader users |
| Reading Guide (ruler) | Best practice | Dyslexia, ADHD |
| Line Focus / Content Mask | Best practice | ADHD, cognitive |
| Big Cursor | Best practice | Motor, low vision |
| Screen Reader Preview | 1.1.1, 1.3.1 | Developers |

### Media & Content
| Feature | WCAG | Helps |
|---------|------|-------|
| Link Highlighting | 1.4.1, 2.4.4 | Low vision, cognitive |
| Image Alt Text Overlay | 1.1.1 | Blind, low vision |
| Stop Animations | 2.3.1, 2.3.3 | Seizure, vestibular |
| Mute All Sounds | 1.4.2 | Deaf, cognitive |

### Compliance
| Feature | Regulation | Helps |
|---------|-----------|-------|
| Accessibility Statement Generator | Takanot Negishut 35-heh | Legal compliance |
| Compliance Badge (SVG) | Best practice | Trust signal |

## Configuration

```html
<script>
  window.OpenNagishConfig = {
    position: 'bottom-left',    // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
    lang: 'he',                 // 'he', 'en', 'ar', 'ru'
    statementUrl: '/accessibility-statement',  // link to existing statement
    statementData: {
      orgName: 'My Company',
      orgPhone: '03-1234567',
      orgEmail: 'access@example.com',
      coordinatorName: 'John Doe',
      lastAuditDate: '2026-01-15',
    },
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/open-nagish@latest/dist/open-nagish.min.js" defer></script>
```

## Languages

The widget UI supports 4 languages, switchable at runtime:

- **Hebrew** (default) - עברית
- **English** - English
- **Arabic** - العربية
- **Russian** - Русский

## Regulatory Compliance

### Israeli Standard SI 5568

SI 5568 is the Israeli adaptation of WCAG 2.0 with national modifications:

| Criterion | WCAG 2.0 Level | SI 5568 Level | Notes |
|-----------|----------------|---------------|-------|
| 1.2.1 Audio/Video-only | A | AA | Relaxed for Hebrew |
| 1.2.2 Captions | A | AA | Relaxed for Hebrew |
| 1.2.3 Audio Description | A | AA | Relaxed for Hebrew |
| 1.2.4 Live Captions | AA | AAA | On request only |
| 1.2.5 Audio Description | AA | AAA | On request only |
| 2.4.10 Section Headings | AAA | **AA** | Stricter in Israel |
| 3.1.2 Language of Parts | AA | N/A | UTF-8 handles this |

### Takanot Negishut 2017

Israeli law requires:
- AA-level compliance for internet services
- Accessibility statement on the website (regulation 35-heh)
- Video captions for prerecorded content
- Accessible documents (PDF)
- Accessibility coordinator details published

### WCAG 2.1

The widget also addresses WCAG 2.1 success criteria including:
- 1.4.10 Reflow
- 1.4.12 Text Spacing
- 1.4.13 Content on Hover or Focus
- 2.3.3 Animation from Interactions
- 4.1.3 Status Messages

## CMS Integration Guides

Step-by-step setup instructions for popular platforms:

- [WordPress](docs/cms/wordpress.md) — via `functions.php`, plugin, or self-hosted
- [Shopify](docs/cms/shopify.md) — via `theme.liquid` code injection
- [Wix](docs/cms/wix.md) — via Custom Code settings
- [Squarespace](docs/cms/squarespace.md) — via Code Injection (Business plan+)

## Development

```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Start dev server with live reload
npm run dev
# Open http://localhost:3000/demo.html
```

### Project Structure

```
src/
  open-nagish.js           Main entry point
  styles.js                All CSS (injected into Shadow DOM)
  i18n.js                  Translations (HE/EN/AR/RU)
  storage.js               localStorage persistence
  utils.js                 Shared utilities
  modules/                 One file per feature (23 modules)
dist/
  open-nagish.min.js       Minified IIFE bundle (~77 KB)
  open-nagish.esm.js       ES module for bundlers
demo.html                  Demo page
```

### Architecture

- **Shadow DOM** isolation prevents style conflicts with host pages
- **Zero runtime dependencies** - pure vanilla JavaScript
- **Module pattern** - each feature is self-contained with `enable()`/`disable()`/`toggle()`
- **localStorage** persistence for user preferences across sessions
- **ARIA live regions** for screen reader announcements (WCAG 4.1.3)

## Browser Support

- Chrome 80+
- Firefox 78+
- Safari 14+
- Edge 80+

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Author

**Leonid Shoresh** - Creator and maintainer

## License

MIT License. See [LICENSE](LICENSE).

## Links

- [WCAG 2.1 Specification](https://www.w3.org/TR/WCAG21/)
- [SI 5568 Standard](https://www.sii.org.il/he/public-standards)
- [Israeli Accessibility Regulations (W3C overview)](https://www.w3.org/WAI/policies/israel/)
