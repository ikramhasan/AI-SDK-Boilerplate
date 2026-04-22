"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, ChevronRight } from "lucide-react";
import {
  useToolkitDetail,
  useConnectToolkit,
  useDisconnectToolkit,
} from "@/lib/integrations/hooks";
import { ToolkitHeader } from "../_components/toolkit-header";
import { ToolkitMetadata } from "../_components/toolkit-metadata";
import { ToolsList } from "../_components/tools-list";

export default function IntegrationDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const nameHint = searchParams.get("name");

  const { data, isLoading, error } = useToolkitDetail(slug);
  const connectMutation = useConnectToolkit();
  const disconnectMutation = useDisconnectToolkit();

  const toolkit = data?.toolkit ?? null;
  const tools = data?.tools ?? [];

  const actionLoading =
    connectMutation.isPending || disconnectMutation.isPending;

  const connect = () => connectMutation.mutate(slug);
  const disconnect = () => {
    if (!toolkit?.connectedAccountId) return;
    disconnectMutation.mutate(toolkit.connectedAccountId);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-dvh flex-col">
        <header className="flex h-12 shrink-0 items-center px-4">
          <SidebarTrigger />
          <nav className="ml-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Link
              href="/integrations"
              className="hover:text-foreground transition-colors"
            >
              Integrations
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground font-medium">
              {toolkit?.name ?? nameHint ?? slug}
            </span>
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Spinner />
            </div>
          ) : error || !toolkit ? (
            <div className="mx-auto max-w-2xl space-y-4 p-6">
              <p className="text-sm text-muted-foreground">
                {error
                  ? "Failed to load integration details."
                  : "Integration not found."}
              </p>
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 size-4" />
                Go back
              </Button>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-8 p-6">
              <ToolkitHeader
                toolkit={toolkit}
                actionLoading={actionLoading}
                onConnect={connect}
                onDisconnect={disconnect}
              />
              <ToolkitMetadata toolkit={toolkit} />
              <ToolsList tools={tools} />
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
