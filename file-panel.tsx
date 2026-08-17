"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UploadIcon, FileIcon, Trash2Icon, RefreshCwIcon } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { uploadDownloadFileAction, deleteDownloadFileAction } from "@/app/actions/files"
import type { DownloadFileRow } from "@/lib/db"

const MAX_BYTES = 100 * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export function FilePanel({ file }: { file: DownloadFileRow | null }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleFiles(files: FileList | null) {
    const selected = files?.[0]
    if (!selected) return
    if (selected.size > MAX_BYTES) {
      toast.error("Файл больше 100 МБ")
      return
    }
    const formData = new FormData()
    formData.append("file", selected)
    startTransition(async () => {
      const result = await uploadDownloadFileAction({}, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Файл загружен")
        router.refresh()
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteDownloadFileAction()
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Файл удалён")
        router.refresh()
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Файл для скачивания</CardTitle>
        <CardDescription>Этот файл получают все пользователи по кнопке Download на Home.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {file ? (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                <FileIcon className="size-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(file.size)} · {new Date(file.uploaded_at).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={pending}>
                <RefreshCwIcon data-icon="inline-start" />
                Заменить
              </Button>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" size="sm" disabled={pending} />}>
                  <Trash2Icon data-icon="inline-start" />
                  Удалить
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить файл?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Пользователи больше не смогут скачать файл на Home, пока вы не загрузите новый.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={handleDelete}>
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleFiles(e.dataTransfer.files)
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-10 text-center transition-colors",
              isDragging ? "border-primary bg-primary/5" : "hover:bg-muted/30"
            )}
          >
            <UploadIcon className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Перетащите файл или нажмите, чтобы выбрать</p>
            <p className="text-xs text-muted-foreground">Любой тип файла, до 100 МБ</p>
          </div>
        )}

        {pending && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Загрузка...
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </CardContent>
    </Card>
  )
}
