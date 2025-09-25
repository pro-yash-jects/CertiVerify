"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", rememberMe: true });

  const registered = search.get("registered");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const { error, data } = await authClient.signIn.email({
      email: form.email,
      password: form.password,
      rememberMe: form.rememberMe,
      callbackURL: "/admin",
    });

    if (error?.code) {
      toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
      setLoading(false);
      return;
    }

    if (data?.user) {
      toast.success("Logged in successfully");
    }
    // Redirect to callbackURL (admin) or optional redirect param
    const redirect = search.get("redirect");
    router.push(redirect || "/admin");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Access your dashboard and verification tools.</CardDescription>
          </CardHeader>
          <CardContent>
            {registered && (
              <div className="mb-4 text-sm text-green-600">Account created! Please login.</div>
            )}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e)=>setForm(v=>({...v, email: e.target.value}))} autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={form.password} onChange={(e)=>setForm(v=>({...v, password: e.target.value}))} autoComplete="off" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={form.rememberMe} onCheckedChange={(c)=> setForm(v=>({...v, rememberMe: Boolean(c)}))} />
                <Label htmlFor="remember">Remember me</Label>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              Don\'t have an account? <Link href="/register" className="underline">Register</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}