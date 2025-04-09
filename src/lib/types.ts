type Bucket = {
  id: string;
  globalAliases: string[];
  createdAt: string;
  updatedAt: string;
};


interface BucketInfo {
  id: string;
  globalAliases: string[];
  websiteAccess: boolean;
  websiteConfig: {
    indexDocument: string;
    errorDocument: string;
  };
  keys: Array<Record<string, unknown>>;
  objects: number;
  bytes: number;
  unfinishedUploads: number;
  quotas: {
    maxSize: number | null;
    maxObjects: number | null;
  };
  createdAt: string;
  updatedAt: string;
}


export type { Bucket, BucketInfo };