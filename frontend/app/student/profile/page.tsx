"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface StudentProfileData {
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  className: string;
  department: string;
  year: number | string;
  section?: string;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [editSection, setEditSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      setError("");
      try {
        const storedStudent = localStorage.getItem("student");
        if (storedStudent) {
          try {
            const s = JSON.parse(storedStudent);
            setProfile({
              name: s.name || "",
              rollNo: s.rollNo || s.rollNumber || "",
              email: s.email || "",
              phone: s.phone || "",
              className: s.className || "",
              department: s.department || "",
              year: typeof s.year === "number" ? s.year : (s.year || ""),
              section: s.section || "",
            });
          } catch {}
        }

        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/student/profile", {
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
            section: data.section || "",
          });
        } else if (!storedStudent) {
          setError("Failed to fetch profile");
        }
      } catch (e) {
        if (!profile) setError("Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !profile) {
    return <div className="p-8">Loading...</div>;
  }
  if (error && !profile) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const initial = (profile?.name || "S").charAt(0);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const handleSave = async (section: string) => {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch("http://localhost:5000/api/student/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        });
        if (!res.ok) throw new Error("Failed to save profile");
        const data = await res.json().catch(() => null);
        if (data && typeof data === "object") {
          setProfile({
            name: data.name ?? profile.name,
            rollNo: data.rollNo ?? data.rollNumber ?? profile.rollNo,
            email: data.email ?? profile.email,
            phone: data.phone ?? profile.phone,
            className: data.className ?? profile.className,
            department: data.department ?? profile.department,
            year: typeof data.year === "number" ? data.year : (data.year ?? profile.year),
            section: data.section ?? profile.section,
          });
        }
      }
      try {
        const s = JSON.parse(localStorage.getItem("student") || "{}");
        const merged = { ...s, ...profile };
        localStorage.setItem("student", JSON.stringify(merged));
      } catch {}
      setEditSection(null);
    } catch (e: any) {
      setError(e?.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-5xl mx-auto p-4 md:p-10">
        <h2 className="text-3xl font-bold mb-8">My Profile</h2>

        <TiltCard className="mb-8 relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-200/60 to-indigo-200/40 blur-2xl" />
          <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-pink-200/60 to-purple-200/40 blur-2xl" />
          <CardContent className="relative z-10 p-8 flex items-center gap-8">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-white/70 shadow-xl">
                <AvatarImage src={"/placeholder.svg?height=96&width=96"} alt="Student" />
                <AvatarFallback className="text-3xl">{initial}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white shadow-lg grid place-items-center text-blue-600 font-bold">{initial}</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold tracking-tight">{profile?.name || "Student"}</div>
              <div className="mt-1 text-gray-700 font-medium">{profile?.className}</div>
              {profile?.department && (
                <div className="mt-0.5 text-gray-500">{profile.department}</div>
              )}
            </div>
          </CardContent>
        </TiltCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TiltCard className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl">
          <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-xl">Personal Information</div>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={() => setEditSection("personal")}>Edit</Button>
              </div>
              <div className="space-y-4">
                {editSection === "personal" ? (
                  <div className="grid grid-cols-1 gap-4">
                    <InputRow name="name" label="Full Name" value={profile?.name || ""} onChange={handleChange} />
                    <InputRow name="rollNo" label="Roll Number" value={profile?.rollNo || ""} onChange={handleChange} />
                    <InputRow name="email" label="Email" value={profile?.email || ""} onChange={handleChange} />
                    <InputRow name="phone" label="Phone" value={profile?.phone || ""} onChange={handleChange} />
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" disabled={saving} onClick={() => handleSave("personal")} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditSection(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Field label="Full Name" value={profile?.name} />
                    <Field label="Roll Number" value={profile?.rollNo} />
                    <Field label="Email" value={profile?.email} />
                    <Field label="Phone" value={profile?.phone} />
                  </>
                )}
              </div>
            </div>
          </TiltCard>

          <TiltCard className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-xl">Academic Details</div>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={() => setEditSection("academic")}>Edit</Button>
              </div>
              <div className="space-y-4">
                {editSection === "academic" ? (
                  <div className="grid grid-cols-1 gap-4">
                    <InputRow name="className" label="Class" value={profile?.className || ""} onChange={handleChange} />
                    <InputRow name="department" label="Department" value={profile?.department || ""} onChange={handleChange} />
                    <InputRow name="year" label="Year" value={profile ? String(profile.year) : ""} onChange={handleChange} />
                    <InputRow name="section" label="Section" value={profile?.section || ""} onChange={handleChange} />
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" disabled={saving} onClick={() => handleSave("academic")} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditSection(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Field label="Class" value={profile?.className} />
                    <Field label="Department" value={profile?.department} />
                    <Field label="Year" value={profile ? String(profile.year) : ""} />
                    {profile?.section ? <Field label="Section" value={profile.section} /> : null}
                  </>
                )}
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-semibold text-lg tracking-wide">{value || "-"}</div>
    </div>
  );
}

function InputRow({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <input name={name} value={value} onChange={onChange} className="border rounded px-3 py-2 w-full text-lg" />
    </div>
  )
}

function TiltCard({ className, children }: { className?: string; children: React.ReactNode }) {
  const [style, setStyle] = React.useState<any>({})
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rX = (0.5 - y) * 6
    const rY = (x - 0.5) * 6
    setStyle({ transform: `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg)` })
  }
  const handleLeave = () => setStyle({ transform: `perspective(1000px) rotateX(0deg) rotateY(0deg)` })
  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={style}
      className={`transition-transform duration-300 will-change-transform ${className || ""}`}
    >
      {children}
    </div>
  )
}
