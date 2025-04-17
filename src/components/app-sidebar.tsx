'use client'

import { Home, Key, PaintBucket, Server } from "lucide-react";
import Link from "next/link"; 

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function AppSidebar() {

  const pathname = usePathname();

  return (
    <div className="hidden md:block fixed left-0 top-0 z-40 border-r bg-neutral-950/70 min-h-screen w-64">
      <div className="flex flex-col h-screen">
        {/* Sidebar Header */}
        <div className="flex h-14 mt-6 items-center px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold" // Ensure text uses foreground color
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
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {/* Add AvatarImage if you have a user image URL */}
              {/* <AvatarImage src="/path/to/user-avatar.png" alt="User Name" /> */}
              <AvatarFallback>GA</AvatarFallback> {/* Initials */}
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none text-foreground">
                Garage Admin
              </span>
              <span className="text-xs text-muted-foreground">
                admin@example.com
              </span>
            </div>
          </div>
          {/* You could add Settings/Logout links here */}
        </div>
      </div>
    </div>
  );
}
