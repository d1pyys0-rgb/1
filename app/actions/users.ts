"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import { getServiceClient } from "@/lib/supabase/service"

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    throw new Error("Forbidden")
  }
  return session
}

export async function setUserRoleAction(userId: string, role: "user" | "admin") {
  const session = await requireAdmin()
  if (session.userId === userId) {
    return { error: "Нельзя изменить свою роль" }
  }

  const supabase = getServiceClient()
  const { error } = await supabase.from("users").update({ role }).eq("id", userId)
  if (error) return { error: "Не удалось изменить роль" }

  revalidatePath("/panel")
  return { success: true }
}

export async function setUserStatusAction(userId: string, status: "active" | "banned") {
  const session = await requireAdmin()
  if (session.userId === userId) {
    return { error: "Нельзя изменить свой статус" }
  }

  const supabase = getServiceClient()
  const { error } = await supabase.from("users").update({ status }).eq("id", userId)
  if (error) return { error: "Не удалось изменить статус" }

  revalidatePath("/panel")
  return { success: true }
}
