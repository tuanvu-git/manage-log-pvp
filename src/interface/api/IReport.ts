import { Report } from "@prisma/client";

export interface ICSVReport {
  name: string;
  status: string;
  time: string;
}


export type IReport = Report & {
  folderNameDisplay: string
}
