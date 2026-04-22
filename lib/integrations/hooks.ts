"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { integrationKeys } from "./query-keys";
import {
  fetchToolkits,
  fetchToolkitDetail,
  connectToolkit,
  disconnectToolkit,
} from "./api";
import type { ToolkitsListResponse } from "./api";

// ── List toolkits (infinite / paginated) ───────────────────────────────────

export function useToolkits(search: string) {
  return useInfiniteQuery<ToolkitsListResponse>({
    queryKey: integrationKeys.list(search),
    queryFn: ({ pageParam }) =>
      fetchToolkits({
        cursor: pageParam as string | undefined,
        search: search || undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

// ── Toolkit detail ─────────────────────────────────────────────────────────

export function useToolkitDetail(slug: string) {
  return useQuery({
    queryKey: integrationKeys.detail(slug),
    queryFn: () => fetchToolkitDetail(slug),
    enabled: !!slug,
  });
}

// ── Connect mutation ───────────────────────────────────────────────────────

export function useConnectToolkit() {
  return useMutation({
    mutationFn: connectToolkit,
    onSuccess: (data) => {
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    },
  });
}

// ── Disconnect mutation ────────────────────────────────────────────────────

export function useDisconnectToolkit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectToolkit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.all });
    },
  });
}
