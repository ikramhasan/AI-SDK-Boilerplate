"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Edit02Icon,
  Search01Icon,
  MessageMultiple02Icon,
  Settings02Icon,
  MoreVerticalCircle01Icon,
  Delete02Icon,
  Share08Icon,
  ConnectIcon,
  FileExportIcon,
} from "@hugeicons/core-free-icons"
import { FileTextIcon, FileIcon, FileDownIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { useSession } from "@better-auth-ui/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { getSiteName } from "@/lib/site-data"
import { TextAnimate } from "@/components/text-animate"
import { Kbd, KbdGroup } from "./ui/kbd"
import { useIsMac } from "@/hooks/use-is-mac"
import { ShareChatDialog } from "./share-chat-dialog"
import { exportAsMarkdown, exportAsDocx, exportAsPdf } from "@/lib/export-chat"
import { UserButton } from "@/components/user/user-button"

export function AppSidebar() {
  const { data: session, isPending: isLoading } = useSession()
  const isAuthenticated = Boolean(session)
  const router = useRouter()
  const isMac = useIsMac()
  const params = useParams()
  const activeChatId = params?.chatId as string | undefined
  const recentChatsQuery = useQuery(
    api.chats.list,
    isAuthenticated ? {} : "skip"
  )
  const isLoadingChats = recentChatsQuery === undefined
  const recentChats = recentChatsQuery ?? []
  const removeChat = useMutation(api.chats.remove)
  const [shareChatId, setShareChatId] = useState<string | null>(null)
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null)
  const [streamedTitles, setStreamedTitles] = useState<Record<string, string>>(
    {}
  )
  const streamedTitleTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({})
  const isAdmin = useQuery(
    api.adminUsers.hasAdminPermission,
    isAuthenticated ? {} : "skip"
  )
  const shareChatIsShared =
    recentChats.find((c) => c._id === shareChatId)?.isShared ?? false
  const siteName = getSiteName()

  useEffect(() => {
    const streamedTitleTimeouts = streamedTitleTimeoutsRef.current

    const handleTitleAvailable = (event: Event) => {
      const { chatId, title } = (event as CustomEvent).detail ?? {}
      if (typeof chatId !== "string" || typeof title !== "string") return

      setStreamedTitles((current) => ({ ...current, [chatId]: title }))

      clearTimeout(streamedTitleTimeouts[chatId])
      streamedTitleTimeouts[chatId] = setTimeout(() => {
        setStreamedTitles((current) => {
          const next = { ...current }
          delete next[chatId]
          return next
        })
        delete streamedTitleTimeouts[chatId]
      }, 2400)
    }

    window.addEventListener("chat-title-available", handleTitleAvailable)
    return () => {
      window.removeEventListener("chat-title-available", handleTitleAvailable)
      for (const timeout of Object.values(streamedTitleTimeouts)) {
        clearTimeout(timeout)
      }
    }
  }, [])

  const handleExportChat = async (
    chatId: string,
    format: "markdown" | "docx" | "pdf",
    title: string
  ) => {
    try {
      const res = await fetch(`/api/export-chat?chatId=${chatId}`)
      if (!res.ok) throw new Error("Failed to fetch messages")
      const messages = await res.json()
      if (format === "markdown") exportAsMarkdown(messages, title)
      else if (format === "docx") await exportAsDocx(messages, title)
      else if (format === "pdf") await exportAsPdf(messages, title)
    } catch (err) {
      console.error("Export failed:", err)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-3">
        <div className="mb-2 flex items-center gap-2 px-2">
          <Image
            src="/logo.webp"
            alt={siteName}
            width={16}
            height={16}
            className="rounded"
          />
          <span className="truncate text-sm font-semibold">{siteName}</span>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New chat"
              className="flex items-center justify-between"
              onClick={() => {
                window.dispatchEvent(new Event("new-chat"))
                router.push("/chat")
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <HugeiconsIcon icon={Edit02Icon} size={18} />
                <span>New chat</span>
              </div>
              <KbdGroup>
                <Kbd>{isMac ? "⌥" : "Alt"}</Kbd>
                <span>+</span>
                <Kbd>N</Kbd>
              </KbdGroup>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search"
              className="flex items-center justify-between"
              onClick={() => {
                window.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true })
                )
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <HugeiconsIcon icon={Search01Icon} size={18} />
                <span>Search</span>
              </div>
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <span>+</span>
                <Kbd>K</Kbd>
              </KbdGroup>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoadingChats ? (
                <div className="flex flex-col gap-1 px-1">
                  {[75, 90, 60, 85, 70, 80].map((width, i) => (
                    <div
                      key={i}
                      className="h-8 animate-pulse rounded-md bg-muted/50"
                      style={{ width: `${width}%` }}
                    />
                  ))}
                </div>
              ) : recentChats.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  <HugeiconsIcon
                    icon={MessageMultiple02Icon}
                    size={24}
                    className="mx-auto mb-2 opacity-40"
                  />
                  No chats yet
                </div>
              ) : (
                recentChats.map((chat) => {
                  const streamedTitle = streamedTitles[chat._id]
                  const title = streamedTitle ?? chat.title

                  return (
                    <SidebarMenuItem key={chat._id}>
                      <SidebarMenuButton
                        tooltip={title}
                        isActive={activeChatId === chat._id}
                        asChild
                      >
                        <Link href={`/chat/${chat._id}`}>
                          {streamedTitle ? (
                            <TextAnimate
                              key={`${chat._id}-${streamedTitle}`}
                              as="span"
                              animation="blurIn"
                              by="word"
                              className="min-w-0 truncate"
                              duration={0.35}
                              startOnView={false}
                            >
                              {title}
                            </TextAnimate>
                          ) : (
                            <span className="truncate">{title}</span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction
                            showOnHover
                            aria-label="More options"
                          >
                            <HugeiconsIcon
                              icon={MoreVerticalCircle01Icon}
                              size={16}
                            />
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="start">
                          <DropdownMenuItem
                            onSelect={() => setShareChatId(chat._id)}
                          >
                            <HugeiconsIcon icon={Share08Icon} size={16} />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <HugeiconsIcon icon={FileExportIcon} size={16} />
                              Export
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleExportChat(chat._id, "markdown", title)
                                }
                              >
                                <FileTextIcon className="size-4" />
                                Markdown
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleExportChat(chat._id, "docx", title)
                                }
                              >
                                <FileIcon className="size-4" />
                                Word (.docx)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleExportChat(chat._id, "pdf", title)
                                }
                              >
                                <FileDownIcon className="size-4" />
                                PDF
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem
                            variant="destructive"
                            className="text-destructive"
                            onSelect={() => setDeleteChatId(chat._id)}
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={16} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  )
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {isLoading ? null : isAuthenticated ? (
          <>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Integrations" asChild>
                  <Link href="/integrations">
                    <HugeiconsIcon icon={ConnectIcon} size={18} />
                    <span>Integrations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin === true && (
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Admin" asChild>
                    <Link href="/admin">
                      <HugeiconsIcon icon={Settings02Icon} size={18} />
                      <span>Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
            <UserButton align="start" sideOffset={8} className="w-full" />
          </>
        ) : (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth/sign-in">
              Sign in
            </Link>
          </Button>
        )}
      </SidebarFooter>

      <ShareChatDialog
        chatId={shareChatId ?? ""}
        isShared={shareChatIsShared}
        open={shareChatId !== null}
        onOpenChange={(open) => {
          if (!open) setShareChatId(null)
        }}
      />

      <AlertDialog
        open={deleteChatId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteChatId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat and all its messages. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (deleteChatId) {
                  if (activeChatId === deleteChatId) {
                    window.dispatchEvent(new Event("new-chat"))
                    router.replace("/chat")
                  }

                  await removeChat({ chatId: deleteChatId as Id<"chats"> })
                }
                setDeleteChatId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}
