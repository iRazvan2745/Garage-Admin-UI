import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`bg-background text-foreground`}>
        <SidebarProvider>
          <div className="flex h-screen">
            <AppSidebar />
            <main className="">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
