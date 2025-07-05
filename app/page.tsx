import type React from "react"
import Link from "next/link"
import { GraduationCap, BookOpen, Award, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const practiceCategories = [
  { name: 'Abstract Reasoning', image: '/pictures/Abstract.jpg' },
  { name: 'Critical Thinking', image: '/pictures/critical.jpg' },
  { name: 'Deductive Reasoning', image: 'aptitude.jpg' },
  { name: 'Mechanical Aptitude', image: '/pictures/mechanical.jpg' },
  { name: 'Numerical Reasoning', image: '/pictures/Numerical_reasoning.jpg' },
  { name: 'Office Proficiency', image: '/pictures/office.jpg' },
  { name: 'Personality Test', image: '/pictures/personality.jpg' },
  { name: 'Spatial Ability', image: '/pictures/spatial.jpg' },
  { name: 'Typing Skills', image: '/pictures/typing.jpg' },
  { name: 'Verbal Skills', image: '/pictures/verbal.jpg' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col overflow-auto">
      {/* Header */}
      <header className="bg-white/90 border-b border-blue-100 py-4 shadow-lg sticky top-0 z-20">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-9 w-9 text-blue-700 drop-shadow" />
            <h1 className="font-semibold text-2xl md:text-3xl tracking-wide">
              <span className="text-green-600">JMIT</span>
              <span className="text-blue-500"> Online Aptitude Test System</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container py-16 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">
                Welcome to JMIT Online Aptitude Test System
              </h1>
              <p className="text-center text-gray-600 mb-10">
                A secure and professional platform for college students to take aptitude tests online.
              </p>
              <div className="flex justify-center items-center gap-6 pt-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-800 transition-all text-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <Link href="/student/login">
                    Student Login
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-blue-500 text-blue-700 font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-50 hover:text-blue-900 transition-all text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <Link href="/faculty/login">
                    Faculty Login
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-center items-center">
              <div className="mx-auto max-w-md md:max-w-lg bg-gradient-to-br from-white/60 to-blue-100/60 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-blue-100">
                <img
                  src="aptipic.jpg"
                  alt="Online classroom illustration"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Practice Tests by Category Section */}
        <section className="bg-white/90 py-16">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Practice Tests by Category</h2>
            <p className="text-center text-gray-600 mb-10">Find the test prep materials suitable for your needs. Select the relevant category below.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {practiceCategories.map((cat) => (
                <div
                  key={cat.name}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col items-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white focus-within:shadow-2xl focus-within:-translate-y-2 cursor-pointer group"
                  tabIndex={0}
                >
                  <div className="w-full aspect-[16/9] overflow-hidden">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-5 w-full text-center">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-700 transition-colors duration-200">{cat.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <div className="bg-white/90 py-20">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">Why Choose Our Platform?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
              <FeatureCard
                icon={<BookOpen className="h-12 w-12 text-blue-700 drop-shadow" />}
                title="Secure Testing Environment"
                description="Our platform ensures academic integrity with fullscreen mode, tab switching prevention, and comprehensive monitoring."
              />
              <FeatureCard
                icon={<Award className="h-12 w-12 text-blue-700 drop-shadow" />}
                title="Comprehensive Analytics"
                description="Faculty can access detailed reports, performance trends, and student improvement metrics."
              />
              <FeatureCard
                icon={<GraduationCap className="h-12 w-12 text-blue-700 drop-shadow" />}
                title="Multiple Question Types"
                description="Support for Multiple Choice, Multiple Select, and Numerical Answer Type questions."
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="container py-20">
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
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
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
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="shadow-2xl rounded-2xl border border-blue-100 bg-white/95 hover:scale-[1.03] hover:shadow-blue-200 transition-all">
      <CardContent className="p-8 text-center">
        <div className="mx-auto w-fit mb-5">{icon}</div>
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
