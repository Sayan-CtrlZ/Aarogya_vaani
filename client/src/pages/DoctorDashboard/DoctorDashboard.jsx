import { Outlet } from "react-router-dom";
import UniversalNavbar from "../../components/UniversalNavbar";

export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800">
      <UniversalNavbar />

      {/* Main Outlet Container for Subpages */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
