import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = { ...body };
    if (body.scheduledStart) data.scheduledStart = new Date(body.scheduledStart);
    if (body.scheduledEnd) data.scheduledEnd = new Date(body.scheduledEnd);

    const jobSubbie = await prisma.jobSubbie.update({
      where: { id },
      data,
      include: {
        subcontractor: true,
        job: true,
      },
    });

    return NextResponse.json(jobSubbie);
  } catch (error) {
    console.error("Failed to update job subbie:", error);
    return NextResponse.json({ error: "Failed to update job subbie" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.jobSubbie.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete job subbie:", error);
    return NextResponse.json({ error: "Failed to delete job subbie" }, { status: 500 });
  }
}
