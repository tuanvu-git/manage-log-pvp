import { ALL_ROUTER } from "@/constant/router.constant";
import { IPage } from "@/interface/IPage";


// import {ALL_ROUTER} from '../app'
export default function DashboardLayout({ children }: IPage) {
  return (
    <div className="dashboard-component">
      {/* TODO */}
      {ALL_ROUTER.dashboard.mac}
      {children}
    </div>
  );
}
