"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FacultyLogin() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
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

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/faculty/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('faculty', JSON.stringify(data.faculty));
      
      // Login successful, redirect to dashboard
      router.push('/faculty/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white/95 rounded-2xl shadow-2xl border border-blue-100 p-10 hover:scale-[1.02] hover:shadow-blue-200 transition-all animate-fade-in">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col items-center mb-2">
            <BookOpen className="h-12 w-12 text-[#0074b7] mb-2" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#22223b] mb-2">Faculty Login</h2>
            <p className="text-[#4a4e69] text-base mb-4 text-center">Enter your email and password to access your faculty dashboard</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="font-semibold text-lg text-[#4a4e69]">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="focus:ring-4 focus:ring-blue-200/70 transition-all duration-200 border border-gray-300 rounded-md py-4 text-lg"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-semibold text-lg text-[#4a4e69]">Password</Label>
              <Link href="/faculty/forgot-password" className="text-[#0074b7] hover:underline text-sm font-semibold">Forgot Password?</Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="focus:ring-4 focus:ring-blue-200/70 transition-all duration-200 border border-gray-300 rounded-md py-4 text-lg pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#0074b7] hover:bg-[#005fa3] text-white font-bold py-4 text-xl rounded-md focus:ring-2 focus:ring-blue-400 transition-all duration-200 relative overflow-hidden group"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
            <span className="absolute inset-0 bg-white/40 rounded-full pointer-events-none scale-0 group-active:scale-100 transition-transform duration-500"></span>
          </Button>
          <div className="text-center text-sm mt-2">
            Don&apos;t have an account?{' '}
            <Link href="/faculty/register" className="inline-flex items-center text-[#0074b7] hover:underline font-semibold">
              Sign up <span className="ml-1">→</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
