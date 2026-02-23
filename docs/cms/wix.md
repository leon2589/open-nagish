# Wix Integration

## Steps

1. Go to your Wix site's **Settings**
2. Click **Custom Code** (under Advanced)
3. Click **+ Add Custom Code**
4. Paste the following code:

```html
<script>
  window.AccessibioNidConfig = {
    position: 'bottom-left',
    lang: 'he'
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/accessibionid@latest/dist/accessibionid.min.js" defer></script>
```

5. Set placement to **Body - end**
6. Apply to **All pages**
7. Click **Apply**

## Notes

- Wix has its own built-in accessibility features. AccessibioNid supplements these.
- The widget's Shadow DOM ensures no style conflicts with Wix's design system.
