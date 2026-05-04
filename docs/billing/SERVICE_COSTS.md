# Service Costs

Last reviewed: 2026-05-02

This file tracks non-AI services in this app that can create direct or indirect billing. Prices change, so use the linked official pricing pages as the source of truth before making budget decisions.

## Summary

| Service | Used for in this app | Current cost model |
| --- | --- | --- |
| Convex | Backend database, functions, auth integration, file storage, search indexes, realtime client subscriptions | Free/Starter includes baseline usage. Starter overages include function calls at $2.20 per 1M, action compute at $0.33/GB-hour, database storage at $0.22/GB/month, database I/O at $0.22/GB, file storage at $0.033/GB/month, file/data egress at $0.132/GB, and search storage/query overages. Professional is $25/developer/month with larger included usage and lower overage rates. Business/Enterprise starts at a $2,500 monthly minimum. |
| Tavily | Agent web search and URL extraction tools | Free plan includes 1,000 API credits/month. Pay-as-you-go is $0.008/credit. Monthly plans include Project at $30/month for 4,000 credits, Bootstrap at $100/month for 15,000 credits, Startup at $220/month for 38,000 credits, and Growth at $500/month for 100,000 credits. This app configures Tavily search with `searchDepth: "advanced"`, which costs 2 credits per search request. Tavily Extract costs 1 credit per 5 successful basic extractions or 2 credits per 5 successful advanced extractions. |
| Google Custom Search JSON API | `fetchImages` tool for image search | 100 search queries/day are free. Additional requests cost $5 per 1,000 queries, up to 10,000 queries/day. |
| Composio | User-connected integrations and dynamic tools | Free plan includes 20,000 standard tool calls/month. Paid plans include $29/month for 200,000 tool calls plus $0.299 per additional 1,000 standard calls, and $229/month for 2M tool calls plus $0.249 per additional 1,000 standard calls. Premium tool calls are priced higher: on paid plans, roughly $0.897 per 1,000 on the $29 plan and $0.747 per 1,000 on the $229 plan. |
| Google OAuth / Google Identity | Google sign-in via Better Auth | The app uses Google OAuth client credentials for sign-in, not Google Identity Platform billing. I found no direct per-login price for this OAuth setup. If the project is later moved to Google Identity Platform, social-provider auth is free up to 49,999 monthly active users, then starts at $0.0055 per MAU for the next tier. |

## App-Specific Notes

- Convex costs are likely driven by chat/message storage, realtime reads/subscriptions, admin queries, usage tracking, knowledge file storage, user avatar uploads, and document asset uploads.
- Tavily can become meaningful quickly because the app enables advanced web search, which is 2 credits per search request.
- Google Custom Search costs are tied to the `fetchImages` tool. If image search is enabled for many agent runs, budget around the per-query pricing.
- Composio cost depends on how many connected integration tools users call, and whether any calls are premium tools such as search, scraping, code execution, OCR, or AI/ML inference.
- Google OAuth itself should not be treated as a usage-metered service in this codebase; the paid Google item currently used by code is Google Custom Search.

## Sources

- Convex pricing: https://www.convex.dev/pricing
- Convex limits and overage details: https://docs.convex.dev/production/state/limits
- Tavily API credits: https://docs.tavily.com/documentation/api-credits
- Google Custom Search JSON API pricing: https://developers.google.com/custom-search/v1/overview
- Composio pricing: https://composio.dev/pricing
- Composio premium tools: https://docs.composio.dev/toolkits/premium-tools
- Google Identity Platform pricing, included only as a non-current-codepath reference: https://cloud.google.com/identity-platform/pricing
