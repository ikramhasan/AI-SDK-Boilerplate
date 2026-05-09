import { spawnSync } from "node:child_process"

import { PolarCore } from "@polar-sh/sdk/core.js"
import { productsCreate } from "@polar-sh/sdk/funcs/productsCreate.js"
import { productsList } from "@polar-sh/sdk/funcs/productsList.js"

const args = new Map()
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index]
  if (!arg.startsWith("--")) continue
  const key = arg.slice(2)
  const next = process.argv[index + 1]
  if (!next || next.startsWith("--")) {
    args.set(key, true)
  } else {
    args.set(key, next)
    index += 1
  }
}

const accessToken =
  args.get("token") ?? process.env.POLAR_ORGANIZATION_TOKEN ?? ""
const server = args.get("server") ?? process.env.POLAR_SERVER ?? "sandbox"
const shouldSetConvexEnv = !args.has("skip-convex-env")
const shouldSyncProducts = !args.has("skip-sync")

if (!accessToken || accessToken === true) {
  throw new Error(
    "Missing Polar token. Pass --token polar_oat_... or set POLAR_ORGANIZATION_TOKEN."
  )
}

if (server !== "sandbox" && server !== "production") {
  throw new Error("--server must be either sandbox or production.")
}

const plans = [
  {
    key: "starter",
    env: "POLAR_STARTER_PRODUCT_ID",
    name: "Starter Monthly",
    interval: "monthly",
    recurringInterval: "month",
    priceCents: 2_000,
    credits: 2_000,
  },
  {
    key: "starter",
    env: "POLAR_STARTER_YEARLY_PRODUCT_ID",
    name: "Starter Yearly",
    interval: "yearly",
    recurringInterval: "year",
    priceCents: 19_200,
    credits: 24_000,
  },
  {
    key: "plus",
    env: "POLAR_PLUS_PRODUCT_ID",
    name: "Plus Monthly",
    interval: "monthly",
    recurringInterval: "month",
    priceCents: 5_000,
    credits: 5_000,
  },
  {
    key: "plus",
    env: "POLAR_PLUS_YEARLY_PRODUCT_ID",
    name: "Plus Yearly",
    interval: "yearly",
    recurringInterval: "year",
    priceCents: 48_000,
    credits: 60_000,
  },
  {
    key: "pro",
    env: "POLAR_PRO_PRODUCT_ID",
    name: "Pro Monthly",
    interval: "monthly",
    recurringInterval: "month",
    priceCents: 10_000,
    credits: 10_000,
  },
  {
    key: "pro",
    env: "POLAR_PRO_YEARLY_PRODUCT_ID",
    name: "Pro Yearly",
    interval: "yearly",
    recurringInterval: "year",
    priceCents: 96_000,
    credits: 120_000,
  },
  {
    key: "scale",
    env: "POLAR_SCALE_PRODUCT_ID",
    name: "Scale Monthly",
    interval: "monthly",
    recurringInterval: "month",
    priceCents: 25_000,
    credits: 25_000,
  },
  {
    key: "scale",
    env: "POLAR_SCALE_YEARLY_PRODUCT_ID",
    name: "Scale Yearly",
    interval: "yearly",
    recurringInterval: "year",
    priceCents: 240_000,
    credits: 300_000,
  },
]

const client = new PolarCore({ accessToken, server })

function unwrapResult(result) {
  return result.value?.result ?? result.value
}

async function listAllProducts() {
  const items = []

  for (let page = 1; page < 20; page += 1) {
    const result = await productsList(client, { page, limit: 100 })
    if (!result.ok) {
      throw new Error(`Failed to list Polar products: ${JSON.stringify(result.error)}`)
    }

    const pageResult = unwrapResult(result)

    items.push(...pageResult.items)

    const maxPage =
      pageResult.pagination?.maxPage ??
      pageResult.pagination?.max_page ??
      page

    if (page >= maxPage) break
  }

  return items
}

function candidateNames(plan) {
  return [
    plan.name,
    plan.name.replace(" Monthly", ""),
    plan.name.replace(" Yearly", " Annual"),
    plan.name.replace(" Yearly", " Annual Plan"),
  ].map((name) => name.toLowerCase())
}

const products = await listAllProducts()
const activeProducts = products.filter((product) => !product.isArchived)
const created = []
const reused = []
const idsByEnv = {}

for (const plan of plans) {
  const existing =
    activeProducts.find(
      (product) =>
        product.metadata?.plan_key === plan.key &&
        product.metadata?.interval === plan.interval
    ) ??
    activeProducts.find((product) =>
      candidateNames(plan).includes(String(product.name).toLowerCase())
    )

  if (existing) {
    reused.push(plan.name)
    idsByEnv[plan.env] = existing.id
    continue
  }

  const result = await productsCreate(client, {
    name: plan.name,
    description: `${plan.credits.toLocaleString()} credits ${
      plan.interval === "yearly" ? "per year" : "per month"
    } for HeyClaw AI agent usage.`,
    recurringInterval: plan.recurringInterval,
    prices: [
      {
        amountType: "fixed",
        priceCurrency: "usd",
        priceAmount: plan.priceCents,
      },
    ],
    metadata: {
      plan_key: plan.key,
      interval: plan.interval,
      credits: plan.credits,
    },
  })

  if (!result.ok) {
    throw new Error(`Failed to create ${plan.name}: ${JSON.stringify(result.error)}`)
  }

  created.push(plan.name)
  idsByEnv[plan.env] = unwrapResult(result).id
}

const envSet = []

if (shouldSetConvexEnv) {
  for (const [name, value] of Object.entries(idsByEnv)) {
    const result = spawnSync("npx", ["convex", "env", "set", name, value], {
      cwd: process.cwd(),
      encoding: "utf8",
    })

    if (result.status !== 0) {
      throw new Error(`Failed to set ${name}: ${result.stderr || result.stdout}`)
    }

    envSet.push(name)
  }
}

let synced = false
if (shouldSyncProducts) {
  const syncResult = spawnSync("npx", ["convex", "run", "billing:syncProducts"], {
    cwd: process.cwd(),
    encoding: "utf8",
  })

  if (syncResult.status !== 0) {
    throw new Error(`Failed to sync products: ${syncResult.stderr || syncResult.stdout}`)
  }

  synced = true
}

console.log(
  JSON.stringify(
    {
      server,
      created,
      reused,
      envSet,
      synced,
    },
    null,
    2
  )
)
