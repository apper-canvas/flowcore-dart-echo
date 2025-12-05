import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import DataTable from "@/components/organisms/DataTable";
import productService from "@/services/api/productService";
import customerService from "@/services/api/customerService";

const OrderModal = ({ isOpen, onClose, order, onSave }) => {
  const [formData, setFormData] = useState({
    customerId: "",
    status: "pending",
    notes: ""
  });
  
  const [orderItems, setOrderItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: 1
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (order) {
      setFormData({
        customerId: order.customerId || "",
        status: order.status || "pending",
        notes: order.notes || ""
      });
      setOrderItems(order.items || []);
    } else {
      setFormData({
        customerId: "",
        status: "pending",
        notes: ""
      });
      setOrderItems([]);
    }
  }, [order]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [productsData, customersData] = await Promise.all([
        productService.getAll(),
        customerService.getAll()
      ]);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setDataLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.productId || newItem.quantity <= 0) {
      toast.error("Please select a product and enter a valid quantity");
      return;
    }

    const product = products.find(p => p.Id === parseInt(newItem.productId));
    if (!product) {
      toast.error("Product not found");
      return;
    }

    const existingItemIndex = orderItems.findIndex(item => item.productId === newItem.productId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += parseInt(newItem.quantity);
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * product.price;
      setOrderItems(updatedItems);
    } else {
      const item = {
        productId: newItem.productId,
        productName: product.name,
        quantity: parseInt(newItem.quantity),
        unitPrice: product.price,
        total: parseInt(newItem.quantity) * product.price
      };
      setOrderItems([...orderItems, item]);
    }

    setNewItem({ productId: "", quantity: 1 });
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      toast.error("Please select a customer");
      return;
    }
    
    if (orderItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setLoading(true);

    try {
      const { subtotal, tax, total } = calculateTotals();
      
      const orderData = {
        ...formData,
        customerId: parseInt(formData.customerId),
        items: orderItems,
        subtotal,
        tax,
        total
      };

      await onSave(orderData);
      toast.success(order ? "Order updated successfully" : "Order created successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const customerOptions = customers.map(customer => ({
    value: customer.Id.toString(),
    label: customer.name
  }));

  const productOptions = products.map(product => ({
    value: product.Id.toString(),
    label: `${product.name} - $${product.price.toFixed(2)}`
  }));

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const itemColumns = [
    { key: "productName", label: "Product", sortable: true },
    { key: "quantity", label: "Quantity", sortable: true },
    { 
      key: "unitPrice", 
      label: "Unit Price", 
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`
    },
    { 
      key: "total", 
      label: "Total", 
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, item, index) => (
        <Button
          variant="error"
          size="sm"
          onClick={() => handleRemoveItem(index)}
        >
          <ApperIcon name="Trash2" className="w-4 h-4" />
        </Button>
      )
    }
  ];

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {order ? "Edit Order" : "Create New Order"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Details */}
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

          {/* Add Items */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <FormField
                label="Product"
                type="select"
                name="productId"
                value={newItem.productId}
                onChange={handleNewItemChange}
                options={productOptions}
              />
              
              <FormField
                label="Quantity"
                type="number"
                name="quantity"
                value={newItem.quantity}
                onChange={handleNewItemChange}
                min="1"
              />
              
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={dataLoading}
                  className="w-full"
                >
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Items Table */}
            {orderItems.length > 0 ? (
              <DataTable
                data={orderItems.map((item, index) => ({ ...item, index }))}
                columns={itemColumns}
                loading={false}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No items added yet. Add items to the order above.
              </div>
            )}
          </div>

          {/* Order Totals */}
          {orderItems.length > 0 && (
            <div className="border-t pt-6">
              <div className="bg-gray-50 rounded-lg p-4 max-w-sm ml-auto">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <FormField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter any additional notes"
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
              disabled={loading || orderItems.length === 0}
            >
              {loading ? "Saving..." : (order ? "Update Order" : "Create Order")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;