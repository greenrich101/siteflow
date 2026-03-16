import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const subcontractors = await prisma.subcontractor.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        jobSubbies: {
          include: { job: true },
        },
      },
    });
    return NextResponse.json(subcontractors);
  } catch (error) {
    console.error("Failed to fetch subcontractors:", error);
    return NextResponse.json({ error: "Failed to fetch subcontractors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const subcontractor = await prisma.subcontractor.create({
      data: {
        trade: body.trade,
        companyName: body.companyName,
        contactName: body.contactName,
        phone: body.phone,
        email: body.email,
        abn: body.abn,
        insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : undefined,
        rateBasis: body.rateBasis,
        rating: body.rating,
        notes: body.notes,
      },
    });

    return NextResponse.json(subcontractor, { status: 201 });
  } catch (error) {
    console.error("Failed to create subcontractor:", error);
    return NextResponse.json({ error: "Failed to create subcontractor" }, { status: 500 });
  }
}
