/**
 * Students Management Page - Staff
 * Consolidated page with pre-registration and CSV import in dialogs
 */

'use client'

import { useState } from 'react'
import { useUsers, usePreRegisterStudent, useImportStudents } from '@/hooks/useUsers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, UserPlus, Upload, Loader2, Eye, AlertCircle, CheckCircle, Download, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import Papa from 'papaparse'

interface CSVStudent {
  email: string
  firstName: string
  lastName: string
  middleName?: string
  studentId: string
  program: string
  yearLevel: number
  phone?: string
  borrowingLimit?: number
}

export default function StudentsPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10
  
  const { data, isLoading, refetch } = useUsers({ page, limit, search, role: 'STUDENT' })
  
  // Pre-register dialog state
  const preRegister = usePreRegisterStudent()
  const [showPreRegister, setShowPreRegister] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [preRegisterForm, setPreRegisterForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    studentId: '',
    program: '',
    yearLevel: 1,
    phone: '',
    borrowingLimit: 3
  })
  const [preRegisterError, setPreRegisterError] = useState<string | null>(null)
  const [registeredStudent, setRegisteredStudent] = useState<any>(null)
  
  // CSV import dialog state
  const importStudents = useImportStudents()
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [students, setStudents] = useState<CSVStudent[]>([])
  const [importResults, setImportResults] = useState<any>(null)
  const [importError, setImportError] = useState<string | null>(null)
  
  const users = data?.users || []
  const pagination = data?.pagination
  
  // Pre-register handlers
  const handlePreRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value
    setPreRegisterForm(prev => ({
      ...prev,
      [e.target.name]: value
    }))
  }
  
  const handlePreRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPreRegisterError(null)
    
    preRegister.mutate(preRegisterForm, {
      onSuccess: (data) => {
        setRegisteredStudent(data.data.student)
        setShowPreRegister(false)
        setShowSuccessDialog(true)
        
        // Reset form
        setPreRegisterForm({
          email: '',
          firstName: '',
          lastName: '',
          middleName: '',
          studentId: '',
          program: '',
          yearLevel: 1,
          phone: '',
          borrowingLimit: 3
        })
        
        // Refetch students list
        refetch()
      },
      onError: (err: any) => {
        const errorMessage = err.response?.data?.error?.message || 'Failed to pre-register student'
        setPreRegisterError(errorMessage)
      }
    })
  }
  
  // CSV import handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    if (!selectedFile.name.endsWith('.csv')) {
      setImportError('Please select a CSV file')
      return
    }
    
    setFile(selectedFile)
    setImportError(null)
    setImportResults(null)
    
    // Parse CSV
    Papa.parse(selectedFile, {
      header: true,
      complete: (result) => {
        const parsedStudents = result.data.map((row: any) => ({
          email: row.email || '',
          firstName: row.firstName || '',
          lastName: row.lastName || '',
          middleName: row.middleName || '',
          studentId: row.studentId || '',
          program: row.program || '',
          yearLevel: parseInt(row.yearLevel) || 1,
          phone: row.phone || '',
          borrowingLimit: parseInt(row.borrowingLimit) || 3
        })).filter(s => s.email && s.firstName && s.lastName && s.studentId)
        
        setStudents(parsedStudents)
        
        if (parsedStudents.length === 0) {
          setImportError('No valid students found in CSV file')
        }
      },
      error: (error) => {
        setImportError(`Failed to parse CSV: ${error.message}`)
      }
    })
  }
  
  const handleImport = () => {
    if (students.length === 0) return
    
    importStudents.mutate({
      students: students.map(s => ({
        ...s,
        borrowingLimit: s.borrowingLimit || 3
      }))
    }, {
      onSuccess: (data) => {
        setImportResults(data.data.results)
        toast({
          title: 'Import Completed',
          description: `Successfully imported ${data.data.imported} students`
        })
        
        // Refetch students list
        refetch()
      },
      onError: (err: any) => {
        const errorMessage = err.response?.data?.error?.message || 'Failed to import students'
        setImportError(errorMessage)
      }
    })
  }
  
  const downloadTemplate = () => {
    const csv = `email,firstName,lastName,middleName,studentId,program,yearLevel,phone,borrowingLimit
john.doe@example.com,John,Doe,Michael,2024-00001,BS Computer Science,1,09123456789,3
jane.smith@example.com,Jane,Smith,,2024-00002,BS Information Technology,2,09987654321,3`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const resetImportDialog = () => {
    setFile(null)
    setStudents([])
    setImportResults(null)
    setImportError(null)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage student accounts</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showImportDialog} onOpenChange={(open) => {
            setShowImportDialog(open)
            if (!open) resetImportDialog()
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Students from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to pre-register multiple students at once
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {importError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{importError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                  
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-upload"
                      disabled={importStudents.isPending}
                    />
                    <label htmlFor="csv-upload">
                      <Button asChild variant={file ? 'secondary' : 'default'} className="w-full">
                        <span className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          {file ? file.name : 'Choose CSV File'}
                        </span>
                      </Button>
                    </label>
                  </div>
                  
                  {students.length > 0 && !importResults && (
                    <Button onClick={handleImport} disabled={importStudents.isPending}>
                      {importStudents.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        `Import ${students.length}`
                      )}
                    </Button>
                  )}
                </div>
                
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>CSV Format:</strong> email, firstName, lastName, middleName (optional), studentId, program, yearLevel, phone (optional), borrowingLimit (optional)
                  </AlertDescription>
                </Alert>
                
                {/* Preview Table */}
                {students.length > 0 && !importResults && (
                  <div className="border rounded-lg overflow-auto max-h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Year</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student, index) => (
                          <TableRow key={index}>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>
                              {student.firstName} {student.middleName && `${student.middleName} `}{student.lastName}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.program}</TableCell>
                            <TableCell>{student.yearLevel}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {/* Import Results */}
                {importResults && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-700">Successful</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{importResults.success.length}</p>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-700">Failed</span>
                        </div>
                        <p className="text-2xl font-bold text-red-700">{importResults.errors.length}</p>
                      </div>
                    </div>
                    
                    {importResults.errors.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2 text-destructive">Failed Imports</h3>
                        <div className="border rounded-lg overflow-auto max-h-48">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Row</TableHead>
                                <TableHead>Error</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {importResults.errors.map((item: any) => (
                                <TableRow key={item.row}>
                                  <TableCell>{item.row}</TableCell>
                                  <TableCell className="text-destructive text-sm">{item.error}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showPreRegister} onOpenChange={setShowPreRegister}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Pre-Register Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Pre-Register Student</DialogTitle>
                <DialogDescription>
                  Fill in the student details. Students will be able to register using their information.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handlePreRegisterSubmit} className="space-y-4">
                {preRegisterError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{preRegisterError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={preRegisterForm.firstName}
                      onChange={handlePreRegisterChange}
                      required
                      disabled={preRegister.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={preRegisterForm.lastName}
                      onChange={handlePreRegisterChange}
                      required
                      disabled={preRegister.isPending}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    name="middleName"
                    value={preRegisterForm.middleName}
                    onChange={handlePreRegisterChange}
                    disabled={preRegister.isPending}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="student@example.com"
                      value={preRegisterForm.email}
                      onChange={handlePreRegisterChange}
                      required
                      disabled={preRegister.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID *</Label>
                    <Input
                      id="studentId"
                      name="studentId"
                      placeholder="20XX-XXXXX"
                      value={preRegisterForm.studentId}
                      onChange={handlePreRegisterChange}
                      required
                      disabled={preRegister.isPending}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="program">Program *</Label>
                    <Input
                      id="program"
                      name="program"
                      placeholder="e.g., BS Computer Science"
                      value={preRegisterForm.program}
                      onChange={handlePreRegisterChange}
                      required
                      disabled={preRegister.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="yearLevel">Year Level *</Label>
                    <Input
                      id="yearLevel"
                      name="yearLevel"
                      type="number"
                      min="1"
                      max="6"
                      value={preRegisterForm.yearLevel}
                      onChange={handlePreRegisterChange}
                      required
                      disabled={preRegister.isPending}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="09XXXXXXXXX"
                      value={preRegisterForm.phone}
                      onChange={handlePreRegisterChange}
                      disabled={preRegister.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrowingLimit">Borrowing Limit *</Label>
                    <Input
                      id="borrowingLimit"
                      name="borrowingLimit"
                      type="number"
                      min="1"
                      max="10"
                      value={preRegisterForm.borrowingLimit}
                      onChange={handlePreRegisterChange}
                      required
                      disabled={preRegister.isPending}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreRegister(false)}
                    disabled={preRegister.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={preRegister.isPending}>
                    {preRegister.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Pre-Registering...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Pre-Register
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Student Pre-Registered Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              The student can now complete their registration online
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Student Details:</p>
              <p className="text-sm">Name: {registeredStudent?.firstName} {registeredStudent?.middleName && `${registeredStudent.middleName} `}{registeredStudent?.lastName}</p>
              <p className="text-sm">Email: {registeredStudent?.email}</p>
              <p className="text-sm">Student ID: {registeredStudent?.studentId}</p>
            </div>
            
            <Alert>
              <AlertDescription>
                The student should use their <strong>Student ID, First Name, Last Name, and Middle Name (if applicable)</strong> when registering to activate their account.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
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
