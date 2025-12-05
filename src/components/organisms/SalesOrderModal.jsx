import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import customerService from "@/services/api/customerService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";

const SalesOrderModal = ({ isOpen, onClose, salesOrder, onSave }) => {
  const [formData, setFormData] = useState({
    customerId: "",
    orderDate: "",
    deliveryDate: "",
    status: "Open",
    totalAmount: "",
    description: ""
  });
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (salesOrder) {
      setFormData({
        customerId: salesOrder.customer_c?.Id || salesOrder.customer_c || "",
        orderDate: salesOrder.order_date_c || "",
        deliveryDate: salesOrder.delivery_date_c || "",
        status: salesOrder.status_c || "Open",
        totalAmount: salesOrder.total_amount_c || "",
        description: salesOrder.description_c || ""
      });
    } else {
      setFormData({
        customerId: "",
        orderDate: "",
        deliveryDate: "",
        status: "Open",
        totalAmount: "",
        description: ""
      });
    }
  }, [salesOrder]);

  const loadCustomers = async () => {
    setDataLoading(true);
    try {
      const customersData = await customerService.getAll();
      setCustomers(customersData);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!formData.orderDate) {
      toast.error("Please select an order date");
      return;
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) < 0) {
      toast.error("Please enter a valid total amount");
      return;
    }

    setLoading(true);

    try {
      const salesOrderData = {
        customer_c: parseInt(formData.customerId),
        order_date_c: formData.orderDate,
        delivery_date_c: formData.deliveryDate,
        status_c: formData.status,
        total_amount_c: parseFloat(formData.totalAmount),
        description_c: formData.description
      };

      await onSave(salesOrderData);
      toast.success(salesOrder ? "Sales order updated successfully" : "Sales order created successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save sales order");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const customerOptions = customers.map(customer => ({
    value: customer.Id.toString(),
    label: customer.Name || customer.name
  }));

  const statusOptions = [
    { value: "Open", label: "Open" },
    { value: "Closed", label: "Closed" },
    { value: "Pending", label: "Pending" },
    { value: "Shipped", label: "Shipped" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {salesOrder ? "Edit Sales Order" : "Create New Sales Order"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Customer"
              type="select"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              options={customerOptions}
              required
            />
            
            <FormField
              label="Status"
              type="select"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Order Date"
              type="date"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleChange}
              required
            />
            
            <FormField
              label="Delivery Date"
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
            />
          </div>

          {/* Total Amount */}
          <FormField
            label="Total Amount"
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />

          {/* Description */}
          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter sales order description or notes"
          />

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || dataLoading}
            >
              {loading ? "Saving..." : (salesOrder ? "Update Sales Order" : "Create Sales Order")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesOrderModal;