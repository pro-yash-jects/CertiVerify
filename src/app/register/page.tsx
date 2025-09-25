"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await authClient.signUp.email({
      email: form.email,
      name: form.name,
      password: form.password,
    });

    if (error?.code) {
      const map: Record<string, string> = {
        USER_ALREADY_EXISTS: "Email already registered",
      };
      toast.error(map[error.code] || "Registration failed");
      setLoading(false);
      return;
    }

    toast.success("Account created! Please login.");
    router.push("/login?registered=true");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Register to access verification tools and dashboards.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" type="text" required value={form.name} onChange={(e)=>setForm(v=>({...v, name: e.target.value}))} autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e)=>setForm(v=>({...v, email: e.target.value}))} autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={form.password} onChange={(e)=>setForm(v=>({...v, password: e.target.value}))} autoComplete="off" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" required value={form.confirm} onChange={(e)=>setForm(v=>({...v, confirm: e.target.value}))} autoComplete="off" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account..." : "Create account"}</Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="underline">Login</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}