import React, { useState } from "react";
import TableHeader from "@/components/molecules/TableHeader";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";

const DataTable = ({ 
  data, 
  columns, 
  loading, 
  emptyState,
  onRowClick,
  className = ""
}) => {
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (columnKey, direction) => {
    setSortBy(columnKey);
    setSortDirection(direction);
  };

  const sortedData = React.useMemo(() => {
    if (!sortBy || !data) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortBy, sortDirection]);

  if (loading) {
    return <Loading type="table" />;
  }

  if (!data || data.length === 0) {
    return emptyState || <Empty />;
  }

  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader
            columns={columns}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, index) => (
              <tr
                key={row.Id || index}
                onClick={() => onRowClick && onRowClick(row)}
                className={`${
                  onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                } transition-colors duration-150`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render 
                      ? column.render(row[column.key], row) 
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;