/**
 * Book Details Page - Student
 */

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Book Details</h1>
        <p className="text-muted-foreground">View book information and availability</p>
      </div>
      
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Book details for ID: {params.id}</p>
      </div>
    </div>
  )
}
