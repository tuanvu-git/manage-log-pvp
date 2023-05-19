import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
// get report by date
export async function GET(request: Request) {
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

  return NextResponse.json({  history });
}
