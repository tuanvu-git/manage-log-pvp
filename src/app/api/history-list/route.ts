import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
// get report by date
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const system = searchParams.get("system") || "";
  const history = await prisma.report.findMany({
    where: {
      system: system,
    },
    distinct: ['folderName'],
    orderBy: [{
      testType: 'asc',
    }, {
      folderName: 'desc'
    }],
    select: {
      id: true,
      folderName: true,
    }
  });

  return NextResponse.json({ history });
}
