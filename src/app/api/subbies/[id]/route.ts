import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subcontractor = await prisma.subcontractor.findUnique({
      where: { id },
      include: {
        jobSubbies: {
          include: { job: true },
        },
      },
    });

    if (!subcontractor) {
      return NextResponse.json({ error: "Subcontractor not found" }, { status: 404 });
    }

    return NextResponse.json(subcontractor);
  } catch (error) {
    console.error("Failed to fetch subcontractor:", error);
    return NextResponse.json({ error: "Failed to fetch subcontractor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = { ...body };
    if (body.insuranceExpiry) data.insuranceExpiry = new Date(body.insuranceExpiry);

    const subcontractor = await prisma.subcontractor.update({
      where: { id },
      data,
    });

    return NextResponse.json(subcontractor);
  } catch (error) {
    console.error("Failed to update subcontractor:", error);
    return NextResponse.json({ error: "Failed to update subcontractor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.subcontractor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete subcontractor:", error);
    return NextResponse.json({ error: "Failed to delete subcontractor" }, { status: 500 });
  }
}
