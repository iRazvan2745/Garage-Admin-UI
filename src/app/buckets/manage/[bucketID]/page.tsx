export default function BucketManagePage({ params }: { params: { bucketID: string }} ) {
  const { bucketID } = params
  return <div>Bucket: {bucketID}</div>
}