"use client"

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Upload, XCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import Stepper from '@/components/ui/stepper'

interface Question {
    question: string
    options: string[]
    correctAnswer: string
    type: 'MCQ'
    marks: number
}

interface CreateTestModalProps {
    isOpen: boolean
    onClose: () => void
    onTestCreated: () => void
}

const API_BASE_URL = 'http://localhost:5000/api';

export default function CreateTestModal({ isOpen, onClose, onTestCreated }: CreateTestModalProps) {
    const [step, setStep] = useState(0); // 0: Details, 1: Upload, 2: Preview
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        totalMarks: '',
        startTime: '',
        instructions: ''
    })
    const [questions, setQuestions] = useState<Question[]>([])
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            console.log('Reading Excel file...')
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            console.log('Raw Excel data:', jsonData)

            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                throw new Error('No data found in Excel file')
            }

            // Validate headers
            const firstRow = jsonData[0] as any
            const requiredHeaders = ['Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectAnswer']
            const missingHeaders = requiredHeaders.filter(header => !(header in firstRow))

            if (missingHeaders.length > 0) {
                throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
            }

            const parsedQuestions = jsonData.map((row: any, index: number) => {
                // Get all values, ensuring they are strings and trimmed
                const question = String(row.Question || '').trim()
                const optionA = String(row.OptionA || '').trim()
                const optionB = String(row.OptionB || '').trim()
                const optionC = String(row.OptionC || '').trim()
                const optionD = String(row.OptionD || '').trim()
                const correctAnswer = String(row.CorrectAnswer || '').trim()

                // Validate required fields
                if (!question) {
                    throw new Error(`Row ${index + 1}: Question is required`)
                }

                // Combine options into array
                const options = [optionA, optionB, optionC, optionD].filter(Boolean)

                if (options.length < 4) {
                    throw new Error(`Row ${index + 1}: All four options are required`)
                }

                if (!correctAnswer) {
                    throw new Error(`Row ${index + 1}: Correct answer is required`)
                }

                if (!options.includes(correctAnswer)) {
                    throw new Error(`Row ${index + 1}: Correct answer must match one of the options`)
                }

                return {
                    question,
                    options,
                    correctAnswer,
                    type: 'MCQ' as const,
                    marks: 1 // Default marks per question
                }
            })

            console.log('Parsed questions:', parsedQuestions)
            setQuestions(parsedQuestions)
            setError('')
            
            // Auto-switch to preview if parsing successful
            setStep(2)
        } catch (err) {
            console.error('Error parsing Excel:', err)
            setError(err instanceof Error ? err.message : 'Error parsing Excel file')
            setQuestions([])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            // First, calculate total marks
            const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
            formData.totalMarks = totalMarks.toString() || '0'  ;

            // Before creating testPayload, ensure startTime is an ISO string if present
            if (formData.startTime && !formData.startTime.endsWith('Z')) {
                // Convert from 'YYYY-MM-DDTHH:mm' to ISO string
                formData.startTime = new Date(formData.startTime).toISOString();
            }

            // Then, create the test
            const testPayload = {
                testName: formData.title,
                description: formData.description || '',
                duration: Number(formData.duration),
                totalMarks: Number(formData.totalMarks),
                startTime: formData.startTime,
                instructions: formData.instructions,
                status: 'active'
            };
            const testResponse = await fetch(`${API_BASE_URL}/tests/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify(testPayload)
            });

            if (!testResponse.ok) {
                const errorData = await testResponse.json();
                throw new Error(errorData.message || 'Failed to create test');
            }

            const testResult = await testResponse.json();
            console.log('Test created successfully:', testResult);

            // Get the correct test ID from the response
            const testId = testResult.test?._id || testResult._id || testResult.id;
            if (!testId) {
              throw new Error('Could not determine test ID after creation.');
            }

            // Then, upload questions if they exist
            if (questions.length > 0) {
                console.log('Uploading questions for test:', testId);
                const questionsResponse = await fetch(`${API_BASE_URL}/tests/${testId}/questions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include',
                    body: JSON.stringify({ questions })
                });

                if (!questionsResponse.ok) {
                    const errorData = await questionsResponse.json();
                    throw new Error(errorData.message || 'Failed to upload questions');
                }

                const questionsResult = await questionsResponse.json();
                console.log('Questions uploaded successfully:', questionsResult);
            }

            window.alert('congratulations! Test created successfully!');
            onTestCreated();
            handleClose();
        } catch (error) {
            console.error('Error creating test:', error);
            setError(error instanceof Error ? error.message : 'Failed to create test');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            duration: '',
            totalMarks: '',
            startTime: '',
            instructions: ''
        })
        setQuestions([])
        setError('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        onClose()
    }

    // Helper for showing alerts
    const showAlert = (msg: string) => {
      window.alert(msg);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Create New Test</DialogTitle>
                </DialogHeader>

                <Stepper steps={['Test Details', 'Upload Questions', 'Preview & Confirm']} activeStep={step} />

                {error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {step === 0 && (
                  <Card className="p-6 mb-4">
                        <h3 className="text-lg font-semibold mb-4">Test Details</h3>
                    <div className="space-y-4 grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                        <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter test title" />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                        <Input id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Enter test description" />
                            </div>
                            <div>
                                <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input id="duration" type="number" value={formData.duration} onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))} placeholder="Enter duration" />
                            </div>
                            <div>
                                <Label htmlFor="totalMarks">Total Marks</Label>
                        <Input id="totalMarks" type="number" value={formData.totalMarks} onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: e.target.value }))} placeholder="Enter total marks" />
                      </div>
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input id="startTime" type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} placeholder="Select start time" />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="instructions">Instructions</Label>
                        <Input id="instructions" value={formData.instructions} onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))} placeholder="Enter test instructions" />
                            </div>
                        </div>
                    </Card>
                )}

                {step === 1 && (
                  <Card className="p-6 mb-4">
                        <h3 className="text-lg font-semibold mb-4">Upload Questions</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-center w-full">
                        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
                                    </div>
                          <input id="file-upload" type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileChange} ref={fileInputRef} />
                                </label>
                            </div>
                            <div className="text-sm text-gray-500">
                                <p className="font-medium mb-1">Excel file format:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Question (text)</li>
                                    <li>Options (comma-separated)</li>
                                    <li>Correct Answer (single or comma-separated)</li>
                                    <li>Type (MCQ/MSQ)</li>
                                    <li>Marks (number)</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                )}

                {step === 2 && questions.length > 0 && (
                  // Question preview table removed as per user request
                  <></>
                )}

                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" onClick={handleClose}>Cancel</Button>
                  {step > 0 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
                  {step < 2 && (
                    <Button
                      onClick={() => {
                        if (step === 0) {
                          if (!formData.title || !formData.duration || !formData.totalMarks || !formData.startTime || !formData.instructions) {
                            showAlert('Please fill all required test details before proceeding.');
                            return;
                          }
                        }
                        if (step === 1) {
                          if (questions.length === 0) {
                            showAlert('Please upload at least one question before proceeding.');
                            return;
                          }
                        }
                        setStep(step + 1);
                      }}
                      disabled={isLoading}
                    >
                      Next
                    </Button>
                  )}
                  {step === 2 && (
                    <Button 
                        onClick={handleSubmit} 
                      disabled={isLoading || !formData.title || !formData.duration || !formData.totalMarks || !formData.startTime || !formData.instructions || questions.length === 0}
                    >
                        {isLoading ? 'Creating...' : 'Create Test'}
                    </Button>
                  )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 