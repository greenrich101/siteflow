import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const absolutePath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
