"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Building2, CheckCircle2, Upload, ChevronRight, ChevronLeft, FileText, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const TRADES = [
  "Carpentry / Joinery", "Electrical", "Plumbing", "Painting / Decorating",
  "Plastering / Ceiling Fixing", "Tiling", "Flooring", "HVAC / Mechanical",
  "Fire Protection", "Demolition", "Glazing", "Signage", "General Labourer", "Other",
];

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"];

const PLI_AMOUNTS = ["$5 Million", "$10 Million", "$20 Million", "Other"];

const STEPS = [
  "Personal & Contact Details",
  "Trade Qualifications & Licences",
  "Insurance & ABN Details",
  "WHS & Safety Inductions",
  "Review & Submit",
];

interface FormData {
  // Step 1
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  // Step 2
  trade: string;
  licenceNumber: string;
  licenceExpiry: string;
  whiteCardNumber: string;
  whiteCardState: string;
  additionalTickets: string;
  // Step 3
  abn: string;
  gstRegistered: string;
  pliProvider: string;
  pliPolicyNumber: string;
  pliCoverAmount: string;
  pliExpiry: string;
  wcPolicyNumber: string;
  wcExpiry: string;
  // Step 4
  siteInduction: string;
  ackSWMS: boolean;
  ackPPE: boolean;
  ackIncidentReporting: boolean;
  ackDrugAlcohol: boolean;
  ackEnvironmental: boolean;
  whsNotes: string;
}

