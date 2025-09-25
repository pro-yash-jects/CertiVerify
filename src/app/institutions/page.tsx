"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Server, CloudUpload } from "lucide-react";
import { toast } from "sonner";

export default function InstitutionPortalPage() {
  const [sync, setSync] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const simulateSync = async () => {
    setSync(0);
    for (let i=0;i<=100;i+=10){
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r=>setTimeout(r, 200));
      setSync(i);
    }
    toast("ERP sync completed", { description: "All new credentials registered in the verifier"});
  };

  return (
    <div className="container mx-auto px-4 py-10 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CloudUpload className="h-5 w-5"/> Bulk Upload</CardTitle>
          <CardDescription>Upload CSV/ZIP exports of issued certificates to register them in the state registry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select>
            <SelectTrigger><SelectValue placeholder="Select institution"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="ranchi-university">Ranchi University</SelectItem>
              <SelectItem value="iim-ranchi">IIM Ranchi</SelectItem>
              <SelectItem value="nit-jamshedpur">NIT Jamshedpur</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input type="file" accept=".csv,.zip" onChange={(e)=> setFile(e.target.files?.[0] ?? null)} />
            <Button disabled={!file} className="gap-2" onClick={()=> toast("Uploaded", { description: file?.name })}><Upload className="h-4 w-4"/> Upload</Button>
          </div>
          {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5"/> ERP Integration</CardTitle>
          <CardDescription>Trigger a real-time sync with institution ERP via secure webhook.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Button onClick={simulateSync}>Start Sync</Button>
          </div>
          <Progress value={sync} />
          <p className="text-sm text-muted-foreground">{sync}%</p>
        </CardContent>
      </Card>
    </div>
  );
}