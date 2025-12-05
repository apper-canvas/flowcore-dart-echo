import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { name: "Dashboard", href: "/", icon: "BarChart3" },
    { name: "Inventory", href: "/inventory", icon: "Package" },
    { name: "Orders", href: "/orders", icon: "ShoppingCart" },
    { name: "Customers", href: "/customers", icon: "Users" },
    { name: "Financials", href: "/financials", icon: "DollarSign" }
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would perform global search
      console.log("Searching for:", searchQuery);
    }
  };

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
                FlowCore ERP
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
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
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block max-w-sm w-full">
            <form onSubmit={handleSearchSubmit}>
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search products, orders, customers..."
              />
            </form>
          </div>

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
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search..."
              />
            </form>
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
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
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;