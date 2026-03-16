import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const variation = await prisma.variation.create({
      data: {
        jobId: body.jobId,
        title: body.title,
        description: body.description,
        amount: body.amount,
      },
    });

    return NextResponse.json(variation, { status: 201 });
  } catch (error) {
    console.error("Failed to create variation:", error);
    return NextResponse.json({ error: "Failed to create variation" }, { status: 500 });
  }
}
