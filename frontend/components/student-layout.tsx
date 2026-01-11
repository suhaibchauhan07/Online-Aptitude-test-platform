"use client";
import type React from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { GraduationCap, Home, BookOpen, FileText, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import API_BASE_URL from "@/app/config/api"

interface StudentLayoutProps {
  children: ReactNode
}

interface StudentProfile {
  name: string;
  className: string;
  profilePicture?: string;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname()

  // Define paths where the layout (Header + Nav) should be hidden
  // Note: /student/tests is the LIST of tests (needs nav), /student/test/[id] is the ACTUAL test (hides nav)
  const isPublicOrTestPage = 
    pathname === "/student/login" || 
    pathname === "/student/register" || 
    pathname === "/student/forgot-password" ||
    pathname?.startsWith("/student/test/"); 

  useEffect(() => {
    // Skip profile fetch for public pages or test pages where we might not want to block rendering
    // However, for test page we probably need auth, but maybe we handle it in the page itself.
    // If we are on login/register, definitely don't fetch.
    if (pathname === "/student/login" || pathname === "/student/register" || pathname === "/student/forgot-password") {
       setLoading(false);
       return;
    }

    const fetchProfile = async () => {   
      try {
        const token = localStorage.getItem('token');
        const storedStudent = localStorage.getItem('student');
        
        if (!token) {
          setLoading(false);
          return;
        }

        // First set profile from stored data to avoid loading state
        if (storedStudent) {
            const studentData = JSON.parse(storedStudent);
            setProfile({
              name: studentData.name,
              className: studentData.className,
              profilePicture: studentData.profilePicture
            });
        }

        // Then fetch fresh data from server
        const response = await fetch(`${API_BASE_URL}/student/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile({
            name: data.name,
            className: data.className,
            profilePicture: data.profilePicture
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [pathname]);

  // For public pages or test taking page, render children without layout
  if (isPublicOrTestPage) {
     return <>{children}</>;
  }

  // If loading and no profile, show loading state (only for protected pages)
  if (loading && !profile) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-medium">Loading...</div>;
  }

  // If no profile after loading (and not public), show error/redirect
  // But strictly, we might want to redirect to login here if token is missing.
  if (!loading && !profile) {
     // Optional: Redirect to login
     // router.push('/student/login');
     return <div className="p-8 text-center">Please log in to access this page.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-700 drop-shadow" />
            <span className="font-semibold text-xl tracking-wide hidden sm:inline">
              <span className="text-green-600">JMIT</span>
              <span className="text-blue-500"> Online Aptitude Test System</span>
            </span>
            <span className="font-semibold text-xl tracking-wide sm:hidden">
              <span className="text-green-600">JMIT</span>
              <span className="text-blue-500"> OATS</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-gray-100 transition-transform hover:scale-105 cursor-pointer">
                <AvatarImage 
                  src={profile?.profilePicture ? `${API_BASE_URL.replace('/api', '')}${profile.profilePicture}` : ""} 
                  alt="Student" 
                />
                <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-700 leading-none">{profile?.name || 'Loading...'}</p>
                <p className="text-xs text-gray-500 mt-1">{profile?.className || 'Loading...'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Navigation Bar - Enhanced White 3D Style */}
        {pathname !== "/student/forgot-password" && (
          <nav className="flex w-full bg-white border-t border-gray-100 overflow-x-auto no-scrollbar shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] relative z-40">
            <div className="container flex items-center p-0 gap-1 sm:gap-4 h-16">
               <NavItem href="/student/dashboard" label="Dashboard" active={pathname === "/student/dashboard"} />
               <NavItem href="/student/profile" label="Profile" active={pathname === "/student/profile"} />
               <NavItem href="/student/tests" label="Available Tests" active={pathname === "/student/tests"} />
               <NavItem href="/student/results" label="Results" active={pathname === "/student/results"} />
               <div className="ml-auto flex items-center pr-2">
                  <Link href="/">
                    <button className="group px-5 py-2 text-sm font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-100 hover:border-red-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center hover:-translate-y-0.5 active:translate-y-0">
                       <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                       <span className="hidden sm:inline">Logout</span>
                    </button>
                  </Link>
               </div>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 bg-gray-50/50">{children}</main>
      </div>
    </div>
  )
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`
      relative group flex items-center justify-center px-4 sm:px-6 h-full text-sm sm:text-base font-bold text-center transition-all duration-300 cursor-pointer whitespace-nowrap select-none
      ${active 
        ? "text-blue-600" 
        : "text-gray-500 hover:text-blue-600"
      }
    `}>
      <span className={`relative z-10 transition-transform duration-300 ${active ? "scale-105" : "group-hover:scale-105"}`}>{label}</span>
      
      {/* Active Indicator - Modern 3D Underline with Glow */}
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg shadow-[0_-2px_8px_rgba(59,130,246,0.5)] animate-in fade-in zoom-in duration-300" />
      )}
      
      {/* Subtle Hover Background Effect */}
      {!active && (
         <span className="absolute inset-x-2 bottom-2 top-2 bg-gray-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 -z-10 shadow-inner" />
      )}
    </Link>
  )
}
