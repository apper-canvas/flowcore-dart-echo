import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DataTable from "@/components/organisms/DataTable";
import ProductModal from "@/components/organisms/ProductModal";
import SearchBar from "@/components/molecules/SearchBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import productService from "@/services/api/productService";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError("Failed to load products");
      console.error("Products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(product => {
        const status = getStockStatus(product);
        return status === statusFilter;
      });
    }

    setFilteredProducts(filtered);
  };

  const getStockStatus = (product) => {
    if (product.stockLevel === 0) return "out-of-stock";
    if (product.stockLevel <= product.reorderPoint) return "low-stock";
    return "in-stock";
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (selectedProduct) {
        await productService.update(selectedProduct.Id, productData);
        const updatedProducts = products.map(p =>
          p.Id === selectedProduct.Id ? { ...p, ...productData } : p
        );
        setProducts(updatedProducts);
      } else {
        const newProduct = await productService.create(productData);
        setProducts([...products, newProduct]);
      }
      setIsModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await productService.delete(product.Id);
        setProducts(products.filter(p => p.Id !== product.Id));
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const columns = [
    { key: "sku", label: "SKU", sortable: true },
    { key: "name", label: "Product Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { 
      key: "price", 
      label: "Price", 
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`
    },
    { key: "stockLevel", label: "Stock", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (value, product) => (
        <StatusBadge status={getStockStatus(product)} type="stock" />
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, product) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditProduct(product)}
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteProduct(product)}
            className="text-error hover:text-error"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorView message={error} onRetry={loadProducts} />
      </div>
    );
  }

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-gray-600">Manage your product catalog and stock levels</p>
        </div>
        <Button onClick={handleAddProduct} className="mt-4 sm:mt-0">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or category..."
            />
          </div>
          
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 && !loading ? (
        <Empty
          title="No products found"
          description={searchQuery || categoryFilter || statusFilter 
            ? "Try adjusting your filters to see more products"
            : "Get started by adding your first product to the inventory"
          }
          actionLabel="Add Product"
          onAction={handleAddProduct}
          icon="Package"
        />
      ) : (
        <DataTable
          data={filteredProducts}
          columns={columns}
          loading={loading}
          onRowClick={handleEditProduct}
        />
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default Inventory;