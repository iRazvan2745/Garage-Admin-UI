'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);
  return (
    <div className="h-full w-full bg-neutral-900">
      <p>Redirecting...</p>
    </div>
  );
}
