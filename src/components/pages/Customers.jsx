import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DataTable from "@/components/organisms/DataTable";
import CustomerModal from "@/components/organisms/CustomerModal";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import customerService from "@/services/api/customerService";
import orderService from "@/services/api/orderService";
import { format } from "date-fns";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState({});

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery]);

  const loadCustomers = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [customersData, ordersData] = await Promise.all([
        customerService.getAll(),
        orderService.getAll()
      ]);
      
      setCustomers(customersData);
      
      // Group orders by customer ID for quick lookup
      const ordersByCustomer = {};
      ordersData.forEach(order => {
        if (!ordersByCustomer[order.customerId]) {
          ordersByCustomer[order.customerId] = [];
        }
        ordersByCustomer[order.customerId].push(order);
      });
      setCustomerOrders(ordersByCustomer);
      
    } catch (err) {
      setError("Failed to load customers");
      console.error("Customers error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      if (selectedCustomer) {
        await customerService.update(selectedCustomer.Id, customerData);
        const updatedCustomers = customers.map(c =>
          c.Id === selectedCustomer.Id ? { ...c, ...customerData } : c
        );
        setCustomers(updatedCustomers);
      } else {
        const newCustomer = await customerService.create(customerData);
        setCustomers([...customers, newCustomer]);
      }
      setIsModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteCustomer = async (customer) => {
    const orderCount = customerOrders[customer.Id]?.length || 0;
    if (orderCount > 0) {
      toast.error(`Cannot delete customer with ${orderCount} orders. Delete orders first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
      try {
        await customerService.delete(customer.Id);
        setCustomers(customers.filter(c => c.Id !== customer.Id));
        toast.success("Customer deleted successfully");
      } catch (error) {
        toast.error("Failed to delete customer");
      }
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const getCustomerOrderCount = (customerId) => {
    return customerOrders[customerId]?.length || 0;
  };

  const getCustomerTotalSpent = (customerId) => {
    const orders = customerOrders[customerId] || [];
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { 
      key: "totalOrders", 
      label: "Orders", 
      sortable: true,
      render: (value, customer) => getCustomerOrderCount(customer.Id)
    },
    { 
      key: "totalSpent", 
      label: "Total Spent", 
      sortable: true,
      render: (value, customer) => `$${getCustomerTotalSpent(customer.Id).toFixed(2)}`
    },
    { 
      key: "createdAt", 
      label: "Since", 
      sortable: true,
      render: (value) => format(new Date(value), "MMM yyyy")
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, customer) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditCustomer(customer)}
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteCustomer(customer)}
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
        <ErrorView message={error} onRetry={loadCustomers} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="mt-2 text-gray-600">Manage your customer database and relationships</p>
        </div>
        <Button onClick={handleAddCustomer} className="mt-4 sm:mt-0">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <ApperIcon name="Users" className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => getCustomerOrderCount(c.Id) > 0).length}
              </p>
            </div>
            <ApperIcon name="UserCheck" className="w-8 h-8 text-success" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                $
                {customers.length > 0 
                  ? (customers.reduce((sum, c) => sum + getCustomerTotalSpent(c.Id), 0) / 
                     customers.filter(c => getCustomerOrderCount(c.Id) > 0).length || 1).toFixed(0)
                  : 0
                }
              </p>
            </div>
            <ApperIcon name="DollarSign" className="w-8 h-8 text-accent" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-6 mb-6">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customers by name, email, or phone..."
        />
      </div>

      {/* Customers Table */}
      {filteredCustomers.length === 0 && !loading ? (
        <Empty
          title="No customers found"
          description={searchQuery 
            ? "Try adjusting your search to see more customers"
            : "Get started by adding your first customer"
          }
          actionLabel="Add Customer"
          onAction={handleAddCustomer}
          icon="Users"
        />
      ) : (
        <DataTable
          data={filteredCustomers}
          columns={columns}
          loading={loading}
          onRowClick={handleEditCustomer}
        />
      )}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
      />
    </div>
  );
};

export default Customers;