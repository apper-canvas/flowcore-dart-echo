import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

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
      { name: "Departments", href: "/departments", icon: "Building" },
      { name: "Payroll", href: "/payroll", icon: "DollarSign" }
    ]
  }
];

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <ApperIcon 
          name={isMobileOpen ? "X" : "Menu"} 
          className="w-6 h-6" 
        />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-sm z-30 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isExpanded ? 'w-64' : 'w-16 lg:w-16'}
      `}>
        {/* Sidebar Header */}
<div className="flex items-center justify-between p-4 border-b border-gray-200">
          {isExpanded && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ERP</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ERP System
              </span>
            </div>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden lg:block p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <ApperIcon 
              name={isExpanded ? "ChevronLeft" : "ChevronRight"} 
              className="w-4 h-4" 
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <>
                  <div className={`flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-600 rounded-md ${!isExpanded && 'justify-center'}`}>
                    <ApperIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && <span>{item.name}</span>}
                  </div>
                  {isExpanded && (
                    <div className="ml-4 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.name}
                          to={child.href}
                          onClick={() => setIsMobileOpen(false)}
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
                  )}
                </>
              ) : (
                <NavLink
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                      !isExpanded ? 'justify-center' : ''
                    } ${
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`
                  }
                >
                  <ApperIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && <span>{item.name}</span>}
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;