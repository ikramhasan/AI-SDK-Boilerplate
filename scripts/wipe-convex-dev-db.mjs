import { spawnSync } from "node:child_process"
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const args = new Set(process.argv.slice(2))
const isDryRun = args.has("--dry-run")
const hasConfirmed = args.has("--yes")

const components = [
  {
    name: "app",
    component: null,
    tables: [
      "chats",
      "messages",
      "messageToolRuns",
      "aiConfig",
      "feedback",
      "knowledgeFiles",
      "mcpServers",
      "usage",
      "creditLedger",
      "userBillingState",
      "userAvatars",
    ],
  },
  {
    name: "betterAuth",
    component: "betterAuth",
    tables: ["session", "account", "verification", "jwks", "user"],
  },
  {
    name: "polar",
    component: "polar",
    tables: ["subscriptions", "customers", "products"],
  },
]

function readEnvFile(path) {
  if (!existsSync(path)) return {}

  const values = {}
  const lines = readFileSync(path, "utf8").split("\n")

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed)
    if (!match) continue

    const [, key, rawValue] = match
    const value = rawValue
      .replace(/\s+#.*$/, "")
      .trim()
      .replace(/^['"]|['"]$/g, "")

    values[key] = value
  }

  return values
}

function assertDevDeployment(env) {
  if (args.has("--prod")) {
    throw new Error(
      "Refusing to wipe data: this script must never be run with --prod."
    )
  }

  const deployment = process.env.CONVEX_DEPLOYMENT ?? env.CONVEX_DEPLOYMENT
  if (!deployment) {
    throw new Error(
      "Refusing to wipe data: CONVEX_DEPLOYMENT is missing. Run `npx convex dev` or set a dev deployment first."
    )
  }

  if (!deployment.startsWith("dev:")) {
    throw new Error(
      `Refusing to wipe data: CONVEX_DEPLOYMENT is ${JSON.stringify(
        deployment
      )}, expected it to start with "dev:".`
    )
  }

  const deployKey = process.env.CONVEX_DEPLOY_KEY ?? env.CONVEX_DEPLOY_KEY
  if (deployKey && !deployKey.startsWith("dev:")) {
    throw new Error(
      "Refusing to wipe data: CONVEX_DEPLOY_KEY is not a dev deploy key."
    )
  }

  return deployment
}

function runConvexImport({ component, table, emptyJsonPath }) {
  const commandArgs = [
    "convex",
    "import",
    "--replace",
    "--table",
    table,
    "--format",
    "jsonArray",
    "--yes",
  ]

  if (component) {
    commandArgs.push("--component", component)
  }

  commandArgs.push(emptyJsonPath)

  if (isDryRun) {
    console.log(`DRY RUN: npx ${commandArgs.join(" ")}`)
    return
  }

  const result = spawnSync("npx", commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "inherit",
  })

  if (result.status !== 0) {
    throw new Error(
      `Failed to wipe ${component ? `${component}.` : ""}${table}.`
    )
  }
}

if (!hasConfirmed && !isDryRun) {
  throw new Error(
    "Refusing to wipe data without confirmation. Re-run with `--yes` after verifying this is the dev deployment."
  )
}

const env = readEnvFile(".env.local")
const deployment = assertDevDeployment(env)
const tempDir = mkdtempSync(join(tmpdir(), "convex-empty-import-"))
const emptyJsonPath = join(tempDir, "empty.json")

writeFileSync(emptyJsonPath, "[]\n")

try {
  console.log(`Wiping Convex dev deployment ${deployment}.`)

  for (const { name, component, tables } of components) {
    console.log(`\n${name}`)

    for (const table of tables) {
      console.log(`- ${table}`)
      runConvexImport({ component, table, emptyJsonPath })
    }
  }

  console.log("\nConvex dev database wipe complete.")
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
