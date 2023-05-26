import { ICSVReport } from "@/interface/api/IReport";
import { PrismaClient, Report } from "@prisma/client";
import fs from 'fs';
import moment from "moment";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
const prefix = 'public\\all_log\\';

export async function POST(request: Request) {
  const data = await request.json();

  // const folderName = data.get('folderName') as string;
  const fullPathFile = data.fullPathFile
  const isMigratePhase = data.isMigratePhase;
  console.log('running file: ' + fullPathFile);
  let isMigratePhaseBool = isMigratePhase === 'yes' ? true : false;
  isMigratePhaseBool = false; // hard code for test;
  await hanndleReadFile(fullPathFile, isMigratePhaseBool);
  console.log('running file completed: ' + fullPathFile);
  return NextResponse.json({
    message: "Inserted Data Successfully",
  });
}

function getFileSync(filePath: string,) {
  const data: string = fs.readFileSync(filePath,
    { encoding: 'utf8', flag: 'r' });

  return convertCSVToJson(data);
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

async function hanndleReadFile(fullPathFile: string, isMigratePhaseBool: boolean) {
  // public/all_log/mac/log_report/test_result.csv
  const fullPathFileTmp = fullPathFile.replace(prefix, '').split('\\');
  const system = fullPathFileTmp[0] as any;
  const folderName = fullPathFileTmp[1];

  let pattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  let result = pattern.test(folderName);
  let testType = '0'; // daily report
  if (!result) {
    testType = '1';
  }

  const data = getFileSync(fullPathFile);
  await importDB(data, system, folderName, testType, isMigratePhaseBool);

  return null;
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

async function importDB(arrObject: ICSVReport[], system: "win" | "mac" | "wuo", folderName: string, testType: string, isMigratePhaseBool = true) {
  let reports: any[] = [];

  let allPreviusData: Report[] = [];
  if (!isMigratePhaseBool) {
    const regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/g;
    const found = folderName.match(regex);
    if (found && found.length > 0) {
      const allPreviusDataWM = await prisma.report.findMany({
        where: {
          system: {
            in: ['win', 'mac']
          },
          folderName: {
            contains: moment(found[0]).add(-1, "day").format("YYYY-MM-DD")
          },
        },
      });

      allPreviusData = allPreviusData.concat(allPreviusDataWM);
    }

    const dateWUO = await prisma.report.findMany({
      where: {
        system: 'wuo',
      },
      distinct: ['folderName'],
      orderBy: [{
        testType: 'asc'
      }, {
        folderName: 'desc',
      }],
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
  }

  for (let i = 0; i < arrObject.length; i++) {
    const report = arrObject[i];
    const isLast = i === arrObject.length - 1;
    try {
      const insertedReport = await prisma.report.upsert({
        where: {
          folderName_productName_system: {
            folderName: folderName,
            productName: report.name,
            system: system,
          },
        },
        create: {
          folderName: folderName,
          testType: testType, // 0 = daily, 1 = ticket test
          productName: report.name,
          buildStatus: report.status || '',
          time: report.time,
          system: system,
          isSumarry: isLast,
          filePath: `/all_log/${system}/${folderName}/${report.name}.json.log`,
          comment: mappingComment(allPreviusData, report.name, system),
        },
        update: {
          buildStatus: report.status || '',
          time: report.time,
          filePath: `/all_log/${system}/${folderName}/${report.name}.json.log`,
        },
      });
      reports.push(insertedReport);
    } catch (e) {
      i--;
      console.log(' failed record ', system, folderName, i, ' try to re-execute this record');
    }
  }

  return reports;
}

// delete data by date
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderName = searchParams.get("folderName") || "";
  const system = searchParams.get("system") || "";
  const path = prefix + `${system}\\${folderName}`;
  await fs.rmSync(path, { recursive: true, force: true });
  const deletedReport = await prisma.report.deleteMany({
    where: {
      folderName: folderName,
      system: system
    },
  });
  return NextResponse.json({
    data: deletedReport,
    message: "Deleted Data Successfully",
  });
}
