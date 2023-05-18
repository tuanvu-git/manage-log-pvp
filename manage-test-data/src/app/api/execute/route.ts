import { ICSVReport } from "@/interface/api/IReport";
import { PrismaClient, Report } from "@prisma/client";
import moment from "moment";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

// check request timeout. insert data take too much time.
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export async function POST(request: Request) {
  const data = await request.formData();
  console.log(data);
  const filewindow = data.get("fileWindow") as File;
  const fileMac = data.get("fileMac") as File;
  const fileWUO = data.get("fileWUO") as File;
  let allReport: Report[] = [];
  allReport.concat(await importDB(filewindow, "window"));
  allReport.concat(await importDB(fileMac, "mac"));
  allReport.concat(await importDB(fileWUO, "wuo"));
  return NextResponse.json({
    data: allReport,
    message: "insert data successfully",
  });
}

function convertCSVToJson(text: string): ICSVReport[] {
  const arr = text.split("\n");
  if (arr.length === 0) return [];
  const columnName = ["name", "status", "time"];
  const results = [];
  for (let i = 0; i < arr.length; i++) {
    const values = arr[i].split(",");
    const obj: any = {};
    if (values.length !== 3) continue; // wrong format line.
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
  if (!file) return [];
  const text = await file.text();
  const arrObject = convertCSVToJson(text);
  let reports: any[] = [];
  const a = moment;
  const allPreviusData = await prisma.report.findMany({
    where: {
      date: moment().add(-1, "day").format("YYYY-MM-DD"),
    },
  });

  for (let i = 0; i < arrObject.length; i++) {
    const report = arrObject[i];
    const insertedReport = await prisma.report.upsert({
      where: {
        date_productName_system: {
          date: moment().format("YYYY-MM-DD"),
          productName: report.name,
          system: system,
        },
      },
      create: {
        date: moment().format("YYYY-MM-DD"),
        productName: report.name,
        buildStatus: report.status,
        time: report.time,
        system: system,
        filePath: `/${report.name}.log`,
        comment: mappingComment(allPreviusData, report.name, system),
      },
      update: {
        buildStatus: report.status,
        time: report.time,
        filePath: `/${report.name}.log`,
        comment: mappingComment(allPreviusData, report.name, system),
      },
    });
    reports.push(insertedReport);
    console.log("current" + i);
  }

  return reports;
}
