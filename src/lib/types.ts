export interface Bucket {
  id: string;
  globalAliases: string[];
  localAliases: string[];
  description?: string;
}

export interface BucketInfo {
  id: string;
  globalAliases: string[];
  websiteAccess: boolean;
  websiteConfig: null | any;
  keys: string[];
  objects: number;
  bytes: number;
  unfinishedUploads: number;
  unfinishedMultipartUploads: number;
  unfinishedMultipartUploadParts: number;
  unfinishedMultipartUploadBytes: number;
  quotas: {
    maxSize: number | null;
    maxObjects: number | null;
  };
  localAliases: string[];
  description?: string;
}

export interface KeyList {
  id: string;
  name: string;
}

export interface NodeRole {
  id: string;
  zone: string;
  capacity: number;
  tags: string[];
}

export interface Node {
  id: string;
  role: NodeRole[];
  addr: string;
  hostname: string
  isUp: boolean
  lastSeenSecondsAgo: number
  dataPartition: string[]
  metadataPartition: string[]
}

export interface NodeList {
  nodes: Node[]
}
