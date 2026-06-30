# Deployment

Production is served by Cloudflare Pages at:

```text
https://landscape.chinaready.co
```

The source repository is expected to be public under the Chinaready GitHub organization. The generated `build/` directory is not committed; CI builds it from `landscape.yml`, `settings.yml`, `guide.yml`, and `games.yml`.

## Cloudflare Pages

Create or reuse this Pages project:

```text
chinaready-landscape
```

Build output directory:

```text
build
```

The GitHub Actions deploy step uses Wrangler:

```bash
npx wrangler pages deploy build --project-name chinaready-landscape --branch main
```

## Custom Domain

Attach this custom domain to the Cloudflare Pages project:

```text
landscape.chinaready.co
```

If `chinaready.co` is already managed in Cloudflare DNS, Pages can create the required DNS record when the custom domain is added. If DNS is managed elsewhere, point `landscape.chinaready.co` to the target Cloudflare Pages provides for the project.

## GitHub Secrets

Set these repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

The API token should have permission to deploy Cloudflare Pages for the target account. Keep it scoped to the Pages project where possible.

Minimum CI token scope:

```text
Account: Cloudflare Pages:Edit
Account: Account Settings:Read
```

Custom domain setup is outside the CI workflow. To automate the DNS record for `landscape.chinaready.co`, the operator token also needs DNS record access on the `chinaready.co` zone. Without that permission, add the Pages custom domain first, then create the DNS record in the Cloudflare dashboard:

```text
Type: CNAME
Name: landscape
Target: chinaready-landscape.pages.dev
Proxy: enabled
```

## CI Model

- Pull requests run `.github/workflows/validate.yml`.
- Pushes to `main` run `.github/workflows/deploy.yml`.
- Both workflows use Node 22, `npm ci`, `npm run validate`, `npm run build`, and `npm run verify`.
- Only the deploy workflow publishes to Cloudflare Pages.

## Local Smoke Test

```bash
npm run validate
npm run build
npm run verify
```

Serve the generated preview:

```bash
node scripts/landscape2.mjs serve --landscape-dir build
```
