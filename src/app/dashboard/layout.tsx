import { IPage } from "@/interface/IPage";


// import {ALL_ROUTER} from '../app'
export default function DashboardLayout({ children }: IPage) {
  return (
    <div className="dashboard-component">
      {/* TODO */}
      {/* {ALL_ROUTER.dashboard.mac} */}
      {children}
      {/* <div className="bg-blue-700 h-5">hes</div> */}
    </div>
  );
}
