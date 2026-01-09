"use client";

import type React from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { BookOpen, Home, Users, FileText, Settings, User, LogOut, Plus, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CreateTestModal from "@/app/components/CreateTestModal"
import { useState, useEffect } from "react"
import { usePathname } from 'next/navigation'
import API_BASE_URL from "@/app/config/api"

interface FacultyLayoutProps {
  children: ReactNode
}

interface FacultyProfile {
  name: string;
  department: string;
}

export function FacultyLayout({ children }: FacultyLayoutProps) {
  const [isCreateTestModalOpen, setIsCreateTestModalOpen] = useState(false)
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const hideSidebar = pathname === '/faculty/login' || pathname === '/faculty/register' || pathname === '/faculty/forgot-password';
  const hideHeader = pathname === '/faculty/forgot-password';

  useEffect(() => {
    // Skip profile fetch for public pages
    if (pathname === '/faculty/login' || pathname === '/faculty/register' || pathname === '/faculty/forgot-password') {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/faculty/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // If token is invalid or expired, just log it instead of throwing
          console.log('Failed to fetch profile, likely invalid token');
          setProfile(null);
          return;
        }

        const data = await response.json();
        setProfile({
          name: data.name || 'Name not available',
          department: data.department || 'Department not available'
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile({
          name: 'Name not available',
          department: 'Department not available'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {hideHeader ? null : (
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
                  <AvatarImage src="" alt="Faculty" />
                  <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'F'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-semibold text-gray-700">
                  {profile?.name || 'Loading...'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Navigation Bar - Enhanced White 3D Style */}
          {!hideSidebar && (
            <nav className="flex w-full bg-white border-t border-gray-100 overflow-x-auto no-scrollbar shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] relative z-40">
              <div className="container flex items-center p-0 gap-1 sm:gap-4 h-16">
                 <NavItem href="/faculty/dashboard" label="Dashboard" active={pathname === "/faculty/dashboard"} />
                 <NavItem href="/faculty/profile" label="Profile" active={pathname === "/faculty/profile"} />
                 
                 {/* Create Test Action - 3D Button Style */}
                 <button 
                    onClick={() => setIsCreateTestModalOpen(true)}
                    className="relative group flex items-center justify-center px-4 sm:px-6 h-full text-sm sm:text-base font-bold text-center transition-all duration-300 cursor-pointer whitespace-nowrap text-blue-600 hover:text-blue-700"
                 >
                    <span className="flex items-center gap-2 relative z-10 group-hover:scale-105 transition-transform duration-300">
                       <div className="bg-blue-100 p-1.5 rounded-lg shadow-sm group-hover:shadow-md group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                         <Plus className="h-4 w-4" />
                       </div>
                       Create Test
                    </span>
                    {/* Hover Effect */}
                    <span className="absolute inset-x-2 bottom-2 top-2 bg-blue-50/50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 -z-10" />
                 </button>

                 <NavItem href="/faculty/tests" label="Manage Tests" active={pathname === "/faculty/tests"} />
                 <NavItem href="/faculty/student-results" label="Results" active={pathname === "/faculty/student-results"} />
                 
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
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 bg-gray-50/50">{children}</main>
      </div>

      {/* Create Test Modal */}
      <CreateTestModal
        isOpen={isCreateTestModalOpen}
        onClose={() => setIsCreateTestModalOpen(false)}
        onTestCreated={() => {
          // Handle test creation if needed
        }}
      />
    </div>
  )
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} legacyBehavior>
      <a className={`
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
      </a>
    </Link>
  );
}
