"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import { getServiceClient } from "@/lib/supabase/service"
import { generateInviteCode } from "@/lib/invite-code"

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    throw new Error("Forbidden")
  }
  return session
}

export type CreateInvitesState = {
  error?: string
  success?: boolean
}

export async function createInvitesAction(
  _prevState: CreateInvitesState,
  formData: FormData
): Promise<CreateInvitesState> {
  const session = await requireAdmin()

  const countRaw = Number(formData.get("count"))
  const count = Math.floor(countRaw)
  if (!Number.isFinite(count) || count < 1 || count > 50) {
    return { error: "Количество должно быть от 1 до 50" }
  }

  const supabase = getServiceClient()
  const rows = Array.from({ length: count }, () => ({
    code: generateInviteCode(),
    created_by: session.userId,
  }))

  const { error } = await supabase.from("invites").insert(rows)
  if (error) {
    return { error: "Не удалось создать инвайты" }
  }

  revalidatePath("/panel")
  return { success: true }
}
