"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudentRegister() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    className: "",
    section: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    department: "",
    year: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (Object.values(formData).some((value) => !value)) {
      setError("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/student/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rollNo: formData.rollNumber,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          className: formData.className,
          department: formData.department,
          year: parseInt(formData.year)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful, redirect to login
      router.push('/student/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // 🛠️ Original class list
  const classes = ["B.Tech CSE", "B.Tech ECE", "B.Tech ME", "B.Tech CE", "BCA", "MCA"]
  const sections = ["A", "B", "C", "D"]
  const departments = ["CSE", "ECE", "ME", "CE", "BCA", "MCA"]
  const years = ["1", "2", "3", "4"]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container py-12 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <h1 className="font-bold text-4xl md:text-5xl text-[#22223b] mb-4" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}>Student Registration</h1>
          <p className="text-[#4a4e69] mb-10 text-xl md:text-2xl">Create your account to access the aptitude test system</p>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-lg md:text-xl text-[#4a4e69]">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="focus:ring-2 focus:ring-blue-400 transition-all duration-200 border border-gray-300 rounded-md py-4 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="font-semibold text-lg md:text-xl text-[#4a4e69]">College Roll Number</Label>
              <Input
                id="rollNumber"
                name="rollNumber"
                placeholder="Enter your roll number"
                value={formData.rollNumber}
                onChange={handleChange}
                className="focus:ring-2 focus:ring-blue-400 transition-all duration-200 border border-gray-300 rounded-md py-4 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="className" className="font-semibold text-lg md:text-xl text-[#4a4e69]">Class</Label>
              <Select
                value={formData.className}
                onValueChange={(value) => handleSelectChange("className", value)}
              >
                <SelectTrigger id="className">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="section" className="font-semibold text-lg md:text-xl text-[#4a4e69]">Section</Label>
              <Select
                value={formData.section}
                onValueChange={(value) => handleSelectChange("section", value)}
              >
                <SelectTrigger id="section">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="font-semibold text-lg md:text-xl text-[#4a4e69]">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleSelectChange("department", value)}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="font-semibold text-lg md:text-xl text-[#4a4e69]">Year</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => handleSelectChange("year", value)}
              >
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-lg md:text-xl text-[#4a4e69]">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="focus:ring-2 focus:ring-blue-400 transition-all duration-200 border border-gray-300 rounded-md py-4 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-semibold text-lg md:text-xl text-[#4a4e69]">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className="focus:ring-2 focus:ring-blue-400 transition-all duration-200 border border-gray-300 rounded-md py-4 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-lg md:text-xl text-[#4a4e69]">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-2 focus:ring-blue-400 transition-all duration-200 border border-gray-300 rounded-md pr-10 py-4 text-lg"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-semibold text-lg md:text-xl text-[#4a4e69]">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="focus:ring-2 focus:ring-blue-400 transition-all duration-200 border border-gray-300 rounded-md py-4 text-lg"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-center mb-6">
              <input type="checkbox" id="terms" required className="mr-2 w-5 h-5 accent-[#0074b7]" />
              <label htmlFor="terms" className="text-[#4a4e69] text-base select-none">
                I agree with the
                <a href="/terms" target="_blank" className="text-[#0074b7] hover:underline mx-1">terms and conditions</a>,
                <a href="/data-processing" target="_blank" className="text-[#0074b7] hover:underline mx-1">data processing agreement</a>,
                and
                <a href="/privacy-policy" target="_blank" className="text-[#0074b7] hover:underline mx-1">privacy policy</a>.
              </label>
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                className="w-full bg-[#0074b7] hover:bg-[#005fa3] text-white font-bold py-4 text-xl rounded-md focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
              <div className="text-center text-sm mt-4">
                Already have an account?{' '}
                <Link href="/student/login" className="inline-flex items-center text-[#0074b7] hover:underline font-semibold">
                  Sign in <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
