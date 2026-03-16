"use client";

import { useEffect, useState, useCallback } from "react";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SettingsData {
  id: string;
  businessName: string;
  abn: string;
  phone: string;
  email: string;
  address: string;
  jobPrefix: string;
  nextJobNumber: number;
}

const defaultSettings: SettingsData = {
  id: "default",
  businessName: "",
  abn: "",
  phone: "",
  email: "",
  address: "",
  jobPrefix: "FO-",
  nextJobNumber: 4,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSettings(data);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave() {
    setSaving(true);
    try {
      const { id: _id, ...payload } = settings;
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setSettings(updated);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function update(field: keyof SettingsData, value: string | number) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-muted-foreground dark:bg-slate-950">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-700 text-white">
            <Settings2 className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your business details and preferences
            </p>
          </div>
        </div>

        {/* Business Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
            <CardDescription>
              Your company information used across SiteFlow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={settings.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                  placeholder="e.g. FO Construction Pty Ltd"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="abn">ABN</Label>
                <Input
                  id="abn"
                  value={settings.abn}
                  onChange={(e) => update("abn", e.target.value)}
                  placeholder="e.g. 12 345 678 901"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="e.g. 0412 345 678"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="e.g. admin@foconstruction.com.au"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="e.g. 123 Builder St, Sydney NSW 2000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Numbering Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Job Numbering</CardTitle>
            <CardDescription>
              Configure how new job numbers are generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="jobPrefix">Job Number Prefix</Label>
                <Input
                  id="jobPrefix"
                  value={settings.jobPrefix}
                  onChange={(e) => update("jobPrefix", e.target.value)}
                  placeholder="e.g. FO-"
                />
                <p className="text-xs text-muted-foreground">
                  Prefix added before the job number
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nextJobNumber">Next Job Number</Label>
                <Input
                  id="nextJobNumber"
                  type="number"
                  min={1}
                  value={settings.nextJobNumber}
                  onChange={(e) =>
                    update("nextJobNumber", parseInt(e.target.value, 10) || 1)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Next job will be{" "}
                  <span className="font-mono font-medium text-foreground">
                    {settings.jobPrefix}
                    {String(settings.nextJobNumber).padStart(3, "0")}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button size="lg" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
