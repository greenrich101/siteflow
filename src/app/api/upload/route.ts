import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const jobId = formData.get("jobId") as string | null;
    const folder = formData.get("folder") as string | null;
    const subfolder = formData.get("subfolder") as string | null;

    if (!file || !jobId || !folder) {
      return NextResponse.json(
        { error: "file, jobId, and folder are required" },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const dirParts = ["uploads", job.jobNumber, folder];
    if (subfolder) dirParts.push(subfolder);

    const relativeDir = path.join(...dirParts);
    const absoluteDir = path.join(process.cwd(), relativeDir);

    fs.mkdirSync(absoluteDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const absoluteFilePath = path.join(absoluteDir, fileName);

    fs.writeFileSync(absoluteFilePath, buffer);

    const filePath = `/${path.join(relativeDir, fileName)}`;

    const document = await prisma.document.create({
      data: {
        jobId,
        folder,
        subfolder,
        fileName,
        filePath,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Failed to upload file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
