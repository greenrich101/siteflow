"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  Plus,
  Trash2,
  Upload,
  FolderOpen,
  FolderClosed,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  AlertTriangle,
  ClipboardList,
  Users,
  Pencil,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
// Select imports available if needed
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  variations: Variation[];
  progressClaims: ProgressClaim[];
  documents: Document[];
  dailyLogs: DailyLog[];
  jobSubbies: JobSubbie[];
}

interface Variation {
  id: string;
  jobId: string;
  title: string;
  description: string | null;
  amount: number;
  status: string;
  createdAt: string;
}

interface ProgressClaim {
  id: string;
  jobId: string;
  claimNumber: number;
  amount: number;
  dateSent: string;
  datePaid: string | null;
  status: string;
  createdAt: string;
}

interface Document {
  id: string;
  jobId: string;
  folder: string;
  subfolder: string | null;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

interface DailyLog {
  id: string;
  jobId: string;
  date: string;
  notes: string;
  weather: string | null;
  onSite: string | null;
  createdAt: string;
}

interface Subcontractor {
  id: string;
  trade: string;
  companyName: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
}

interface JobSubbie {
  id: string;
  jobId: string;
  subcontractorId: string;
  quoteAmount: number | null;
  status: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  subcontractor: Subcontractor;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AUD = (value: number | null | undefined) => {
  if (value == null) return "$0.00";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
};

const phases = ["quoting", "pre-con", "on-site", "complete"] as const;
const phaseLabels: Record<string, string> = {
  quoting: "Quoting",
  "pre-con": "Pre-con",
  "on-site": "On Site",
  complete: "Complete",
};

const weatherIcons: Record<string, React.ReactNode> = {
  fine: <Sun className="size-4 text-amber-500" />,
  overcast: <Cloud className="size-4 text-gray-400" />,
  rain: <CloudRain className="size-4 text-blue-500" />,
  extreme: <AlertTriangle className="size-4 text-red-500" />,
};

const weatherLabels: Record<string, string> = {
  fine: "Fine",
  overcast: "Overcast",
  rain: "Rain",
  extreme: "Extreme",
};

const FOLDER_STRUCTURE = [
  { name: "01-quote", subfolders: ["variations"] },
  { name: "02-plans", subfolders: ["revisions"] },
  { name: "03-permits", subfolders: [] },
  {
    name: "04-subbies",
    subfolders: ["subbie-quotes", "purchase-orders", "insurance-certs"],
  },
  {
    name: "05-site",
    subfolders: ["daily-logs", "progress-photos", "safety-inductions"],
  },
  {
    name: "06-invoicing",
    subfolders: ["progress-claims", "receipts-materials", "subbie-invoices"],
  },
  { name: "07-handover", subfolders: ["warranties", "as-built-plans"] },
];

const subbieStatuses = ["quoted", "booked", "on-site", "complete", "paid"] as const;

// ─── Editable Field ─────────────────────────────────────────────────────────

function EditableField({
  value,
  fieldKey,
  type = "text",
  onSave,
}: {
  label?: string;
  value: string;
  fieldKey: string;
  type?: string;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSave = async () => {
    if (editValue !== value) {
      await onSave(fieldKey, editValue);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          onBlur={handleSave}
          className="h-7 text-sm"
        />
      </div>
    );
  }

  return (
    <div
      className="group/editable flex cursor-pointer items-center gap-1 rounded px-1 -mx-1 hover:bg-muted"
      onClick={() => setEditing(true)}
    >
      <span className="text-sm">{value || "---"}</span>
      <Pencil className="size-3 text-muted-foreground opacity-0 group-hover/editable:opacity-100 transition-opacity" />
    </div>
  );
}

// ─── Phase Timeline ──────────────────────────────────────────────────────────

function PhaseTimeline({ currentPhase }: { currentPhase: string }) {
  const currentIndex = phases.indexOf(currentPhase as (typeof phases)[number]);

  return (
    <div className="flex items-center gap-1 w-full">
      {phases.map((phase, i) => {
        const isActive = i === currentIndex;
        const isComplete = i < currentIndex;
        return (
          <div key={phase} className="flex items-center flex-1">
            <div
              className={`flex-1 flex items-center justify-center rounded-md py-1.5 px-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isComplete
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {phaseLabels[phase]}
            </div>
            {i < phases.length - 1 && (
              <ChevronRight
                className={`size-4 shrink-0 mx-0.5 ${
                  isComplete ? "text-primary" : "text-muted-foreground/40"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error("Failed to fetch job");
      const data = await res.json();
      setJob(data);
    } catch {
      toast.error("Failed to load job");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const updateJobField = async (key: string, value: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error();
      toast.success("Updated successfully");
      fetchJob();
    } catch {
      toast.error("Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading job...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Job not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Go back
        </Button>
      </div>
    );
  }

  const approvedVariationsTotal = job.variations
    .filter((v) => v.status === "approved")
    .reduce((sum, v) => sum + v.amount, 0);
  const totalContractValue = (job.quoteAmount || 0) + approvedVariationsTotal;
  const totalInvoiced = job.progressClaims.reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = job.progressClaims
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.amount, 0);
  const outstanding = totalContractValue - totalPaid;
  const paidPercent = totalContractValue > 0 ? (totalPaid / totalContractValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold truncate">
                  {job.jobNumber}
                </h1>
                <Badge variant="secondary">{phaseLabels[job.phase] || job.phase}</Badge>
                <span className="text-sm text-muted-foreground">
                  {job.percentComplete}% complete
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {job.clientName} &mdash; {job.siteAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <Tabs defaultValue="0">
          <TabsList className="w-full overflow-x-auto flex-nowrap">
            <TabsTrigger value="0">Overview</TabsTrigger>
            <TabsTrigger value="1">Documents</TabsTrigger>
            <TabsTrigger value="2">Variations</TabsTrigger>
            <TabsTrigger value="3">Claims</TabsTrigger>
            <TabsTrigger value="4">Site Diary</TabsTrigger>
            <TabsTrigger value="5">Subbies</TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ───────────────────────────────────────────── */}
          <TabsContent value="0" className="mt-4 space-y-4">
            {/* Phase Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Project Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <PhaseTimeline currentPhase={job.phase} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Client Name</Label>
                      <EditableField
                        label="Client Name"
                        value={job.clientName}
                        fieldKey="clientName"
                        onSave={updateJobField}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        <MapPin className="size-3" /> Site Address
                      </Label>
                      <EditableField
                        label="Site Address"
                        value={job.siteAddress}
                        fieldKey="siteAddress"
                        onSave={updateJobField}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          <Phone className="size-3" /> Phone
                        </Label>
                        <EditableField
                          label="Phone"
                          value={job.phone || ""}
                          fieldKey="phone"
                          type="tel"
                          onSave={updateJobField}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          <Mail className="size-3" /> Email
                        </Label>
                        <EditableField
                          label="Email"
                          value={job.email || ""}
                          fieldKey="email"
                          type="email"
                          onSave={updateJobField}
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Quote Sent</Label>
                        <EditableField
                          label="Quote Sent"
                          value={
                            job.quoteSentDate
                              ? format(new Date(job.quoteSentDate), "yyyy-MM-dd")
                              : ""
                          }
                          fieldKey="quoteSentDate"
                          type="date"
                          onSave={updateJobField}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Contract Signed</Label>
                        <EditableField
                          label="Contract Signed"
                          value={
                            job.contractSigned
                              ? format(new Date(job.contractSigned), "yyyy-MM-dd")
                              : ""
                          }
                          fieldKey="contractSigned"
                          type="date"
                          onSave={updateJobField}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Start Date</Label>
                        <EditableField
                          label="Start Date"
                          value={
                            job.startDate
                              ? format(new Date(job.startDate), "yyyy-MM-dd")
                              : ""
                          }
                          fieldKey="startDate"
                          type="date"
                          onSave={updateJobField}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Target End</Label>
                        <EditableField
                          label="Target End"
                          value={
                            job.targetEndDate
                              ? format(new Date(job.targetEndDate), "yyyy-MM-dd")
                              : ""
                          }
                          fieldKey="targetEndDate"
                          type="date"
                          onSave={updateJobField}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phase</Label>
                      <EditableField
                        label="Phase"
                        value={job.phase}
                        fieldKey="phase"
                        onSave={updateJobField}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">% Complete</Label>
                      <EditableField
                        label="% Complete"
                        value={String(job.percentComplete)}
                        fieldKey="percentComplete"
                        type="number"
                        onSave={updateJobField}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <DollarSign className="inline size-4" /> Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quote Amount</span>
                      <span className="font-medium">{AUD(job.quoteAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Approved Variations
                      </span>
                      <span className="font-medium">{AUD(approvedVariationsTotal)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Contract Value</span>
                      <span className="font-semibold text-base">{AUD(totalContractValue)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Invoiced to Date</span>
                      <span className="font-medium">{AUD(totalInvoiced)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Paid to Date</span>
                      <span className="font-medium text-green-600">{AUD(totalPaid)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Outstanding</span>
                      <span className="font-semibold text-red-600">{AUD(outstanding)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Documents Tab ──────────────────────────────────────────── */}
          <TabsContent value="1" className="mt-4">
            <DocumentsTab job={job} onRefresh={fetchJob} />
          </TabsContent>

          {/* ── Variations Tab ─────────────────────────────────────────── */}
          <TabsContent value="2" className="mt-4">
            <VariationsTab job={job} onRefresh={fetchJob} />
          </TabsContent>

          {/* ── Claims Tab ─────────────────────────────────────────────── */}
          <TabsContent value="3" className="mt-4">
            <ClaimsTab
              job={job}
              totalInvoiced={totalInvoiced}
              totalPaid={totalPaid}
              outstanding={outstanding}
              paidPercent={paidPercent}
              onRefresh={fetchJob}
            />
          </TabsContent>

          {/* ── Site Diary Tab ─────────────────────────────────────────── */}
          <TabsContent value="4" className="mt-4">
            <SiteDiaryTab job={job} onRefresh={fetchJob} />
          </TabsContent>

          {/* ── Subbies Tab ────────────────────────────────────────────── */}
          <TabsContent value="5" className="mt-4">
            <SubbiesTab job={job} onRefresh={fetchJob} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Documents Tab ───────────────────────────────────────────────────────────

function DocumentsTab({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);

  const toggleFolder = (key: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleUpload = async (
    file: File,
    folder: string,
    subfolder: string | null
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobId", job.id);
      formData.append("folder", folder);
      if (subfolder) formData.append("subfolder", subfolder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      toast.success("File uploaded");
      onRefresh();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Document deleted");
      onRefresh();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const getDocsForPath = (folder: string, subfolder: string | null) =>
    job.documents.filter(
      (d) => d.folder === folder && d.subfolder === (subfolder || null)
    );

  const FileUploadArea = ({
    folder,
    subfolder,
  }: {
    folder: string;
    subfolder: string | null;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-muted-foreground/30 px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
      <Upload className="size-3.5" />
      <span>{uploading ? "Uploading..." : "Upload file"}</span>
      <input
        type="file"
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file, folder, subfolder);
          e.target.value = "";
        }}
      />
    </label>
  );

  const DocumentList = ({
    folder,
    subfolder,
  }: {
    folder: string;
    subfolder: string | null;
  }) => {
    const docs = getDocsForPath(folder, subfolder);
    return (
      <div className="space-y-1">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-muted"
          >
            <FileText className="size-3.5 shrink-0 text-muted-foreground" />
            <a
              href={`/api/uploads${doc.filePath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 truncate hover:underline"
            >
              {doc.fileName}
            </a>
            <span className="text-xs text-muted-foreground shrink-0">
              {format(new Date(doc.uploadedAt), "dd MMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(doc.id)}
            >
              <Trash2 className="size-3 text-destructive" />
            </Button>
          </div>
        ))}
        <FileUploadArea folder={folder} subfolder={subfolder} />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FolderOpen className="inline size-4" /> Documents
        </CardTitle>
        <CardDescription>Virtual folder structure for job documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {FOLDER_STRUCTURE.map((folder) => {
            const folderKey = folder.name;
            const isExpanded = expandedFolders.has(folderKey);
            const folderDocCount = job.documents.filter(
              (d) => d.folder === folder.name
            ).length;

            return (
              <div key={folder.name}>
                {/* Folder header */}
                <button
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  onClick={() => toggleFolder(folderKey)}
                >
                  {isExpanded ? (
                    <FolderOpen className="size-4 text-amber-500" />
                  ) : (
                    <FolderClosed className="size-4 text-amber-500" />
                  )}
                  <span className="flex-1 text-left">{folder.name}</span>
                  {folderDocCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {folderDocCount}
                    </Badge>
                  )}
                  <ChevronRight
                    className={`size-3.5 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="ml-4 border-l pl-3 space-y-2 py-1">
                    {/* Root folder docs */}
                    <DocumentList folder={folder.name} subfolder={null} />

                    {/* Subfolders */}
                    {folder.subfolders.map((sub) => {
                      const subKey = `${folder.name}/${sub}`;
                      const subExpanded = expandedFolders.has(subKey);
                      const subDocCount = job.documents.filter(
                        (d) => d.folder === folder.name && d.subfolder === sub
                      ).length;

                      return (
                        <div key={sub}>
                          <button
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted transition-colors"
                            onClick={() => toggleFolder(subKey)}
                          >
                            {subExpanded ? (
                              <FolderOpen className="size-3.5 text-blue-400" />
                            ) : (
                              <FolderClosed className="size-3.5 text-blue-400" />
                            )}
                            <span className="flex-1 text-left">{sub}</span>
                            {subDocCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {subDocCount}
                              </Badge>
                            )}
                            <ChevronRight
                              className={`size-3 text-muted-foreground transition-transform ${
                                subExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </button>
                          {subExpanded && (
                            <div className="ml-4 border-l pl-3 py-1">
                              <DocumentList folder={folder.name} subfolder={sub} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Variations Tab ──────────────────────────────────────────────────────────

function VariationsTab({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const approvedTotal = job.variations
    .filter((v) => v.status === "approved")
    .reduce((sum, v) => sum + v.amount, 0);

  const handleCreate = async () => {
    if (!title || !amount) {
      toast.error("Title and amount are required");
      return;
    }
    try {
      const res = await fetch("/api/variations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          title,
          description: description || null,
          amount: parseFloat(amount),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Variation added");
      setTitle("");
      setDescription("");
      setAmount("");
      setDialogOpen(false);
      onRefresh();
    } catch {
      toast.error("Failed to create variation");
    }
  };

  const updateStatus = async (variationId: string, status: string) => {
    try {
      const res = await fetch(`/api/variations/${variationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Status updated to ${status}`);
      onRefresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">{status}</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Variations</CardTitle>
            <CardDescription>
              Approved total: <span className="font-semibold text-foreground">{AUD(approvedTotal)}</span>
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="size-3.5" /> Add Variation</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Variation</DialogTitle>
                <DialogDescription>Add a new variation to this job.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="var-title">Title</Label>
                  <Input
                    id="var-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Variation title"
                  />
                </div>
                <div>
                  <Label htmlFor="var-desc">Description</Label>
                  <Textarea
                    id="var-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <Label htmlFor="var-amount">Amount (AUD)</Label>
                  <Input
                    id="var-amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleCreate}>Add Variation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {job.variations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No variations yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.variations.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.title}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[200px] truncate">
                      {v.description || "---"}
                    </TableCell>
                    <TableCell className="text-right">{AUD(v.amount)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><button className="cursor-pointer">{statusBadge(v.status)}</button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => updateStatus(v.id, "pending")}>
                            Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(v.id, "approved")}>
                            Approved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(v.id, "rejected")}>
                            Rejected
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Claims Tab ──────────────────────────────────────────────────────────────

function ClaimsTab({
  job,
  totalInvoiced,
  totalPaid,
  outstanding,
  paidPercent,
  onRefresh,
}: {
  job: Job;
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
  paidPercent: number;
  onRefresh: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [claimAmount, setClaimAmount] = useState("");
  const [dateSent, setDateSent] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleCreate = async () => {
    if (!claimAmount || !dateSent) {
      toast.error("Amount and date sent are required");
      return;
    }
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          amount: parseFloat(claimAmount),
          dateSent,
          status: "sent",
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Claim created");
      setClaimAmount("");
      setDateSent(format(new Date(), "yyyy-MM-dd"));
      setDialogOpen(false);
      onRefresh();
    } catch {
      toast.error("Failed to create claim");
    }
  };

  const updateClaimStatus = async (claimId: string, status: string, datePaid?: string) => {
    try {
      const body: Record<string, unknown> = { status };
      if (datePaid) body.datePaid = datePaid;
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(`Claim marked as ${status}`);
      onRefresh();
    } catch {
      toast.error("Failed to update claim");
    }
  };

  const claimStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 border-red-200">{status}</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Invoiced</p>
            <p className="text-xl font-semibold">{AUD(totalInvoiced)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-xl font-semibold text-green-600">{AUD(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-xl font-semibold text-red-600">{AUD(outstanding)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Paid vs Total Contract</span>
            <span className="text-sm font-medium">{Math.round(paidPercent)}%</span>
          </div>
          <Progress value={paidPercent} />
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Progress Claims</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="size-3.5" /> New Claim</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Progress Claim</DialogTitle>
                <DialogDescription>Create a new progress claim for this job.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="claim-amount">Amount (AUD)</Label>
                  <Input
                    id="claim-amount"
                    type="number"
                    step="0.01"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="claim-date">Date Sent</Label>
                  <Input
                    id="claim-date"
                    type="date"
                    value={dateSent}
                    onChange={(e) => setDateSent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleCreate}>Create Claim</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {job.progressClaims.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No claims yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim #</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date Sent</TableHead>
                  <TableHead className="hidden sm:table-cell">Date Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.progressClaims
                  .sort((a, b) => a.claimNumber - b.claimNumber)
                  .map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">#{c.claimNumber}</TableCell>
                      <TableCell className="text-right">{AUD(c.amount)}</TableCell>
                      <TableCell>{format(new Date(c.dateSent), "dd MMM yyyy")}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {c.datePaid
                          ? format(new Date(c.datePaid), "dd MMM yyyy")
                          : "---"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><button className="cursor-pointer">{claimStatusBadge(c.status)}</button></DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => updateClaimStatus(c.id, "sent")}>
                              Sent
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateClaimStatus(c.id, "paid", format(new Date(), "yyyy-MM-dd"))
                              }
                            >
                              Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateClaimStatus(c.id, "overdue")}>
                              Overdue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Site Diary Tab ──────────────────────────────────────────────────────────

function SiteDiaryTab({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [weather, setWeather] = useState("fine");
  const [onSite, setOnSite] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = async () => {
    if (!notes) {
      toast.error("Notes are required");
      return;
    }
    try {
      const res = await fetch("/api/daily-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          date,
          weather,
          onSite: onSite || null,
          notes,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Entry added");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setWeather("fine");
      setOnSite("");
      setNotes("");
      setDialogOpen(false);
      onRefresh();
    } catch {
      toast.error("Failed to add entry");
    }
  };

  const handleDelete = async (logId: string) => {
    try {
      const res = await fetch(`/api/daily-logs/${logId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Entry deleted");
      onRefresh();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const sortedLogs = [...job.dailyLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Site Diary</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="size-3.5" /> Add Entry</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Diary Entry</DialogTitle>
              <DialogDescription>Record site activity for the day.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="diary-date">Date</Label>
                <Input
                  id="diary-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Weather</Label>
                <div className="flex gap-2 mt-1">
                  {(["fine", "overcast", "rain", "extreme"] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeather(w)}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                        weather === w
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {weatherIcons[w]}
                      {weatherLabels[w]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="diary-onsite">Who was on site</Label>
                <Input
                  id="diary-onsite"
                  value={onSite}
                  onChange={(e) => setOnSite(e.target.value)}
                  placeholder="e.g. John, Tim, electrician"
                />
              </div>
              <div>
                <Label htmlFor="diary-notes">Notes</Label>
                <Textarea
                  id="diary-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What happened on site today..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleCreate}>Add Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sortedLogs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <ClipboardList className="mx-auto size-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No diary entries yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Date and weather row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {format(new Date(log.date), "EEEE, d MMMM yyyy")}
                      </span>
                      {log.weather && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                          {weatherIcons[log.weather]}
                          {weatherLabels[log.weather] || log.weather}
                        </span>
                      )}
                    </div>

                    {/* Who was on site */}
                    {log.onSite && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="size-3" />
                        <span>{log.onSite}</span>
                      </div>
                    )}

                    {/* Notes */}
                    <p className="text-sm whitespace-pre-wrap">{log.notes}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(log.id)}
                  >
                    <Trash2 className="size-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Subbies Tab ─────────────────────────────────────────────────────────────

function SubbiesTab({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [allSubbies, setAllSubbies] = useState<Subcontractor[]>([]);
  const [selectedSubId, setSelectedSubId] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");

  const fetchSubbies = async () => {
    try {
      const res = await fetch("/api/subbies");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAllSubbies(data);
    } catch {
      toast.error("Failed to load subcontractors");
    }
  };

  useEffect(() => {
    fetchSubbies();
  }, []);

  const handleAssign = async () => {
    if (!selectedSubId) {
      toast.error("Please select a subcontractor");
      return;
    }
    try {
      const res = await fetch("/api/job-subbies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          subcontractorId: selectedSubId,
          quoteAmount: quoteAmount ? parseFloat(quoteAmount) : null,
          status: "quoted",
          scheduledStart: scheduledStart || null,
          scheduledEnd: scheduledEnd || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Subcontractor assigned");
      setSelectedSubId("");
      setQuoteAmount("");
      setScheduledStart("");
      setScheduledEnd("");
      setDialogOpen(false);
      onRefresh();
    } catch {
      toast.error("Failed to assign subcontractor");
    }
  };

  const updateSubbieStatus = async (jsId: string, status: string) => {
    try {
      const res = await fetch(`/api/job-subbies/${jsId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Status updated to ${status}`);
      onRefresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const subbieStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      quoted: "bg-gray-100 text-gray-800 border-gray-200",
      booked: "bg-blue-100 text-blue-800 border-blue-200",
      "on-site": "bg-amber-100 text-amber-800 border-amber-200",
      complete: "bg-green-100 text-green-800 border-green-200",
      paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800 border-gray-200"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Subcontractors</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (open) fetchSubbies(); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="size-3.5" /> Assign Subbie</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Subcontractor</DialogTitle>
                <DialogDescription>Select a subcontractor to assign to this job.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Subcontractor</Label>
                  <select
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={selectedSubId}
                    onChange={(e) => setSelectedSubId(e.target.value)}
                  >
                    <option value="">Select a subcontractor...</option>
                    {allSubbies.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName} ({s.trade})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="sub-quote">Quote Amount (AUD)</Label>
                  <Input
                    id="sub-quote"
                    type="number"
                    step="0.01"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="sub-start">Scheduled Start</Label>
                    <Input
                      id="sub-start"
                      type="date"
                      value={scheduledStart}
                      onChange={(e) => setScheduledStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sub-end">Scheduled End</Label>
                    <Input
                      id="sub-end"
                      type="date"
                      value={scheduledEnd}
                      onChange={(e) => setScheduledEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleAssign}>Assign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {job.jobSubbies.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No subcontractors assigned yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trade</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="text-right">Quote</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Dates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.jobSubbies.map((js) => (
                  <TableRow key={js.id}>
                    <TableCell className="font-medium">{js.subcontractor.trade}</TableCell>
                    <TableCell>{js.subcontractor.companyName}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {js.subcontractor.contactName || "---"}
                    </TableCell>
                    <TableCell className="text-right">
                      {js.quoteAmount != null ? AUD(js.quoteAmount) : "---"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><button className="cursor-pointer">{subbieStatusBadge(js.status)}</button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {subbieStatuses.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => updateSubbieStatus(js.id, s)}
                            >
                              {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {js.scheduledStart
                        ? format(new Date(js.scheduledStart), "dd MMM")
                        : "---"}
                      {" - "}
                      {js.scheduledEnd
                        ? format(new Date(js.scheduledEnd), "dd MMM")
                        : "---"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
