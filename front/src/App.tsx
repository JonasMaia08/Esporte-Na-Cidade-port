import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="">
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </div>
  );
}

export default App;
