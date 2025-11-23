// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="center-page">
      <h1 className="page-title">404</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link to="/dashboard" className="btn-primary">
        Go to dashboard
      </Link>
    </div>
  );
}
