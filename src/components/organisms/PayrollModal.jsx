import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";

const PayrollModal = ({ isOpen, onClose, onSubmit, payroll }) => {
  const [formData, setFormData] = useState({
    Name: "",
    employee_id_c: "",
    month_c: "",
    gross_salary_c: "",
    deductions_c: "",
    net_salary_c: "",
    payment_date_c: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (payroll) {
      setFormData({
        Name: payroll.Name || "",
        employee_id_c: payroll.employee_id_c || "",
        month_c: payroll.month_c || "",
        gross_salary_c: payroll.gross_salary_c || "",
        deductions_c: payroll.deductions_c || "",
        net_salary_c: payroll.net_salary_c || "",
        payment_date_c: payroll.payment_date_c || ""
      });
    } else {
      setFormData({
        Name: "",
        employee_id_c: "",
        month_c: "",
        gross_salary_c: "",
        deductions_c: "",
        net_salary_c: "",
        payment_date_c: ""
      });
    }
    setErrors({});
  }, [payroll, isOpen]);

  useEffect(() => {
    // Auto-calculate net salary when gross salary or deductions change
    const grossSalary = parseFloat(formData.gross_salary_c) || 0;
    const deductions = parseFloat(formData.deductions_c) || 0;
    const netSalary = grossSalary - deductions;
    
    if (formData.gross_salary_c || formData.deductions_c) {
      setFormData(prev => ({
        ...prev,
        net_salary_c: netSalary.toFixed(2)
      }));
    }
  }, [formData.gross_salary_c, formData.deductions_c]);

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
    
    if (!formData.month_c) {
      newErrors.month_c = "Month is required";
    }
    
    if (!formData.gross_salary_c) {
      newErrors.gross_salary_c = "Gross salary is required";
    }
    
    if (!formData.payment_date_c) {
      newErrors.payment_date_c = "Payment date is required";
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
        Name: formData.Name || `Payroll - ${formData.month_c}`
      };
      
      await onSubmit(submissionData);
    } catch (error) {
      console.error("Error submitting payroll:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      Name: "",
      employee_id_c: "",
      month_c: "",
      gross_salary_c: "",
      deductions_c: "",
      net_salary_c: "",
      payment_date_c: ""
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
            {payroll ? "Edit Payroll" : "Add Payroll Record"}
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
            label="Month"
            name="month_c"
            type="date"
            value={formData.month_c}
            onChange={handleInputChange}
            error={errors.month_c}
            required
          />
          
          <FormField
            label="Gross Salary"
            name="gross_salary_c"
            type="number"
            step="0.01"
            value={formData.gross_salary_c}
            onChange={handleInputChange}
            error={errors.gross_salary_c}
            required
          />
          
          <FormField
            label="Deductions"
            name="deductions_c"
            type="number"
            step="0.01"
            value={formData.deductions_c}
            onChange={handleInputChange}
            error={errors.deductions_c}
            placeholder="0.00"
          />
          
          <FormField
            label="Net Salary"
            name="net_salary_c"
            type="number"
            step="0.01"
            value={formData.net_salary_c}
            onChange={handleInputChange}
            error={errors.net_salary_c}
            disabled
          />
          
          <FormField
            label="Payment Date"
            name="payment_date_c"
            type="datetime-local"
            value={formData.payment_date_c}
            onChange={handleInputChange}
            error={errors.payment_date_c}
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
              {isSubmitting ? "Saving..." : (payroll ? "Update" : "Add")} Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollModal;