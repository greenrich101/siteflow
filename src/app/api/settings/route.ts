import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst({ where: { id: "default" } });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    let settings = await prisma.settings.findFirst({ where: { id: "default" } });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "default", ...body },
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: "default" },
        data: body,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
