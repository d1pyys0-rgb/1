"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { CopyIcon, PlusIcon } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { createInvitesAction, type CreateInvitesState } from "@/app/actions/invites"
import type { InviteWithUsername } from "@/lib/db"

const initialState: CreateInvitesState = {}

export function InvitesPanel({ invites }: { invites: InviteWithUsername[] }) {
  const [state, action, pending] = useActionState(createInvitesAction, initialState)

  useEffect(() => {
    if (state.success) toast.success("Инвайты созданы")
  }, [state.success])

  function copyLink(code: string) {
    const link = `${window.location.origin}/register?invite=${code}`
    navigator.clipboard.writeText(link)
    toast.success("Ссылка скопирована")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Инвайты</CardTitle>
        <CardDescription>Создавайте одноразовые коды для регистрации.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <form action={action} className="flex items-end gap-3">
          <FieldGroup className="flex-1 max-w-40">
            <Field>
              <FieldLabel htmlFor="count">Количество</FieldLabel>
              <Input id="count" name="count" type="number" min={1} max={50} defaultValue={5} disabled={pending} />
            </Field>
          </FieldGroup>
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : <PlusIcon data-icon="inline-start" />}
            Создать
          </Button>
        </form>

        {state.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Ссылка</TableHead>
                <TableHead className="text-right">Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Пока нет инвайтов
                  </TableCell>
                </TableRow>
              )}
              {invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="font-mono text-xs">{invite.code}</TableCell>
                  <TableCell>
                    {invite.used_by ? (
                      <Badge variant="secondary">
                        {invite.used_by_username} ·{" "}
                        {invite.used_at ? new Date(invite.used_at).toLocaleDateString("ru-RU") : ""}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">не использован</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-56 truncate font-mono text-xs text-muted-foreground">
                    /register?invite={invite.code}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon-sm" onClick={() => copyLink(invite.code)}>
                      <CopyIcon />
                      <span className="sr-only">Скопировать ссылку</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
