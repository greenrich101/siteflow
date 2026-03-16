import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { format } from "date-fns";

function fmt(date: Date | string | null | undefined): string {
  if (!date) return "";
  return format(new Date(date), "dd/MM/yyyy");
}

function currency(amount: number | null | undefined): number | string {
  return amount ?? "";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";

  try {
    const wb = XLSX.utils.book_new();

    if (type === "all" || type === "jobs") {
      const jobs = await prisma.job.findMany({
        include: { variations: true, progressClaims: true, jobSubbies: { include: { subcontractor: true } } },
        orderBy: { jobNumber: "asc" },
      });

      // -- Jobs sheet (Buildxact Project Import format) --
      const jobRows = jobs.map((j) => {
        const approvedVars = j.variations.filter((v) => v.status === "approved").reduce((s, v) => s + v.amount, 0);
        const totalContract = (j.quoteAmount || 0) + approvedVars;
        const totalInvoiced = j.progressClaims.reduce((s, c) => s + c.amount, 0);
        const totalPaid = j.progressClaims.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);
        return {
          "Job Number": j.jobNumber,
          "Client Name": j.clientName,
          "Site Address": j.siteAddress,
          "Phone": j.phone || "",
          "Email": j.email || "",
          "Status": j.phase,
          "Quote Amount (ex GST)": currency(j.quoteAmount),
          "Approved Variations": currency(approvedVars),
          "Total Contract Value": currency(totalContract),
          "Total Invoiced": currency(totalInvoiced),
          "Total Paid": currency(totalPaid),
          "Outstanding": currency(totalContract - totalPaid),
          "% Complete": j.percentComplete,
          "Quote Sent": fmt(j.quoteSentDate),
          "Contract Signed": fmt(j.contractSigned),
          "Start Date": fmt(j.startDate),
          "Target End Date": fmt(j.targetEndDate),
          "Notes": j.notes || "",
        };
      });
      const wsJobs = XLSX.utils.json_to_sheet(jobRows);
      // Set column widths
      wsJobs["!cols"] = [
        { wch: 12 }, { wch: 20 }, { wch: 35 }, { wch: 15 }, { wch: 25 },
        { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
        { wch: 12 }, { wch: 15 }, { wch: 30 },
      ];
      XLSX.utils.book_append_sheet(wb, wsJobs, "Jobs");

      // -- Variations sheet --
      const varRows: Record<string, unknown>[] = [];
      for (const j of jobs) {
        for (const v of j.variations) {
          varRows.push({
            "Job Number": j.jobNumber,
            "Client Name": j.clientName,
            "Variation Title": v.title,
            "Description": v.description || "",
            "Amount (ex GST)": currency(v.amount),
            "GST": currency(v.amount ? v.amount * 0.1 : null),
            "Amount (inc GST)": currency(v.amount ? v.amount * 1.1 : null),
            "Status": v.status,
            "Date": fmt(v.createdAt),
          });
        }
      }
      if (varRows.length) {
        const wsVars = XLSX.utils.json_to_sheet(varRows);
        wsVars["!cols"] = [
          { wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 40 },
          { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(wb, wsVars, "Variations");
      }

      // -- Progress Claims sheet --
      const claimRows: Record<string, unknown>[] = [];
      for (const j of jobs) {
        for (const c of j.progressClaims) {
          claimRows.push({
            "Job Number": j.jobNumber,
            "Client Name": j.clientName,
            "Claim #": c.claimNumber,
            "Amount (ex GST)": currency(c.amount),
            "GST": currency(c.amount * 0.1),
            "Amount (inc GST)": currency(c.amount * 1.1),
            "Date Sent": fmt(c.dateSent),
            "Date Paid": fmt(c.datePaid),
            "Status": c.status,
          });
        }
      }
      if (claimRows.length) {
        const wsClaims = XLSX.utils.json_to_sheet(claimRows);
        wsClaims["!cols"] = [
          { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 15 },
          { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
        ];
        XLSX.utils.book_append_sheet(wb, wsClaims, "Progress Claims");
      }
    }

    if (type === "all" || type === "subbies") {
      const subbies = await prisma.subcontractor.findMany({
        include: { jobSubbies: { include: { job: true } } },
        orderBy: { trade: "asc" },
      });

      // -- Subcontractors sheet (Buildxact Supplier Import format) --
      const subRows = subbies.map((s) => ({
        "Trade / Category": s.trade,
        "Company Name": s.companyName,
        "Contact Name": s.contactName || "",
        "Phone": s.phone || "",
        "Email": s.email || "",
        "ABN": s.abn || "",
        "Insurance Expiry": fmt(s.insuranceExpiry),
        "Rate / Pricing": s.rateBasis || "",
        "Rating": s.rating ?? "",
        "Active Jobs": s.jobSubbies.map((js) => js.job.jobNumber).join(", "),
        "Notes": s.notes || "",
      }));
      const wsSubbies = XLSX.utils.json_to_sheet(subRows);
      wsSubbies["!cols"] = [
        { wch: 18 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 25 },
        { wch: 18 }, { wch: 15 }, { wch: 20 }, { wch: 8 }, { wch: 15 }, { wch: 30 },
      ];
      XLSX.utils.book_append_sheet(wb, wsSubbies, "Subcontractors");

      // -- Job Assignments sheet --
      const assignRows: Record<string, unknown>[] = [];
      for (const s of subbies) {
        for (const js of s.jobSubbies) {
          assignRows.push({
            "Job Number": js.job.jobNumber,
            "Client": js.job.clientName,
            "Trade": s.trade,
            "Company": s.companyName,
            "Contact": s.contactName || "",
            "Quote Amount (ex GST)": currency(js.quoteAmount),
            "Status": js.status,
            "Scheduled Start": fmt(js.scheduledStart),
            "Scheduled End": fmt(js.scheduledEnd),
          });
        }
      }
      if (assignRows.length) {
        const wsAssign = XLSX.utils.json_to_sheet(assignRows);
        wsAssign["!cols"] = [
          { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 25 },
          { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
        ];
        XLSX.utils.book_append_sheet(wb, wsAssign, "Job Assignments");
      }
    }

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const today = format(new Date(), "yyyy-MM-dd");
    const filename = `SiteFlow_Export_${today}.xlsx`;

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
