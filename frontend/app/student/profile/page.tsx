"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import API_BASE_URL from "@/app/config/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface StudentProfileData {
  profilePicture?: string;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  className: string;
  department: string;
  year: number | string;
}

interface TiltProps extends React.HTMLAttributes<HTMLDivElement> { className?: string; children: React.ReactNode }
function TiltCard({ className, children, ...rest }: TiltProps) {
  const [style, setStyle] = React.useState<any>({})
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rest.onMouseMove) rest.onMouseMove(e);
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rX = (0.5 - y) * 6
    const rY = (x - 0.5) * 6
    setStyle({ transform: `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg)` })
  }
  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rest.onMouseLeave) rest.onMouseLeave(e);
    setStyle({ transform: `perspective(1000px) rotateX(0deg) rotateY(0deg)` })
  }
  return (
    <div
      {...rest}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={style}
      className={`transition-transform duration-300 will-change-transform ${className || ""}`}
    >
      {children}
    </div>
  )
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [editSection, setEditSection] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const fetchProfile = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || "",
          rollNo: data.rollNo || data.rollNumber || "",
          email: data.email || "",
          phone: data.phone || "",
          className: data.className || "",
          department: data.department || "",
          year: typeof data.year === "number" ? data.year : (data.year || ""),
          profilePicture: data.profilePicture || "",
        });
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (e: any) {
      setError(e.message || "Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("profilePicture", file);
    setUploading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_BASE_URL}/student/profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload profile picture");
      const data = await response.json();
      setProfile((prev) => prev ? ({ ...prev, profilePicture: data.profilePicture }) : null);
    } catch (err: any) {
      setError(err.message || "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setError("");

    const normalizePhone = (p: string) => {
      const cleaned = p.replace(/\D/g, "");
      if (cleaned.length === 10) return `+91${cleaned}`;
      if (cleaned.length === 12 && cleaned.startsWith("91")) return `+${cleaned}`;
      return p;
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      // Prepare payload with trimmed values and normalized phone
      const payload = {
        ...profile,
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: normalizePhone(profile.phone),
        className: profile.className.trim(),
        department: profile.department.trim(), // Keeping department as requested for Student
        year: Number(profile.year),
      };

      const res = await fetch(`${API_BASE_URL}/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save profile");
      }

      // Re-fetch to ensure we show the latest server state
      await fetchProfile();
      setEditSection(null);
    } catch (e: any) {
      setError(e?.message || "Error saving profile");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error && !profile) return <div className="p-8 text-red-500">{error}</div>;

  const initial = (profile?.name || "S").charAt(0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <style jsx global>{`
        @keyframes floatSlow { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.6 } 50% { opacity: 1 } }
      `}</style>
      <h2 className="text-3xl font-bold mb-10">My Profile</h2>

      <TiltCard
        className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row items-center gap-8 mb-10"
        onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
          if (window.innerWidth < 768) return;
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width - 0.5
          const y = (e.clientY - rect.top) / rect.height - 0.5
          setParallax({ x, y })
        }}
        onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      >
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-200/60 to-indigo-200/40 blur-2xl" style={{ transform: `translate3d(${parallax.x * 18}px, ${parallax.y * -12}px, 0)` }} />
        <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-pink-200/60 to-purple-200/40 blur-2xl" style={{ transform: `translate3d(${parallax.x * -20}px, ${parallax.y * 14}px, 0)` }} />
        
        <div className="relative">
          <Avatar className="h-28 w-28 ring-4 ring-white/70 shadow-xl">
            <AvatarImage 
              src={profile?.profilePicture ? `${API_BASE_URL.replace('/api', '')}${profile.profilePicture}` : ""} 
              alt="Student" 
            />
            <AvatarFallback className="text-2xl sm:text-3xl">{initial}</AvatarFallback>
          </Avatar>
          <input
            type="file"
            accept="image/*"
            id="profile-upload"
            className="hidden"
            onChange={handleImageChange}
            disabled={uploading}
          />
          <label htmlFor="profile-upload" className="absolute bottom-2 right-2 cursor-pointer bg-white rounded-full p-2 shadow hover:bg-gray-50 transition-colors">
            <Pencil className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
          </label>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-gray-900">{profile?.name}</div>
          <div className="text-lg text-gray-600 font-medium">{profile?.rollNo}</div>
          {profile?.department && <div className="text-gray-500">{profile.department}</div>}
        </div>
      </TiltCard>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <TiltCard className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-md">
          <div className="text-xs text-emerald-700">Class</div>
          <div className="text-sm font-semibold text-emerald-900 truncate">{profile?.className || "-"}</div>
        </TiltCard>
        <TiltCard className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 shadow-md">
          <div className="text-xs text-amber-700">Year</div> 
          <div className="text-sm font-semibold text-blue-900">{profile?.year || "-"}</div>
        </TiltCard>
        <TiltCard className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 shadow-md">
          <div className="text-xs text-purple-700">Department</div>
          <div className="text-sm font-semibold text-purple-900 truncate">{profile?.department || "-"}</div>
        </TiltCard>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 mb-10">
        <TiltCard className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="font-semibold text-xl">Personal & Academic Info</div>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg active:scale-95" onClick={() => setEditSection("all")}>Edit <Pencil className="h-4 w-4 ml-1" /></Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1 md:col-span-2">
              <div className="text-xs text-gray-400">Full Name</div>
              {editSection === "all" ? (
                <input name="name" value={profile?.name || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile?.name}</div>
              )}
            </div>
            
            <div>
              <div className="text-xs text-gray-400">Email</div>
              {editSection === "all" ? (
                <input name="email" value={profile?.email || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile?.email}</div>
              )}
            </div>

            <div>
              <div className="text-xs text-gray-400">Phone</div>
              {editSection === "all" ? (
                <input name="phone" value={profile?.phone || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile?.phone}</div>
              )}
            </div>

            <div>
              <div className="text-xs text-gray-400">Class</div>
              {editSection === "all" ? (
                <input name="className" value={profile?.className || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile?.className}</div>
              )}
            </div>

            <div>
              <div className="text-xs text-gray-400">Department</div>
              {editSection === "all" ? (
                <input name="department" value={profile?.department || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile?.department}</div>
              )}
            </div>

            <div>
              <div className="text-xs text-gray-400">Year</div>
              {editSection === "all" ? (
                <input name="year" type="number" value={profile?.year || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full text-lg" />
              ) : (
                <div className="font-semibold text-lg">{profile?.year}</div>
              )}
            </div>
          </div>

          {editSection === "all" && (
            <div className="mt-6 flex gap-2">
              <Button size="sm" onClick={() => handleSave()}>Save Changes</Button>
              <Button size="sm" variant="outline" onClick={() => setEditSection(null)}>Cancel</Button>
            </div>
          )}
        </TiltCard>
      </div>
    </div>
  );
}
