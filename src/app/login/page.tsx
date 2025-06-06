"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient, signIn } from "@/lib/auth-client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthPage() {
  const { data, error: sessionError } = authClient.useSession()
  const user = data?.user
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [, setCheckingUsers] = useState(true);
  const router = useRouter()
  
  useEffect(() => {
    async function checkUsers() {
      try {
        const res = await fetch("/api/users/hasUsers");
        if (!res.ok) throw new Error("Failed to check users");
        const json = await res.json();
        if (!json.hasUsers) {
          router.replace("/register");
        } else {
          setCheckingUsers(false);
        }
      } catch {
        // fallback: allow login if check fails
        setCheckingUsers(false);
      }
    }
    checkUsers();
  }, [router]);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard")
    }
  }, [user, router])

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)
    try {
      await signIn.email({ email, password })
    } catch (err) {
      setFormError(getErrorMessage(err) || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  function getErrorMessage(err: unknown): string | undefined {
    if (typeof err === "string") return err;
    if (err && typeof err === "object" && 'message' in err && typeof (err as { message?: unknown }).message === "string") {
      return (err as { message: string }).message;
    }
    return undefined;
  }

  const errorMessage = formError || getErrorMessage(sessionError);

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      disabled={loading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}