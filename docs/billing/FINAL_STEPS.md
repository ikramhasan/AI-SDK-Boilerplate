# Final Steps

1. Create the five monthly subscription products in Polar:
   - Basic: $10/month, 1,000 included credits
   - Starter: $20/month, 2,000 included credits
   - Plus: $50/month, 5,000 included credits
   - Pro: $100/month, 10,000 included credits
   - Scale: $250/month, 25,000 included credits

2. Set these Convex environment variables:

```bash
bunx convex env set POLAR_ORGANIZATION_TOKEN polar_oat_VrHAZtME5L9RpefHwoCSyqJUx9kpK02zLJKzz1TZ5p4
bunx convex env set POLAR_WEBHOOK_SECRET polar_whs_ftvWM2vtW8vymwlV2oVOBsRwIg4RQn6R94DJU0pDS6N
bunx convex env set POLAR_SERVER "sandbox"
bunx convex env set POLAR_BASIC_PRODUCT_ID "..."
bunx convex env set POLAR_STARTER_PRODUCT_ID "..."
bunx convex env set POLAR_PLUS_PRODUCT_ID "..."
bunx convex env set POLAR_PRO_PRODUCT_ID 7966ecf9-a7d3-4e09-b4cb-91300afba4b9
bunx convex env set POLAR_SCALE_PRODUCT_ID 1a14b320-be0d-424e-a750-ad33faa53b4a
```

Use `POLAR_SERVER="production"` only after sandbox checkout and webhook testing pass.

3. In Polar, create a webhook endpoint pointing to:

```text
https://<your-convex-site-url>/polar/events
```

Enable at least:

- `product.created`
- `product.updated`
- `subscription.created`
- `subscription.updated`

4. Sync existing Polar products after the env vars are set:

```bash
bunx convex run billing:syncProducts
```

5. Run a sandbox checkout from `/settings/billing`, confirm the webhook arrives, then verify the user receives the subscription credit grant in the billing ledger.
