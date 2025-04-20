"use client"

import { Home, Key, PaintBucket, Server } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { authClient } from "@/lib/auth-client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Logo from "./logo"

const navigationItems = [
  {
    section: "System",
    items: [
      { title: "Home", url: "/dashboard", icon: Home },
      { title: "Nodes", url: "/dashboard/nodes", icon: Server },
    ],
  },
  {
    section: "Management",
    items: [
      { title: "Buckets", url: "/dashboard/buckets", icon: PaintBucket },
      { title: "Keys", url: "/dashboard/keys", icon: Key },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const router = useRouter()

  const avatarContent = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?"

  const displayName = user?.name || user?.email || ""
  const email = user?.email || ""
  const avatarImage = user?.image || ""

  return (
    <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarHeader className="flex flex-col items-center space-y-2 px-4 py-6">
      {" "}
      {/* Keep column, center items, add padding & spacing */}
      <Link href="/dashboard" aria-label="Dashboard Home">
        {/*
          This div creates a styled container around the logo.
          Adjust size (h-16 w-16), background (bg-neutral-700/50), padding (p-2),
          and rounding (rounded-lg) as needed.
        */}
        <div className="flex  items-center justify-center rounded-lg p-2">
          {/* Logo is sized smaller than the container */}
          <Logo />
        </div>
      </Link>
      {/* Optional: You could add text below the logo box here */}
      {/* <span className="text-sm text-muted-foreground">App Name</span> */}
    </SidebarHeader>


      <SidebarContent className="px-2 py-2">
        {navigationItems.map((section) => (
          <div key={section.section} className="mb-3 last:mb-0">
            <div className="mb-1 px-2 text-xs font-medium text-muted-foreground">{section.section}</div>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="transition-all duration-200"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-border/40 p-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-accent focus:outline-none"
                aria-label="Open user menu"
              >
                <Avatar className="h-8 w-8 border border-border/50">
                  {avatarImage ? (
                    <AvatarImage src={avatarImage || "/placeholder.svg"} alt={displayName} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">{avatarContent}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-1 flex-col overflow-hidden text-left">
                  <span className="truncate text-sm font-medium leading-tight">{displayName}</span>
                  <span className="truncate text-xs leading-tight text-muted-foreground">{email}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:bg-destructive/10"
                onClick={() => authClient.signOut()}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={() => router.push("/login")}
          >
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">?</AvatarFallback>
            </Avatar>
            <span>Sign In</span>
          </button>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
