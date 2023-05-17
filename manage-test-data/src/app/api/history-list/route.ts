import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import moment from "moment";

const prisma = new PrismaClient();
// get report by date
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const history = await prisma.report.findMany({
    where: {
      system: 'window',
    },
    distinct: ['date'],
    select: {
      id: true,
      date: true,
    }
  });

  return NextResponse.json({ data: history });
}
