import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const document = await prisma.document.create({
      data: {
        jobId: body.jobId,
        folder: body.folder,
        subfolder: body.subfolder,
        fileName: body.fileName,
        filePath: body.filePath,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
