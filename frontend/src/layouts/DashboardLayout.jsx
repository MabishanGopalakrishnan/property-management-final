import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* TOP NAVBAR */}
      <nav className="w-full bg-[#1a1a1a] px-8 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="text-xl font-bold">Property Manager</div>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="hover:text-cyan-300">Home</Link>
          <Link to="/properties" className="hover:text-cyan-300">Properties</Link>
          <Link to="/units" className="hover:text-cyan-300">Units</Link>
          <Link to="/payments" className="hover:text-cyan-300">Payments</Link>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="p-10">
        <Outlet />
      </div>
    </div>
  );
}
