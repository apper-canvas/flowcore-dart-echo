import React from "react";
import ApperIcon from "@/components/ApperIcon";

const ErrorView = ({ message = "Something went wrong", onRetry, onBack }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
          <ApperIcon name="AlertCircle" className="w-10 h-10 text-red-500" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Oops! Something went wrong
        </h3>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-primary inline-flex items-center gap-2"
            >
              <ApperIcon name="RefreshCw" className="w-4 h-4" />
              Try Again
            </button>
          )}
          
          {onBack && (
            <button
              onClick={onBack}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ApperIcon name="ArrowLeft" className="w-4 h-4" />
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorView;