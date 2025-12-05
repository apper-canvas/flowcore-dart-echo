import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <ApperIcon name="Search" className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to your dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2"
          >
            <ApperIcon name="Home" className="w-4 h-4" />
            Go to Dashboard
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4" />
            Go Back
          </Button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Quick access to main sections:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => navigate("/inventory")}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Inventory
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Orders
            </button>
            <button
              onClick={() => navigate("/customers")}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Customers
            </button>
            <button
              onClick={() => navigate("/financials")}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Financials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;