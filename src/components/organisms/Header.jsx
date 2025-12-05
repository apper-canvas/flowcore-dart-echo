import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@/layouts/Root";
import Button from "@/components/atoms/Button";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
<div className="flex items-center">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;