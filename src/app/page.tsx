"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileCheck2, ShieldAlert, ShieldCheck, Search } from "lucide-react";

export default function Home() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<null | { state: "valid" | "invalid" | "suspect"; confidence: number; id: string }>(null);

  const simulateQuickVerify = useCallback(async (f: File) => {
    setProgress(10);
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    setProgress(55);
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    setProgress(100);

    const hint = f.name.toLowerCase();
    const good = /qr|hash|secure|verified/.test(hint);
    const bad = /unknown|fake|test/.test(hint);
    const state = good ? "valid" : bad ? "invalid" : "suspect";
    const confidence = state === "valid" ? 0.94 : state === "invalid" ? 0.4 : 0.72;
    setStatus({ state, confidence, id: `CERT-${Math.floor(100000 + Math.random()*900000)}` });
  }, []);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    setFile(f);
    setStatus(null);
    setProgress(0);
    await simulateQuickVerify(f);
  }, [simulateQuickVerify]);

  const recent = [
    { name: "B.Tech Degree - State University.pdf", state: "valid" },
    { name: "Diploma - Unknown Institute.jpg", state: "invalid" },
    { name: "MBA - Business School.pdf", state: "valid" },
    { name: "BSc - College Scan.png", state: "suspect" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px-80px)]">{/* account for navbar/footer height */}
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1600&auto=format&fit=crop"
          alt="Graduation"
          width={1600}
          height={900}
          priority
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="relative container mx-auto px-4 py-16 sm:py-24 grid gap-6 lg:grid-cols-2 items-center">
          <div>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4">
              Certificate Authenticity Verification Platform
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg mb-6">
              Authenticate degrees and certificates issued by higher education institutions using QR, metadata, signatures and registry checks.
            </p>
            <div className="flex gap-3">
              <Button asChild><Link href="/verify">Go to Verifier</Link></Button>
              <Button asChild variant="outline"><Link href="/institutions">Institution Portal</Link></Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4"/> Secure, auditable, privacy-first verification
            </div>
          </div>

          {/* Quick Upload */}
          <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5"/> Quick Check</CardTitle>
              <CardDescription>Drop a certificate to run a fast authenticity screen. For full report, use the Verifier.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition ${dragOver ? "border-primary bg-accent" : "border-border"}`}
              >
                <Search className="mx-auto mb-2 h-6 w-6"/>
                <p className="mb-2">Drag & drop certificate (PDF/JPG/PNG)</p>
                <p className="text-xs text-muted-foreground mb-4">or</p>
                <div className="flex items-center justify-center gap-2">
                  <Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e)=> handleFiles(e.target.files)} className="max-w-xs" />
                  <Button onClick={() => document.querySelector<HTMLInputElement>('input[type=file]')?.click()}>Browse</Button>
                </div>
                {file && <p className="mt-3 text-sm text-muted-foreground truncate">Selected: {file.name}</p>}
              </div>

              {progress > 0 && progress < 100 && (
                <div className="mt-4">
                  <Progress value={progress} />
                  <p className="mt-2 text-xs text-muted-foreground">Running OCR/QR/signature checks… {progress}%</p>
                </div>
              )}

              {status && (
                <div className="mt-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {status.state === "valid" ? <ShieldCheck className="h-5 w-5 text-green-600"/> : status.state === "invalid" ? <ShieldAlert className="h-5 w-5 text-red-600"/> : <FileCheck2 className="h-5 w-5 text-yellow-600"/>}
                      <span className="font-medium">Result</span>
                    </div>
                    <Badge variant={status.state === "invalid" ? "destructive" : status.state === "valid" ? "default" : "secondary"}>
                      {status.state.toUpperCase()} • {(status.confidence*100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Serial: {status.id}</p>
                  <div className="mt-3 flex gap-2">
                    <Button asChild size="sm"><Link href="/verify">View Detailed Report</Link></Button>
                    <Button asChild size="sm" variant="outline"><Link href="/admin">Report Issue</Link></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dashboard */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[{
            label: "Verified Today",
            value: 324,
          },{
            label: "Valid",
            value: 298,
          },{
            label: "Invalid",
            value: 12,
          },{
            label: "Under Review",
            value: 14,
          }].map((s) => (
            <Card key={s.label}>
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-3xl">{s.value.toLocaleString()}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Verifications</CardTitle>
              <CardDescription>Local demo data for illustration.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {recent.map((row, i) => (
                  <li key={i} className="flex items-center justify-between rounded-md border p-3">
                    <span className="truncate mr-2">{row.name}</span>
                    <Badge variant={row.state === "invalid" ? "destructive" : row.state === "valid" ? "default" : "secondary"}>{row.state}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Use the verifier or connect your institution ERP.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full"><Link href="/verify">Open Verifier</Link></Button>
              <Button asChild variant="outline" className="w-full"><Link href="/institutions">Institution Portal</Link></Button>
              <Button asChild variant="ghost" className="w-full"><Link href="/admin">Admin Dashboard</Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}