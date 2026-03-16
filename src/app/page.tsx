"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Building2, Plus, DollarSign, Calendar, Briefcase, FileText, Download } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Job {
  id: string;
  jobNumber: string;
  clientName: string;
  siteAddress: string;
  phone: string | null;
  email: string | null;
  phase: string;
  quoteAmount: number | null;
  quoteSentDate: string | null;
  contractSigned: string | null;
  startDate: string | null;
  targetEndDate: string | null;
  percentComplete: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  progressClaims: { status: string; amount: number }[];
}

const PHASES = ["all", "quoting", "pre-con", "on-site", "complete"] as const;

const PHASE_CONFIG: Record<string, { label: string; color: string }> = {
  quoting: { label: "Quoting", color: "bg-amber-100 text-amber-800 border-amber-200" },
  "pre-con": { label: "Pre-con", color: "bg-blue-100 text-blue-800 border-blue-200" },
  "on-site": { label: "On Site", color: "bg-green-100 text-green-800 border-green-200" },
  complete: { label: "Complete", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

function formatAUD(amount: number | null | undefined): string {
  if (amount == null) return "$0.00";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setJobs(data);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs =
    activePhase === "all"
      ? jobs
      : jobs.filter((j) => j.phase === activePhase);

  // Stats
  const activeJobs = jobs.filter((j) => j.phase !== "complete");
  const totalQuoted = jobs.reduce((sum, j) => sum + (j.quoteAmount ?? 0), 0);
  const outstandingInvoices = jobs.reduce((sum, j) => {
    const unpaid = (j.progressClaims ?? []).filter((c) => c.status === "sent");
    return sum + unpaid.reduce((s, c) => s + c.amount, 0);
  }, 0);
  const now = new Date();
  const jobsDueThisMonth = jobs.filter((j) => {
    if (!j.targetEndDate) return false;
    const d = new Date(j.targetEndDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      clientName: form.get("clientName") as string,
      siteAddress: form.get("siteAddress") as string,
      phone: (form.get("phone") as string) || undefined,
      email: (form.get("email") as string) || undefined,
      quoteAmount: form.get("quoteAmount")
        ? parseFloat(form.get("quoteAmount") as string)
        : undefined,
      notes: (form.get("notes") as string) || undefined,
      phase: "quoting",
      percentComplete: 0,
    };

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create job");
      }

      toast.success("Job created successfully");
      setDialogOpen(false);
      fetchJobs();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create job";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of all your fit-out projects
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              window.open("/api/export?type=all", "_blank");
              toast.success("Exporting to Excel...");
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <DialogTrigger asChild>
              <Button className="bg-slate-800 hover:bg-slate-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Job
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  required
                  placeholder="e.g. Smith Developments"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteAddress">Site Address *</Label>
                <Input
                  id="siteAddress"
                  name="siteAddress"
                  required
                  placeholder="e.g. 42 George St, Sydney NSW 2000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0400 000 000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="client@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quoteAmount">Quote Amount (AUD)</Label>
                <Input
                  id="quoteAmount"
                  name="quoteAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Any additional details..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-slate-800 hover:bg-slate-700 text-white"
                >
                  {submitting ? "Creating..." : "Create Job"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Jobs</p>
                <p className="text-2xl font-bold text-slate-900">
                  {activeJobs.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Quoted</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatAUD(totalQuoted)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-2.5">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Outstanding</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatAUD(outstandingInvoices)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2.5">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Due This Month</p>
                <p className="text-2xl font-bold text-slate-900">
                  {jobsDueThisMonth.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase filter tabs + job cards */}
      <Tabs value={activePhase} onValueChange={(val) => setActivePhase(val as string)}>
        <TabsList className="bg-slate-100">
          {PHASES.map((phase) => (
            <TabsTrigger
              key={phase}
              value={phase}
              className="capitalize data-[state=active]:bg-white data-[state=active]:text-slate-900"
            >
              {phase === "all"
                ? `All (${jobs.length})`
                : `${PHASE_CONFIG[phase]?.label ?? phase} (${jobs.filter((j) => j.phase === phase).length})`}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* We use a single TabsContent for all, since filtering is controlled by state */}
        {PHASES.map((phase) => (
          <TabsContent key={phase} value={phase} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className="border-slate-200 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Building2 className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">No jobs found</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Create your first job to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => {
                  const phaseConf = PHASE_CONFIG[job.phase] ?? {
                    label: job.phase,
                    color: "bg-gray-100 text-gray-600 border-gray-200",
                  };

                  return (
                    <Card
                      key={job.id}
                      className="border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-xs font-mono text-slate-400">
                              {job.jobNumber}
                            </p>
                            <CardTitle className="text-base font-semibold text-slate-900">
                              {job.clientName}
                            </CardTitle>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${phaseConf.color}`}
                          >
                            {phaseConf.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-slate-500 line-clamp-1">
                          {job.siteAddress}
                        </p>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-medium text-slate-700">
                              {Math.round(job.percentComplete)}%
                            </span>
                          </div>
                          <Progress
                            value={job.percentComplete}
                            className="h-2"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-semibold text-slate-700">
                            {formatAUD(job.quoteAmount)}
                          </span>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                          >
                            View
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
