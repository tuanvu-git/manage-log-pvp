import { ICSVReport } from "@/interface/api/IReport";
import { PrismaClient, Report } from "@prisma/client";
import moment from "moment";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export async function POST(request: Request) {
  const data = await request.formData();
  console.log(data);
  const folderName = data.get('folderName') as string;
  const filewindow = data.get("fileWindow") as File;
  const fileMac = data.get("fileMac") as File;
  const fileWUO = data.get("fileWUO") as File;
  let allReport: Report[] = [];
  allReport.concat(await importDB(filewindow, "win", folderName));
  allReport.concat(await importDB(fileMac, "mac", folderName));
  allReport.concat(await importDB(fileWUO, "wuo", folderName));
  return NextResponse.json({
    data: allReport,
    message: "Inserted Data Successfully",
  });
}

// delete data by date
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const currentDate = searchParams.get("date") || "";
  const deletedReport = await prisma.report.deleteMany({
    where: {
      folderName: currentDate,
    },
  });
  return NextResponse.json({
    data: deletedReport,
    message: "Deleted Data Successfully",
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
      obj[columnName[index]] = value.replace(/\r/g, '');
    });
    results.push(obj);
  }
  arr.reverse().forEach(item => {
    if (!item.includes('Total runtime'))
      return;
    const values = item.split(",");
    results.push(
      {
        name: "total",
        time: values[1].replace(/\r/g, ''),
        satus: '',
      }
    );
  })

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

async function importDB(file: File, system: "win" | "mac" | "wuo", folderName: string, testType = '1') {
  if (!file) return [];
  const text = await file.text();
  const arrObject = convertCSVToJson(text);
  let reports: any[] = [];
  let allPreviusData: Report[] = [];
  const allPreviusDataWM = await prisma.report.findMany({
    where: {
      system: {
        in: ['win', 'mac']
      },
      folderName: {
        contains: moment(folderName).add(-1, "day").format("YYYY-MM-DD")
      },
    },
  });

  allPreviusData = allPreviusData.concat(allPreviusDataWM);
  const dateWUO = await prisma.report.findMany({
    where: {
      system: 'wuo',
    },
    distinct: ['folderName'],
    orderBy: {
      folderName: 'desc'
    },
    select: {
      id: true,
      folderName: true,
    }
  });
  if (dateWUO.length > 0) {
    const allPreviusDataWUO = await prisma.report.findMany({
      where: {
        system: 'wuo',
        folderName: dateWUO[0].folderName,
      },
    });
    allPreviusData = allPreviusData.concat(allPreviusDataWUO)
  }
  for (let i = 0; i < arrObject.length; i++) {
    const report = arrObject[i];
    const isLast = i === arrObject.length - 1
    const insertedReport = await prisma.report.upsert({
      where: {
        folderName_productName_system: {
          folderName: moment(folderName).format("YYYY-MM-DD"),
          productName: report.name,
          system: system,
        },
      },
      create: {
        folderName: moment(folderName).format("YYYY-MM-DD"),
        testType: testType,
        productName: report.name,
        buildStatus: report.status || '',
        time: report.time,
        system: system,
        isSumarry: isLast,
        filePath: `/all_log/${system}/log_report_${folderName}/${report.name}.json.log`,
        comment: mappingComment(allPreviusData, report.name, system),
      },
      update: {
        buildStatus: report.status || '',
        time: report.time,
        filePath: `/all_log/${system}/log_report_${folderName}/${report.name}.json.log`,
        comment: mappingComment(allPreviusData, report.name, system),
      },
    });
    reports.push(insertedReport);
    console.log("current" + i);
  }

  return reports;
}
