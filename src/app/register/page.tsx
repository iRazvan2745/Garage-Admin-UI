"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [checkingUsers, setCheckingUsers] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkUsers() {
      try {
        const res = await fetch("/api/users/hasUsers");
        if (!res.ok) throw new Error("Failed to check users");
        const json = await res.json();
        if (json.hasUsers) {
          router.replace("/login");
        } else {
          setCheckingUsers(false);
        }
      } catch {
        // fallback: block register if check fails
        router.replace("/login");
      }
    }
    checkUsers();
  }, [router]);

  // Handles registration; shows a friendly error if registration is blocked
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      await signUp.email({ email, password, name });
      router.replace("/login");
    } catch (err: unknown) {
      // If the server blocks registration, show a clear message
      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' && err.message.includes('403')) {
        setFormError("Registration is disabled: an account already exists. ");
      } else if (err && typeof err === 'object' && 'error' in err && typeof err.error === 'string' && err.error.includes('Registration is disabled')) {
        setFormError("Registration is disabled: an account already exists. ");
      } else {
        setFormError(getErrorMessage(err) || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  function getErrorMessage(err: unknown): string | undefined {
    if (typeof err === "string") return err;
    if (err && typeof err === "object" && 'message' in err && typeof (err as { message?: unknown }).message === "string") {
      return (err as { message: string }).message;
    }
    return undefined;
  }

  // Show spinner while checking if registration is allowed
  if (checkingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Admin Account</CardTitle>
            <CardDescription>
              This will create the first user (admin) for your Garage instance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <div className="flex flex-col gap-6">
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
