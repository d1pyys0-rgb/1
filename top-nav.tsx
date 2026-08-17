"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MenuIcon, UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChangeAvatarDialog } from "@/components/change-avatar-dialog"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { logoutAction } from "@/app/actions/auth"

const FORUM_URL = "https://t.me/+tKCcuR81P4AzYzBi"

export type TopNavUser = {
  username: string
  avatarUrl: string | null
  role: "user" | "admin"
}

export function TopNav({ user, showPanel = false }: { user: TopNavUser; showPanel?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === "/"
  const isPanel = pathname?.startsWith("/panel")

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [isLoggingOut, startLogout] = useTransition()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-base font-bold tracking-tight text-foreground">
          bunnylove
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors",
                isHome ? "text-primary" : "text-foreground hover:text-primary"
              )}
            >
              Home
            </Link>
            <a
              href={FORUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Forum
            </a>
            {showPanel && (
              <Link
                href="/panel"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isPanel ? "text-primary" : "text-foreground hover:text-primary"
                )}
              >
                Panel
              </Link>
            )}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-md p-1.5 text-foreground outline-none hover:bg-muted sm:hidden"
              aria-label="Menu"
            >
              <MenuIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/")}>Home</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(FORUM_URL, "_blank", "noopener,noreferrer")}>
                  Forum
                </DropdownMenuItem>
                {showPanel && (
                  <DropdownMenuItem onClick={() => router.push("/panel")}>Panel</DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Account menu"
            >
              <Avatar>
                {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.username} /> : null}
                <AvatarFallback>
                  <UserIcon className="size-4 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setAvatarDialogOpen(true)}>Сменить аватар</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>Сменить пароль</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isLoggingOut}
                  onClick={() => startLogout(() => logoutAction())}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ChangeAvatarDialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen} />
      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </header>
  )
}
