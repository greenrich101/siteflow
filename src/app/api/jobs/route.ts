import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        variations: true,
        progressClaims: true,
        jobSubbies: {
          include: { subcontractor: true },
        },
      },
    });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const settings = await prisma.settings.findFirst({ where: { id: "default" } });
    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 500 });
    }

    const jobNumber = `${settings.jobPrefix}${String(settings.nextJobNumber).padStart(3, "0")}`;

    await prisma.settings.update({
      where: { id: "default" },
      data: { nextJobNumber: settings.nextJobNumber + 1 },
    });

    const job = await prisma.job.create({
      data: {
        jobNumber,
        clientName: body.clientName,
        siteAddress: body.siteAddress,
        phone: body.phone,
        email: body.email,
        phase: body.phase,
        quoteAmount: body.quoteAmount,
        quoteSentDate: body.quoteSentDate ? new Date(body.quoteSentDate) : undefined,
        contractSigned: body.contractSigned ? new Date(body.contractSigned) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        targetEndDate: body.targetEndDate ? new Date(body.targetEndDate) : undefined,
        percentComplete: body.percentComplete,
        notes: body.notes,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Failed to create job:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
