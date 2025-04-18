import { makeRequest } from "@/lib/makeRequest";
import { NextRequest } from "next/server";
import type { NodeList } from "@/lib/types";



export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: "Node ID is required" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const statusResponse = await makeRequest('status') as NodeList;
  const node = statusResponse.nodes.find((node: { id: string }) => node.id === id);
  
  if (!node) {
    return new Response(JSON.stringify({ error: "Node not found" }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const nodeResponse = {
    ...node,
    dataUsed: node.dataPartition.total - node.dataPartition.available,
    metadataUsed: node.metadataPartition.total - node.metadataPartition.available
  }
  return new Response(JSON.stringify(nodeResponse), {
    headers: { 'Content-Type': 'application/json' }
  });
}