/**
 * Students List Page - Staff
 */

'use client'

import { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, UserPlus, Upload, Loader2, Eye } from 'lucide-react'
import Link from 'next/link'

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10
  
  const { data, isLoading } = useUsers({ page, limit, search, role: 'STUDENT' })
  
  const users = data?.users || []
  const pagination = data?.pagination
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage student accounts</p>
        </div>
        
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/staff/students/import">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/staff/students/pre-register">
              <UserPlus className="mr-2 h-4 w-4" />
              Pre-Register Student
            </Link>
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or student ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No students found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Loans</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.firstName} {student.lastName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.program}</TableCell>
                    <TableCell>{student.yearLevel}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{student._count?.transactions || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/staff/students/${student.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {users.length} of {pagination.total} students
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

