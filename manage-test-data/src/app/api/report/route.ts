import { PrismaClient } from "@prisma/client";
import moment from "moment";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
// get report by date and system
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || "";
  const system = searchParams.get("system") || "";
  const reportBySystem = await prisma.report.findMany({
    where: {
      date: moment(date).format('YYYY-MM-dd'),
      system: system,
    }
  });

  return NextResponse.json({ reportBySystem });
}
