import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DataTable from "@/components/organisms/DataTable";
import TransactionModal from "@/components/organisms/TransactionModal";
import MetricCard from "@/components/molecules/MetricCard";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import transactionService from "@/services/api/transactionService";
import { format } from "date-fns";

const Financials = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netIncome: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, typeFilter, categoryFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [transactionsData, summaryData] = await Promise.all([
        transactionService.getAll(),
        transactionService.getSummary()
      ]);
      setTransactions(transactionsData);
      setSummary(summaryData);
    } catch (err) {
      setError("Failed to load financial data");
      console.error("Financials error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(transaction => transaction.category === categoryFilter);
    }

    setFilteredTransactions(filtered);
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      if (selectedTransaction) {
        await transactionService.update(selectedTransaction.Id, transactionData);
        const updatedTransactions = transactions.map(t =>
          t.Id === selectedTransaction.Id ? { ...t, ...transactionData } : t
        );
        setTransactions(updatedTransactions);
      } else {
        const newTransaction = await transactionService.create(transactionData);
        setTransactions([...transactions, newTransaction]);
      }
      
      // Refresh summary
      const newSummary = await transactionService.getSummary();
      setSummary(newSummary);
      
      setIsModalOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    if (window.confirm(`Are you sure you want to delete this transaction?`)) {
      try {
        await transactionService.delete(transaction.Id);
        setTransactions(transactions.filter(t => t.Id !== transaction.Id));
        
        // Refresh summary
        const newSummary = await transactionService.getSummary();
        setSummary(newSummary);
        
        toast.success("Transaction deleted successfully");
      } catch (error) {
        toast.error("Failed to delete transaction");
      }
    }
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const columns = [
    { 
      key: "date", 
      label: "Date", 
      sortable: true,
      render: (value) => format(new Date(value), "MMM dd, yyyy")
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <span className={`status-badge ${
          value === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {value === "income" ? "Income" : "Expense"}
        </span>
      )
    },
    { key: "category", label: "Category", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { 
      key: "amount", 
      label: "Amount", 
      sortable: true,
      render: (value, transaction) => (
        <span className={transaction.type === "income" ? "text-success font-semibold" : "text-error font-semibold"}>
          {transaction.type === "income" ? "+" : "-"}${value.toFixed(2)}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, transaction) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditTransaction(transaction)}
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteTransaction(transaction)}
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
        <ErrorView message={error} onRetry={loadTransactions} />
      </div>
    );
  }

  const categories = [...new Set(transactions.map(t => t.category))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="mt-2 text-gray-600">Track income, expenses, and financial performance</p>
        </div>
        <Button onClick={handleAddTransaction} className="mt-4 sm:mt-0">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Record Transaction
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Income"
          value={`$${summary.totalIncome.toLocaleString()}`}
          icon="TrendingUp"
          trend="+12.5%"
          trendDirection="up"
        />
        <MetricCard
          title="Total Expenses"
          value={`$${summary.totalExpenses.toLocaleString()}`}
          icon="TrendingDown"
          trend="+8.2%"
          trendDirection="down"
        />
        <MetricCard
          title="Net Income"
          value={`$${summary.netIncome.toLocaleString()}`}
          icon="DollarSign"
          trend={summary.netIncome >= 0 ? "+15.3%" : "-8.7%"}
          trendDirection={summary.netIncome >= 0 ? "up" : "down"}
        />
      </div>

      {/* Profit & Loss Summary */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit & Loss Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total Revenue</span>
            <span className="font-semibold text-success">+${summary.totalIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total Expenses</span>
            <span className="font-semibold text-error">-${summary.totalExpenses.toFixed(2)}</span>
          </div>
          <hr />
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-900">Net Profit/Loss</span>
            <span className={`font-bold ${summary.netIncome >= 0 ? "text-success" : "text-error"}`}>
              ${summary.netIncome.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions by description or category..."
            />
          </div>
          
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 && !loading ? (
        <Empty
          title="No transactions found"
          description={searchQuery || typeFilter || categoryFilter 
            ? "Try adjusting your filters to see more transactions"
            : "Get started by recording your first transaction"
          }
          actionLabel="Record Transaction"
          onAction={handleAddTransaction}
          icon="FileText"
        />
      ) : (
        <DataTable
          data={filteredTransactions}
          columns={columns}
          loading={loading}
          onRowClick={handleEditTransaction}
        />
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onSave={handleSaveTransaction}
      />
    </div>
  );
};

export default Financials;