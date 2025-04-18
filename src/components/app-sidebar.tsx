'use client'

import { Home, Key, PaintBucket, Server } from "lucide-react";
import Link from "next/link"; 

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils"; 
import Logo from "./Logo"; 
import { usePathname } from "next/navigation";

const systemItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Nodes", url: "/dashboard/nodes", icon: Server },
];

const managementItems = [
  { title: "Buckets", url: "/dashboard/buckets", icon: PaintBucket },
  { title: "Keys", url: "/dashboard/keys", icon: Key },
];

function SidebarNavItem({
  item,
  pathname, 
}: {
  item: (typeof systemItems)[0];
  pathname: string;
}) {
  const isActive = pathname === item.url; 

  return (
    <Link
      href={item.url}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-primary",
        isActive && "bg-muted text-primary font-medium",
      )}
    >
      <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
      {item.title}
    </Link>
  );
}

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  let avatarContent = "";
  let displayName = "";
  let email = "";
  let avatarImage = "";

  if (user) {
    displayName = user.name || user.email;
    email = user.email;
    avatarContent = user.name
      ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
      : user.email[0].toUpperCase();
    if (user.image) {
      avatarImage = user.image;
    }
  }

  return (
    <div className="hidden md:block fixed left-0 top-0 z-40 border-r bg-neutral-950/70 min-h-screen w-64">
      <div className="flex flex-col h-screen">
        {/* Sidebar Header */}
        <div className="flex h-14 mt-6 items-center px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Logo />
          </Link>
        </div>

        {/* Sidebar Content - Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
            {systemItems.map((item) => (
              <SidebarNavItem
                key={item.title}
                item={item}
                pathname={pathname}
              />
            ))}
            {managementItems.map((item) => (
              <SidebarNavItem
                key={item.title}
                item={item}
                pathname={pathname}
              />
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t p-4 mt-0">
          {user ? (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {avatarImage ? (
                        <AvatarImage src={avatarImage} alt={displayName} />
                      ) : (
                        <AvatarFallback>{avatarContent}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{displayName}</span>
                      <span className="text-xs text-muted-foreground truncate">{email}</span>
                    </div>
                  </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{displayName}</span>
                      <span className="text-xs text-muted-foreground truncate">{email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 cursor-pointer"
                    onClick={() => authClient.signOut()}
                  >
                    Logout
                  </DropdownMenuItem>
                  {/* Add more menu items here if needed */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <button
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              onClick={() => router.push("/login")}
            >
              Sign In
            </button>
          )}
          {/* You could add Settings/Logout links here */}
        </div>
      </div>
    </div>
  );
}
