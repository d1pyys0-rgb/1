import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getUserById } from "@/lib/db"
import { RegisterForm } from "@/components/register-form"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>
}) {
  const session = await getSession()
  if (session) {
    const user = await getUserById(session.userId)
    if (user && user.status === "active") {
      redirect("/")
    }
  }

  const { invite } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <RegisterForm initialInvite={invite ?? ""} />
    </main>
  )
}
