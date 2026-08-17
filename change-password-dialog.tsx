"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { changePasswordAction, type ChangePasswordState } from "@/app/actions/account"

const initialState: ChangePasswordState = {}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [state, action, pending] = useActionState(changePasswordAction, initialState)

  useEffect(() => {
    if (state.success) {
      toast.success("Пароль изменён")
      onOpenChange(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сменить пароль</DialogTitle>
          <DialogDescription>Введите текущий и новый пароль.</DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="currentPassword">Текущий пароль</FieldLabel>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="newPassword">Новый пароль</FieldLabel>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Подтвердите пароль</FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={pending}
              />
            </Field>
          </FieldGroup>

          {state.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}

          <DialogFooter className="-mx-0 -mb-0 border-t-0 bg-transparent p-0 sm:justify-end">
            <Button type="submit" disabled={pending}>
              {pending && <Spinner data-icon="inline-start" />}
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
