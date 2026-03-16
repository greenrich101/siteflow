import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const jobSubbie = await prisma.jobSubbie.create({
      data: {
        jobId: body.jobId,
        subcontractorId: body.subcontractorId,
        quoteAmount: body.quoteAmount,
        status: body.status,
        scheduledStart: body.scheduledStart ? new Date(body.scheduledStart) : undefined,
        scheduledEnd: body.scheduledEnd ? new Date(body.scheduledEnd) : undefined,
      },
      include: {
        subcontractor: true,
        job: true,
      },
    });

    return NextResponse.json(jobSubbie, { status: 201 });
  } catch (error) {
    console.error("Failed to assign subcontractor:", error);
    return NextResponse.json({ error: "Failed to assign subcontractor" }, { status: 500 });
  }
}
