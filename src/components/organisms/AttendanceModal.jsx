import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";

const AttendanceModal = ({ isOpen, onClose, onSubmit, attendance }) => {
  const [formData, setFormData] = useState({
    Name: "",
    employee_id_c: "",
    date_c: "",
    status_c: "",
    notes_c: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (attendance) {
      setFormData({
        Name: attendance.Name || "",
        employee_id_c: attendance.employee_id_c || "",
        date_c: attendance.date_c || "",
        status_c: attendance.status_c || "",
        notes_c: attendance.notes_c || ""
      });
    } else {
      setFormData({
        Name: "",
        employee_id_c: "",
        date_c: "",
        status_c: "",
        notes_c: ""
      });
    }
    setErrors({});
  }, [attendance, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employee_id_c) {
      newErrors.employee_id_c = "Employee ID is required";
    }
    
    if (!formData.date_c) {
      newErrors.date_c = "Date is required";
    }
    
    if (!formData.status_c) {
      newErrors.status_c = "Status is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Auto-generate Name if not provided
      const submissionData = {
        ...formData,
        Name: formData.Name || `Attendance - ${formData.date_c}`
      };
      
      await onSubmit(submissionData);
    } catch (error) {
      console.error("Error submitting attendance:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      Name: "",
      employee_id_c: "",
      date_c: "",
      status_c: "",
      notes_c: ""
    });
    setErrors({});
    onClose();
  };

  const statusOptions = [
    { value: "Present", label: "Present" },
    { value: "Absent", label: "Absent" },
    { value: "Leave", label: "Leave" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {attendance ? "Edit Attendance" : "Add Attendance Record"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Employee ID"
            name="employee_id_c"
            type="number"
            value={formData.employee_id_c}
            onChange={handleInputChange}
            error={errors.employee_id_c}
            required
          />
          
          <FormField
            label="Date"
            name="date_c"
            type="date"
            value={formData.date_c}
            onChange={handleInputChange}
            error={errors.date_c}
            required
          />
          
          <FormField
            label="Status"
            name="status_c"
            type="select"
            value={formData.status_c}
            onChange={handleInputChange}
            error={errors.status_c}
            options={statusOptions}
            required
          />
          
          <FormField
            label="Notes"
            name="notes_c"
            value={formData.notes_c}
            onChange={handleInputChange}
            error={errors.notes_c}
            placeholder="Additional notes about attendance"
          />
          
          <FormField
            label="Name (Optional)"
            name="Name"
            value={formData.Name}
            onChange={handleInputChange}
            error={errors.Name}
            placeholder="Auto-generated if left blank"
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : (attendance ? "Update" : "Add")} Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;