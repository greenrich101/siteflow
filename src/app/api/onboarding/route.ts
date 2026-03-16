import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract text fields
    const getString = (key: string) => {
      const val = formData.get(key);
      return val && typeof val === "string" && val.trim() ? val.trim() : null;
    };
    const getBool = (key: string) => formData.get(key) === "true";

    // Handle file uploads
    const saveFile = async (key: string, subfolder: string): Promise<string | null> => {
      const file = formData.get(key);
      if (!file || !(file instanceof File) || file.size === 0) return null;

      const dir = join(process.cwd(), "uploads", "onboarding", subfolder);
      mkdirSync(dir, { recursive: true });

      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileName = `${timestamp}_${safeName}`;
      const filePath = join(dir, fileName);

      const bytes = await file.arrayBuffer();
      writeFileSync(filePath, Buffer.from(bytes));

      return `/uploads/onboarding/${subfolder}/${fileName}`;
    };

    const companyName = getString("companyName");
    const trade = getString("trade");

    if (!companyName || !trade) {
      return NextResponse.json({ error: "Company name and trade are required" }, { status: 400 });
    }

    // Save uploaded files
    const licenceDocPath = await saveFile("licenceDoc", "licences");
    const insuranceDocPath = await saveFile("insuranceDoc", "insurance");

    const sub = await prisma.subcontractor.create({
      data: {
        trade,
        companyName,
        contactName: getString("contactName"),
        phone: getString("phone"),
        email: getString("email"),
        address: getString("address"),
        abn: getString("abn"),
        gstRegistered: getString("gstRegistered"),
        emergencyContactName: getString("emergencyContactName"),
        emergencyContactPhone: getString("emergencyContactPhone"),
        licenceNumber: getString("licenceNumber"),
        licenceExpiry: getString("licenceExpiry") ? new Date(getString("licenceExpiry")!) : null,
        whiteCardNumber: getString("whiteCardNumber"),
        whiteCardState: getString("whiteCardState"),
        additionalTickets: getString("additionalTickets"),
        licenceDocPath,
        pliProvider: getString("pliProvider"),
        pliPolicyNumber: getString("pliPolicyNumber"),
        pliCoverAmount: getString("pliCoverAmount"),
        pliExpiry: getString("pliExpiry") ? new Date(getString("pliExpiry")!) : null,
        insuranceExpiry: getString("pliExpiry") ? new Date(getString("pliExpiry")!) : null,
        wcPolicyNumber: getString("wcPolicyNumber"),
        wcExpiry: getString("wcExpiry") ? new Date(getString("wcExpiry")!) : null,
        insuranceDocPath,
        siteInduction: getString("siteInduction"),
        ackSWMS: getBool("ackSWMS"),
        ackPPE: getBool("ackPPE"),
        ackIncidentReporting: getBool("ackIncidentReporting"),
        ackDrugAlcohol: getBool("ackDrugAlcohol"),
        ackEnvironmental: getBool("ackEnvironmental"),
        whsNotes: getString("whsNotes"),
        onboardingComplete: true,
        notes: getString("notes"),
      },
    });

    return NextResponse.json(sub, { status: 201 });
  } catch (error) {
    console.error("Onboarding failed:", error);
    return NextResponse.json({ error: "Onboarding submission failed" }, { status: 500 });
  }
}
