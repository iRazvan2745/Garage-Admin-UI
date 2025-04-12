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