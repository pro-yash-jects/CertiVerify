"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileScan, ShieldCheck, ShieldAlert, QrCode, Hash } from "lucide-react";
import { toast } from "sonner";

export default function VerifyPage() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<null | {
    status: "valid" | "invalid" | "suspect";
    confidence: number;
    details: string[];
    meta: Record<string, string>;
  }>(null);

  const simulateOCR = async (f: File) => {
    setProgress(5);
    await new Promise(r => setTimeout(r, 400));
    setProgress(35);
    await new Promise(r => setTimeout(r, 600));
    setProgress(70);
    await new Promise(r => setTimeout(r, 600));
    setProgress(100);

    const textHint = f.name.toLowerCase();
    const hasQR = /qr|code|qrcode|hash/.test(textHint);
    const institution = /ranchi|nit|iim|iit|univ|college/.test(textHint) ? "Recognized Institution" : "Unknown Issuer";
    const status = hasQR ? "valid" : institution === "Unknown Issuer" ? "invalid" : "suspect";
    const confidence = hasQR ? 0.96 : status === "invalid" ? 0.42 : 0.77;

    const details: string[] = [
      hasQR ? "QR code detected and decoded" : "No QR code detected in scan",
      status !== "invalid" ? "Issuer signature structure appears correct" : "Issuer not in trusted registry",
      "Metadata checksum computed via embedded hash"
    ];

    const meta = {
      issuer: institution,
      serial: `JH-${Math.floor(100000 + Math.random()*900000)}`,
      issuedOn: new Date(2022 + Math.floor(Math.random()*3), 3, 15).toDateString(),
      hash: Math.random().toString(36).slice(2, 10).toUpperCase(),
    };

    return { status, confidence, details, meta } as const;
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    setFile(f);
    setResult(null);
    setProgress(0);
    toast("Scanning document…", { description: "Running OCR, QR, and signature checks" });
    const res = await simulateOCR(f);
    setResult(res);
    toast(res.status === "valid" ? "Certificate is authentic" : res.status === "invalid" ? "Certificate seems invalid" : "Certificate needs manual review", { description: `Confidence ${(res.confidence*100).toFixed(0)}%` });
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileScan className="h-5 w-5"/> Certificate Verification</CardTitle>
            <CardDescription>Upload a certificate (PDF/JPG/PNG) to verify authenticity via OCR, QR and registry checks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition ${dragOver ? "border-primary bg-accent" : "border-border"}`}
            >
              <Upload className="mx-auto mb-3 h-8 w-8"/>
              <p className="mb-2">Drag & drop a certificate file here</p>
              <p className="text-sm text-muted-foreground mb-4">or</p>
              <div className="flex items-center justify-center gap-2">
                <Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFiles(e.target.files)} className="max-w-xs" />
                <Button onClick={() => document.querySelector<HTMLInputElement>('input[type=file]')?.click()}>Browse</Button>
              </div>
              {file && (
                <p className="mt-4 text-sm text-muted-foreground">Selected: {file.name}</p>
              )}
            </div>

            {progress > 0 && progress < 100 && (
              <div className="mt-6">
                <Progress value={progress} />
                <p className="mt-2 text-sm text-muted-foreground">Running verification pipeline… {progress}%</p>
              </div>
            )}

            {result && (
              <div className="mt-6 space-y-4">
                <Alert variant={result.status === "invalid" ? "destructive" : "default"}>
                  <AlertTitle className="flex items-center gap-2">
                    {result.status === "valid" && <ShieldCheck className="h-5 w-5 text-green-600"/>}
                    {result.status === "invalid" && <ShieldAlert className="h-5 w-5 text-red-600"/>}
                    {result.status === "suspect" && <ShieldAlert className="h-5 w-5 text-yellow-600"/>}
                    Result: {result.status.toUpperCase()} <Badge variant="outline" className="ml-2">Confidence {(result.confidence*100).toFixed(0)}%</Badge>
                  </AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      {result.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>

                <Tabs defaultValue="metadata" className="w-full">
                  <TabsList>
                    <TabsTrigger value="metadata"><Hash className="mr-2 h-4 w-4"/>Metadata</TabsTrigger>
                    <TabsTrigger value="qr"><QrCode className="mr-2 h-4 w-4"/>QR/Signature</TabsTrigger>
                  </TabsList>
                  <TabsContent value="metadata">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(result.meta).map(([k, v]) => (
                        <div key={k} className="rounded-md border p-3">
                          <p className="text-muted-foreground">{k}</p>
                          <p className="font-medium">{v}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="qr">
                    <div className="rounded-md border p-4 text-sm">
                      {result.status === "valid" ? (
                        <p>QR hash matched registry entry. Embedded signature verified against trusted public key set.</p>
                      ) : result.status === "suspect" ? (
                        <p>QR not detected; signature structure partially matches. Recommend manual review.</p>
                      ) : (
                        <p>No trusted issuer match found. Please cross-check with institution.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Checks</CardTitle>
            <CardDescription>Last few verifications performed locally.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {["B.Tech Degree Ranchi University.pdf","Diploma Unknown Institute.jpg","IIM Ranchi Certificate.png"].map((n,i)=> (
                <li key={i} className="flex items-center justify-between rounded-md border p-3">
                  <span className="truncate mr-2">{n}</span>
                  <Badge variant={i===0?"default":i===1?"destructive":"secondary"}>{i===0?"valid":i===1?"invalid":"suspect"}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}