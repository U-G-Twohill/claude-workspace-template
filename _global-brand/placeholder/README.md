# Placeholder Brand Assets

This directory holds placeholder brand assets for ICU Media Design until final assets are ready.

## Convention

- `logo-light.svg` — Logo for use on dark backgrounds
- `logo-dark.svg` — Logo for use on light backgrounds

## Placeholder Palette

The placeholder palette uses a professional neutral dark blue / white / grey scheme defined in `../config.json`. This is applied to all generated documents until final brand assets are placed here and `config.json` is updated.

## Swapping to Final Assets

1. Place final SVG logos in this directory (or replace `placeholder/` with a new path)
2. Update `../config.json` with final colors, fonts, and logo paths
3. Run `/update-brand all` to regenerate all documents with the new brand
