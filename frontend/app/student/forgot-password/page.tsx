"use client"
import { useState } from "react"
import Link from "next/link"
import API_BASE_URL from "@/app/config/api"
import { StudentLayout } from "@/components/student-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Phone, KeyRound, ShieldCheck } from "lucide-react"

export default function StudentForgotPasswordPage() {
  const [stage, setStage] = useState<"email"|"phone"|"verify"|"reset"|"done">("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [prefix, setPrefix] = useState("")
  const [suffix, setSuffix] = useState("")

  const lookupEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/student/forgot-password/lookup-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to find account")
      setPrefix(data.prefix || "")
      setSuffix(data.suffix || "")
      setSuccess("Email verified. Please enter your registered phone.")
      setStage("phone")
    } catch (err: any) {
      setError(err.message || "Error verifying email")
    } finally {
      setLoading(false)
    }
  }

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      if (!/^\+91\d{10}$/.test(phone)) {
        throw new Error("Enter your full phone as +91 followed by 10 digits")
      }
      const res = await fetch(`${API_BASE_URL}/student/forgot-password/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to request OTP")
      setSuccess("OTP sent to your registered phone")
      if (data.otpPreview) setSuccess(`OTP: ${data.otpPreview}`)
      setStage("verify")
    } catch (err: any) {
      setError(err.message || "Error requesting OTP")
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    try {
      setLoading(true)
      if (!/^\+91\d{10}$/.test(phone)) {
        throw new Error("Enter your full phone as +91 followed by 10 digits")
      }
      const res = await fetch(`${API_BASE_URL}/student/forgot-password/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to resend OTP")
      setSuccess("OTP resent to your registered phone")
      if (data.otpPreview) setSuccess(`OTP: ${data.otpPreview}`)
    } catch (err:any) {
      setError(err.message || "Error resending OTP")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      if (!/^\+91\d{10}$/.test(phone)) {
        throw new Error("Enter your full phone as +91 followed by 10 digits")
      }
      const res = await fetch(`${API_BASE_URL}/student/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to verify OTP")
      setResetToken(data.resetToken)
      setSuccess("OTP verified")
      setStage("reset")
    } catch (err: any) {
      setError(err.message || "Error verifying OTP")
    } finally {
      setLoading(false)
    }
  }

  const resetPwd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/student/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to reset password")
      setSuccess("Password reset successful")
      setStage("done")
    } catch (err: any) {
      setError(err.message || "Error resetting password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <StudentLayout>
      <div className="max-w-xl mx-auto p-4">
        <Card className="shadow-xl border border-blue-100">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-[#1f2937]">Forgot Password</CardTitle>
            <CardDescription>Reset your student account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {stage === "email" && (
              <form onSubmit={lookupEmail} className="space-y-3">
                <Label className="font-semibold">Enter your registered email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Checking..." : "Continue"}
                </Button>
                <div className="text-sm text-slate-600">
                  <Link href="/student/login" className="text-blue-600 hover:underline">Back to login</Link>
                </div>
              </form>
            )}

            {stage === "phone" && (
              <form onSubmit={requestOtp} className="space-y-3">
                <Label className="font-semibold">
                  {prefix && suffix ? `Enter the full phone (+91XXXXXXXXXX) for ${prefix}*****${suffix}` : "Enter your full registered phone (+91XXXXXXXXXX)"}
                </Label>
                <div className="relative">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pr-12"
                    type="tel"
                    placeholder="+91XXXXXXXXXX"
                    maxLength={13}
                    required
                  />
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
               
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
                <div className="text-sm text-slate-600">
                  <Link href="/student/login" className="text-blue-600 hover:underline">Back to login</Link>
                </div>
              </form>
            )}

            {stage === "verify" && (
              <form onSubmit={verifyOtp} className="space-y-3">
                <Label className="font-semibold">Enter OTP</Label>
                <div className="relative">
                  <Input
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pr-12"
                    maxLength={6}
                    required
                  />
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
                <div className="text-sm text-slate-600 flex justify-between">
                  <button type="button" className="text-blue-600 hover:underline" onClick={resendOtp}>Resend OTP</button>
                  <Link href="/student/login" className="text-blue-600 hover:underline">Back to login</Link>
                </div>
              </form>
            )}

            {stage === "reset" && (
              <form onSubmit={resetPwd} className="space-y-3">
                <Label className="font-semibold">New Password</Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button type="submit" disabled={loading || !resetToken} className="w-full">
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            {stage === "done" && (
              <div className="space-y-3">
                <p className="text-slate-700">Your password has been reset.</p>
                <Button asChild className="w-full">
                  <Link href="/student/login">Go to Login</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  )
}
