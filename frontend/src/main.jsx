import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

<<<<<<< HEAD
// IMPORT your AuthProvider
import { AuthProvider } from "./context/AuthContext.jsx";
=======
// Google OAuth
import { GoogleOAuthProvider } from "@react-oauth/google";
>>>>>>> 1b23df24c03b6decf4a406c79c06e32b2dcd0df2

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="595357260328-bgtuhfcdt7is5asi5fkikg8cndhmflbo.apps.googleusercontent.com">
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
