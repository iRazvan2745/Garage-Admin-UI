import { makeRequest } from "@/lib/makeRequest"

type NodeStatus = {
  id: string
  hostname: string
  addr: string
  isUp: boolean
  dataPartition: { total: number; available: number }
  metadataPartition: { total: number; available: number }
  lastSeenSecsAgo: number | null
  role: { zone: string; tags: string[] }
  partitionCount: number
}

/*
async function getUsableStorage(nodes: NodeStatus[]) {
  const totalStorage = nodes.reduce((acc, node) => acc + node.dataPartition.total, 0);
  const availableStorage = nodes.reduce((acc, node) => acc + node.dataPartition.available, 0);
  // Calculate per-partition free space per node
  const perPartitionFree = nodes
    .filter(node => node.partitionCount > 0)
    .map(node => node.dataPartition.available / node.partitionCount);
  const minPerPartitionFree = perPartitionFree.length > 0 ? Math.min(...perPartitionFree) : 0;
  const usableStorage = minPerPartitionFree * 256;
  return { totalStorage, availableStorage, usableStorage };
}
*/

export async function GET() {
  const response = await makeRequest('status');
  //const usableStorage = await getUsableStorage(response.nodes || []);
  return new Response(JSON.stringify({
    ...response,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}