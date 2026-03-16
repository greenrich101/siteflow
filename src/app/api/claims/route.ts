import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const lastClaim = await prisma.progressClaim.findFirst({
      where: { jobId: body.jobId },
      orderBy: { claimNumber: "desc" },
    });

    const claimNumber = lastClaim ? lastClaim.claimNumber + 1 : 1;

    const claim = await prisma.progressClaim.create({
      data: {
        jobId: body.jobId,
        claimNumber,
        amount: body.amount,
        dateSent: new Date(body.dateSent),
        datePaid: body.datePaid ? new Date(body.datePaid) : undefined,
        status: body.status,
      },
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    console.error("Failed to create claim:", error);
    return NextResponse.json({ error: "Failed to create claim" }, { status: 500 });
  }
}
