# Squarespace Integration

## Steps

1. Go to **Settings > Advanced > Code Injection**
2. In the **Footer** section, paste:

```html
<script>
  window.OpenNagishConfig = {
    position: 'bottom-left',
    lang: 'he',
    statementUrl: '/accessibility-statement'
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/open-nagish@latest/dist/open-nagish.min.js" defer></script>
```

3. Click **Save**

## Notes

- Code Injection requires a Squarespace Business plan or higher.
- For lower-tier plans, you can add the script via a Code Block on individual pages, though this won't cover all pages.
