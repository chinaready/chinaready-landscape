# Contributing

This project follows the standard `landscape2` contribution model: update data, add logos, build locally, and verify the generated preview.

## Add Or Edit An Entry

1. Edit `landscape.yml`.
2. Put the item in one primary subcategory.
3. Use `second_path` only when a product genuinely spans another category.
4. Add a matching SVG logo under `hosted_logos/`.
5. Include source-backed notes in `extra.annotations`.

## Required Entry Fields

Each item should include:

- `name`
- `homepage_url`
- `logo`
- `description`
- `extra.annotations.global_analogs`
- `extra.annotations.replacement_fit`
- `extra.annotations.china_context`
- `extra.annotations.vendor_type`
- `extra.annotations.evidence_level`

## Brand Rules

This is a Chinaready open-source project. Keep the preview aligned with the Chinaready design system:

- Use deep navy `#0C1E3E`, brand blue `#005BAC`, white, and surface grey.
- Do not introduce gradients.
- Do not use red except for semantic errors.
- Keep the `landscape2` workflow recognizable.
- Do not fork or patch `landscape2` unless the change should be proposed upstream.

## Verify Locally

```bash
npm run validate
npm run build
npm run verify
```
