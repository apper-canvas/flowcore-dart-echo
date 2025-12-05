import React from "react";

const Loading = ({ type = "page" }) => {
  if (type === "table") {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-full mb-4"></div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 mb-3">
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded col-span-2"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"></div>
            </div>
            <div className="w-20 h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-2"></div>
            <div className="w-24 h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-accent opacity-20 animate-pulse"></div>
          <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <div className="space-y-3">
          <div className="w-32 h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mx-auto animate-pulse"></div>
          <div className="w-24 h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;