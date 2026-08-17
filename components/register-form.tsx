"use client"

import { useActionState, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { loginAction, registerAction, type AuthFormState } from "@/app/actions/auth"

const initialAuthState: AuthFormState = { errors: {} }

export function RegisterForm({ initialInvite }: { initialInvite: string }) {
  const [tab, setTab] = useState(initialInvite ? "register" : "login")

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-1 text-center">
        <span className="text-3xl font-bold tracking-tight">
          <span className="text-foreground">bunny</span>
          <span className="text-primary">love</span>
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">
              Вход
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              Регистрация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <LoginTab />
          </TabsContent>
          <TabsContent value="register" className="mt-6">
            <RegisterTab initialInvite={initialInvite} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function LoginTab() {
  const [state, action, pending] = useActionState(loginAction, initialAuthState)

  return (
    <form action={action}>
      <FieldGroup>
        <Field data-invalid={!!state.errors.username}>
          <FieldLabel htmlFor="login-username">Username</FieldLabel>
          <Input
            id="login-username"
            name="username"
            autoComplete="username"
            aria-invalid={!!state.errors.username}
            disabled={pending}
          />
          <FieldError>{state.errors.username}</FieldError>
        </Field>

        <Field data-invalid={!!state.errors.password}>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!state.errors.password}
            disabled={pending}
          />
          <FieldError>{state.errors.password}</FieldError>
        </Field>

        {state.errors.form && (
          <p className="text-sm font-medium text-destructive">{state.errors.form}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Spinner data-icon="inline-start" />}
          Войти
        </Button>
      </FieldGroup>
    </form>
  )
}

function RegisterTab({ initialInvite }: { initialInvite: string }) {
  const [state, action, pending] = useActionState(registerAction, initialAuthState)

  return (
    <form action={action}>
      <FieldGroup>
        <Field data-invalid={!!state.errors.username}>
          <FieldLabel htmlFor="register-username">Username</FieldLabel>
          <Input
            id="register-username"
            name="username"
            autoComplete="username"
            aria-invalid={!!state.errors.username}
            disabled={pending}
          />
          <FieldError>{state.errors.username}</FieldError>
        </Field>

        <Field data-invalid={!!state.errors.password}>
          <FieldLabel htmlFor="register-password">Password</FieldLabel>
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!state.errors.password}
            disabled={pending}
          />
          <FieldError>{state.errors.password}</FieldError>
        </Field>

        <Field data-invalid={!!state.errors.invite}>
          <FieldLabel htmlFor="register-invite">Invite code</FieldLabel>
          <Input
            id="register-invite"
            name="invite"
            defaultValue={initialInvite}
            className="font-mono text-sm"
            aria-invalid={!!state.errors.invite}
            disabled={pending}
          />
          <FieldError>{state.errors.invite}</FieldError>
        </Field>

        {state.errors.form && (
          <p className="text-sm font-medium text-destructive">{state.errors.form}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Spinner data-icon="inline-start" />}
          Создать аккаунт
        </Button>
      </FieldGroup>
    </form>
  )
}
