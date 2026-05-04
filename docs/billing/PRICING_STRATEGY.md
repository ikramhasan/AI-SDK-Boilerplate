# Pricing Strategy

Last reviewed: 2026-05-02

This strategy is designed for an 85% gross profit margin on metered usage. It assumes "gross profit margin" means:

```text
gross_margin = (customer_revenue - direct_vendor_cost) / customer_revenue
```

At an 85% margin, direct vendor cost must be no more than 15% of revenue.

## Credit Definition

Use a simple customer-facing credit unit:

```text
1 credit = $0.01 customer value
```

That means each credit can safely cover at most:

```text
max_vendor_cost_per_credit = $0.01 * 15% = $0.0015
```

For any metered event:

```text
credits_to_charge = ceil(vendor_cost_usd / 0.0015)
```

For AI usage already recorded by the app:

```text
credits_to_charge = ceil(usage.cost * 666.6667)
```

If `usage.cost > 0`, charge at least 1 credit. Do not round each token category separately; calculate total request cost first, then round once.

## Subscription Tiers

Do not discount credits until real usage data proves the blended margin is safely above 85%. Larger tiers should provide workflow/features/support value, not cheaper metered usage.

| Tier | Price / month | Included credits | Included subscription credit value | Notes |
| --- | ---: | ---: | ---: | --- |
| Basic | $10 | 1,000 | $10 | Low-friction package for users who want to try real usage beyond the free trial. |
| Starter | $20 | 2,000 | $20 | Entry plan. Good for light personal usage. |
| Plus | $50 | 5,000 | $50 | Higher limits, faster support, more saved chats/files. |
| Pro | $100 | 10,000 | $100 | Power-user plan with shared knowledge, larger usage needs, and priority support. |
| Scale | $250 | 25,000 | $250 | Higher rate limits, priority support, larger file limits. |

## Free Trial

Give every new user a one-time trial grant:

```text
trial_credits = 100
credit_card_required = false
```

Trial rules:

- Trial credits are only for evaluating the app.
- Trial users cannot buy extra credits.
- Trial users cannot use overages.
- When trial credits reach zero, require an active paid subscription before allowing more paid AI/tool usage.
- Trial credits should expire after 14 or 30 days to reduce dormant liability.

## Extra Credits and Overages

Extra credits and overages should cost more than subscription credits to make monthly plans the best-value path.

| Pack | Price | Credits |
| --- | ---: | ---: |
| Small top-up | $12 | 1,000 |
| Standard top-up | $55 | 5,000 |
| Large top-up | $105 | 10,000 |

Overages should be charged at:

```text
overage_price = $0.012 per credit
```

Extra credit and overage eligibility:

- Users must have an active paid subscription to buy extra credits.
- Users must have an active paid subscription to enable overages.
- Free trial users cannot buy extra credits or use overages.
- Cancelled, expired, or delinquent subscriptions cannot buy top-ups or continue overage billing.
- Purchased credits should be consumed after subscription credits but before overages.

Recommended billing behavior:

- Subscription credits reset monthly and do not roll over.
- Purchased top-up credits do not expire for at least 12 months.
- When subscription credits reach zero, either stop generation or charge overages automatically if the customer has enabled overages.
- No negative balance unless a payment method is present.
- Add a hard monthly spend cap per account.

## AI Credit Conversion

The app already calculates AI vendor cost in `lib/usage.ts` and stores it in `convex/usage.ts` as `usage.cost`. Use that recorded cost as the source of truth.

For Gemini 3 Flash reference pricing:

```json
{
  "cost": {
    "input": 0.5,
    "output": 3,
    "cache_read": 0.05,
    "context_over_200k": {
      "input": 0.5,
      "output": 3,
      "cache_read": 0.05
    }
  }
}
```

These prices are dollars per 1M tokens.

Gemini 3 Flash minimum credit rates for 85% margin:

| Usage type | Vendor cost | Minimum credits to charge | Customer revenue | Gross margin |
| --- | ---: | ---: | ---: | ---: |
| 1M input tokens | $0.50 | 334 credits | $3.34 | 85.03% |
| 1M output tokens | $3.00 | 2,000 credits | $20.00 | 85.00% |
| 1M cache-read tokens | $0.05 | 34 credits | $0.34 | 85.29% |
| 1K input tokens | $0.0005 | Aggregate in request | n/a | n/a |
| 1K output tokens | $0.0030 | Aggregate in request | n/a | n/a |
| 1K cache-read tokens | $0.00005 | Aggregate in request | n/a | n/a |

Example request:

