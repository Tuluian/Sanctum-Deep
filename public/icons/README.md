# PWA Icons

This folder should contain the following PWA icons for Sanctum Ruins:

## Required Icons

Generate these from a 512x512 master icon:

| File | Size | Purpose |
|------|------|---------|
| `icon-72x72.png` | 72x72 | Android low-density |
| `icon-96x96.png` | 96x96 | Android medium-density |
| `icon-128x128.png` | 128x128 | Chrome Web Store |
| `icon-144x144.png` | 144x144 | iOS/Android |
| `icon-152x152.png` | 152x152 | iPad |
| `icon-192x192.png` | 192x192 | Android high-density (required) |
| `icon-384x384.png` | 384x384 | Android extra-high-density |
| `icon-512x512.png` | 512x512 | Android splash/maskable (required) |

## Also Needed in `/public/`

| File | Size | Purpose |
|------|------|---------|
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `og-image.png` | 1200x630 | Social media sharing |

## How to Generate

1. Create a 512x512 PNG icon (square, no transparency for best results)
2. Use one of these tools:
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/
   - https://app-manifest.firebaseapp.com/

## Design Guidelines

- Use the Sanctum Ruins logo/symbol
- Dark background (#1a1a2e or #16213e) works well
- Keep design simple for small sizes
- Test on both light and dark backgrounds
- For maskable icons, keep important content in center 80%
