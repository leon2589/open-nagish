# WordPress Integration

## Method 1: Theme Footer (Recommended)

Add to your theme's `functions.php`:

```php
function add_accessibionid() {
    echo '<script>
        window.AccessibioNidConfig = {
            position: "bottom-left",
            lang: "he",
            statementUrl: "/accessibility-statement"
        };
    </script>';
    echo '<script src="https://cdn.jsdelivr.net/npm/accessibionid@latest/dist/accessibionid.min.js" defer></script>';
}
add_action('wp_footer', 'add_accessibionid');
```

## Method 2: Plugin

1. Install the "Insert Headers and Footers" plugin
2. Go to Settings > Insert Headers and Footers
3. In the "Scripts in Footer" section, paste:

```html
<script src="https://cdn.jsdelivr.net/npm/accessibionid@latest/dist/accessibionid.min.js" defer></script>
```

## Method 3: Self-Hosted

1. Download `accessibionid.min.js`
2. Upload to your WordPress media library or `/wp-content/themes/your-theme/js/`
3. Enqueue in `functions.php`:

```php
function enqueue_accessibionid() {
    wp_enqueue_script(
        'accessibionid',
        get_template_directory_uri() . '/js/accessibionid.min.js',
        array(),
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'enqueue_accessibionid');
```
