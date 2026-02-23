# Shopify Integration

## Steps

1. From your Shopify admin, go to **Online Store > Themes**
2. Click **Actions > Edit code**
3. Open `theme.liquid` (under Layout)
4. Just before the closing `</body>` tag, add:

```html
<script>
  window.AccessibioNidConfig = {
    position: 'bottom-left',
    lang: 'he',
    statementUrl: '/pages/accessibility-statement'
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/accessibionid@latest/dist/accessibionid.min.js" defer></script>
```

5. Click **Save**

## Creating an Accessibility Statement Page

1. Go to **Online Store > Pages**
2. Click **Add page**
3. Title: "Accessibility Statement" / "הצהרת נגישות"
4. Add your accessibility statement content
5. Update the `statementUrl` in the config to match the page URL
