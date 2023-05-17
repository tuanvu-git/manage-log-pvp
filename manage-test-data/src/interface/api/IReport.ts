export interface IReport {
  id: number;
  date: string;
  productName: string;
  buildStatus: "Build Passed" | "Build Failed"; // Build
  time: string; // time to Build finish the product
  filePath: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICSVReport {
  name: string;
  status: string;
  time: string;
}
