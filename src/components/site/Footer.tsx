"use client";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground grid gap-2 md:grid-cols-2">
        <p>
          © {new Date().getFullYear()} Government of Jharkhand. All rights reserved.
        </p>
        <p className="md:text-right">
          Compliant with NAD, ABC, DigiLocker, and UGC guidelines. For assistance, contact support@jh-verify.gov.in
        </p>
      </div>
    </footer>
  );
}