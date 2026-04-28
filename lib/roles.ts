import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import type { Roles } from "@/types/globals";

export async function checkRole(role: Roles): Promise<boolean> {
  if (role !== "admin") return false;
  return await fetchAuthQuery(api.adminUsers.hasAdminPermission, {});
}
