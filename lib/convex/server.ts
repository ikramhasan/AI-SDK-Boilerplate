import "server-only";

import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import type {
  FunctionReference,
  FunctionReturnType,
  OptionalRestArgs,
} from "convex/server";

export async function requireCurrentUserConvexAuth() {
  const authObject = await auth();

  if (!authObject.userId) {
    throw new Error("Not authenticated");
  }

  const token =
    authObject.sessionClaims?.aud === "convex"
      ? await authObject.getToken()
      : await authObject.getToken({ template: "convex" });

  if (!token) {
    throw new Error("Failed to obtain Convex token");
  }

  return {
    userId: authObject.userId,
    token,
  };
}

export async function getCurrentUserConvexToken() {
  const { token } = await requireCurrentUserConvexAuth();
  return token;
}

function isValidConvexAdminKey(value: string) {
  return /^(dev|prod|preview|project):.+\|.+$/.test(value);
}

export function getConvexAdminOptions() {
  const deployKey = process.env.CONVEX_DEPLOY_KEY;
  if (!deployKey) {
    throw new Error(
      "Missing Convex deploy key. Set CONVEX_DEPLOY_KEY to a valid Convex deploy/admin key from the Convex dashboard."
    );
  }

  if (!isValidConvexAdminKey(deployKey)) {
    throw new Error(
      "Invalid Convex deploy key. CONVEX_DEPLOY_KEY must be a Convex deploy/admin key like dev:<deployment>|<secret> or prod:<deployment>|<secret>."
    );
  }

  return { deployKey };
}

function createAdminConvexClient() {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!) as ConvexHttpClient & {
    setAdminAuth(token: string): void;
    function<
      AnyFunction extends FunctionReference<
        "query" | "mutation" | "action",
        "public" | "internal"
      >
    >(
      anyFunction: AnyFunction,
      componentPath: string | undefined,
      ...args: OptionalRestArgs<AnyFunction>
    ): Promise<FunctionReturnType<AnyFunction>>;
  };

  client.setAdminAuth(getConvexAdminOptions().deployKey);

  return client;
}

export async function runConvexAdminQuery<
  Query extends FunctionReference<"query", "public" | "internal">
>(query: Query, ...args: OptionalRestArgs<Query>) {
  return await createAdminConvexClient().function(query, undefined, ...args);
}

export async function runConvexAdminMutation<
  Mutation extends FunctionReference<"mutation", "public" | "internal">
>(mutation: Mutation, ...args: OptionalRestArgs<Mutation>) {
  return await createAdminConvexClient().function(mutation, undefined, ...args);
}
