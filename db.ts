import { getServiceClient } from "@/lib/supabase/service"

export type UserRow = {
  id: string
  username: string
  password_hash: string
  role: "user" | "admin"
  status: "active" | "banned"
  avatar_url: string | null
  created_at: string
}

export type InviteRow = {
  id: string
  code: string
  created_by: string | null
  used_by: string | null
  used_at: string | null
  created_at: string
}

export type DownloadFileRow = {
  id: string
  url: string
  path: string
  name: string
  size: number
  uploaded_by: string | null
  uploaded_at: string
}

export async function getUserByUsername(username: string) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("username", username)
    .maybeSingle()
  if (error) throw error
  return data as UserRow | null
}

export async function getUserById(id: string) {
  const supabase = getServiceClient()
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data as UserRow | null
}

export async function getInviteByCode(code: string) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("code", code)
    .maybeSingle()
  if (error) throw error
  return data as InviteRow | null
}

export async function getLatestDownloadFile() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("download_file")
    .select("*")
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as DownloadFileRow | null
}

export type InviteWithUsername = InviteRow & {
  used_by_username: string | null
  created_by_username: string | null
}

export async function getAllInvites(): Promise<InviteWithUsername[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("invites")
    .select("*, used_by_user:used_by(username), created_by_user:created_by(username)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    ...row,
    used_by_username: row.used_by_user?.username ?? null,
    created_by_username: row.created_by_user?.username ?? null,
  }))
}

export async function getAllUsers(): Promise<UserRow[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as UserRow[]
}
