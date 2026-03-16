import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const variation = await prisma.variation.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(variation);
  } catch (error) {
    console.error("Failed to update variation:", error);
    return NextResponse.json({ error: "Failed to update variation" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.variation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete variation:", error);
    return NextResponse.json({ error: "Failed to delete variation" }, { status: 500 });
  }
}
