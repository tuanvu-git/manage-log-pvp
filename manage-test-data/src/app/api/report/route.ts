import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import moment from "moment";

const prisma = new PrismaClient();
// get report by date
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

  return NextResponse.json({ data: reportBySystem });
}
