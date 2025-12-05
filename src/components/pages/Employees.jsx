import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DataTable from "@/components/organisms/DataTable";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import EmployeeModal from "@/components/organisms/EmployeeModal";
import employeeService from "@/services/api/employeeService";
import { format } from "date-fns";

const Employees = () => {
const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  useEffect(() => {
    loadEmployees();
  }, []);

useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, departmentFilter, statusFilter, employmentTypeFilter]);

  const loadEmployees = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      setError("Failed to load employees");
      console.error("Employees error:", err);
    } finally {
      setLoading(false);
    }
  };

const filterEmployees = () => {
    let filtered = [...employees];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.Name?.toLowerCase().includes(searchLower) ||
        employee.employee_code_c?.toLowerCase().includes(searchLower) ||
        employee.first_name_c?.toLowerCase().includes(searchLower) ||
        employee.last_name_c?.toLowerCase().includes(searchLower) ||
        employee.email_c?.toLowerCase().includes(searchLower)
      );
    }

    // Apply department filter
    if (departmentFilter && departmentFilter !== "") {
      filtered = filtered.filter(employee => 
        employee.department_c?.toLowerCase() === departmentFilter.toLowerCase()
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "") {
      filtered = filtered.filter(employee => 
        employee.status_c?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply employment type filter
    if (employmentTypeFilter && employmentTypeFilter !== "") {
      filtered = filtered.filter(employee => 
        employee.employment_type_c?.toLowerCase() === employmentTypeFilter.toLowerCase()
      );
    }
    
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = async (employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.Name}?`)) {
      return;
    }

    const success = await employeeService.delete(employee.Id);
    if (success) {
      await loadEmployees();
    }
  };

  const handleEmployeeSubmit = async (employeeData) => {
    let success = false;
    
    if (selectedEmployee) {
      const result = await employeeService.update(selectedEmployee.Id, employeeData);
      success = !!result;
    } else {
      const result = await employeeService.create(employeeData);
      success = !!result;
    }

    if (success) {
      setIsModalOpen(false);
      setSelectedEmployee(null);
      await loadEmployees();
    }
  };

const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentFilterChange = (e) => {
    setDepartmentFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleEmploymentTypeFilterChange = (e) => {
    setEmploymentTypeFilter(e.target.value);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setStatusFilter("");
    setEmploymentTypeFilter("");
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
      key: "employee_code_c", 
      label: "Employee Code", 
      sortable: true 
    },
    { 
      key: "Name", 
      label: "Name", 
      sortable: true 
    },
    { 
      key: "email_c", 
      label: "Email", 
      sortable: true 
    },
    { 
      key: "department_id_c", 
      label: "Department ID", 
      sortable: true 
    },
    { 
      key: "join_date_c", 
      label: "Join Date", 
      sortable: true,
      render: (value) => value ? format(new Date(value), "MMM dd, yyyy") : "-"
    },
    { 
      key: "salary_c", 
      label: "Salary", 
      sortable: true,
      render: (value) => value ? `$${value.toLocaleString()}` : "-"
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, employee) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditEmployee(employee);
            }}
          >
            <ApperIcon name="Edit" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEmployee(employee);
            }}
          >
            <ApperIcon name="Trash2" className="w-4 h-4 text-error" />
          </Button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

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
        <ErrorView message={error} onRetry={loadEmployees} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <p className="mt-2 text-gray-600">Manage your employee records</p>
          </div>
          <Button
            variant="primary"
            onClick={handleAddEmployee}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            Add Employee
          </Button>
        </div>
      </div>

{/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search employees..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="min-w-[150px]">
              <Select
                value={departmentFilter}
                onChange={handleDepartmentFilterChange}
                className="w-full"
              >
                <option value="">All Departments</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </Select>
            </div>
            <div className="min-w-[120px]">
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </Select>
            </div>
            <div className="min-w-[140px]">
              <Select
                value={employmentTypeFilter}
                onChange={handleEmploymentTypeFilterChange}
                className="w-full"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </Select>
            </div>
            <Button
              variant="secondary"
              onClick={clearAllFilters}
              className="px-3 py-2 whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="space-y-6">
        {filteredEmployees.length === 0 && !loading ? (
          <Empty 
            title="No employees found"
            description={searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first employee"}
            action={
              !searchTerm && (
                <Button variant="primary" onClick={handleAddEmployee}>
                  <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
                  Add Employee
                </Button>
              )
            }
          />
        ) : (
          <DataTable
            data={filteredEmployees}
            columns={columns}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredEmployees.length,
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

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleEmployeeSubmit}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default Employees;