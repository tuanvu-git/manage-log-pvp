import { ICSVReport } from "@/interface/api/IReport";
import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(request: Request) {
  const prefix = 'public/all_log/';
  await getDirectorySync(prefix, 'mac');
  await getDirectorySync(prefix, 'win');
  await getDirectorySync(prefix, 'wuo');
  return NextResponse.json({
    data: {},
    message: "Inserted Data Successfully",
  });
}

function getFileSync(filePath: string) {
  const data: string = fs.readFileSync(filePath,
    { encoding: 'utf8', flag: 'r' });

  return convertCSVToJson(data);
}


async function getDirectorySync(directoryPath: string, system: any = 'win') {
  directoryPath = directoryPath + system;
  const dir = fs.readdirSync(directoryPath);
  for (let i = 0; i < dir.length; i++) {
    const file = dir[i];
    console.log(file);
    let fileName = file;

    let pattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}.*$/;
    let result = pattern.test(fileName);
    let testType = '0'; // daily report
    if (!result) {
      testType = '1';
    }

    const data = getFileSync(directoryPath + '/' + file + '/Test_result.csv');
    await importDB(data, system, fileName, testType);
  }

  return null;
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

async function importDB(arrObject: ICSVReport[], system: "win" | "mac" | "wuo", folderName: string, testType: string) {
  let reports: any[] = [];
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
          comment: '',
        },
        update: {
          buildStatus: report.status || '',
          time: report.time,
          filePath: `/all_log/${system}/${folderName}/${report.name}.json.log`,
          comment: '',
        },
      });
      reports.push(insertedReport);
    } catch (e) {
      i--;
      console.log(' fail record ', folderName, i, system);
    }

  }

  return reports;
}
