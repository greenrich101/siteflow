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
    if (body.date) data.date = new Date(body.date);

    const dailyLog = await prisma.dailyLog.update({
      where: { id },
      data,
    });

    return NextResponse.json(dailyLog);
  } catch (error) {
    console.error("Failed to update daily log:", error);
    return NextResponse.json({ error: "Failed to update daily log" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.dailyLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete daily log:", error);
    return NextResponse.json({ error: "Failed to delete daily log" }, { status: 500 });
  }
}
