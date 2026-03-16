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
    if (body.dateSent) data.dateSent = new Date(body.dateSent);
    if (body.datePaid) data.datePaid = new Date(body.datePaid);

    const claim = await prisma.progressClaim.update({
      where: { id },
      data,
    });

    return NextResponse.json(claim);
  } catch (error) {
    console.error("Failed to update claim:", error);
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.progressClaim.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete claim:", error);
    return NextResponse.json({ error: "Failed to delete claim" }, { status: 500 });
  }
}
