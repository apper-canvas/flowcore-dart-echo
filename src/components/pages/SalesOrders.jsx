import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DataTable from "@/components/organisms/DataTable";
import SalesOrderModal from "@/components/organisms/SalesOrderModal";
import SearchBar from "@/components/molecules/SearchBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import salesOrderService from "@/services/api/salesOrderService";
import customerService from "@/services/api/customerService";
import { format } from "date-fns";

const SalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredSalesOrders, setFilteredSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSalesOrders();
  }, [salesOrders, searchQuery, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [salesOrdersData, customersData] = await Promise.all([
        salesOrderService.getAll(),
        customerService.getAll()
      ]);
      setSalesOrders(salesOrdersData);
      setCustomers(customersData);
    } catch (err) {
      setError("Failed to load sales orders");
      console.error("Sales orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterSalesOrders = () => {
    let filtered = [...salesOrders];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(salesOrder => {
        const customer = customers.find(c => c.Id === (salesOrder.customer_c?.Id || salesOrder.customer_c));
        return (
          (salesOrder.sales_order_number_c || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer?.Name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(salesOrder => salesOrder.status_c === statusFilter);
    }

    setFilteredSalesOrders(filtered);
  };

  const handleSaveSalesOrder = async (salesOrderData) => {
    try {
      if (selectedSalesOrder) {
        await salesOrderService.update(selectedSalesOrder.Id, salesOrderData);
        const updatedSalesOrders = salesOrders.map(so =>
          so.Id === selectedSalesOrder.Id ? { ...so, ...salesOrderData } : so
        );
        setSalesOrders(updatedSalesOrders);
      } else {
        const newSalesOrder = await salesOrderService.create(salesOrderData);
        setSalesOrders([...salesOrders, newSalesOrder]);
      }
      setIsModalOpen(false);
      setSelectedSalesOrder(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteSalesOrder = async (salesOrder) => {
    if (window.confirm(`Are you sure you want to delete sales order ${salesOrder.sales_order_number_c}?`)) {
      try {
        await salesOrderService.delete(salesOrder.Id);
        setSalesOrders(salesOrders.filter(so => so.Id !== salesOrder.Id));
        toast.success("Sales order deleted successfully");
      } catch (error) {
        toast.error("Failed to delete sales order");
      }
    }
  };

  const handleEditSalesOrder = (salesOrder) => {
    setSelectedSalesOrder(salesOrder);
    setIsModalOpen(true);
  };

  const handleAddSalesOrder = () => {
    setSelectedSalesOrder(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (salesOrder, newStatus) => {
    try {
      const updatedSalesOrder = await salesOrderService.update(salesOrder.Id, { status_c: newStatus });
      const updatedSalesOrders = salesOrders.map(so =>
        so.Id === salesOrder.Id ? updatedSalesOrder : so
      );
      setSalesOrders(updatedSalesOrders);
      toast.success(`Sales order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update sales order status");
    }
  };

  const getCustomerName = (customerId) => {
    if (typeof customerId === 'object' && customerId?.Name) {
      return customerId.Name;
    }
    const customer = customers.find(c => c.Id === customerId);
    return customer ? (customer.Name || customer.name) : "Unknown Customer";
  };

  const columns = [
    { key: "sales_order_number_c", label: "Sales Order #", sortable: true },
    { 
      key: "customer_c", 
      label: "Customer", 
      sortable: true,
      render: (value) => getCustomerName(value)
    },
    {
      key: "status_c",
      label: "Status",
      render: (value) => <StatusBadge status={value} type="salesOrder" />
    },
    { 
      key: "order_date_c", 
      label: "Order Date", 
      sortable: true,
      render: (value) => value ? format(new Date(value), "MMM dd, yyyy") : "N/A"
    },
    { 
      key: "delivery_date_c", 
      label: "Delivery Date", 
      sortable: true,
      render: (value) => value ? format(new Date(value), "MMM dd, yyyy") : "Not Set"
    },
    { 
      key: "total_amount_c", 
      label: "Total Amount", 
      sortable: true,
      render: (value) => `$${(value || 0).toFixed(2)}`
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, salesOrder) => (
        <div className="flex items-center gap-2">
          <Select
            value={salesOrder.status_c}
            onChange={(e) => handleStatusChange(salesOrder, e.target.value)}
            className="w-32 text-xs"
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSalesOrder(salesOrder)}
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteSalesOrder(salesOrder)}
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
        <ErrorView message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
          <p className="mt-2 text-gray-600">Manage customer sales orders and deliveries</p>
        </div>
        <Button onClick={handleAddSalesOrder} className="mt-4 sm:mt-0">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Create Sales Order
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {["Open", "Closed", "Pending", "Shipped", "Delivered", "Cancelled"].map(status => {
          const count = salesOrders.filter(so => so.status_c === status).length;
          return (
            <div key={status} className="card p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
              <div className="text-sm text-gray-600">{status}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sales orders by number or customer name..."
            />
          </div>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Sales Orders Table */}
      {filteredSalesOrders.length === 0 && !loading ? (
        <Empty
          title="No sales orders found"
          description={searchQuery || statusFilter 
            ? "Try adjusting your filters to see more sales orders"
            : "Get started by creating your first sales order"
          }
          actionLabel="Create Sales Order"
          onAction={handleAddSalesOrder}
          icon="ShoppingBag"
        />
      ) : (
        <DataTable
          data={filteredSalesOrders}
          columns={columns}
          loading={loading}
          onRowClick={handleEditSalesOrder}
        />
      )}

      {/* Sales Order Modal */}
      <SalesOrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSalesOrder(null);
        }}
        salesOrder={selectedSalesOrder}
        onSave={handleSaveSalesOrder}
      />
    </div>
  );
};

export default SalesOrders;