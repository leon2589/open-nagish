# Contributing to AccessibioNid

Thank you for your interest in making the web more accessible! Here's how to contribute.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/accessibionid.git`
3. Install dependencies: `npm install`
4. Start the dev server: `npm run dev`
5. Open `http://localhost:3000/demo.html`

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes in `src/`
3. Test with `demo.html` in multiple browsers
4. Build: `npm run build`
5. Commit with a descriptive message
6. Push and open a pull request

## Code Guidelines

- **Vanilla JavaScript only** - no frameworks or runtime dependencies
- Each module must implement: `enable()`, `disable()`, `toggle()`
- All CSS must be injected via JavaScript (no external CSS files)
- Use CSS `!important` sparingly and only for overrides on host pages
- All UI elements must be keyboard accessible with proper ARIA attributes
- Minimum touch target size: 44x44 CSS pixels
- Add translations for all 4 languages (HE, EN, AR, RU) in `src/i18n.js`

## Adding a New Feature Module

1. Create `src/modules/your-feature.js`
2. Export a class with `enable()`, `disable()`, `toggle()` methods
3. Import and register it in `src/accessibionid.js`
4. Add translations to `src/i18n.js`
5. Add the feature to the panel UI in `accessibionid.js`
6. Update `README.md`

## Accessibility Requirements

The widget itself must comply with WCAG 2.1 AA:
- Keyboard navigable (2.1.1)
- No keyboard traps (2.1.2)
- Visible focus indicators (2.4.7)
- ARIA live regions for status messages (4.1.3)
- 44px minimum touch targets (2.5.5)
- Visible labels match accessible names (2.5.3)

## Reporting Issues

- Use GitHub Issues
- Include browser version and OS
- Describe the expected vs actual behavior
- Include screenshots if relevant
- For accessibility issues, include the assistive technology used

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
