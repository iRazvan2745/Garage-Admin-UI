"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const user = data?.user;
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !user) {
      router.push("/login");
    }
  }, [user, isPending, router]);

  if (isPending) return <div>Loading...</div>;
  if (!user) return null;

  return <>{children}</>;
}
  