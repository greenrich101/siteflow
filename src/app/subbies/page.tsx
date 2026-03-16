"use client";

import { useEffect, useState, useCallback } from "react";
import { format, isPast, isBefore, addDays } from "date-fns";
import { Star, Plus, HardHat, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TRADES = [
  "electrician",
  "plumber",
  "plasterer",
  "painter",
  "tiler",
  "joiner",
  "flooring",
  "demolition",
  "ac",
  "fire",
  "other",
] as const;

const TRADE_LABELS: Record<string, string> = {
  electrician: "Electrician",
  plumber: "Plumber",
  plasterer: "Plasterer",
  painter: "Painter",
  tiler: "Tiler",
  joiner: "Joiner",
  flooring: "Flooring",
  demolition: "Demolition",
  ac: "A/C",
  fire: "Fire",
  other: "Other",
};

interface JobSubbie {
  id: string;
  jobId: string;
  job: {
    id: string;
    jobNumber: string;
    clientName: string;
  };
}

interface Subcontractor {
  id: string;
  trade: string;
  companyName: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  abn: string | null;
  insuranceExpiry: string | null;
  rateBasis: string | null;
  rating: number | null;
  notes: string | null;
  createdAt: string;
  jobSubbies: JobSubbie[];
}

interface SubFormData {
  trade: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  abn: string;
  insuranceExpiry: string;
  rateBasis: string;
  rating: number;
  notes: string;
}

const emptyForm: SubFormData = {
  trade: "electrician",
  companyName: "",
  contactName: "",
  phone: "",
  email: "",
  abn: "",
  insuranceExpiry: "",
  rateBasis: "",
  rating: 3,
  notes: "",
};

function StarRating({ rating }: { rating: number | null }) {
  const r = rating ?? 0;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-4 ${
            i <= r
              ? "fill-amber-400 text-amber-400"
              : "fill-none text-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  );
}

function insuranceClass(expiry: string | null): string {
  if (!expiry) return "";
  const d = new Date(expiry);
  const today = new Date();
  if (isPast(d)) return "bg-red-100 dark:bg-red-950/40 text-red-900 dark:text-red-300";
  if (isBefore(d, addDays(today, 30)))
    return "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300";
  return "";
}

export default function SubbiesPage() {
  const [subs, setSubs] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradeFilter, setTradeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcontractor | null>(null);
  const [form, setForm] = useState<SubFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchSubs = useCallback(async () => {
    try {
      const res = await fetch("/api/subbies");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSubs(data);
    } catch {
      toast.error("Failed to load subcontractors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  const filtered =
    tradeFilter === "all"
      ? subs
      : subs.filter((s) => s.trade === tradeFilter);

  function openAdd() {
    setEditingSub(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(sub: Subcontractor) {
    setEditingSub(sub);
    setForm({
      trade: sub.trade,
      companyName: sub.companyName,
      contactName: sub.contactName ?? "",
      phone: sub.phone ?? "",
      email: sub.email ?? "",
      abn: sub.abn ?? "",
      insuranceExpiry: sub.insuranceExpiry
        ? format(new Date(sub.insuranceExpiry), "yyyy-MM-dd")
        : "",
      rateBasis: sub.rateBasis ?? "",
      rating: sub.rating ?? 3,
      notes: sub.notes ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        insuranceExpiry: form.insuranceExpiry || null,
        rating: Number(form.rating),
      };

      if (editingSub) {
        const res = await fetch(`/api/subbies/${editingSub.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Subcontractor updated");
      } else {
        const res = await fetch("/api/subbies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("Subcontractor added");
      }

      setDialogOpen(false);
      fetchSubs();
    } catch {
      toast.error("Failed to save subcontractor");
    } finally {
      setSaving(false);
    }
  }

  function updateForm(field: keyof SubFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-700 text-white">
              <HardHat className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Subcontractor Register
              </h1>
              <p className="text-sm text-muted-foreground">
                {subs.length} subcontractor{subs.length !== 1 ? "s" : ""} on
                file
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by trade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                {TRADES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TRADE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                window.open("/api/export?type=subbies", "_blank");
                toast.success("Exporting subbies to Excel...");
              }}
            >
              <Download className="size-4" data-icon="inline-start" />
              Export Excel
            </Button>
            <Button onClick={openAdd}>
              <Plus className="size-4" data-icon="inline-start" />
              Add Subcontractor
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-white ring-1 ring-foreground/10 dark:bg-slate-900">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <HardHat className="mb-2 size-8 opacity-40" />
              <p>No subcontractors found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Trade</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Email</TableHead>
                  <TableHead>Insurance Expiry</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="hidden xl:table-cell">Notes</TableHead>
                  <TableHead className="hidden lg:table-cell">Jobs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub) => (
                  <TableRow
                    key={sub.id}
                    className="cursor-pointer"
                    onClick={() => openEdit(sub)}
                  >
                    <TableCell>
                      <Badge variant="secondary">
                        {TRADE_LABELS[sub.trade] ?? sub.trade}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {sub.companyName}
                    </TableCell>
                    <TableCell>{sub.contactName ?? "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {sub.phone ?? "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {sub.email ?? "-"}
                    </TableCell>
                    <TableCell>
                      {sub.insuranceExpiry ? (
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${insuranceClass(sub.insuranceExpiry)}`}
                        >
                          {format(new Date(sub.insuranceExpiry), "dd MMM yyyy")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StarRating rating={sub.rating} />
                    </TableCell>
                    <TableCell className="hidden xl:table-cell max-w-[200px] truncate">
                      {sub.notes ?? "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {sub.jobSubbies.length === 0 ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          sub.jobSubbies.map((js) => (
                            <Badge
                              key={js.id}
                              variant="outline"
                              className="text-[10px]"
                            >
                              {js.job.jobNumber}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSub ? "Edit Subcontractor" : "Add Subcontractor"}
            </DialogTitle>
            <DialogDescription>
              {editingSub
                ? "Update the subcontractor details below."
                : "Fill in the details for the new subcontractor."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Trade */}
            <div className="grid gap-2">
              <Label htmlFor="trade">Trade</Label>
              <Select
                value={form.trade}
                onValueChange={(v) => updateForm("trade", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRADES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TRADE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company Name */}
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => updateForm("companyName", e.target.value)}
                placeholder="e.g. Smith Electrical Pty Ltd"
              />
            </div>

            {/* Contact + Phone row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={(e) => updateForm("contactName", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
              />
            </div>

            {/* ABN */}
            <div className="grid gap-2">
              <Label htmlFor="abn">ABN</Label>
              <Input
                id="abn"
                value={form.abn}
                onChange={(e) => updateForm("abn", e.target.value)}
                placeholder="e.g. 12 345 678 901"
              />
            </div>

            {/* Insurance Expiry + Rate Basis */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                <Input
                  id="insuranceExpiry"
                  type="date"
                  value={form.insuranceExpiry}
                  onChange={(e) =>
                    updateForm("insuranceExpiry", e.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rateBasis">Rate Basis</Label>
                <Input
                  id="rateBasis"
                  value={form.rateBasis}
                  onChange={(e) => updateForm("rateBasis", e.target.value)}
                  placeholder="e.g. $85/hr or quote"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={String(form.rating)}
                onValueChange={(v) => updateForm("rating", Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r} Star{r !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => updateForm("notes", e.target.value)}
                placeholder="Any additional info..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingSub ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
