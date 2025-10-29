"use client";
import type React from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { GraduationCap, Home, BookOpen, FileText, BarChart2, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"

interface StudentLayoutProps {
  children: ReactNode
}

interface StudentProfile {
  name: string;
  className: string;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedStudent = localStorage.getItem('student');
        
        if (!token || !storedStudent) {
          setLoading(false);
          return;
        }

        // First set profile from stored data to avoid loading state
        const studentData = JSON.parse(storedStudent);
        setProfile({
          name: studentData.name,
          className: studentData.className
        });

        // Then fetch fresh data from server
        const response = await fetch('http://localhost:5000/api/student/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile({
            name: data.name,
            className: data.className
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // If loading and no profile, show loading state
  if (loading && !profile) {
    return <div>Loading...</div>;
  }

  // If no profile after loading, show error state
  if (!profile) {
    return <div>Error loading profile. Please try logging in again.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-700 drop-shadow" />
            <span className="font-semibold text-xl tracking-wide">
              <span className="text-green-600">JMIT</span>
              <span className="text-blue-500"> Online Aptitude Test System</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Student" />
              <AvatarFallback>{profile?.name?.charAt(0) || 'S'}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{profile?.name || 'Loading...'}</p>
              <p className="text-xs text-gray-500">{profile?.className || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-16 md:w-64 bg-transparent shrink-0 flex flex-col items-center py-6 animate-fade-in">
          <nav className="w-full flex flex-col h-full">
            <div className="bg-white/80 backdrop-blur shadow-2xl rounded-2xl border border-blue-100 p-4 flex flex-col gap-1 w-full transition-all">
              <div className="space-y-1">
                <NavItem href="/student/dashboard" icon={<Home className="h-5 w-5" />} label="Dashboard" />
                <NavItem href="/student/tests" icon={<BookOpen className="h-5 w-5" />} label="Available Tests" />
                <NavItem href="/student/results" icon={<FileText className="h-5 w-5" />} label="My Results" />
                <NavItem href="/student/analytics" icon={<BarChart2 className="h-5 w-5" />} label="Analytics" />
                <NavItem href="/student/profile" icon={<User className="h-5 w-5" />} label="Profile" />
              </div>

              <div className="mt-auto">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span className="hidden md:inline">Logout</span>
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}>
      <Button variant="ghost" className="w-full justify-start hover:scale-[1.03] hover:shadow-blue-200 transition-all">
        {icon}
        <span className="ml-2 hidden md:inline">{label}</span>
      </Button>
    </Link>
  )
}
