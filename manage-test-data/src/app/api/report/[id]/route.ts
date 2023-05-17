import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function GET(request: Request) {
  
}

// update comment POST report/214141
export async function POST(request: Request) {
  console.log(request.body);
  const body = await request.body;
  const id = 1;
  const comment = "abc";
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
