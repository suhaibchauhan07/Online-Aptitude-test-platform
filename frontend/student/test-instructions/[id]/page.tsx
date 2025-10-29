"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StudentLayout } from "@/components/student-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function TestInstructions({ params }: { params: { id: string } }) {
	const id = params.id
	const router = useRouter()
	const [agreed, setAgreed] = useState(false)
	const [loading, setLoading] = useState(false)
	const [test, setTest] = useState<any>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchTestDetails = async () => {
			try {
				const response = await fetch(`http://localhost:5000/api/student/tests/${id}`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`
					}
				})
				if (!response.ok) throw new Error('Failed to fetch test details')
				const data = await response.json()
				setTest(data)
			} catch (err) {
				setError('Failed to fetch test details')
			}
		}
		fetchTestDetails()
	}, [id])

	const handleStartTest = async () => {
		if (!agreed || loading) return
		setLoading(true)
		try {
			// Create/continue attempt before navigating to the test page
			const res = await fetch(`http://localhost:5000/api/student/tests/${id}/start`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`
				}
			})
			
			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.message || 'Failed to start test')
			}
			
			const data = await res.json()
			console.log('Start test response:', data)
			
			// Check if the response has the expected structure
			if (data.status === 'success' && data.data && data.data.attemptId) {
				router.push(`/student/test/${id}`)
			} else {
				throw new Error('Invalid response from server')
			}
		} catch (e) {
			console.error('Error starting test:', e)
			setError(e instanceof Error ? e.message : 'Failed to start test')
		} finally {
			setLoading(false)
		}
	}

	if (error) {
		return <div className="flex justify-center items-center min-h-screen"><span>{error}</span></div>
	}
	if (!test) {
		return <div className="flex justify-center items-center min-h-screen"><span>Loading...</span></div>
	}

	return (
		<StudentLayout>
			<div className="container mx-auto p-4">
				<Card>
					<CardHeader>
						<CardTitle>{test?.testName || 'Test Instructions'}</CardTitle>
						<CardDescription>Read carefully before starting the test</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<Alert>
								<AlertTriangle className="h-4 w-4" />
								<AlertTitle>Important</AlertTitle>
								<AlertDescription>
									Once you start, the timer begins. Do not refresh or close the tab.
								</AlertDescription>
							</Alert>
							<div className="flex items-center space-x-2">
								<Checkbox id="agree" checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
								<label htmlFor="agree" className="text-sm">I have read and agree to the instructions</label>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button disabled={!agreed || loading} onClick={handleStartTest}>
							{loading ? 'Starting...' : 'Start Test'}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</StudentLayout>
	)
}
