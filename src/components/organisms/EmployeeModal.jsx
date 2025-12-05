import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";

const EmployeeModal = ({ isOpen, onClose, onSubmit, employee }) => {
  const [formData, setFormData] = useState({
    Name: "",
    employee_code_c: "",
    first_name_c: "",
    last_name_c: "",
    department_id_c: "",
    join_date_c: "",
    salary_c: "",
    email_c: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        Name: employee.Name || "",
        employee_code_c: employee.employee_code_c || "",
        first_name_c: employee.first_name_c || "",
        last_name_c: employee.last_name_c || "",
        department_id_c: employee.department_id_c || "",
        join_date_c: employee.join_date_c || "",
        salary_c: employee.salary_c || "",
        email_c: employee.email_c || ""
      });
    } else {
      setFormData({
        Name: "",
        employee_code_c: "",
        first_name_c: "",
        last_name_c: "",
        department_id_c: "",
        join_date_c: "",
        salary_c: "",
        email_c: ""
      });
    }
    setErrors({});
  }, [employee, isOpen]);

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
    
    if (!formData.employee_code_c.trim()) {
      newErrors.employee_code_c = "Employee code is required";
    }
    
    if (!formData.first_name_c.trim()) {
      newErrors.first_name_c = "First name is required";
    }
    
    if (!formData.last_name_c.trim()) {
      newErrors.last_name_c = "Last name is required";
    }
    
    if (!formData.department_id_c) {
      newErrors.department_id_c = "Department ID is required";
    }
    
    if (!formData.join_date_c) {
      newErrors.join_date_c = "Join date is required";
    }
    
    if (!formData.salary_c) {
      newErrors.salary_c = "Salary is required";
    }
    
    if (!formData.email_c.trim()) {
      newErrors.email_c = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email_c)) {
      newErrors.email_c = "Please enter a valid email";
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
        Name: formData.Name || `${formData.first_name_c} ${formData.last_name_c}`
      };
      
      await onSubmit(submissionData);
    } catch (error) {
      console.error("Error submitting employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      Name: "",
      employee_code_c: "",
      first_name_c: "",
      last_name_c: "",
      department_id_c: "",
      join_date_c: "",
      salary_c: "",
      email_c: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {employee ? "Edit Employee" : "Add Employee"}
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
            label="Employee Code"
            name="employee_code_c"
            value={formData.employee_code_c}
            onChange={handleInputChange}
            error={errors.employee_code_c}
            required
          />
          
          <FormField
            label="First Name"
            name="first_name_c"
            value={formData.first_name_c}
            onChange={handleInputChange}
            error={errors.first_name_c}
            required
          />
          
          <FormField
            label="Last Name"
            name="last_name_c"
            value={formData.last_name_c}
            onChange={handleInputChange}
            error={errors.last_name_c}
            required
          />
          
          <FormField
            label="Email"
            name="email_c"
            type="email"
            value={formData.email_c}
            onChange={handleInputChange}
            error={errors.email_c}
            required
          />
          
          <FormField
            label="Department ID"
            name="department_id_c"
            type="number"
            value={formData.department_id_c}
            onChange={handleInputChange}
            error={errors.department_id_c}
            required
          />
          
          <FormField
            label="Join Date"
            name="join_date_c"
            type="date"
            value={formData.join_date_c}
            onChange={handleInputChange}
            error={errors.join_date_c}
            required
          />
          
          <FormField
            label="Salary"
            name="salary_c"
            type="number"
            step="0.01"
            value={formData.salary_c}
            onChange={handleInputChange}
            error={errors.salary_c}
            required
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
              {isSubmitting ? "Saving..." : (employee ? "Update" : "Add")} Employee
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;