"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { API_BASE_URL } from "@/app/config/api"

export default function StudentLogin() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    rollNumber: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.rollNumber || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rollNo: formData.rollNumber,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Invalid roll number. Please check and try again.");
        } else if (response.status === 401) {
          throw new Error("Incorrect password. Please try again.");
        } else {
          throw new Error(data.message || 'Login failed');
        }
      }

      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('student', JSON.stringify(data.student));

      // Login successful, redirect to dashboard
      router.push('/student/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/70 to-white flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-md mx-auto" style={{ perspective: "1600px" }}>
        <div className="bg-white/95 rounded-[28px] shadow-[0_25px_80px_rgba(15,23,42,0.12)] border border-white/60 p-8 sm:p-10 transition-transform duration-500 hover:-translate-y-1.5 hover:rotate-x-1 hover:-rotate-y-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col items-center mb-2">
            <GraduationCap className="h-12 w-12 text-[#0074b7] mb-3 drop-shadow" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#22223b] text-center mb-2">Student Login</h2>
            <p className="text-[#4a4e69] text-sm sm:text-base mb-4 text-center">Enter your Roll Number and password to access your student dashboard</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="rollNumber" className="font-semibold text-base sm:text-lg text-[#4a4e69]">Roll Number</Label>
            <Input
              id="rollNumber"
              name="rollNumber"
              type="text"
              placeholder="Enter your roll number"
              value={formData.rollNumber}
              onChange={handleChange}
              className="focus:ring-4 focus:ring-blue-200/70 transition-all duration-200 border border-gray-200 rounded-xl py-3 sm:py-4 text-base sm:text-lg"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-semibold text-base sm:text-lg text-[#4a4e69]">Password</Label>
              <Link href="/student/forgot-password" className="text-[#0074b7] hover:underline text-xs sm:text-sm font-semibold">Forgot Password?</Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="focus:ring-4 focus:ring-blue-200/70 transition-all duration-200 border border-gray-200 rounded-xl py-3 sm:py-4 text-base sm:text-lg pr-12"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-500 hover:text-slate-700"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#0074b7] to-[#005fa3] hover:shadow-lg text-white font-bold py-3.5 sm:py-4 text-lg rounded-xl focus:ring-2 focus:ring-blue-400 transition-all duration-200 relative overflow-hidden group"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
            <span className="absolute right-0 top-0 h-full w-10 bg-white/40 rounded-full pointer-events-none scale-0 group-active:scale-100 transition-transform duration-500"></span>
          </Button>
          <div className="text-center text-sm mt-2">
            Don&apos;t have an account?{' '}
            <Link href="/student/register" className="inline-flex items-center text-[#0074b7] hover:underline font-semibold">
              Sign up <span className="ml-1">→</span>
            </Link>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}
