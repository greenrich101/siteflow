import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dailyLog = await prisma.dailyLog.create({
      data: {
        jobId: body.jobId,
        date: new Date(body.date),
        notes: body.notes,
        weather: body.weather,
        onSite: body.onSite,
      },
    });

    return NextResponse.json(dailyLog, { status: 201 });
  } catch (error) {
    console.error("Failed to create daily log:", error);
    return NextResponse.json({ error: "Failed to create daily log" }, { status: 500 });
  }
}
