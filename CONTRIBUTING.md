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
- `extra.annotations.availability_status` — status of **this China product / China-region route**
- `extra.annotations.global_availability_in_china` — typical mainland China availability of the **listed global analogs** (primary / representative when several are listed)

### `availability_status` values

- `generally-available` — broadly usable China product or service
- `china-region-only` — global vendor China-region / operated deployment (not a local SaaS substitute)
- `invite-or-restricted` — limited signup, invite-only, or tightly gated access
- `deprecated-or-sunset` — retiring or no longer recommended for new builds
- `unverified` — status not yet confirmed from public sources

### `global_availability_in_china` values

- `available` — global analog generally works for mainland users without a China-specific route
- `limited` — works with constraints (partner, region, compliance, degraded features, or unstable access)
- `unavailable` — effectively unusable as a drop-in for mainland production stacks
- `unknown` — not yet assessed

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
