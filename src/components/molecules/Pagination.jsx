import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  className = ""
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    onItemsPerPageChange(newItemsPerPage);
    // Reset to first page when changing items per page
    onPageChange(1);
  };

  // Don't render if there's no data or only one page and no items per page selector
  if (totalItems === 0 || (totalPages <= 1 && !showItemsPerPage)) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200 ${className}`}>
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing {startItem} to {endItem} of {totalItems} results
        </span>
        {showItemsPerPage && (
          <div className="ml-6 flex items-center space-x-2">
            <span>Show</span>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="w-20 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
            <span>per page</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          className="flex items-center space-x-1"
        >
          <ApperIcon name="ChevronLeft" size={16} />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <Button
          variant="secondary" 
          size="sm"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="flex items-center space-x-1"
        >
          <span>Next</span>
          <ApperIcon name="ChevronRight" size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;