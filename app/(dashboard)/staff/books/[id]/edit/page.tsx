/**
 * Edit Book Page - Staff
 */

export default function EditBookPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Book</h1>
        <p className="text-muted-foreground">Update book information</p>
      </div>
      
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Book edit form for ID: {params.id}</p>
      </div>
    </div>
  )
}
