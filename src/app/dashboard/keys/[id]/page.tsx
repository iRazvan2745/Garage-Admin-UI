import { KeyViewerContent } from "@/components/key-content";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default async function KeyViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <QueryClientProvider client={queryClient}>
      <KeyViewerContent id={id} />
    </QueryClientProvider>
  );
}