import React, { useState } from "react";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import TableHeader from "@/components/molecules/TableHeader";

const DataTable = ({ 
  data, 
  columns, 
  loading, 
  emptyState,
  onRowClick,
  pagination,
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
// Handle pagination if provided - must be called before early returns
const paginatedData = React.useMemo(() => {
    if (!pagination || !sortedData) return sortedData;
    
    const { currentPage, itemsPerPage } = pagination;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Ensure we don't go beyond array bounds and handle edge cases
    if (startIndex >= sortedData.length && sortedData.length > 0) {
      // If current page is beyond available data, return empty array
      return [];
    }
    
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination]);

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
            {paginatedData.map((row, index) => (
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
                      ? column.render(row, row) 
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <pagination.component
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.onPageChange}
          onItemsPerPageChange={pagination.onItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default DataTable;