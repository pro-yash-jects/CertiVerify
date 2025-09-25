"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShieldAlert, ShieldCheck, Flag, Building2 } from "lucide-react";

export default function AdminPage() {
  const stats = useMemo(() => ([
    { label: "Total Verifications", value: 18234 },
    { label: "Valid", value: 16780 },
    { label: "Invalid", value: 626 },
    { label: "Under Review", value: 828 },
  ]), []);

  const flagged = useMemo(() => ([
    { id: "JH-102938", name: "Diploma Unknown Institute.jpg", reason: "Issuer not recognized", status: "invalid" },
    { id: "JH-657483", name: "B.Tech RU.pdf", reason: "Hash mismatch", status: "suspect" },
    { id: "JH-998321", name: "MBA IIM Ranchi.pdf", reason: "Multiple attempts", status: "valid" },
  ] as const), []);

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl">{s.value.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flag className="h-5 w-5"/> Flagged Certificates</CardTitle>
            <CardDescription>Items requiring manual review or action.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Recent flagged items</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flagged.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.id}</TableCell>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.reason}</TableCell>
                    <TableCell>
                      <Badge variant={f.status === "invalid" ? "destructive" : f.status === "valid" ? "default" : "secondary"}>
                        {f.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5"/> Institution Management</CardTitle>
            <CardDescription>Connect and manage institution registries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">Select Institution</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ranchi-university">Ranchi University</SelectItem>
                  <SelectItem value="iim-ranchi">IIM Ranchi</SelectItem>
                  <SelectItem value="nit-jamshedpur">NIT Jamshedpur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">Sync Progress</label>
              <Progress value={72} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">72% synced with central credential registry</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2"><ShieldCheck className="h-4 w-4"/> Trust</Button>
              <Button variant="destructive" className="gap-2"><ShieldAlert className="h-4 w-4"/> Revoke</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}