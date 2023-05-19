import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
// get report by date and system 
// return list Report
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || "";
  const system = searchParams.get("system") || "";
  const reportBySystem = await prisma.report.findMany({
    where: {
      date: date,
      system: system,
    }
  });

  return NextResponse.json({ reportBySystem });
}


// update comment POST report/214141
export async function POST(request: Request) {
  const json = await request.json();
  const id = json.id;
  const comment = json.comment;
  const report = await prisma.report.update({
    where: {
      id,
    },
    data: {
      comment,
    },
  });
  return NextResponse.json({ message: 'update comment successfully'});
}
