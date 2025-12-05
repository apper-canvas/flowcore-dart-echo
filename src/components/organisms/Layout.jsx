import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Header from "@/components/organisms/Header";

const Layout = () => {
  const { isAuthenticated } = useSelector(state => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;