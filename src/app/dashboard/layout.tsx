import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <main className="flex-1 transition-[margin] duration-300 md:ml-64 mt-16 md:mt-0">
                  {children}
                </main>
              </ThemeProvider>
      </div>
    </SidebarProvider>
  );
}