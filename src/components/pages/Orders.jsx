import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DataTable from "@/components/organisms/DataTable";
import OrderModal from "@/components/organisms/OrderModal";
import InvoicePDFModal from "@/components/organisms/InvoicePDFModal";
import SearchBar from "@/components/molecules/SearchBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import orderService from "@/services/api/orderService";
import customerService from "@/services/api/customerService";
import { format } from "date-fns";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [ordersData, customersData] = await Promise.all([
        orderService.getAll(),
        customerService.getAll()
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
    } catch (err) {
      setError("Failed to load orders");
      console.error("Orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order => {
        const customer = customers.find(c => c.Id === order.customerId);
        return (
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleSaveOrder = async (orderData) => {
    try {
      if (selectedOrder) {
        await orderService.update(selectedOrder.Id, orderData);
        const updatedOrders = orders.map(o =>
          o.Id === selectedOrder.Id ? { ...o, ...orderData } : o
        );
        setOrders(updatedOrders);
      } else {
        const newOrder = await orderService.create(orderData);
        setOrders([...orders, newOrder]);
      }
      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteOrder = async (order) => {
    if (window.confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
      try {
        await orderService.delete(order.Id);
        setOrders(orders.filter(o => o.Id !== order.Id));
        toast.success("Order deleted successfully");
      } catch (error) {
        toast.error("Failed to delete order");
      }
    }
  };
const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleAddOrder = () => {
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleGenerateInvoice = (order) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceModalOpen(true);
  };
  const handleStatusChange = async (order, newStatus) => {
    try {
      const updatedOrder = await orderService.update(order.Id, { status: newStatus });
      const updatedOrders = orders.map(o =>
        o.Id === order.Id ? updatedOrder : o
      );
      setOrders(updatedOrders);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.Id === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  const columns = [
    { key: "orderNumber", label: "Order #", sortable: true },
    { 
      key: "customerId", 
      label: "Customer", 
      sortable: true,
      render: (value) => getCustomerName(value)
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} type="order" />
    },
    { 
      key: "total", 
      label: "Total", 
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`
    },
    { 
      key: "createdAt", 
      label: "Date", 
      sortable: true,
      render: (value) => format(new Date(value), "MMM dd, yyyy")
    },
    {
      key: "actions",
label: "Actions",
      render: (value, order) => (
        <div className="flex items-center gap-2">
          <Select
            value={order.status}
            onChange={(e) => handleStatusChange(order, e.target.value)}
            className="w-32 text-xs"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          {order.status === 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleGenerateInvoice(order)}
              title="Generate Invoice"
            >
              <ApperIcon name="FileText" className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditOrder(order)}
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteOrder(order)}
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
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-2 text-gray-600">Track and manage customer orders</p>
        </div>
        <Button onClick={handleAddOrder} className="mt-4 sm:mt-0">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {["pending", "processing", "completed", "cancelled"].map(status => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <div key={status} className="card p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{status}</div>
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
              placeholder="Search orders by number or customer name..."
            />
          </div>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 && !loading ? (
        <Empty
          title="No orders found"
          description={searchQuery || statusFilter 
            ? "Try adjusting your filters to see more orders"
            : "Get started by creating your first order"
          }
          actionLabel="Create Order"
          onAction={handleAddOrder}
          icon="ShoppingCart"
        />
      ) : (
        <DataTable
          data={filteredOrders}
          columns={columns}
          loading={loading}
          onRowClick={handleEditOrder}
        />
      )}

{/* Order Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onSave={handleSaveOrder}
      />

      {/* Invoice PDF Modal */}
      <InvoicePDFModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedOrderForInvoice(null);
        }}
        order={selectedOrderForInvoice}
      />
    </div>
  );
};

export default Orders;