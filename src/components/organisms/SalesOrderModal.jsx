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
  
  const [lineItems, setLineItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: 1,
    taxCodeId: 1
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
      setLineItems(salesOrder.lineItems || []);
    } else {
      setFormData({
        customerId: "",
        orderDate: "",
        deliveryDate: "",
        status: "Open",
        totalAmount: "",
        description: ""
      });
      setLineItems([]);
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

    if (lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

setLoading(true);

    try {
      const { subtotal, tax, total } = calculateTotals();
      
      const salesOrderData = {
        customer_c: parseInt(formData.customerId),
        order_date_c: formData.orderDate,
        delivery_date_c: formData.deliveryDate,
        status_c: formData.status,
        total_amount_c: total,
        description_c: formData.description
      };

      const lineItemsData = lineItems.map(item => ({
        item_id: item.productId || item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_code_id: item.tax_code_id || 1,
        line_total: item.line_total
      }));

      await onSave(salesOrderData, lineItemsData);
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

    const existingItemIndex = lineItems.findIndex(item => item.productId === newItem.productId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...lineItems];
      updatedItems[existingItemIndex].quantity += parseInt(newItem.quantity);
      updatedItems[existingItemIndex].line_total = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unit_price;
      setLineItems(updatedItems);
    } else {
      const unitPrice = product.price_c || product.price || 0;
      const quantity = parseInt(newItem.quantity);
      const lineTotal = quantity * unitPrice;
      
      const item = {
        productId: newItem.productId,
        product_name: product.Name || product.name,
        quantity: quantity,
        unit_price: unitPrice,
        tax_code_id: newItem.taxCodeId,
        line_total: lineTotal
      };
      setLineItems([...lineItems, item]);
    }

    setNewItem({ productId: "", quantity: 1, taxCodeId: 1 });
  };

  const handleRemoveItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const productOptions = products.map(product => ({
    value: product.Id.toString(),
    label: `${product.Name || product.name} - $${(product.price_c || product.price || 0).toFixed(2)}`
  }));

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
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

          {/* Line Items Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Line Items</h3>
            
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
                  className="w-full"
                >
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Items Table */}
            {lineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lineItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(item.unit_price || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(item.line_total || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <Button
                            variant="error"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No line items added yet. Add items to the sales order above.
              </div>
            )}
          </div>

          {/* Order Totals */}
          {lineItems.length > 0 && (
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