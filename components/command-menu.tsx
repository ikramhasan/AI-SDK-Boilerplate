"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useSession } from "@better-auth-ui/react";
import { useTheme } from "next-themes";
import { api } from "@/convex/_generated/api";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Edit02Icon,
  Moon02Icon,
  MessageMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useIsMac } from "@/hooks/use-is-mac";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isMac = useIsMac();
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session);

  const recentChats =
    useQuery(api.chats.list, isAuthenticated ? {} : "skip") ?? [];
  const searchResults = useQuery(
    api.chats.search,
    isAuthenticated && debouncedSearch.length > 0
      ? { query: debouncedSearch }
      : "skip"
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Alt+N for new chat
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.code === "KeyN" && e.altKey) {
        e.preventDefault();
        setOpen(false);
        window.dispatchEvent(new Event("new-chat"));
        router.push("/chat");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  const displayChats = debouncedSearch.length > 0 ? (searchResults ?? []) : recentChats.slice(0, 10);

  const actions = [
    { label: "New chat", icon: Edit02Icon, onSelect: () => runCommand(() => { window.dispatchEvent(new Event("new-chat")); router.push("/chat"); }), shortcut: true },
    { label: "Change theme", icon: Moon02Icon, onSelect: () => runCommand(() => setTheme(resolvedTheme === "dark" ? "light" : "dark")), shortcut: false },
  ];

  const lowerSearch = search.toLowerCase();
  const filteredActions = search
    ? actions.filter((a) => a.label.toLowerCase().includes(lowerSearch))
    : actions;

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command Menu" description="Search chats or run a command">
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search chats or type a command..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {filteredActions.length > 0 && (
            <CommandGroup heading="Actions">
              {filteredActions.map((action) => (
                <CommandItem key={action.label} onSelect={action.onSelect}>
                  <HugeiconsIcon icon={action.icon} size={16} />
                  {action.label}
                  {action.shortcut && (
                    <CommandShortcut>
                      <KbdGroup>
                        <Kbd>{isMac ? "⌥" : "Alt"}</Kbd>
                        <Kbd>N</Kbd>
                      </KbdGroup>
                    </CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {displayChats.length > 0 && (
            <>
              {filteredActions.length > 0 && <CommandSeparator />}
              <CommandGroup heading={debouncedSearch ? "Search results" : "Recent chats"}>
                {displayChats.map((chat) => (
                  <CommandItem
                    key={chat._id}
                    onSelect={() =>
                      runCommand(() => router.push(`/chat/${chat._id}`))
                    }
                  >
                    <HugeiconsIcon icon={MessageMultiple02Icon} size={16} />
                    <span className="truncate">{chat.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function useCommandMenu() {
  return {
    open: () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: true })
      );
    },
  };
}
