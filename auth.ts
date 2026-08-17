"use server"

import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { getServiceClient } from "@/lib/supabase/service"
import { getInviteByCode, getUserByUsername } from "@/lib/db"
import { setSessionCookie, clearSessionCookie } from "@/lib/session"
import { validateUsername, validatePassword, validateInviteCode } from "@/lib/validators"

export type AuthFormState = {
  errors: {
    username?: string
    password?: string
    invite?: string
    form?: string
  }
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  const errors: AuthFormState["errors"] = {}
  const usernameError = validateUsername(username)
  const passwordError = !password ? "Введите пароль" : null
  if (usernameError) errors.username = usernameError
  if (passwordError) errors.password = passwordError
  if (usernameError || passwordError) return { errors }

  const user = await getUserByUsername(username)
  if (!user) {
    return { errors: { username: "Пользователь не найден" } }
  }

  if (user.status === "banned") {
    return { errors: { form: "аккаунт заблокирован" } }
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatches) {
    return { errors: { password: "Неверный пароль" } }
  }

  await setSessionCookie({ userId: user.id, username: user.username, role: user.role })
  redirect("/?welcome=1")
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const inviteCode = String(formData.get("invite") ?? "").trim()

  const errors: AuthFormState["errors"] = {}
  const usernameError = validateUsername(username)
  const passwordError = validatePassword(password)
  const inviteError = validateInviteCode(inviteCode)
  if (usernameError) errors.username = usernameError
  if (passwordError) errors.password = passwordError
  if (inviteError) errors.invite = inviteError
  if (usernameError || passwordError || inviteError) return { errors }

  const existing = await getUserByUsername(username)
  if (existing) {
    return { errors: { username: "Это имя уже занято" } }
  }

  const invite = await getInviteByCode(inviteCode)
  if (!invite) {
    return { errors: { invite: "Invite code недействителен" } }
  }
  if (invite.used_by) {
    return { errors: { invite: "Invite code уже использован" } }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const supabase = getServiceClient()

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({ username, password_hash: passwordHash, role: "user", status: "active" })
    .select("*")
    .single()

  if (insertError || !newUser) {
    return { errors: { form: "Не удалось создать аккаунт, попробуйте снова" } }
  }

  const { data: claimedInvite, error: inviteError2 } = await supabase
    .from("invites")
    .update({ used_by: newUser.id, used_at: new Date().toISOString() })
    .eq("id", invite.id)
    .is("used_by", null)
    .select("id")

  if (inviteError2 || !claimedInvite || claimedInvite.length === 0) {
    // Lost the race to another registration using the same code, or an
    // unexpected failure — undo the created account.
    await supabase.from("users").delete().eq("id", newUser.id)
    return { errors: { invite: "Invite code уже использован" } }
  }

  await setSessionCookie({ userId: newUser.id, username: newUser.username, role: newUser.role })
  redirect("/?welcome=1")
}

export async function logoutAction() {
  await clearSessionCookie()
  redirect("/register")
}
