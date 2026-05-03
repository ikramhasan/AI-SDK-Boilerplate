Implement a secure and robust pricing feature in this app with [Polar](https://polar.sh). Polar has integrations with both convex and better auth and I'm not sure which ones to use or both or none.

Requirements: 

1. Implement the pricing strategy. 
2. A usage log ledger MUST be maintained with actual usage. 
3. Ignore the overages and extra credit requirement in the strategy doc. Implement the subscription only for now. 

References: 

1. Pricing strategy guide: `PRICING_STRATEGY.md` (Important, read carefully)
2. Tool calling: `TOOL_CALLING.md`
3. Integation with better auth: `BETTER_AUTH_POLAR.md`
4. Integration with convex: https://www.convex.dev/components/polar/polar.md

Notes: 

1. Be very vigilent, and extra careful while implementing this. Any bug or bad logic will amount to money loss. 
2. Use bun as the package manager. 
3. If there's any steps needed from my end, mention them in a `FINAL_STEPS.md` file.