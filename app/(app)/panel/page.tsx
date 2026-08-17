import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getAllInvites, getAllUsers, getLatestDownloadFile } from "@/lib/db"
import { InvitesPanel } from "@/components/panel/invites-panel"
import { FilePanel } from "@/components/panel/file-panel"
import { UsersPanel } from "@/components/panel/users-panel"

export default async function PanelPage() {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    redirect("/")
  }

  const [invites, users, file] = await Promise.all([
    getAllInvites(),
    getAllUsers(),
    getLatestDownloadFile(),
  ])

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel</h1>
        <p className="text-sm text-muted-foreground">Управление инвайтами, файлом и пользователями.</p>
      </div>

      <InvitesPanel invites={invites} />
      <FilePanel file={file} />
      <UsersPanel users={users} currentUserId={session.userId} />
    </main>
  )
}
