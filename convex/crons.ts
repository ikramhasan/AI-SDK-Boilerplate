import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

// Run credit-balance reconciliation every 6 hours.
// The mutation self-schedules to process one user at a time.
crons.interval(
  "reconcile credit balances",
  { hours: 6 },
  internal.billing.reconcileCreditBalances,
  {}
)

export default crons
