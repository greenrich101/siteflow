"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TRADES = [
  "Electrician", "Plumber", "Plasterer", "Painter", "Tiler",
  "Joiner", "Flooring", "Demolition", "AC", "Fire", "Other",
];

export default function SubbieIntakePage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    trade: "",
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    abn: "",
    insuranceExpiry: "",
    rateBasis: "",
    notes: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.trade || !form.companyName || !form.contactName || !form.phone) {
      toast.error("Please fill in trade, company name, contact name, and phone.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (form.insuranceExpiry) payload.insuranceExpiry = new Date(form.insuranceExpiry).toISOString();
      else delete payload.insuranceExpiry;

      const res = await fetch("/api/subbies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-slate-800">Thanks, you&apos;re registered!</h2>
            <p className="text-slate-500">
              We&apos;ve got your details and will be in touch when we have work that suits your trade.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Building2 className="h-7 w-7 text-slate-700" />
            <span className="text-2xl font-bold tracking-tight text-slate-800">SiteFlow</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-700">Subcontractor Registration</h1>
          <p className="text-sm text-slate-500">
            Fill in your details below so we can add you to our subbie register.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
            <CardDescription>Fields marked with * are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Trade */}
              <div className="space-y-1.5">
                <Label htmlFor="trade">Trade *</Label>
                <select
                  id="trade"
                  value={form.trade}
                  onChange={(e) => update("trade", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select your trade</option>
                  {TRADES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="e.g. Spark Electric Pty Ltd"
                />
              </div>

              {/* Contact Name */}
              <div className="space-y-1.5">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={(e) => update("contactName", e.target.value)}
                  placeholder="e.g. Dave Nguyen"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="e.g. 0411 222 333"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="e.g. dave@sparkelectric.com.au"
                />
              </div>

              {/* ABN */}
              <div className="space-y-1.5">
                <Label htmlFor="abn">ABN</Label>
                <Input
                  id="abn"
                  value={form.abn}
                  onChange={(e) => update("abn", e.target.value)}
                  placeholder="e.g. 12 345 678 901"
                />
              </div>

              {/* Insurance Expiry */}
              <div className="space-y-1.5">
                <Label htmlFor="insuranceExpiry">Insurance Expiry Date</Label>
                <Input
                  id="insuranceExpiry"
                  type="date"
                  value={form.insuranceExpiry}
                  onChange={(e) => update("insuranceExpiry", e.target.value)}
                />
              </div>

              {/* Rate Basis */}
              <div className="space-y-1.5">
                <Label htmlFor="rateBasis">Rate / Pricing Basis</Label>
                <Input
                  id="rateBasis"
                  value={form.rateBasis}
                  onChange={(e) => update("rateBasis", e.target.value)}
                  placeholder="e.g. $95/hr + GST, or Fixed quote"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Anything else we should know?</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Availability, specialisations, areas you cover, etc."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Powered by SiteFlow
        </p>
      </div>
    </div>
  );
}
