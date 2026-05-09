import { spawnSync } from "node:child_process"

const args = process.argv.slice(2)
const passthroughArgs = []
let email = null
let shouldPush = true

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index]

  if (arg === "--email") {
    email = args[index + 1]
    index += 1
    continue
  }

  if (arg.startsWith("--email=")) {
    email = arg.slice("--email=".length)
    continue
  }

  if (arg === "--no-push") {
    shouldPush = false
    continue
  }

  if (arg === "--prod") {
    shouldPush = false
  }

  if (!arg.startsWith("-") && !email) {
    email = arg
    continue
  }

  passthroughArgs.push(arg)
}

if (!email?.trim()) {
  console.error("Usage: npm run admin:make -- <email> [convex options]")
  console.error("Example: npm run admin:make -- admin@example.com")
  process.exit(1)
}

const convexArgs = [
  "convex",
  "run",
  ...(shouldPush ? ["--push"] : []),
  ...passthroughArgs,
  "internal.adminUsers.makeAdminByEmail",
  JSON.stringify({ email }),
]

const result = spawnSync("npx", convexArgs, {
  cwd: process.cwd(),
  encoding: "utf8",
  stdio: "inherit",
})

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
