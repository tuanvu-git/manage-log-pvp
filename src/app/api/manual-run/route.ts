import { ICSVReport } from "@/interface/api/IReport";
import { PrismaClient, Report } from "@prisma/client";
import fs from 'fs';
import moment from "moment";
const prisma = new PrismaClient();
const prefix = 'public\\all_log\\';


// TODO 
// app/api/route.ts

export const runtime = 'nodejs';
// This is required to enable streaming
export const dynamic = 'force-dynamic';

export async function GET() {

  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  writer.write(encoder.encode('Running ....'));

  getDirectorySync(prefix, 'mac', writer)
    .then(() => getDirectorySync(prefix, 'win', writer))
    .then(() => getDirectorySync(prefix, 'wuo', writer))
    .then(() => {
      writer.write(encoder.encode('\nDone!!!'));
      writer.close();
    })


  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
// TODO END



// export async function GET(request: Request) {
//   // const prefix = 'public/all_log/';
//   await getDirectorySync(prefix, 'mac');
//   await getDirectorySync(prefix, 'win');
//   await getDirectorySync(prefix, 'wuo');
//   return NextResponse.json({
//     data: {},
//     message: "Inserted Data Successfully",
//   });

//   // hanndleReadFile
// }

async function getDirectorySync(directoryPath: string, system: any = 'win', writer: WritableStreamDefaultWriter<any>) {
  const encoder = new TextEncoder();
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
    const fullPath = directoryPath + '\\' + file + '\\Test_result.csv';
    writer.write(encoder.encode('\nimporting file: ' + fullPath));
    console.log('importing file: ' + fullPath);
    await hanndleReadFile(fullPath);
    writer.write(encoder.encode('\nimport file: ' + fullPath + ' done!!'));
  }

  return new Promise(res => {
    res(null);
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

async function hanndleReadFile(fullPathFile: string) {
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
  return importDB(data, system, folderName, testType);
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

async function importDB(arrObject: ICSVReport[], system: "win" | "mac" | "wuo", folderName: string, testType: string) {
  return new Promise(async res => {

    let reports: any[] = [];

    let allPreviusData: Report[] = [];
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
    res(reports);
    return reports;
  });

}