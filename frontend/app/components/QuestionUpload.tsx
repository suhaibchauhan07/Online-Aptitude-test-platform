"use client"

import { useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { API_BASE_URL } from '@/app/config/api'
import * as XLSX from 'xlsx'

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    marks: number;
}

export default function QuestionUpload({ testId, onComplete }: { testId: string, onComplete?: () => void }) {
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                selectedFile.type === 'application/vnd.ms-excel') {
                setFile(selectedFile)
                setError('')
            } else {
                setError('Please upload an Excel file (.xlsx or .xls)')
            }
        }
    }

    const parseExcel = async (file: File): Promise<Question[]> => {
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(worksheet)
        if (!Array.isArray(rows) || rows.length === 0) throw new Error('No data found')

        return rows.map((row: any, index: number) => {
            const question = String(row.Question || '').trim()
            const optionA = String(row.OptionA || '').trim()
            const optionB = String(row.OptionB || '').trim()
            const optionC = String(row.OptionC || '').trim()
            const optionD = String(row.OptionD || '').trim()
            const correctAnswer = String(row.CorrectAnswer || '').trim()
            const rawMarks = row.Marks ?? row.marks ?? row.TotalMarks
            const marksNum = Number(rawMarks)
            const marks = Number.isFinite(marksNum) && marksNum > 0 ? marksNum : 1
            if (!question) throw new Error(`Row ${index + 1}: Question is required`)
            const options = [optionA, optionB, optionC, optionD].filter(Boolean)
            if (options.length < 4) throw new Error(`Row ${index + 1}: All four options are required`)
            if (!correctAnswer) throw new Error(`Row ${index + 1}: Correct answer is required`)
            if (!options.includes(correctAnswer)) throw new Error(`Row ${index + 1}: Correct answer must match one of the options`)
            return { question, options, correctAnswer, marks }
        })
    }

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first')
            return
        }
        setIsLoading(true)
        setError('')
        try {
            const questions = await parseExcel(file)
            const token = localStorage.getItem('token') || ''
            const response = await fetch(`${API_BASE_URL}/tests/${testId}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ questions })
            })
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to upload questions')
            }
            if (onComplete) onComplete()
            setFile(null)
            alert('Questions uploaded successfully')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload questions')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Update Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="flex items-center space-x-4">
                            <label className="flex-1">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                                <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose File
                                </Button>
                            </label>
                            <Button onClick={handleUpload} disabled={!file || isLoading}>
                                {isLoading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>
                        {file && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <FileText className="h-4 w-4" />
                                <span>{file.name}</span>
                                <Button variant="ghost" size="icon" onClick={() => setFile(null)} disabled={isLoading}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
