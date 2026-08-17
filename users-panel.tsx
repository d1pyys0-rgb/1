"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SearchIcon, UserIcon } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { setUserRoleAction, setUserStatusAction } from "@/app/actions/users"
import type { UserRow } from "@/lib/db"

export function UsersPanel({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(
    () => users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase())),
    [users, search]
  )

  function toggleAdmin(user: UserRow) {
    const nextRole = user.role === "admin" ? "user" : "admin"
    startTransition(async () => {
      const result = await setUserRoleAction(user.id, nextRole)
      if (result?.error) toast.error(result.error)
      else {
        toast.success(nextRole === "admin" ? "Права admin выданы" : "Права admin сняты")
        router.refresh()
      }
    })
  }

  function toggleBan(user: UserRow) {
    const nextStatus = user.status === "banned" ? "active" : "banned"
    startTransition(async () => {
      const result = await setUserStatusAction(user.id, nextStatus)
      if (result?.error) toast.error(result.error)
      else {
        toast.success(nextStatus === "banned" ? "Пользователь забанен" : "Пользователь разбанен")
        router.refresh()
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Пользователи</CardTitle>
        <CardDescription>Управляйте ролями и доступом участников.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Поиск по username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Регистрация</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Никого не найдено
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((user) => {
                const isSelf = user.id === currentUserId
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {user.avatar_url ? <AvatarImage src={user.avatar_url} alt={user.username} /> : null}
                          <AvatarFallback>
                            <UserIcon className="size-3.5 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("ru-RU")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "banned" ? "destructive" : "secondary"}>
                        {user.status === "banned" ? "забанен" : "активен"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <button
                                type="button"
                                disabled={isSelf || pending}
                                className="flex items-center gap-1.5 disabled:pointer-events-none disabled:opacity-50"
                              />
                            }
                          >
                            <Switch checked={user.role === "admin"} disabled={isSelf || pending} />
                            <span className="text-xs text-muted-foreground">admin</span>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {user.role === "admin" ? "Снять права admin?" : "Выдать права admin?"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Пользователь {user.username}{" "}
                                {user.role === "admin"
                                  ? "потеряет доступ к разделу Panel."
                                  : "получит полный доступ к разделу Panel."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => toggleAdmin(user)}>Подтвердить</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button variant="outline" size="sm" disabled={isSelf || pending} />
                            }
                          >
                            {user.status === "banned" ? "Разбанить" : "Забанить"}
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {user.status === "banned"
                                  ? "Разбанить пользователя?"
                                  : "Забанить пользователя?"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.status === "banned"
                                  ? `${user.username} снова сможет входить в аккаунт.`
                                  : `${user.username} не сможет войти в аккаунт.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction variant="destructive" onClick={() => toggleBan(user)}>
                                Подтвердить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
