import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MetricCard from "@/components/molecules/MetricCard";
import DataTable from "@/components/organisms/DataTable";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import ApperIcon from "@/components/ApperIcon";
import productService from "@/services/api/productService";
import orderService from "@/services/api/orderService";
import customerService from "@/services/api/customerService";
import transactionService from "@/services/api/transactionService";
import { format } from "date-fns";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    lowStockItems: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [orders, products, customers, transactions] = await Promise.all([
        orderService.getAll(),
        productService.getAll(),
        customerService.getAll(),
        transactionService.getSummary()
      ]);

      // Calculate metrics
      const totalRevenue = transactions.totalIncome;
      const totalOrders = orders.length;
      const lowStockItems = products.filter(p => p.stockLevel <= p.reorderPoint).length;
      const totalCustomers = customers.length;

      setDashboardData({
        totalRevenue,
        totalOrders,
        lowStockItems,
        totalCustomers
      });

      // Get recent orders (last 5)
      const recent = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentOrders(recent);

      // Get low stock products
      const lowStock = products.filter(p => p.stockLevel <= p.reorderPoint);
      setLowStockProducts(lowStock);

    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "new-order":
        navigate("/orders");
        break;
      case "add-product":
        navigate("/inventory");
        break;
      case "add-customer":
        navigate("/customers");
        break;
      case "record-transaction":
        navigate("/financials");
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading type="cards" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorView message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  const orderColumns = [
    { key: "orderNumber", label: "Order #", sortable: true },
    { 
      key: "total", 
      label: "Total", 
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`
    },
    { key: "status", label: "Status", sortable: true },
    { 
      key: "createdAt", 
      label: "Date", 
      sortable: true,
      render: (value) => format(new Date(value), "MMM dd, yyyy")
    }
  ];

  const stockColumns = [
    { key: "name", label: "Product", sortable: true },
    { key: "sku", label: "SKU", sortable: true },
    { key: "stockLevel", label: "Current Stock", sortable: true },
    { key: "reorderPoint", label: "Reorder Point", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (value, product) => (
        <span className={`status-badge ${
          product.stockLevel === 0 ? 'status-out-of-stock' : 'status-low-stock'
        }`}>
          {product.stockLevel === 0 ? 'Out of Stock' : 'Low Stock'}
        </span>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-gray-600">Welcome to FlowCore ERP. Here's your business summary.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={`$${dashboardData.totalRevenue.toLocaleString()}`}
          icon="DollarSign"
          trend="+12.5%"
          trendDirection="up"
        />
        <MetricCard
          title="Total Orders"
          value={dashboardData.totalOrders}
          icon="ShoppingCart"
          trend="+8.2%"
          trendDirection="up"
        />
        <MetricCard
          title="Low Stock Alerts"
          value={dashboardData.lowStockItems}
          icon="AlertTriangle"
          trend={dashboardData.lowStockItems > 0 ? "Action needed" : "All good"}
          trendDirection={dashboardData.lowStockItems > 0 ? "down" : "up"}
        />
        <MetricCard
          title="Total Customers"
          value={dashboardData.totalCustomers}
          icon="Users"
          trend="+5.7%"
          trendDirection="up"
        />
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="primary"
            onClick={() => handleQuickAction("new-order")}
            className="h-16 flex-col gap-2"
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            New Order
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleQuickAction("add-product")}
            className="h-16 flex-col gap-2"
          >
            <ApperIcon name="Package" className="w-5 h-5" />
            Add Product
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleQuickAction("add-customer")}
            className="h-16 flex-col gap-2"
          >
            <ApperIcon name="UserPlus" className="w-5 h-5" />
            Add Customer
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleQuickAction("record-transaction")}
            className="h-16 flex-col gap-2"
          >
            <ApperIcon name="FileText" className="w-5 h-5" />
            Record Transaction
          </Button>
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/orders")}
              className="text-sm"
            >
              View All
              <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {recentOrders.length > 0 ? (
            <DataTable
              data={recentOrders}
              columns={orderColumns}
              loading={false}
              onRowClick={(order) => navigate("/orders")}
            />
          ) : (
            <div className="card p-8 text-center">
              <ApperIcon name="ShoppingCart" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent orders</p>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/inventory")}
              className="text-sm"
            >
              View All
              <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {lowStockProducts.length > 0 ? (
            <DataTable
              data={lowStockProducts}
              columns={stockColumns}
              loading={false}
              onRowClick={(product) => navigate("/inventory")}
            />
          ) : (
            <div className="card p-8 text-center">
              <ApperIcon name="CheckCircle" className="w-12 h-12 text-success mx-auto mb-4" />
              <p className="text-gray-500">All products are well stocked!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;