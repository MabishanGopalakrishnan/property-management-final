import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-[#111214] text-white px-6 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-lg font-bold">Property Manager</h1>

        <div className="flex gap-6 text-sm">
          <Link to="/dashboard" className="hover:text-blue-400">
            Home
          </Link>
          <Link to="/properties" className="hover:text-blue-400">
            Properties
          </Link>
          <Link to="/units" className="hover:text-blue-400">
            Units
          </Link>
          <Link to="/payments" className="hover:text-blue-400">
            Payments
          </Link>

          <button
            onClick={logout}
            className="ml-4 bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
