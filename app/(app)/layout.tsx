import { redirect } from "next/navigation"
import { getSession, clearSessionCookie } from "@/lib/session"
import { getUserById } from "@/lib/db"
import { TopNav } from "@/components/top-nav"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) {
    redirect("/register")
  }

  const user = await getUserById(session.userId)
  if (!user || user.status === "banned") {
    await clearSessionCookie()
    redirect("/register")
  }

  return (
    <div className="min-h-screen">
      <TopNav
        user={{ username: user.username, avatarUrl: user.avatar_url, role: user.role }}
        showPanel={user.role === "admin"}
      />
      {children}
    </div>
  )
}
