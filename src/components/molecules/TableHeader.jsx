import React from "react";
import ApperIcon from "@/components/ApperIcon";

const TableHeader = ({ columns, sortBy, sortDirection, onSort }) => {
  const handleSort = (column) => {
    if (!column.sortable) return;
    
    let direction = "asc";
    if (sortBy === column.key && sortDirection === "asc") {
      direction = "desc";
    }
    
    onSort(column.key, direction);
  };

  return (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
              column.sortable ? "cursor-pointer hover:text-gray-700" : ""
            }`}
            onClick={() => handleSort(column)}
          >
            <div className="flex items-center gap-1">
              {column.label}
              {column.sortable && (
                <div className="flex flex-col">
                  <ApperIcon 
                    name="ChevronUp" 
                    className={`w-3 h-3 ${
                      sortBy === column.key && sortDirection === "asc" 
                        ? "text-primary" 
                        : "text-gray-400"
                    }`} 
                  />
                  <ApperIcon 
                    name="ChevronDown" 
                    className={`w-3 h-3 -mt-1 ${
                      sortBy === column.key && sortDirection === "desc" 
                        ? "text-primary" 
                        : "text-gray-400"
                    }`} 
                  />
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;