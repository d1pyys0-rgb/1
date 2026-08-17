"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UploadIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { changeAvatarAction } from "@/app/actions/account"

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

async function cropToCircleBlob(file: File): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = objectUrl
    })

    const size = 512
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas unavailable")

    const minSide = Math.min(img.width, img.height)
    const sx = (img.width - minSide) / 2
    const sy = (img.height - minSide) / 2

    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/png")
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function ChangeAvatarDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function resetState() {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Разрешены только jpg, png, webp")
      return
    }
    if (file.size > MAX_BYTES) {
      setError("Файл больше 5 МБ")
      return
    }
    setError(null)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!selectedFile) return
    setPending(true)
    setError(null)
    try {
      const blob = await cropToCircleBlob(selectedFile)
      const formData = new FormData()
      formData.append("avatar", blob, "avatar.png")
      const result = await changeAvatarAction({}, formData)
      if (result.error) {
        setError(result.error)
      } else {
        toast.success("Аватар обновлён")
        onOpenChange(false)
        resetState()
        router.refresh()
      }
    } catch {
      setError("Не удалось обработать изображение")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetState()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сменить аватар</DialogTitle>
          <DialogDescription>jpg, png или webp, до 5 МБ. Изображение будет обрезано в круг.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <Avatar size="lg" className="size-24">
            {previewUrl ? <AvatarImage src={previewUrl} alt="Preview" /> : null}
            <AvatarFallback className="text-lg">?</AvatarFallback>
          </Avatar>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={pending}>
            <UploadIcon data-icon="inline-start" />
            Выбрать файл
          </Button>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>

        <DialogFooter className="-mx-0 -mb-0 border-t-0 bg-transparent p-0 sm:justify-end">
          <Button type="button" onClick={handleSave} disabled={pending || !selectedFile}>
            {pending && <Spinner data-icon="inline-start" />}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
