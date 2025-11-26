// src/layouts/LandlordLayout.jsx
import Navbar from "../components/Navbar";

export default function LandlordLayout({ children }) {
  return (
    <div className="layout-container">
      <Navbar />

      <main className="page-container">
        {children}
      </main>
    </div>
  );
}
