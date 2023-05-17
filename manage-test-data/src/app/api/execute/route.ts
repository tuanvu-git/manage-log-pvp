import { IReport } from "@/interface/api/IReport";
import { ICSVReport } from "@/interface/api/IReport";
import { PrismaClient, Report } from "@prisma/client";
import { NextResponse } from "next/server";
import moment from "moment";
const prisma = new PrismaClient();

// check request timeout. insert data take too much time.

export async function POST(request: Request) {
  const data = await request.formData();
  console.log(data);
  const filewindow = data.get("fileWindow") as File;
  const fileMac = data.get("fileWindow") as File;
  const fileWUO = data.get("fileWindow") as File;
  let allReport: IReport[] = [];

  allReport.concat(await importDB(filewindow, "window"));
  allReport.concat(await importDB(fileMac, "mac"));
  allReport.concat(await importDB(fileWUO, "wuo"));
  return NextResponse.json({ data: allReport, message: 'insert data successfully' });
}

function convertCSVToJson(text: string): ICSVReport[] {
  const arr = text.split("\n");
  if (arr.length === 0) return [];
  const columnName = ["name", "status", "time"];
  const results = [];
  for (let i = 0; i < arr.length; i++) {
    const values = arr[i].split(",");
    const obj: any = {};
    values.forEach((value, index) => {
      obj[columnName[index]] = value;
    });
    results.push(obj);
  }
  return results;
}

function mappingComment(source: Report[], productName: string, system: string) {
  const record = source.find(
    (report) => report.productName === productName && report.system === system
  );
  if (record) {
    return record.comment;
  }
  return "";
}

async function importDB(file: File, system: "window" | "mac" | "wuo") {
  const text = await file.text();
  const arrObject = convertCSVToJson(text);
  const reports$: any[] = [];
  const count = await prisma.report.count({
    where: {
      date: moment().format("yyyy-mm-dd"),
      system,
    },
  });

  let allReport: IReport[] = [];
  if (count === 0) {
    const allPreviusData = await prisma.report.findMany({
      where: {
        date: moment().add(-1, "day").format("yyyy-mm-dd"),
      },
    });
    // have data today, execute update updat
    arrObject.forEach(async (report) => {
      const temp = prisma.report.create({
        data: {
          date: moment().format('yyyy-mm-dd'),
          productName: report.name,
          buildStatus: report.status,
          time: report.time,
          system: system,
          filePath: `/public/${report.name}.log`,
          comment: mappingComment(allPreviusData, report.name),
          createdAt: moment().format('yyyy-mm-dd'),
          updatedAt:moment().format('yyyy-mm-dd'),
        },
      });
      reports$.push(temp);
    });
  } else {
    arrObject.forEach((report) => {
      const temp = prisma.report.updateMany({
        where: {
          date: moment().format('yyyy-mm-dd'),
        },
        data: {
          buildStatus: report.status,
          time: report.time,
          system: system,
          filePath: `/public/${report.name}.log`,
          createdAt: moment().format('yyyy-mm-dd'),
          updatedAt: moment().format('yyyy-mm-dd'),
        },
      });
      reports$.push(temp);
    });
  }
  allReport = await Promise.all(reports$);
  return allReport;
}
