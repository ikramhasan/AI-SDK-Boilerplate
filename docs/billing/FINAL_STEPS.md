# Final Steps

1. Create the monthly subscription products in Polar:
   - Basic: $10/month, 1,000 included credits
   - Starter: $20/month, 2,000 included credits
   - Plus: $50/month, 5,000 included credits
   - Pro: $100/month, 10,000 included credits
   - Scale: $250/month, 25,000 included credits

2. Create the yearly subscription products in Polar:
   - Basic: $96/year, 12,000 included credits
   - Starter: $192/year, 24,000 included credits
   - Plus: $480/year, 60,000 included credits
   - Pro: $960/year, 120,000 included credits
   - Scale: $2,400/year, 300,000 included credits

   Yearly products are priced at 20% off the monthly equivalent and grant the
   annual credit bucket once per yearly subscription period.

3. Set these Convex environment variables:

```bash
bunx convex env set POLAR_ORGANIZATION_TOKEN "..."
bunx convex env set POLAR_WEBHOOK_SECRET polar_whs_ftvWM2vtW8vymwlV2oVOBsRwIg4RQn6R94DJU0pDS6N
bunx convex env set POLAR_SERVER "sandbox"
bunx convex env set POLAR_BASIC_PRODUCT_ID "..."
bunx convex env set POLAR_BASIC_YEARLY_PRODUCT_ID "..."
bunx convex env set POLAR_STARTER_PRODUCT_ID "..."
bunx convex env set POLAR_STARTER_YEARLY_PRODUCT_ID "..."
bunx convex env set POLAR_PLUS_PRODUCT_ID "..."
bunx convex env set POLAR_PLUS_YEARLY_PRODUCT_ID "..."
bunx convex env set POLAR_PRO_PRODUCT_ID "..."
bunx convex env set POLAR_PRO_YEARLY_PRODUCT_ID "..."
bunx convex env set POLAR_SCALE_PRODUCT_ID "..."
bunx convex env set POLAR_SCALE_YEARLY_PRODUCT_ID "..."
```

Use `POLAR_SERVER="production"` only after sandbox checkout and webhook testing pass.

4. In Polar, create a webhook endpoint pointing to:

```text
https://<your-convex-site-url>/polar/events
```

Enable at least:

- `product.created`
- `product.updated`
- `subscription.created`
- `subscription.updated`

5. Sync existing Polar products after the env vars are set:

```bash
bunx convex run billing:syncProducts
```

6. Run sandbox checkouts from `/settings/billing` for monthly and yearly plans,
   confirm the webhooks arrive, then verify the user receives the subscription
   credit grant in the billing ledger.

Alternatively, create or reuse the visible Polar products and set the matching
Convex env vars with:

```bash
node scripts/create-polar-products.mjs --server sandbox --token "polar_oat_..."
```

The script does not read tokens from documentation files. It accepts
`--token ...` or `POLAR_ORGANIZATION_TOKEN`, reuses matching existing products,
creates only missing Starter/Plus/Pro/Scale monthly and yearly products, sets the
matching Convex env vars, and runs `billing:syncProducts`.
