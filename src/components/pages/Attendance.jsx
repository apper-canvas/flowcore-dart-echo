import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DataTable from "@/components/organisms/DataTable";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import AttendanceModal from "@/components/organisms/AttendanceModal";
import attendanceService from "@/services/api/attendanceService";
import { format } from "date-fns";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadAttendance();
  }, []);

  useEffect(() => {
    filterAttendance();
  }, [attendance, searchTerm]);

  const loadAttendance = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await attendanceService.getAll();
      setAttendance(data);
    } catch (err) {
      setError("Failed to load attendance records");
      console.error("Attendance error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAttendance = () => {
    if (!searchTerm.trim()) {
      setFilteredAttendance(attendance);
      return;
    }

    const filtered = attendance.filter(record => {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.Name?.toLowerCase().includes(searchLower) ||
        record.employee_id_c?.toString().includes(searchLower) ||
        record.status_c?.toLowerCase().includes(searchLower) ||
        record.notes_c?.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredAttendance(filtered);
    setCurrentPage(1);
  };

  const handleAddAttendance = () => {
    setSelectedAttendance(null);
    setIsModalOpen(true);
  };

  const handleEditAttendance = (record) => {
    setSelectedAttendance(record);
    setIsModalOpen(true);
  };

  const handleDeleteAttendance = async (record) => {
    if (!window.confirm(`Are you sure you want to delete this attendance record?`)) {
      return;
    }

    const success = await attendanceService.delete(record.Id);
    if (success) {
      await loadAttendance();
    }
  };

  const handleAttendanceSubmit = async (attendanceData) => {
    let success = false;
    
    if (selectedAttendance) {
      const result = await attendanceService.update(selectedAttendance.Id, attendanceData);
      success = !!result;
    } else {
      const result = await attendanceService.create(attendanceData);
      success = !!result;
    }

    if (success) {
      setIsModalOpen(false);
      setSelectedAttendance(null);
      await loadAttendance();
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Present': 'status-badge bg-green-100 text-green-800',
      'Absent': 'status-badge bg-red-100 text-red-800',
      'Leave': 'status-badge bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={statusClasses[status] || 'status-badge bg-gray-100 text-gray-800'}>
        {status}
      </span>
    );
  };

  const columns = [
    { 
      key: "employee_id_c", 
      label: "Employee ID", 
      sortable: true 
    },
    { 
      key: "date_c", 
      label: "Date", 
      sortable: true,
      render: (value) => value ? format(new Date(value), "MMM dd, yyyy") : "-"
    },
    { 
      key: "status_c", 
      label: "Status", 
      sortable: true,
      render: (value) => getStatusBadge(value)
    },
    { 
      key: "notes_c", 
      label: "Notes", 
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || "-"}
        </div>
      )
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
              handleEditAttendance(record);
            }}
          >
            <ApperIcon name="Edit" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAttendance(record);
            }}
          >
            <ApperIcon name="Trash2" className="w-4 h-4 text-error" />
          </Button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);

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
        <ErrorView message={error} onRetry={loadAttendance} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
            <p className="mt-2 text-gray-600">Track employee attendance records</p>
          </div>
          <Button
            variant="primary"
            onClick={handleAddAttendance}
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
              placeholder="Search attendance records..."
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="space-y-6">
        {filteredAttendance.length === 0 && !loading ? (
          <Empty 
            title="No attendance records found"
            description={searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first attendance record"}
            action={
              !searchTerm && (
                <Button variant="primary" onClick={handleAddAttendance}>
                  <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
                  Add Record
                </Button>
              )
            }
          />
        ) : (
          <DataTable
            data={filteredAttendance}
            columns={columns}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredAttendance.length,
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

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAttendance(null);
        }}
        onSubmit={handleAttendanceSubmit}
        attendance={selectedAttendance}
      />
    </div>
  );
};

export default Attendance;