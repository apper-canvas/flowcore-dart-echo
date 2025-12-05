import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import transactionService from "@/services/api/transactionService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import TransactionModal from "@/components/organisms/TransactionModal";
import DataTable from "@/components/organisms/DataTable";
import SearchBar from "@/components/molecules/SearchBar";
import MetricCard from "@/components/molecules/MetricCard";
import Pagination from "@/components/molecules/Pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Advanced reporting state
  const [activeTab, setActiveTab] = useState('overview');
  const [cashFlowData, setCashFlowData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [profitMargins, setProfitMargins] = useState([]);
  const [categoryProfits, setCategoryProfits] = useState([]);
  const [advancedLoading, setAdvancedLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, typeFilter, categoryFilter]);

  useEffect(() => {
    if (activeTab === 'advanced') {
      loadAdvancedReports();
    }
  }, [activeTab]);

  const loadTransactions = async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log('Loading transactions...');
      const [transactionsData, summaryData] = await Promise.all([
        transactionService.getAll(),
        transactionService.getSummary()
      ]);
      
      console.log('Loaded transactions:', transactionsData);
      console.log('Transaction count:', transactionsData?.length || 0);
      console.log('Summary data:', summaryData);
      
      // Ensure we have valid arrays
      setTransactions(transactionsData || []);
      setSummary(summaryData || {});
    } catch (err) {
      setError("Failed to load financial data");
      console.error("Financials error:", err);
      // Set empty arrays on error to prevent undefined issues
      setTransactions([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  const loadAdvancedReports = async () => {
    setAdvancedLoading(true);
    
    try {
      // Dynamic imports for advanced services
      const [
        { default: cashFlowService },
        { default: profitMarginService }
      ] = await Promise.all([
        import("@/services/api/cashFlowService"),
        import("@/services/api/profitMarginService")
      ]);

      const [
        cashFlow,
        expenses,
        margins,
        categoryProfitsData
      ] = await Promise.all([
        cashFlowService.getMonthlyCashFlow(),
        cashFlowService.getExpensesByCategory(),
        profitMarginService.getProductProfitMargins(),
        profitMarginService.getCategoryProfitSummary()
      ]);

      // Calculate percentages for expense categories
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const expensesWithPercentages = expenses.map(exp => ({
        ...exp,
        percentage: totalExpenses > 0 ? (exp.amount / totalExpenses) * 100 : 0
      }));

      setCashFlowData(cashFlow);
      setExpenseCategories(expensesWithPercentages);
      setProfitMargins(margins);
      setCategoryProfits(categoryProfitsData);
    } catch (error) {
      console.error("Error loading advanced reports:", error);
    } finally {
      setAdvancedLoading(false);
    }
  };

  const filterTransactions = () => {
    const previousFiltered = filteredTransactions;
    let filtered = [...transactions];

    // Debug: Log raw transactions data
    console.log('Raw transactions:', transactions);
    console.log('Transactions count:', transactions.length);

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        (transaction.description_c || transaction.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.category_c || transaction.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.Name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(transaction => (transaction.type_c || transaction.type) === typeFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(transaction => (transaction.category_c || transaction.category) === categoryFilter);
    }

    console.log('Filtered transactions:', filtered);
    console.log('Filtered count:', filtered.length);
    
    setFilteredTransactions(filtered);
    
    // Only reset to first page if the filtered results actually changed
    // This prevents page reset during normal pagination
    if (JSON.stringify(previousFiltered) !== JSON.stringify(filtered)) {
      setCurrentPage(1);
    }
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

  const getMarginStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-700 bg-green-100';
      case 'good': return 'text-blue-700 bg-blue-100';
      case 'fair': return 'text-yellow-700 bg-yellow-100';
      case 'poor': return 'text-orange-700 bg-orange-100';
      case 'loss': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const columns = [
    { 
      key: "date_c", 
      label: "Date", 
      sortable: true,
      render: (value) => format(new Date(value || Date.now()), "MMM dd, yyyy")
    },
    {
      key: "type_c",
      label: "Type",
      render: (value) => (
        <span className={`status-badge ${
          value === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {value === "income" ? "Income" : "Expense"}
        </span>
      )
    },
    { key: "category_c", label: "Category", sortable: true },
    { key: "description_c", label: "Description", sortable: true },
    { 
      key: "amount_c", 
      label: "Amount", 
      sortable: true,
      render: (value, transaction) => (
        <span className={(transaction.type_c || transaction.type) === "income" ? "text-success font-semibold" : "text-error font-semibold"}>
          {(transaction.type_c || transaction.type) === "income" ? "+" : "-"}${(value || 0).toFixed(2)}
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

  const profitMarginColumns = [
    { key: "sku", label: "SKU", sortable: true },
    { key: "name", label: "Product Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { 
      key: "price", 
      label: "Price", 
      sortable: true,
      render: (value) => `$${(value || 0).toFixed(2)}`
    },
    { 
      key: "cost", 
      label: "Cost", 
      sortable: true,
      render: (value) => `$${(value || 0).toFixed(2)}`
    },
    { 
      key: "profit", 
      label: "Profit", 
      sortable: true,
      render: (value) => (
        <span className={value >= 0 ? "text-success font-semibold" : "text-error font-semibold"}>
          ${(value || 0).toFixed(2)}
        </span>
      )
    },
    { 
      key: "marginPercent", 
      label: "Margin %", 
      sortable: true,
      render: (value, product) => (
        <div className="flex items-center gap-2">
          <span className={`status-badge ${getMarginStatusColor(product.marginStatus)}`}>
            {(value || 0).toFixed(1)}%
          </span>
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

  const categories = [...new Set(transactions.map(t => t.category_c || t.category).filter(Boolean))];

  const renderOverviewTab = () => (
    <>
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
          pagination={{
            component: Pagination,
            currentPage: currentPage,
            totalPages: Math.ceil(filteredTransactions.length / itemsPerPage),
            totalItems: filteredTransactions.length,
            itemsPerPage: itemsPerPage,
            onPageChange: setCurrentPage,
            onItemsPerPageChange: setItemsPerPage
          }}
          debug={{
            totalRecords: transactions.length,
            filteredRecords: filteredTransactions.length,
            currentPageRecords: Math.min(itemsPerPage, filteredTransactions.length - ((currentPage - 1) * itemsPerPage))
          }}
        />
      )}
    </>
  );

  const renderAdvancedTab = () => {
    if (advancedLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loading />
        </div>
      );
    }

    return (
      <>
        {/* Cash Flow Analysis */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Cash Flow Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Flow Chart Data Display */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Total Income</div>
                  <div className="text-lg font-semibold text-green-600">
                    ${cashFlowData.reduce((sum, month) => sum + month.income, 0).toFixed(2)}
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Total Expenses</div>
                  <div className="text-lg font-semibold text-red-600">
                    ${cashFlowData.reduce((sum, month) => sum + month.expenses, 0).toFixed(2)}
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Net Flow</div>
                  <div className="text-lg font-semibold text-blue-600">
                    ${cashFlowData.reduce((sum, month) => sum + month.netFlow, 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Monthly Breakdown */}
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {cashFlowData.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">{month.month}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600">+${month.income.toFixed(2)}</span>
                      <span className="text-red-600">-${month.expenses.toFixed(2)}</span>
                      <span className={`font-semibold ${month.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${month.netFlow.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Expense Categorization */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Categorization</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="space-y-3">
              {expenseCategories.slice(0, 8).map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: `hsl(${index * 45}, 70%, 60%)` 
                      }}
                    />
                    <span className="font-medium text-gray-700">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${category.amount.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary Stats */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Largest Category</div>
                <div className="font-semibold text-blue-700">
                  {expenseCategories[0]?.category || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  ${expenseCategories[0]?.amount?.toFixed(2) || '0.00'} ({expenseCategories[0]?.percentage?.toFixed(1) || '0'}%)
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Total Categories</div>
                <div className="font-semibold text-yellow-700">{expenseCategories.length}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Average per Category</div>
                <div className="font-semibold text-green-700">
                  ${expenseCategories.length > 0 
                    ? (expenseCategories.reduce((sum, cat) => sum + cat.amount, 0) / expenseCategories.length).toFixed(2)
                    : '0.00'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Profit Margins */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Product-Specific Profit Margins</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span>Excellent (≥50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span>Good (30-49%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                <span>Fair (15-29%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 rounded"></div>
                <span>Poor/Loss (&lt;15%)</span>
              </div>
            </div>
          </div>
          
          {profitMargins.length === 0 ? (
            <Empty
              title="No product data available"
              description="Add products with cost and price information to see profit margin analysis"
              icon="Package"
            />
          ) : (
            <DataTable
              data={profitMargins}
              columns={profitMarginColumns}
              loading={false}
            />
          )}
        </div>

        {/* Category Profit Summary */}
        {categoryProfits.length > 0 && (
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Profit Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryProfits.map((category, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{category.category}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Products:</span>
                      <span className="font-medium">{category.productCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-medium text-green-600">${category.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium text-red-600">${category.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Margin:</span>
                      <span className={`font-semibold ${category.averageMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {category.averageMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="mt-2 text-gray-600">Track income, expenses, and advanced financial analytics</p>
        </div>
        <Button onClick={handleAddTransaction} className="mt-4 sm:mt-0">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Record Transaction
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ApperIcon name="BarChart3" className="w-4 h-4 mr-2 inline" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'advanced'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ApperIcon name="TrendingUp" className="w-4 h-4 mr-2 inline" />
            Advanced Reports
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? renderOverviewTab() : renderAdvancedTab()}

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