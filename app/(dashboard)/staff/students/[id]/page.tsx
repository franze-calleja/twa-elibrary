/**
 * Student Details Page - Staff
 */

export default function StudentDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Details</h1>
        <p className="text-muted-foreground">View student information and borrowing history</p>
      </div>
      
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Student details for ID: {params.id}</p>
      </div>
    </div>
  )
}
