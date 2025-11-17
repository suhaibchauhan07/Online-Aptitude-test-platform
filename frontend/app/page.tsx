import type React from "react"
import Link from "next/link"
import { GraduationCap, BookOpen, Award, ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/90 border-b border-blue-100 py-3 shadow-lg sticky top-0 z-20 backdrop-blur">
        <div className="container px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 sm:h-9 sm:w-9 text-blue-700 drop-shadow" />
            <h1 className="font-semibold text-xl sm:text-2xl md:text-3xl tracking-wide text-gray-900">
              <span className="text-green-600">JMIT</span>
              <span className="text-blue-500"> Online Aptitude Test System</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-80 bg-gradient-to-br from-blue-100/40 via-transparent to-green-100/40 blur-3xl" />
        </div>
        <div className="container px-4 sm:px-6 relative py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-8 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold  text-gray-800 max-w-xl mx-auto md:mx-0 font-bold text-center md:text-left tracking-wide">
                Welcome to <span className="text-green-600">JMIT</span> Online Aptitude Test System
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
                A secure and professional platform for college students to take aptitude tests online.
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start items-stretch sm:items-center gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-blue-500 text-blue-700 font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-50 hover:text-blue-900 transition-all text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
                >
                  <Link href="/faculty/login">
                    Faculty Login
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-blue-500 text-blue-700 font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-50 hover:text-blue-900 transition-all text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
                >
                  <Link href="/student/login">
                    Student Login
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-green-500 text-green-700 font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-green-50 hover:text-green-900 transition-all text-lg focus:outline-none focus:ring-2 focus:ring-green-400 w-full sm:w-auto"
                >
                  <Link href="/practice">
                    Practice Questions
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative flex justify-center items-center">
              <div
                className="relative mx-auto max-w-sm sm:max-w-md w-full"
                style={{ perspective: "1200px" }}
              >
                <div className="relative bg-gradient-to-br from-white/70 to-blue-100/70 backdrop-blur-xl p-4 sm:p-6 rounded-[32px] shadow-2xl border border-white/60 transition-transform duration-700 hover:rotate-x-3 hover:-rotate-y-6">
                  <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl -z-10" />
                <img
                  src="aptipic.jpg"
                  alt="Online classroom illustration"
                  className="w-full h-auto rounded-2xl shadow-lg"
                />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/90 py-16 md:py-20">
          <div className="container px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">Why Choose Our Platform?</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              Built with responsiveness in mind—every interaction feels native whether you are on desktop, tablet, or mobile.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              <FeatureCard
                icon={<BookOpen className="h-12 w-12 text-blue-700 drop-shadow" />}
                title="Secure Testing Environment"
                description="Our platform ensures academic integrity with fullscreen mode, tab switching prevention, and comprehensive monitoring."
                accent="from-blue-100 to-blue-50"
              />
              <FeatureCard
                icon={<Award className="h-12 w-12 text-blue-700 drop-shadow" />}
                title="Comprehensive Analytics"
                description="Faculty can access detailed reports, performance trends, and student improvement metrics."
                accent="from-green-100 to-green-50"
              />
              <FeatureCard
                icon={<GraduationCap className="h-12 w-12 text-blue-700 drop-shadow" />}
                title="Multiple Question Types"
                description="Support for Multiple Choice, Multiple Select, and Numerical Answer Type questions."
                accent="from-purple-100 to-purple-50"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="container px-4 sm:px-6 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">About Online Aptitude Testing</h2>
            <p className="text-center text-gray-600 mb-10">
              Online aptitude testing provides a convenient and efficient way to assess students' abilities and knowledge. Our platform is designed to create a fair testing environment while providing valuable insights to faculty members.
            </p>
            <p className="text-center text-gray-600 mb-10">
              With features like automatic submission, comprehensive monitoring, and detailed analytics, JMIT Online Aptitude Test System ensures a reliable and trustworthy assessment experience.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-10 mt-auto shadow-inner">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <GraduationCap className="h-7 w-7" />
              <span className="font-semibold text-lg">JMIT Online Aptitude Test System</span>
            </div>
            <div className="text-md text-blue-200">© {new Date().getFullYear()} JMIT. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode
  title: string
  description: string
  accent: string
}) {
  return (
    <Card className={`shadow-2xl rounded-2xl border border-white/60 bg-gradient-to-br ${accent} bg-white/95 hover:-translate-y-1 hover:shadow-blue-200/80 transition-all duration-300`}>
      <CardContent className="p-8 text-center space-y-4">
        <div className="mx-auto w-fit mb-2">{icon}</div>
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm sm:text-base">{description}</p>
      </CardContent>
    </Card>
  )
}
