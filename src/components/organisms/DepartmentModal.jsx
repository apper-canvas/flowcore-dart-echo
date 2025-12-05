import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';

const DepartmentModal = ({ isOpen, onClose, department, onSave }) => {
  const [formData, setFormData] = useState({
    Name: '',
    Tags: '',
    description_c: '',
    department_code_c: '',
    location_c: '',
    email_c: '',
    phone_number_c: '',
    manager_id_c: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (department) {
      setFormData({
        Name: department.Name || '',
        Tags: department.Tags || '',
        description_c: department.description_c || '',
        department_code_c: department.department_code_c || '',
        location_c: department.location_c || '',
        email_c: department.email_c || '',
        phone_number_c: department.phone_number_c || '',
        manager_id_c: department.manager_id_c || ''
      });
    } else {
      setFormData({
        Name: '',
        Tags: '',
        description_c: '',
        department_code_c: '',
        location_c: '',
        email_c: '',
        phone_number_c: '',
        manager_id_c: ''
      });
    }
    setErrors({});
  }, [department, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Name?.trim()) {
      newErrors.Name = 'Department name is required';
    }
    
    if (!formData.department_code_c?.trim()) {
      newErrors.department_code_c = 'Department code is required';
    }

    if (formData.email_c && !formData.email_c.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email_c = 'Invalid email format';
    }

    if (formData.manager_id_c && isNaN(formData.manager_id_c)) {
      newErrors.manager_id_c = 'Manager ID must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving department:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      Name: '',
      Tags: '',
      description_c: '',
      department_code_c: '',
      location_c: '',
      email_c: '',
      phone_number_c: '',
      manager_id_c: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {department ? 'Edit Department' : 'Add New Department'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormField
              label="Department Name"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              placeholder="Enter department name"
              error={errors.Name}
              required
            />

            <FormField
              label="Department Code"
              name="department_code_c"
              value={formData.department_code_c}
              onChange={handleChange}
              placeholder="Enter department code"
              error={errors.department_code_c}
              required
            />

            <FormField
              label="Location"
              name="location_c"
              value={formData.location_c}
              onChange={handleChange}
              placeholder="Enter location"
              error={errors.location_c}
            />

            <FormField
              label="Email"
              type="email"
              name="email_c"
              value={formData.email_c}
              onChange={handleChange}
              placeholder="Enter email address"
              error={errors.email_c}
            />

            <FormField
              label="Phone Number"
              name="phone_number_c"
              value={formData.phone_number_c}
              onChange={handleChange}
              placeholder="Enter phone number"
              error={errors.phone_number_c}
            />

            <FormField
              label="Manager ID"
              type="number"
              name="manager_id_c"
              value={formData.manager_id_c}
              onChange={handleChange}
              placeholder="Enter manager ID"
              error={errors.manager_id_c}
            />
          </div>

          <div className="mb-6">
            <FormField
              label="Tags"
              name="Tags"
              value={formData.Tags}
              onChange={handleChange}
              placeholder="Enter tags (comma-separated)"
              error={errors.Tags}
            />
          </div>

          <div className="mb-6">
            <FormField
              label="Description"
              name="description_c"
              value={formData.description_c}
              onChange={handleChange}
              placeholder="Enter department description"
              type="textarea"
              rows={4}
              error={errors.description_c}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
              <span>{department ? 'Update Department' : 'Create Department'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;