export default function SubbieIntakePage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [licenceDoc, setLicenceDoc] = useState<File | null>(null);
  const [insuranceDoc, setInsuranceDoc] = useState<File | null>(null);
  const licenceRef = useRef<HTMLInputElement>(null!);
  const insuranceRef = useRef<HTMLInputElement>(null!);

  const [form, setForm] = useState<FormData>({
    contactName: "", companyName: "", email: "", phone: "", address: "",
    emergencyContactName: "", emergencyContactPhone: "",
    trade: "", licenceNumber: "", licenceExpiry: "", whiteCardNumber: "",
    whiteCardState: "", additionalTickets: "",
    abn: "", gstRegistered: "", pliProvider: "", pliPolicyNumber: "",
    pliCoverAmount: "", pliExpiry: "", wcPolicyNumber: "", wcExpiry: "",
    siteInduction: "", ackSWMS: false, ackPPE: false,
    ackIncidentReporting: false, ackDrugAlcohol: false, ackEnvironmental: false,
    whsNotes: "",
  });

  const update = (field: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validateStep = (s: number): boolean => {
    switch (s) {
      case 1:
        if (!form.contactName || !form.companyName || !form.email || !form.phone || !form.emergencyContactName || !form.emergencyContactPhone) {
          toast.error("Please fill in all required fields.");
          return false;
        }
        return true;
      case 2:
        if (!form.trade || !form.whiteCardNumber || !form.whiteCardState) {
          toast.error("Please fill in trade, white card number, and state.");
          return false;
        }
        return true;
      case 3:
        if (!form.abn || !form.gstRegistered || !form.pliProvider || !form.pliPolicyNumber || !form.pliCoverAmount || !form.pliExpiry) {
          toast.error("Please fill in all required insurance and ABN fields.");
          return false;
        }
        return true;
      case 4:
        if (!form.siteInduction || !form.ackSWMS || !form.ackPPE || !form.ackIncidentReporting || !form.ackDrugAlcohol || !form.ackEnvironmental) {
          toast.error("Please complete all safety acknowledgements.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const goTo = (target: number) => {
    if (target > step && !validateStep(step)) return;
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      // Add all text fields
      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, String(value));
      });
      // Add files
      if (licenceDoc) fd.append("licenceDoc", licenceDoc);
      if (insuranceDoc) fd.append("insuranceDoc", insuranceDoc);

      const res = await fetch("/api/onboarding", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
          <CardContent className="pt-10 pb-10 space-y-4">
            <div className="mx-auto w-[72px] h-[72px] rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">You&apos;re All Set!</h2>
            <p className="text-slate-500">
              Your subcontractor onboarding form has been submitted successfully.
              You&apos;ll receive a confirmation email shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-10 sm:py-12 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-500 opacity-10" />
        <div className="absolute -bottom-10 left-1/3 w-44 h-44 rounded-full bg-orange-500 opacity-5" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <Badge className="bg-orange-500 text-white border-0 mb-4">Commercial Fit-Outs</Badge>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-7 w-7" />
            <span className="text-2xl font-bold tracking-tight">SiteFlow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Subcontractor Onboarding</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg">
            Complete all sections below to register as an approved subcontractor.
            All information is kept confidential and used for compliance purposes only.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 pb-16 relative z-10">
        {/* Progress Bar */}
        <Card className="mb-5">
          <CardContent className="pt-5 pb-4">
            <div className="flex gap-1.5 mb-3">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    i + 1 < step ? "bg-green-500" : i + 1 === step ? "bg-orange-500" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Step <strong className="text-slate-800">{step}</strong> of <strong className="text-slate-800">5</strong> — {STEPS[step - 1]}
            </p>
          </CardContent>
        </Card>

        {/* Step 1: Personal & Contact */}
        {step === 1 && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardContent className="pt-8 pb-6">
              <StepHeader num={1} title="Personal & Contact Details" desc="Your basic contact information and business identity." />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="Full Name" required>
                  <Input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="e.g. John Smith" />
                </Field>
                <Field label="Trading / Business Name" required>
                  <Input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="e.g. Smith Fit-Outs Pty Ltd" />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="Email Address" required>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" />
                </Field>
                <Field label="Mobile Number" required>
                  <Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="0400 000 000" />
                </Field>
              </div>
              <div className="mb-4">
                <Field label="Business Address">
                  <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, Suburb, State, Postcode" />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Emergency Contact Name" required>
                  <Input value={form.emergencyContactName} onChange={(e) => update("emergencyContactName", e.target.value)} placeholder="Full name" />
                </Field>
                <Field label="Emergency Contact Number" required>
                  <Input type="tel" value={form.emergencyContactPhone} onChange={(e) => update("emergencyContactPhone", e.target.value)} placeholder="0400 000 000" />
                </Field>
              </div>

              <NavButtons onNext={() => goTo(2)} />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Trade Qualifications */}
        {step === 2 && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardContent className="pt-8 pb-6">
              <StepHeader num={2} title="Trade Qualifications & Licences" desc="Details of your trade skills, licences, and tickets relevant to commercial fit-out work." />

              <div className="mb-4">
                <Field label="Primary Trade / Discipline" required>
                  <select
                    value={form.trade}
                    onChange={(e) => update("trade", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select your primary trade...</option>
                    {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="Trade Licence Number">
                  <Input value={form.licenceNumber} onChange={(e) => update("licenceNumber", e.target.value)} placeholder="e.g. 123456C" />
                </Field>
                <Field label="Licence Expiry Date">
                  <Input type="date" value={form.licenceExpiry} onChange={(e) => update("licenceExpiry", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="White Card Number" required>
                  <Input value={form.whiteCardNumber} onChange={(e) => update("whiteCardNumber", e.target.value)} placeholder="Construction Induction Card #" />
                </Field>
                <Field label="White Card Issued In" required>
                  <select
                    value={form.whiteCardState}
                    onChange={(e) => update("whiteCardState", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select state...</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <div className="mb-4">
                <Field label="Additional Tickets / Certifications" hint="list all that apply">
                  <Textarea
                    value={form.additionalTickets}
                    onChange={(e) => update("additionalTickets", e.target.value)}
                    placeholder="e.g. EWP, Confined Space, Working at Heights, Asbestos Awareness, First Aid..."
                    rows={3}
                  />
                </Field>
              </div>
              <div className="mb-0">
                <Field label="Upload Licence / White Card" hint="photo or scan">
                  <FileUpload file={licenceDoc} inputRef={licenceRef} onSelect={setLicenceDoc} />
                </Field>
              </div>

              <NavButtons onBack={() => goTo(1)} onNext={() => goTo(3)} />
            </CardContent>
          </Card>
        )}

        {/* Step 3: Insurance & ABN */}
        {step === 3 && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardContent className="pt-8 pb-6">
              <StepHeader num={3} title="Insurance & ABN Details" desc="Your business registration and insurance coverage details." />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="ABN" required>
                  <Input value={form.abn} onChange={(e) => update("abn", e.target.value)} placeholder="XX XXX XXX XXX" />
                </Field>
                <Field label="GST Registered?" required>
                  <select
                    value={form.gstRegistered}
                    onChange={(e) => update("gstRegistered", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="Public Liability Insurance Provider" required>
                  <Input value={form.pliProvider} onChange={(e) => update("pliProvider", e.target.value)} placeholder="e.g. QBE, CGU, Allianz" />
                </Field>
                <Field label="Public Liability Policy Number" required>
                  <Input value={form.pliPolicyNumber} onChange={(e) => update("pliPolicyNumber", e.target.value)} placeholder="Policy #" />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="Public Liability Cover Amount" required>
                  <select
                    value={form.pliCoverAmount}
                    onChange={(e) => update("pliCoverAmount", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select...</option>
                    {PLI_AMOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </Field>
                <Field label="Public Liability Expiry Date" required>
                  <Input type="date" value={form.pliExpiry} onChange={(e) => update("pliExpiry", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="Workers Comp Policy Number" hint="if applicable">
                  <Input value={form.wcPolicyNumber} onChange={(e) => update("wcPolicyNumber", e.target.value)} placeholder="Policy # or N/A if sole trader" />
                </Field>
                <Field label="Workers Comp Expiry Date">
                  <Input type="date" value={form.wcExpiry} onChange={(e) => update("wcExpiry", e.target.value)} />
                </Field>
              </div>
              <div className="mb-0">
                <Field label="Upload Insurance Certificate(s) of Currency" required hint="PDF, JPG or PNG">
                  <FileUpload file={insuranceDoc} inputRef={insuranceRef} onSelect={setInsuranceDoc} />
                </Field>
              </div>

              <NavButtons onBack={() => goTo(2)} onNext={() => goTo(4)} />
            </CardContent>
          </Card>
        )}

        {/* Step 4: WHS & Safety */}
        {step === 4 && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardContent className="pt-8 pb-6">
              <StepHeader num={4} title="WHS & Safety Inductions" desc="Confirm your understanding of workplace health and safety requirements for commercial fit-out sites." />

              <div className="mb-6">
                <Field label="Have you completed a site-specific induction in the last 12 months?" required>
                  <select
                    value={form.siteInduction}
                    onChange={(e) => update("siteInduction", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </Field>
              </div>

              <div className="mb-6">
                <Label className="text-sm font-semibold mb-3 block">Acknowledgements <span className="text-orange-500">*</span></Label>
                <div className="space-y-3">
                  <AckCheckbox
                    checked={form.ackSWMS}
                    onChange={(v) => update("ackSWMS", v)}
                    title="Safe Work Method Statements (SWMS)"
                    desc="I agree to provide SWMS for all high-risk work before commencing on site."
                  />
                  <AckCheckbox
                    checked={form.ackPPE}
                    onChange={(v) => update("ackPPE", v)}
                    title="PPE Requirements"
                    desc="I will ensure all workers wear appropriate PPE (hard hat, hi-vis, steel caps, safety glasses) at all times on site."
                  />
                  <AckCheckbox
                    checked={form.ackIncidentReporting}
                    onChange={(v) => update("ackIncidentReporting", v)}
                    title="Incident Reporting"
                    desc="I will report all incidents, near-misses, and hazards to the site supervisor immediately."
                  />
                  <AckCheckbox
                    checked={form.ackDrugAlcohol}
                    onChange={(v) => update("ackDrugAlcohol", v)}
                    title="Drug & Alcohol Policy"
                    desc="I acknowledge and agree to comply with the zero-tolerance drug and alcohol policy on all sites."
                  />
                  <AckCheckbox
                    checked={form.ackEnvironmental}
                    onChange={(v) => update("ackEnvironmental", v)}
                    title="Environmental Obligations"
                    desc="I will comply with waste management and environmental requirements, including correct disposal of hazardous materials."
                  />
                </div>
              </div>

              <div className="mb-0">
                <Field label="Additional WHS Comments or Notes">
                  <Textarea
                    value={form.whsNotes}
                    onChange={(e) => update("whsNotes", e.target.value)}
                    placeholder="Any relevant safety information, restrictions, or special requirements..."
                    rows={3}
                  />
                </Field>
              </div>

              <NavButtons onBack={() => goTo(3)} nextLabel="Review & Submit" onNext={() => goTo(5)} />
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardContent className="pt-8 pb-6">
              <StepHeader num={5} title="Review & Submit" desc="Please check all your details below before submitting." />

              <ReviewGroup title="Personal & Contact">
                <ReviewItem label="Full Name" value={form.contactName} />
                <ReviewItem label="Business Name" value={form.companyName} />
                <ReviewItem label="Email" value={form.email} />
                <ReviewItem label="Mobile" value={form.phone} />
                <ReviewItem label="Address" value={form.address} />
                <ReviewItem label="Emergency Contact" value={`${form.emergencyContactName} — ${form.emergencyContactPhone}`} />
              </ReviewGroup>

              <ReviewGroup title="Trade & Licences">
                <ReviewItem label="Primary Trade" value={form.trade} />
                <ReviewItem label="Licence #" value={form.licenceNumber} />
                <ReviewItem label="Licence Expiry" value={form.licenceExpiry} />
                <ReviewItem label="White Card #" value={form.whiteCardNumber} />
                <ReviewItem label="White Card State" value={form.whiteCardState} />
                <ReviewItem label="Additional Tickets" value={form.additionalTickets} />
                <ReviewItem label="Licence Document" value={licenceDoc?.name || ""} />
              </ReviewGroup>

              <ReviewGroup title="Insurance & ABN">
                <ReviewItem label="ABN" value={form.abn} />
                <ReviewItem label="GST Registered" value={form.gstRegistered} />
                <ReviewItem label="PLI Provider" value={form.pliProvider} />
                <ReviewItem label="PLI Policy #" value={form.pliPolicyNumber} />
                <ReviewItem label="PLI Cover" value={form.pliCoverAmount} />
                <ReviewItem label="PLI Expiry" value={form.pliExpiry} />
                <ReviewItem label="Workers Comp #" value={form.wcPolicyNumber} />
                <ReviewItem label="Workers Comp Expiry" value={form.wcExpiry} />
                <ReviewItem label="Insurance Document" value={insuranceDoc?.name || ""} />
              </ReviewGroup>

              <ReviewGroup title="WHS & Safety">
                <ReviewItem label="Site Induction (12mo)" value={form.siteInduction} />
                <ReviewItem label="SWMS" value={form.ackSWMS ? "Agreed" : "Not agreed"} />
                <ReviewItem label="PPE" value={form.ackPPE ? "Agreed" : "Not agreed"} />
                <ReviewItem label="Incident Reporting" value={form.ackIncidentReporting ? "Agreed" : "Not agreed"} />
                <ReviewItem label="Drug & Alcohol" value={form.ackDrugAlcohol ? "Agreed" : "Not agreed"} />
                <ReviewItem label="Environmental" value={form.ackEnvironmental ? "Agreed" : "Not agreed"} />
                <ReviewItem label="WHS Notes" value={form.whsNotes} />
              </ReviewGroup>

              <Separator className="my-6" />
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => goTo(4)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Onboarding Form"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepHeader({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="mb-6">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 text-orange-500 font-bold text-sm mb-3">
        {num}
      </div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">{desc}</p>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">
        {label}
        {required && <span className="text-orange-500 ml-1">*</span>}
        {hint && <span className="font-normal text-slate-400 text-xs ml-1">({hint})</span>}
      </Label>
      {children}
    </div>
  );
}

function FileUpload({ file, inputRef, onSelect }: { file: File | null; inputRef: React.RefObject<HTMLInputElement>; onSelect: (f: File | null) => void }) {
  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => onSelect(e.target.files?.[0] || null)}
      />
      {file ? (
        <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
          <FileText className="h-5 w-5 text-green-600 shrink-0" />
          <span className="text-sm text-green-800 truncate flex-1">{file.name}</span>
          <button onClick={() => { onSelect(null); if (inputRef.current) inputRef.current.value = ""; }} className="text-slate-400 hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
        >
          <Upload className="h-6 w-6 mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-500">
            <span className="text-orange-500 font-medium">Click to upload</span> or drag & drop
          </p>
          <p className="text-xs text-slate-400 mt-1">PDF, JPG or PNG up to 10MB</p>
        </div>
      )}
    </div>
  );
}

function AckCheckbox({ checked, onChange, title, desc }: { checked: boolean; onChange: (v: boolean) => void; title: string; desc: string }) {
  return (
    <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${checked ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-slate-50 hover:border-orange-200 hover:bg-orange-50/50"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-[18px] w-[18px] accent-orange-500 shrink-0"
      />
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </label>
  );
}

function NavButtons({ onBack, onNext, nextLabel }: { onBack?: () => void; onNext?: () => void; nextLabel?: string }) {
  return (
    <div className="flex justify-between items-center mt-7 pt-6 border-t border-slate-100">
      {onBack ? (
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      ) : <div />}
      {onNext && (
        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={onNext}>
          {nextLabel || "Next"} <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
}

function ReviewGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 pb-5 border-b border-slate-100 last:border-0">
      <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right max-w-[55%]">{value || "—"}</span>
    </div>
  );
}
