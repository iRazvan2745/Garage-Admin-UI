'use client'

import { KeyViewerContent } from "@/components/key-content";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { use } from "react";

const queryClient = new QueryClient();

export default function KeyViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <QueryClientProvider client={queryClient}>
      <KeyViewerContent id={id} />
    </QueryClientProvider>
  )
}