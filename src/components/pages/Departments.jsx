import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DataTable from '@/components/organisms/DataTable';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import Select from '@/components/atoms/Select';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import DepartmentModal from '@/components/organisms/DepartmentModal';
import departmentService from '@/services/api/departmentService';
import { format } from 'date-fns';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load departments on component mount
  useEffect(() => {
    loadDepartments();
  }, []);

  // Filter departments when search term or location filter changes
  useEffect(() => {
    filterDepartments();
  }, [departments, searchTerm, locationFilter]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      setError('Failed to load departments');
      console.error('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterDepartments = () => {
    let filtered = departments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(dept => 
        dept.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.department_code_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.location_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.email_c?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter(dept => 
        dept.location_c?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredDepartments(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = async (department) => {
    if (!window.confirm(`Are you sure you want to delete the department "${department.Name}"?`)) {
      return;
    }

    try {
      const success = await departmentService.delete(department.Id);
      if (success) {
        await loadDepartments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  const handleDepartmentSubmit = async (departmentData) => {
    try {
      if (editingDepartment) {
        await departmentService.update(editingDepartment.Id, departmentData);
      } else {
        await departmentService.create(departmentData);
      }
      await loadDepartments(); // Refresh the list
      setIsModalOpen(false);
      setEditingDepartment(null);
    } catch (error) {
      console.error('Error saving department:', error);
      throw error;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Get unique locations for filter dropdown
  const uniqueLocations = [...new Set(departments.map(dept => dept.location_c).filter(Boolean))];

  // Define columns for the data table
  const columns = [
    {
      key: 'Name',
      label: 'Department Name',
      sortable: true,
      render: (department) => (
        <div className="font-medium text-gray-900">
          {department.Name || 'N/A'}
        </div>
      )
    },
    {
      key: 'department_code_c',
      label: 'Code',
      sortable: true,
      render: (department) => (
        <div className="text-sm text-gray-600 font-mono">
          {department.department_code_c || 'N/A'}
        </div>
      )
    },
    {
      key: 'location_c',
      label: 'Location',
      sortable: true,
      render: (department) => (
        <div className="text-sm text-gray-600">
          {department.location_c || 'N/A'}
        </div>
      )
    },
    {
      key: 'email_c',
      label: 'Email',
      sortable: true,
      render: (department) => (
        <div className="text-sm text-gray-600">
          {department.email_c || 'N/A'}
        </div>
      )
    },
    {
      key: 'phone_number_c',
      label: 'Phone',
      sortable: true,
      render: (department) => (
        <div className="text-sm text-gray-600">
          {department.phone_number_c || 'N/A'}
        </div>
      )
    },
    {
      key: 'manager_id_c',
      label: 'Manager ID',
      sortable: true,
      render: (department) => (
        <div className="text-sm text-gray-600">
          {department.manager_id_c || 'N/A'}
        </div>
      )
    },
    {
      key: 'CreatedOn',
      label: 'Created',
      sortable: true,
      render: (department) => (
        <div className="text-sm text-gray-500">
          {department.CreatedOn ? format(new Date(department.CreatedOn), 'MMM dd, yyyy') : 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (department) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditDepartment(department)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="Edit Department"
          >
            <ApperIcon name="Edit2" size={16} />
          </button>
          <button
            onClick={() => handleDeleteDepartment(department)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Delete Department"
          >
            <ApperIcon name="Trash2" size={16} />
          </button>
        </div>
      )
    }
  ];

  // Calculate pagination
  const totalItems = filteredDepartments.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDepartments = filteredDepartments.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadDepartments} />;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-600">Manage your organization's departments</p>
          </div>
          <Button
            onClick={handleAddDepartment}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" size={16} />
            <span>Add Department</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search departments by name, code, location, or email..."
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="min-w-[150px]"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>
            {(searchTerm || locationFilter) && (
              <Button
                variant="secondary"
                onClick={clearAllFilters}
                className="flex items-center space-x-2"
              >
                <ApperIcon name="X" size={14} />
                <span>Clear</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {totalItems === 0 ? (
        <Empty 
          message="No departments found" 
          description="Get started by adding your first department"
          actionLabel="Add Department"
          onAction={handleAddDepartment}
        />
      ) : (
        <>
          <DataTable
            data={currentDepartments}
            columns={columns}
            loading={loading}
            className="mb-4"
          />
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} departments
              </div>
              <div className="flex items-center space-x-4">
                <Select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="w-20"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </Select>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ApperIcon name="ChevronLeft" size={16} />
                  </Button>
                  <span className="flex items-center px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ApperIcon name="ChevronRight" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDepartment(null);
        }}
        department={editingDepartment}
        onSave={handleDepartmentSubmit}
      />
    </div>
  );
};

export default Departments;