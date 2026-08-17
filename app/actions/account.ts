"use server"

import bcrypt from "bcryptjs"
import { getSession, clearSessionCookie } from "@/lib/session"
import { getServiceClient } from "@/lib/supabase/service"
import { getUserById } from "@/lib/db"
import { validatePassword } from "@/lib/validators"

export type ChangePasswordState = {
  error?: string
  success?: boolean
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await getSession()
  if (!session) return { error: "Сессия истекла, войдите снова" }

  const currentPassword = String(formData.get("currentPassword") ?? "")
  const newPassword = String(formData.get("newPassword") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  if (!currentPassword) return { error: "Введите текущий пароль" }
  const passwordError = validatePassword(newPassword)
  if (passwordError) return { error: passwordError }
  if (newPassword !== confirmPassword) return { error: "Пароли не совпадают" }

  const user = await getUserById(session.userId)
  if (!user) return { error: "Пользователь не найден" }

  const matches = await bcrypt.compare(currentPassword, user.password_hash)
  if (!matches) return { error: "Текущий пароль неверен" }

  const newHash = await bcrypt.hash(newPassword, 10)
  const supabase = getServiceClient()
  const { error } = await supabase
    .from("users")
    .update({ password_hash: newHash })
    .eq("id", user.id)

  if (error) return { error: "Не удалось изменить пароль" }
  return { success: true }
}

export type ChangeAvatarState = {
  error?: string
  success?: boolean
  avatarUrl?: string
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function changeAvatarAction(
  _prevState: ChangeAvatarState,
  formData: FormData
): Promise<ChangeAvatarState> {
  const session = await getSession()
  if (!session) return { error: "Сессия истекла, войдите снова" }

  const file = formData.get("avatar")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Выберите файл" }
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { error: "Разрешены только jpg, png, webp" }
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "Файл больше 5 МБ" }
  }

  const supabase = getServiceClient()
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
  const path = `${session.userId}/avatar.${extension}`
  const buffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return { error: "Не удалось загрузить файл" }
  }

  const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path)
  const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", session.userId)

  if (updateError) {
    return { error: "Не удалось сохранить аватар" }
  }

  return { success: true, avatarUrl }
}

export async function logoutAndClear() {
  await clearSessionCookie()
}
