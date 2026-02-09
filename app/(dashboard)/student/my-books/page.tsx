/**
 * My Books Page - Student
 */

export default function MyBooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
        <p className="text-muted-foreground">View your currently borrowed books</p>
      </div>
      
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Your borrowed books will appear here</p>
      </div>
    </div>
  )
}
