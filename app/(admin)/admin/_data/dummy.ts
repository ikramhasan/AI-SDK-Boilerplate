export type User = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  status: "active" | "banned" | "deleted"
  createdAt: string
}

export type Chat = {
  id: string
  title: string
  userName: string
  userEmail: string
  messageCount: number
  createdAt: string
}

export const DUMMY_USERS: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "admin", status: "active", createdAt: "2025-12-01T10:00:00Z" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "user", status: "active", createdAt: "2025-12-05T14:30:00Z" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", role: "user", status: "banned", createdAt: "2026-01-10T09:15:00Z" },
  { id: "4", name: "Diana Prince", email: "diana@example.com", role: "user", status: "active", createdAt: "2026-01-15T16:45:00Z" },
  { id: "5", name: "Eve Williams", email: "eve@example.com", role: "admin", status: "active", createdAt: "2026-02-01T11:00:00Z" },
  { id: "6", name: "Frank Castle", email: "frank@example.com", role: "user", status: "deleted", createdAt: "2026-02-10T08:20:00Z" },
  { id: "7", name: "Grace Hopper", email: "grace@example.com", role: "user", status: "active", createdAt: "2026-02-20T13:00:00Z" },
  { id: "8", name: "Hank Pym", email: "hank@example.com", role: "user", status: "banned", createdAt: "2026-03-01T07:30:00Z" },
  { id: "9", name: "Ivy Chen", email: "ivy@example.com", role: "user", status: "active", createdAt: "2026-03-10T15:00:00Z" },
  { id: "10", name: "Jack Ryan", email: "jack@example.com", role: "user", status: "active", createdAt: "2026-03-20T12:00:00Z" },
]

export const DUMMY_CHATS: Chat[] = [
  { id: "1", title: "Help with React hooks", userName: "Alice Johnson", userEmail: "alice@example.com", messageCount: 12, createdAt: "2026-03-28T10:00:00Z" },
  { id: "2", title: "Explain quantum computing", userName: "Bob Smith", userEmail: "bob@example.com", messageCount: 8, createdAt: "2026-03-29T14:30:00Z" },
  { id: "3", title: "Write a poem about spring", userName: "Diana Prince", userEmail: "diana@example.com", messageCount: 4, createdAt: "2026-03-30T09:15:00Z" },
  { id: "4", title: "Debug my Python script", userName: "Alice Johnson", userEmail: "alice@example.com", messageCount: 22, createdAt: "2026-03-30T16:45:00Z" },
  { id: "5", title: "Summarize this article", userName: "Grace Hopper", userEmail: "grace@example.com", messageCount: 6, createdAt: "2026-03-31T11:00:00Z" },
  { id: "6", title: "Plan a trip to Japan", userName: "Ivy Chen", userEmail: "ivy@example.com", messageCount: 15, createdAt: "2026-03-31T08:20:00Z" },
  { id: "7", title: "Code review assistance", userName: "Jack Ryan", userEmail: "jack@example.com", messageCount: 10, createdAt: "2026-04-01T13:00:00Z" },
  { id: "8", title: "Translate to Spanish", userName: "Bob Smith", userEmail: "bob@example.com", messageCount: 3, createdAt: "2026-04-01T07:30:00Z" },
  { id: "9", title: "Design system advice", userName: "Eve Williams", userEmail: "eve@example.com", messageCount: 18, createdAt: "2026-04-02T09:00:00Z" },
  { id: "10", title: "Math homework help", userName: "Diana Prince", userEmail: "diana@example.com", messageCount: 7, createdAt: "2026-04-02T11:30:00Z" },
]
