import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@/layouts/Root";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const { logout } = useAuth();
const navigationItems = [
    { name: "Dashboard", href: "/", icon: "BarChart3" },
    { name: "Inventory", href: "/inventory", icon: "Package" },
    { name: "Orders", href: "/orders", icon: "ShoppingCart" },
    { name: "Sales Orders", href: "/sales-orders", icon: "ShoppingBag" },
    { name: "Customers", href: "/customers", icon: "Users" },
    { name: "Financials", href: "/financials", icon: "TrendingUp" },
    {
      name: "HR Management",
      icon: "UserCog",
      children: [
        { name: "Employees", href: "/employees", icon: "Users" },
        { name: "Attendance", href: "/attendance", icon: "Calendar" },
        { name: "Payroll", href: "/payroll", icon: "DollarSign" }
      ]
    }
  ];
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-3">
                <ApperIcon name="Layers" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
ERP System
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
<nav className="hidden lg:flex space-x-8">
            {navigationItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.children ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary cursor-pointer transition-all duration-200">
                      <ApperIcon name={item.icon} className="w-4 h-4" />
                      {item.name}
                      <ApperIcon name="ChevronDown" className="w-3 h-3" />
                    </div>
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.name}
                            to={child.href}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? "text-primary bg-primary/5"
                                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
                              }`
                            }
                          >
                            <ApperIcon name={child.icon} className="w-4 h-4" />
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 relative ${
                        isActive
                          ? "text-primary"
                          : "text-gray-600 hover:text-primary"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <ApperIcon name={item.icon} className="w-4 h-4" />
                        {item.name}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
{/* Mobile Menu Button */}
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ApperIcon 
              name={isMobileMenuOpen ? "X" : "Menu"} 
              className="w-6 h-6" 
            />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
{isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2">
            <nav className="space-y-1">
{navigationItems.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-600 rounded-md">
                        <ApperIcon name={item.icon} className="w-5 h-5" />
                        {item.name}
                      </div>
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.name}
                            to={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                isActive
                                  ? "text-primary bg-primary/5"
                                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
                              }`
                            }
                          >
                            <ApperIcon name={child.icon} className="w-4 h-4" />
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    </>
                  ) : (
                    <NavLink
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                          isActive
                            ? "text-primary bg-primary/5"
                            : "text-gray-600 hover:text-primary hover:bg-gray-50"
                        }`
                      }
                    >
                      <ApperIcon name={item.icon} className="w-5 h-5" />
                      {item.name}
                    </NavLink>
                  )}
                </div>
              ))}
              
              {/* User Profile & Logout */}
              <div className="border-t pt-4 mt-4">
                {user && (
                  <div className="px-3 py-2 text-sm text-gray-600 mb-2">
                    Welcome, {user.firstName} {user.lastName}
                  </div>
                )}
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start px-3 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <ApperIcon name="LogOut" className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;