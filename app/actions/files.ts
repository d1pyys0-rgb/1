"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import { getServiceClient } from "@/lib/supabase/service"
import { getLatestDownloadFile } from "@/lib/db"

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    throw new Error("Forbidden")
  }
  return session
}

const MAX_FILE_BYTES = 100 * 1024 * 1024

export type UploadFileState = {
  error?: string
  success?: boolean
}

export async function uploadDownloadFileAction(
  _prevState: UploadFileState,
  formData: FormData
): Promise<UploadFileState> {
  const session = await requireAdmin()

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Выберите файл" }
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "Файл больше 100 МБ" }
  }

  const supabase = getServiceClient()
  const existing = await getLatestDownloadFile()

  const path = `${Date.now()}-${file.name}`
  const buffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from("downloads")
    .upload(path, buffer, { contentType: file.type || "application/octet-stream" })

  if (uploadError) {
    return { error: "Не удалось загрузить файл" }
  }

  const { data: publicUrlData } = supabase.storage.from("downloads").getPublicUrl(path)

  const { error: insertError } = await supabase.from("download_file").insert({
    url: publicUrlData.publicUrl,
    path,
    name: file.name,
    size: file.size,
    uploaded_by: session.userId,
  })

  if (insertError) {
    await supabase.storage.from("downloads").remove([path])
    return { error: "Не удалось сохранить запись о файле" }
  }

  if (existing) {
    await supabase.storage.from("downloads").remove([existing.path])
    await supabase.from("download_file").delete().eq("id", existing.id)
  }

  revalidatePath("/panel")
  revalidatePath("/")
  return { success: true }
}

export async function deleteDownloadFileAction() {
  await requireAdmin()

  const supabase = getServiceClient()
  const existing = await getLatestDownloadFile()
  if (!existing) return { error: "Файл не найден" }

  await supabase.storage.from("downloads").remove([existing.path])
  await supabase.from("download_file").delete().eq("id", existing.id)

  revalidatePath("/panel")
  revalidatePath("/")
  return { success: true }
}
