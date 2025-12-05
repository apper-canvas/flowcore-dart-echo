import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    category: "",
    price: "",
    cost: "",
    stockLevel: "",
    reorderPoint: "",
    unit: "pcs",
    date: "",
    tags: ""
  });
  
  const [loading, setLoading] = useState(false);

useEffect(() => {
    if (product) {
setFormData({
        sku: product.sku_c || product.sku || "",
        name: product.Name || product.name || "",
        description: product.description_c || product.description || "",
        category: product.category_c || product.category || "",
        price: product.price_c?.toString() || product.price?.toString() || "",
        cost: product.cost_c?.toString() || product.cost?.toString() || "",
        stockLevel: product.stock_level_c?.toString() || product.stockLevel?.toString() || "",
        reorderPoint: product.reorder_point_c?.toString() || product.reorderPoint?.toString() || "",
        unit: product.unit_c || product.unit || "pcs",
        date: product.date_c || product.date || "",
        tags: product.Tags || product.tags || ""
      });
    } else {
      setFormData({
        sku: "",
        name: "",
        description: "",
        category: "",
        price: "",
        cost: "",
        stockLevel: "",
        reorderPoint: "",
        unit: "pcs",
        date: "",
        tags: ""
      });
    }
  }, [product]);

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
const productData = {
        name: formData.name,
        Tags: formData.tags,
        sku_c: formData.sku,
        description_c: formData.description,
        category_c: formData.category,
        price_c: parseFloat(formData.price) || 0,
        cost_c: parseFloat(formData.cost) || 0,
        stock_level_c: parseInt(formData.stockLevel) || 0,
        reorder_point_c: parseInt(formData.reorderPoint) || 0,
        unit_c: formData.unit,
        date_c: formData.date
      };

      await onSave(productData);
      toast.success(product ? "Product updated successfully" : "Product created successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const categories = [
    { value: "Electronics", label: "Electronics" },
    { value: "Clothing", label: "Clothing" },
    { value: "Home & Garden", label: "Home & Garden" },
    { value: "Sports", label: "Sports" },
    { value: "Books", label: "Books" },
    { value: "Health & Beauty", label: "Health & Beauty" }
  ];

  const units = [
    { value: "pcs", label: "Pieces" },
    { value: "kg", label: "Kilograms" },
    { value: "lbs", label: "Pounds" },
    { value: "m", label: "Meters" },
    { value: "ft", label: "Feet" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

<form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* System Audit Fields - Read Only Display */}
          {product && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-3">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Created:</span>{' '}
                  {product.CreatedOn ? new Date(product.CreatedOn).toLocaleDateString() : 'N/A'}
                  {product.CreatedBy?.Name && (
                    <span className="text-gray-500"> by {product.CreatedBy.Name}</span>
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Modified:</span>{' '}
                  {product.ModifiedOn ? new Date(product.ModifiedOn).toLocaleDateString() : 'N/A'}
                  {product.ModifiedBy?.Name && (
                    <span className="text-gray-500"> by {product.ModifiedBy.Name}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="Enter SKU"
              required
            />
            
            <FormField
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <FormField
              label="Tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags (comma-separated)"
            />
          </div>

          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Category"
              type="select"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categories}
              required
            />
            
            <FormField
              label="Unit"
              type="select"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              options={units}
              required
            />
          </div>

          <FormField
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Sale Price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            
            <FormField
              label="Cost Price"
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Stock Level"
              type="number"
              name="stockLevel"
              value={formData.stockLevel}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
            />
            
            <FormField
              label="Reorder Point"
              type="number"
              name="reorderPoint"
              value={formData.reorderPoint}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>

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
              disabled={loading}
            >
              {loading ? "Saving..." : (product ? "Update Product" : "Create Product")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;