```text
input_tokens = 20,000
output_tokens = 2,000
cache_read_tokens = 10,000

regular_input_cost = 10,000 * $0.50 / 1,000,000 = $0.005
cache_read_cost = 10,000 * $0.05 / 1,000,000 = $0.0005
output_cost = 2,000 * $3.00 / 1,000,000 = $0.006

vendor_cost = $0.0115
credits_to_charge = ceil($0.0115 / $0.0015) = 8 credits
customer_revenue = $0.08
gross_margin = 85.625%
```

Important implementation rule:

```text
Charge credits for both chat generation and title generation.
```

The app records these separately as usage sources `chat` and `title`; both consume model tokens.

## Tool Call Pricing

Tool calls must be counted individually. Record one billable tool event for every actual tool invocation, including the tool name, vendor cost, calculated credits, and the chat/message that caused it.

Use this pricing table for current app tools with external vendor cost. MCP servers are intentionally excluded.

| Tool / service | Vendor cost basis | Recommended charge | Revenue | Gross margin |
| --- | ---: | ---: | ---: | ---: |
| Tavily Search, `advanced` | 2 Tavily credits * $0.008 = $0.016 per search | 11 credits per search | $0.11 | 85.45% |
| Tavily Search, `basic` | 1 Tavily credit * $0.008 = $0.008 per search | 6 credits per search | $0.06 | 86.67% |
| Tavily Extract, `basic` | $0.008 per 5 successful URL extractions = $0.0016 each | 2 credits per successful extracted URL | $0.02 | 92.00% |
| Tavily Extract, `advanced` | $0.016 per 5 successful URL extractions = $0.0032 each | 3 credits per successful extracted URL | $0.03 | 89.33% |
| Google Custom Search JSON API | $5 per 1,000 queries = $0.005 per query | 4 credits per image search query | $0.04 | 87.50% |
| Composio standard tool call, $29 plan | $0.299 per 1,000 calls = $0.000299 each | 1 credit per tool call | $0.01 | 97.01% |
| Composio premium tool call, $29 plan | $0.897 per 1,000 calls = $0.000897 each | 1 credit per premium call | $0.01 | 91.03% |
| Composio standard tool call, $229 plan | $0.249 per 1,000 calls = $0.000249 each | 1 credit per tool call | $0.01 | 97.51% |
| Composio premium tool call, $229 plan | $0.747 per 1,000 calls = $0.000747 each | 1 credit per premium call | $0.01 | 92.53% |

Internal tools with no direct external cost, such as calculator, current date/time, local chart construction, and ask-user-question, should still be logged individually. They can be priced at 0 credits for user friendliness, or 1 credit if abuse control is more important than generosity.

Convex usage should not be charged as a visible per-tool event. Treat Convex as platform overhead funded by subscriptions and unspent credits. Revisit this if file storage, file egress, or realtime function calls become a material percentage of revenue.

## Required Usage Ledger

Add a credit ledger separate from the existing raw usage records.

Minimum fields:

| Field | Purpose |
| --- | --- |
| `userId` | Account being charged. |
| `source` | `ai_chat`, `ai_title`, `tool_call`, `credit_purchase`, `subscription_grant`, `manual_adjustment`, `refund`. |
| `credits` | Positive for grants/purchases, negative for usage. |
| `vendorCostUsd` | Direct cost for usage events. |
| `revenueUsd` | `abs(credits) * 0.01` for usage, purchase amount for purchases. |
| `margin` | Calculated margin for auditability. |
| `chatId` | Optional link to chat. |
| `messageId` | Optional link to message. |
| `toolName` | Required for tool calls. |
| `model` | Required for AI events. |
| `metadata` | Token counts, Tavily depth, extracted URL count, Composio premium flag, etc. |

Do not rely only on aggregate monthly totals. You need per-event logs so disputes, billing audits, and model/tool price changes can be traced.

## Guardrails

- Never let users run paid AI/tool actions without enough credits unless overages are enabled.
- Preflight should estimate or reserve credits before generation; final billing should reconcile against actual `usage.cost`.
- If a model returns missing usage or cost is zero because pricing lookup failed, either block the request or charge a conservative fallback.
- Keep a provider/model price snapshot on each usage record. Live pricing can change later.
- Add admin alerts when blended gross margin drops below 88%; this gives time to react before crossing the 85% floor.
- Review Tavily, Google Custom Search, Composio, and AI model pricing monthly.

## Sources

- Convex pricing: https://www.convex.dev/pricing
- Tavily API credits: https://docs.tavily.com/documentation/api-credits
- Google Custom Search JSON API pricing: https://developers.google.com/custom-search/v1/overview
- Composio pricing: https://composio.dev/pricing
- Composio premium tools: https://docs.composio.dev/toolkits/premium-tools
