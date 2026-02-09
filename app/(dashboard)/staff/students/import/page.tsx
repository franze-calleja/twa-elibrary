/**
 * Import Students CSV Page - Staff
 */

'use client'

import { useState } from 'react'
import { useImportStudents } from '@/hooks/useUsers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import Papa from 'papaparse'
import { useToast } from '@/hooks/use-toast'

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

export default function ImportStudentsPage() {
  const { toast } = useToast()
  const importStudents = useImportStudents()
  
  const [file, setFile] = useState<File | null>(null)
  const [students, setStudents] = useState<CSVStudent[]>([])
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }
    
    setFile(selectedFile)
    setError(null)
    setResults(null)
    
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
          setError('No valid students found in CSV file')
        }
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`)
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
        setResults(data.data.results)
        toast({
          title: 'Import Completed',
          description: `Successfully imported ${data.data.imported} students`
        })
      },
      onError: (err: any) => {
        const errorMessage = err.response?.data?.error?.message || 'Failed to import students'
        setError(errorMessage)
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
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Students</h1>
        <p className="text-muted-foreground">Bulk import students via CSV file</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Upload a CSV file containing student information to pre-register multiple students at once
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
                <Button asChild variant={file ? 'secondary' : 'default'}>
                  <span className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {file ? file.name : 'Choose CSV File'}
                  </span>
                </Button>
              </label>
            </div>
            
            {students.length > 0 && !results && (
              <Button onClick={handleImport} disabled={importStudents.isPending}>
                {importStudents.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${students.length} Students`
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
        </CardContent>
      </Card>
      
      {/* Preview Table */}
      {students.length > 0 && !results && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({students.length} students)</CardTitle>
            <CardDescription>Review the data before importing</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
      
      {/* Results */}
      {results && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">Successful</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{results.success.length}</p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-700">Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700">{results.errors.length}</p>
                </div>
              </div>
              
              {results.success.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Successfully Imported ({results.success.length})</h3>
                  <div className="border rounded-lg overflow-auto max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Activation Code</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.success.map((item: any) => (
                          <TableRow key={item.row}>
                            <TableCell>{item.row}</TableCell>
                            <TableCell>
                              {item.student.firstName} {item.student.lastName} ({item.student.studentId})
                            </TableCell>
                            <TableCell>
                              <code className="bg-primary/10 px-2 py-1 rounded font-mono text-sm">
                                {item.activationCode}
                              </code>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              {results.errors.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 text-destructive">Failed Imports ({results.errors.length})</h3>
                  <div className="border rounded-lg overflow-auto max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.errors.map((item: any) => (
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

