"use client"
import { useEffect, useState } from "react"
import API_BASE_URL from "@/app/config/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Upload, Eye, Archive, CheckCircle, XCircle, Trash } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QuestionUpload from "@/app/components/QuestionUpload"

type TestItem = {
  id: string
  title: string
  description?: string
  duration: number
  totalMarks: number
  startTime: string
  status: "draft" | "published" | "archived"
  questionCount: number
  createdAt: string
}

export default function ManageTestsPage() {
  const [tests, setTests] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadTestId, setUploadTestId] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/tests/mine/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      if (!res.ok) throw new Error("Failed to load tests")
      const data = await res.json()
      setTests(Array.isArray(data.tests) ? data.tests : [])
    } catch (e: any) {
      setError(e?.message || "Failed to load tests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const setStatus = async (id: string, status: TestItem["status"]) => {
    try {
      setUpdatingId(id)
      const res = await fetch(`${API_BASE_URL}/tests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error("Failed to update status")
      await load()
    } catch (e: any) {
      setError(e?.message || "Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const archive = async (id: string) => {
    try {
      setUpdatingId(id)
      const res = await fetch(`${API_BASE_URL}/tests/${id}/archive`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      if (!res.ok) throw new Error("Failed to archive test")
      await load()
    } catch (e: any) {
      setError(e?.message || "Failed to archive test")
    } finally {
      setUpdatingId(null)
    }
  }

  const removeTest = async (id: string) => {
    try {
      if (!confirm("Delete this test permanently?")) return
      setUpdatingId(id)
      const res = await fetch(`${API_BASE_URL}/tests/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Failed to delete test")
      }
      await load()
    } catch (e: any) {
      setError(e?.message || "Failed to delete test")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
      <div className="container py-6 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Manage Tests</h1>
            <p className="text-sm text-gray-600">Create, publish, and manage your tests</p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle>My Tests</CardTitle>
            <CardDescription>Overview of tests you’ve created</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-600">{error}</div>
            ) : loading ? (
              <div>Loading...</div>
            ) : tests.length === 0 ? (
              <div className="text-gray-600">No tests yet. Click “Create Test” to add one.</div>
            ) : ( 
              <>
                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-4">
                  {tests.map(t => (
                    <div key={t.id} className="border rounded-lg p-4 space-y-3 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-lg">{t.title}</div>
                          <div className="text-sm text-gray-500">{new Date(t.startTime).toLocaleString()}</div>
                        </div>
                        <Badge variant={t.status === "published" ? "default" : t.status === "draft" ? "secondary" : "outline"}>
                          {t.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">Questions:</span> {t.questionCount}
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">Marks:</span> {t.totalMarks}
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-center"
                          onClick={() => { setUploadTestId(t.id); setUploadOpen(true) }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Update Questions
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {t.status !== "published" ? (
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full justify-center"
                              disabled={updatingId === t.id}
                              onClick={() => setStatus(t.id, "published")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Publish
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full justify-center"
                              disabled={updatingId === t.id}
                              onClick={() => setStatus(t.id, "draft")}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Unpublish
                            </Button>
                          )}
                          
                          <Link href={`/faculty/student-results`} className="w-full">
                            <Button variant="ghost" size="sm" className="w-full justify-center">
                              <Eye className="h-4 w-4 mr-2" />
                              Results
                            </Button>
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center"
                            disabled={updatingId === t.id}
                            onClick={() => archive(t.id)}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full justify-center"
                            disabled={updatingId === t.id}
                            onClick={() => removeTest(t.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tests.map(t => (
                        <TableRow key={t.id}>
                          <TableCell className="font-semibold">{t.title}</TableCell>
                          <TableCell>{t.questionCount}</TableCell>
                          <TableCell>{t.totalMarks}</TableCell>
                          <TableCell>{new Date(t.startTime).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={t.status === "published" ? "default" : t.status === "draft" ? "secondary" : "outline"}>
                              {t.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setUploadTestId(t.id); setUploadOpen(true) }}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Update Questions
                            </Button>
                            {t.status !== "published" ? (
                              <Button
                                variant="default"
                                size="sm"
                                disabled={updatingId === t.id}
                                onClick={() => setStatus(t.id, "published")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Publish
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={updatingId === t.id}
                                onClick={() => setStatus(t.id, "draft")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Unpublish
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={updatingId === t.id}
                              onClick={() => archive(t.id)}
                            >
                              <Archive className="h-4 w-4 mr-1" />
                              Archive
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={updatingId === t.id}
                              onClick={() => removeTest(t.id)}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Delete Test
                            </Button>
                            <Link href={`/faculty/student-results`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Results
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <div className="mt-6 text-sm text-gray-700 space-y-2">
          <p><span className="font-semibold">Update Questions:</span> Re-uploading updates matching questions by text, adds new ones, and keeps existing questions that aren’t in the new file. Total marks are recalculated.</p>
          <p><span className="font-semibold">Unpublish:</span> Hides the test from students while you make changes. You can publish again later.</p>
          <p><span className="font-semibold">Archive:</span> Moves the test to archived status and keeps its data for records. Students cannot see archived tests.</p>
          <p><span className="font-semibold">Delete Test:</span> Permanently removes the test and all related questions and attempts.</p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={(o) => { setUploadOpen(o); if (!o) setUploadTestId(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Questions</DialogTitle>
            </DialogHeader>
            {uploadTestId && (
              <QuestionUpload
                testId={uploadTestId}
                onComplete={() => {
                  setUploadOpen(false)
                  setUploadTestId(null)
                  load()
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}
