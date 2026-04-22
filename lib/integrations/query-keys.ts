export const integrationKeys = {
  all: ["integrations"] as const,
  list: (search?: string) => [...integrationKeys.all, "list", search] as const,
  detail: (slug: string) =>
    [...integrationKeys.all, "detail", slug] as const,
};
