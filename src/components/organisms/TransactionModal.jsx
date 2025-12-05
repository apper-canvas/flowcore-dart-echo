import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";

const TransactionModal = ({ isOpen, onClose, transaction, onSave }) => {
  const [formData, setFormData] = useState({
    type: "income",
    category: "",
    description: "",
    amount: "",
    notes: ""
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || "income",
        category: transaction.category || "",
        description: transaction.description || "",
        amount: transaction.amount?.toString() || "",
        notes: transaction.notes || ""
      });
    } else {
      setFormData({
        type: "income",
        category: "",
        description: "",
        amount: "",
        notes: ""
      });
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0
      };

      await onSave(transactionData);
      toast.success(transaction ? "Transaction updated successfully" : "Transaction recorded successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const typeOptions = [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" }
  ];

  const incomeCategories = [
    { value: "Sales", label: "Sales" },
    { value: "Services", label: "Services" },
    { value: "Interest", label: "Interest" },
    { value: "Other Income", label: "Other Income" }
  ];

  const expenseCategories = [
    { value: "Cost of Goods", label: "Cost of Goods" },
    { value: "Office Supplies", label: "Office Supplies" },
    { value: "Marketing", label: "Marketing" },
    { value: "Utilities", label: "Utilities" },
    { value: "Rent", label: "Rent" },
    { value: "Insurance", label: "Insurance" },
    { value: "Travel", label: "Travel" },
    { value: "Other Expenses", label: "Other Expenses" }
  ];

  const categoryOptions = formData.type === "income" ? incomeCategories : expenseCategories;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction ? "Edit Transaction" : "Record New Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Type"
            type="select"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={typeOptions}
            required
          />
          
          <FormField
            label="Category"
            type="select"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categoryOptions}
            required
          />
          
          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter transaction description"
            required
          />
          
          <FormField
            label="Amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
          
          <FormField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes (optional)"
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
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
              {loading ? "Saving..." : (transaction ? "Update Transaction" : "Record Transaction")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;