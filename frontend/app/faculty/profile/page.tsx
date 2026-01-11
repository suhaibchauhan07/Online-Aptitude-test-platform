"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import API_BASE_URL from "@/app/config/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";

interface ProfileData {
  profilePicture?: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  gender?: string;
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

export default function FacultyProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    profilePicture: "",
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editSection, setEditSection] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  // Move fetchProfile here
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/faculty/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setProfile({
        profilePicture: data.profilePicture || "",
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || (data.city && data.country ? `${data.city}, ${data.country}` : ""),
        gender: data.gender || "",
      });
    } catch (err: any) {
      setError(err.message || "Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("profilePicture", file);
    setUploading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/faculty/profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload profile picture");
      const data = await response.json();
      setProfile((prev) => ({ ...prev, profilePicture: data.profilePicture }));
    } catch (err: any) {
      setError(err.message || "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (section: string) => {
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/faculty/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error("Failed to save profile");
      setEditSection(null);
      // Now this works!
      await fetchProfile();
    } catch (err: any) {
      setError(err.message || "Error saving profile");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg("New passwords do not match.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/faculty/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to change password");
      setPasswordMsg("Password updated successfully!");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordMsg(err.message || "Error changing password");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <style jsx global>{`
        @keyframes floatSlow { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.6 } 50% { opacity: 1 } }
      `}</style>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10">My Profile</h2>
      <TiltCard
        className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-6 md:mb-10"
        onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
          if (window.innerWidth < 768) return; // Disable tilt on mobile
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width - 0.5
          const y = (e.clientY - rect.top) / rect.height - 0.5
          setParallax({ x, y })
        }}
        onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      >
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-200/60 to-indigo-200/40 blur-2xl hidden md:block" style={{ transform: `translate3d(${parallax.x * 18}px, ${parallax.y * -12}px, 0)` }} />
        <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-pink-200/60 to-purple-200/40 blur-2xl hidden md:block" style={{ transform: `translate3d(${parallax.x * -20}px, ${parallax.y * 14}px, 0)` }} />
        
        <div className="relative">
          <Avatar className="h-24 w-24 md:h-28 md:w-28 ring-4 ring-white/70 shadow-xl">
            <AvatarImage 
              src={profile.profilePicture ? `${API_BASE_URL.replace('/api', '')}${profile.profilePicture}` : "/default-profile.png"} 
              alt="Profile" 
            />
            <AvatarFallback className="text-2xl sm:text-3xl">{profile.name?.charAt(0) || "F"}</AvatarFallback>
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
        <div className="flex-1 text-center md:text-left w-full">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-gray-900 break-words">{profile.name}</div>
          <div className="text-gray-500 text-sm md:text-base break-all">{profile.email}</div>
        </div>
      </TiltCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <TiltCard className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-md">
          <div className="text-xs text-emerald-700">Email</div>
          <div className="text-sm font-semibold text-emerald-900 truncate" title={profile.email}>{profile.email || "-"}</div>
        </TiltCard>
        <TiltCard className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 shadow-md">
          <div className="text-xs text-amber-700">Phone</div>
          <div className="text-sm font-semibold text-amber-900 truncate">{profile.phone || "-"}</div>
        </TiltCard>
         <TiltCard className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 shadow-md">
          <div className="text-xs text-purple-700">Location</div>
          <div className="text-sm font-semibold text-purple-900 truncate">{profile.location || "-"}</div>
        </TiltCard>
        <TiltCard className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 shadow-md">
          <div className="text-xs text-blue-700">Gender</div>
          <div className="text-sm font-semibold text-blue-900 truncate">{profile.gender || "-"}</div>
        </TiltCard>
      </div>

      {/* Personal Information Card */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 mb-10">
        <TiltCard className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-5 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="font-semibold text-lg md:text-xl">Personal Information</div>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg active:scale-95" onClick={() => setEditSection("personal")}>Edit <Pencil className="h-3 w-3 md:h-4 md:w-4 ml-1" /></Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1 md:col-span-2">
              <div className="text-xs text-gray-400 mb-1">Full Name</div>
              {editSection === "personal" ? (
                <input name="name" value={profile.name} onChange={handleChange} className="border rounded px-3 py-2 w-full text-base md:text-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              ) : (
                <div className="font-semibold text-base md:text-lg break-words">{profile.name}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Email address</div>
              {editSection === "personal" ? (
                <input name="email" value={profile.email} onChange={handleChange} className="border rounded px-3 py-2 w-full text-base md:text-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              ) : (
                <div className="font-semibold text-base md:text-lg break-all">{profile.email}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Phone</div>
              {editSection === "personal" ? (
                <input name="phone" value={profile.phone} onChange={handleChange} className="border rounded px-3 py-2 w-full text-base md:text-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              ) : (
                <div className="font-semibold text-base md:text-lg">{profile.phone}</div>
              )}
            </div>
          </div>
          {editSection === "personal" && (
            <div className="mt-6 flex gap-2">
              <Button size="sm" onClick={() => handleSave("personal")}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditSection(null)}>Cancel</Button>
            </div>
          )}
        </TiltCard>
      </div>

      {/* Password Change Card (full width) */}
      <TiltCard className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-5 sm:p-8 mb-10">
        <div className="flex justify-between items-center mb-6">
          <div className="font-semibold text-lg md:text-xl">Change Password</div>
        </div>
        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <input
            name="oldPassword"
            type="password"
            value={passwords.oldPassword}
            onChange={handlePasswordChange}
            placeholder="Old password"
            className="border rounded px-3 py-3 text-base md:text-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            name="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            placeholder="New password"
            className="border rounded px-3 py-3 text-base md:text-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            name="confirmPassword"
            type="password"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Confirm new password"
            className="border rounded px-3 py-3 text-base md:text-lg col-span-1 md:col-span-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-2 mt-2 items-start sm:items-center">
            <Button type="submit" size="sm" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg active:scale-95">Change Password</Button>
            {passwordMsg && (
              <span className={`text-sm ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-600'} mt-2 sm:mt-0`}>
                {passwordMsg}
              </span>
            )}
          </div>
        </form>
      </TiltCard>
    </div>
  );
} 
