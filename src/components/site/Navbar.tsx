"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, LogIn, LogOut, ShieldCheck, Gauge, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  const handleSignOut = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : "";
    const { error } = await authClient.signOut({
      fetchOptions: { headers: { Authorization: `Bearer ${token}` } },
    });
    if (!error?.code) {
      if (typeof window !== "undefined") localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
    }
  }, [refetch, router]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="https://images.unsplash.com/photo-1553729784-e91953dec042?q=80&w=160&auto=format&fit=crop" alt="Jharkhand Seal" width={32} height={32} className="rounded" />
            <span className="font-semibold tracking-tight">Jharkhand Credential Verifier</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost"><Link href="/verify">Verify</Link></Button>
          <Button asChild variant="ghost"><Link href="/institutions">Institutions</Link></Button>
          <Button asChild variant="ghost"><Link href="/admin">Admin</Link></Button>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="hidden lg:block">
            <Input placeholder="Search certificate ID / QR hash" className="w-80" />
          </div>
          {!isPending && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Avatar className="h-6 w-6"><AvatarFallback>{session.user.name?.slice(0,2).toUpperCase() || "U"}</AvatarFallback></Avatar>
                  <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/verify" className="flex items-center gap-2"><ShieldCheck size={16}/>Verify</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2"><Gauge size={16}/>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/institutions" className="flex items-center gap-2"><Building2 size={16}/>Institutions</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive"><LogOut size={16}/> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost"><Link href="/login" className="gap-2"><LogIn size={16}/> Login</Link></Button>
              <Button asChild><Link href="/register">Register</Link></Button>
            </div>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-4">
            <div className="pt-8 flex flex-col gap-2">
              <Button asChild variant="ghost"><Link href="/verify">Verify</Link></Button>
              <Button asChild variant="ghost"><Link href="/institutions">Institutions</Link></Button>
              <Button asChild variant="ghost"><Link href="/admin">Admin</Link></Button>
            </div>
            <div className="mt-auto">
              {!isPending && session?.user ? (
                <Button onClick={handleSignOut} variant="destructive" className="w-full"><LogOut className="mr-2 h-4 w-4"/> Sign out</Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="w-full"><Link href="/login"><LogIn className="mr-2 h-4 w-4"/> Login</Link></Button>
                  <Button asChild className="w-full"><Link href="/register">Register</Link></Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}