import { useEffect, useState } from "react";
import { getMeRequest } from "../api/auth";   // <-- FIXED
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMeRequest();   // <-- FIXED
        setUser(res.data);                 // <-- Important: API returns { data }
      } catch (err) {
        console.log("Not logged in", err);
        navigate("/login");
      }
    };
    fetchUser();
  }, []);

  if (!user) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#1b1c1f] text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">
          Welcome, <span className="text-blue-400">{user.email}</span>
        </h1>

        <p className="text-gray-300 mb-10 text-lg">
          Role: <span className="font-semibold">{user.role}</span>
        </p>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Properties</h2>

          {!user.properties || user.properties.length === 0 ? (
            <p className="text-gray-400">You have no properties yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.properties.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#24262b] p-5 rounded-lg shadow-md border border-gray-700"
                >
                  <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
                  <p className="text-gray-400">{p.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
