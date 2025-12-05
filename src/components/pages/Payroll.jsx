import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DataTable from "@/components/organisms/DataTable";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import PayrollModal from "@/components/organisms/PayrollModal";
import payrollService from "@/services/api/payrollService";
import { format } from "date-fns";

const Payroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [filteredPayroll, setFilteredPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadPayroll();
  }, []);

  useEffect(() => {
    filterPayroll();
  }, [payroll, searchTerm]);

  const loadPayroll = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await payrollService.getAll();
      setPayroll(data);
    } catch (err) {
      setError("Failed to load payroll records");
      console.error("Payroll error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterPayroll = () => {
    if (!searchTerm.trim()) {
      setFilteredPayroll(payroll);
      return;
    }

    const filtered = payroll.filter(record => {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.Name?.toLowerCase().includes(searchLower) ||
        record.employee_id_c?.toString().includes(searchLower) ||
        record.month_c?.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredPayroll(filtered);
    setCurrentPage(1);
  };

  const handleAddPayroll = () => {
    setSelectedPayroll(null);
    setIsModalOpen(true);
  };

  const handleEditPayroll = (record) => {
    setSelectedPayroll(record);
    setIsModalOpen(true);
  };

  const handleDeletePayroll = async (record) => {
    if (!window.confirm(`Are you sure you want to delete this payroll record?`)) {
      return;
    }

    const success = await payrollService.delete(record.Id);
    if (success) {
      await loadPayroll();
    }
  };

  const handlePayrollSubmit = async (payrollData) => {
    let success = false;
    
    if (selectedPayroll) {
      const result = await payrollService.update(selectedPayroll.Id, payrollData);
      success = !!result;
    } else {
      const result = await payrollService.create(payrollData);
      success = !!result;
    }

    if (success) {
      setIsModalOpen(false);
      setSelectedPayroll(null);
      await loadPayroll();
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const columns = [
    { 
      key: "employee_id_c", 
      label: "Employee ID", 
      sortable: true 
    },
    { 
      key: "month_c", 
      label: "Month", 
      sortable: true,
      render: (value) => value ? format(new Date(value), "MMM yyyy") : "-"
    },
    { 
      key: "gross_salary_c", 
      label: "Gross Salary", 
      sortable: true,
      render: (value) => value ? `$${value.toLocaleString()}` : "-"
    },
    { 
      key: "deductions_c", 
      label: "Deductions", 
      sortable: true,
      render: (value) => value ? `$${value.toLocaleString()}` : "$0"
    },
    { 
      key: "net_salary_c", 
      label: "Net Salary", 
      sortable: true,
      render: (value) => value ? `$${value.toLocaleString()}` : "-"
    },
    { 
      key: "payment_date_c", 
      label: "Payment Date", 
      sortable: true,
      render: (value) => value ? format(new Date(value), "MMM dd, yyyy") : "-"
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditPayroll(record);
            }}
          >
            <ApperIcon name="Edit" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePayroll(record);
            }}
          >
            <ApperIcon name="Trash2" className="w-4 h-4 text-error" />
          </Button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(filteredPayroll.length / itemsPerPage);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorView message={error} onRetry={loadPayroll} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
            <p className="mt-2 text-gray-600">Manage employee payroll records</p>
          </div>
          <Button
            variant="primary"
            onClick={handleAddPayroll}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search payroll records..."
            />
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="space-y-6">
        {filteredPayroll.length === 0 && !loading ? (
          <Empty 
            title="No payroll records found"
            description={searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first payroll record"}
            action={
              !searchTerm && (
                <Button variant="primary" onClick={handleAddPayroll}>
                  <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
                  Add Record
                </Button>
              )
            }
          />
        ) : (
          <DataTable
            data={filteredPayroll}
            columns={columns}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredPayroll.length,
              itemsPerPage,
              onPageChange: handlePageChange,
              onItemsPerPageChange: handleItemsPerPageChange,
              component: ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>of {totalItems} results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )
            }}
          />
        )}
      </div>

      {/* Payroll Modal */}
      <PayrollModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayroll(null);
        }}
        onSubmit={handlePayrollSubmit}
        payroll={selectedPayroll}
      />
    </div>
  );
};

export default Payroll;