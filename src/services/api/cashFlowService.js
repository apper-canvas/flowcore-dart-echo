import { getApperClient } from "@/services/apperClient";

class CashFlowService {
  async getMonthlyCashFlow(year = new Date().getFullYear()) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('transaction_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "category_c"}}
        ],
        where: [{
          "FieldName": "date_c",
          "Operator": "ExactMatch",
          "SubOperator": "RelativeMatch",
          "Values": [`this year`],
          "Include": true
        }],
        orderBy: [{"fieldName": "date_c", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error("Failed to fetch cash flow data:", response);
        return this.getEmptyMonthlyCashFlow();
      }

      const transactions = response.data || [];
      const monthlyData = this.processMonthlyCashFlow(transactions);
      
      return monthlyData;
    } catch (error) {
      console.error("Error getting monthly cash flow:", error);
      return this.getEmptyMonthlyCashFlow();
    }
  }

  processMonthlyCashFlow(transactions) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const monthlyData = months.map(month => ({
      month,
      income: 0,
      expenses: 0,
      netFlow: 0
    }));

    transactions.forEach(transaction => {
      const date = new Date(transaction.date_c);
      const monthIndex = date.getMonth();
      const amount = parseFloat(transaction.amount_c || 0);
      
      if (transaction.type_c === 'income') {
        monthlyData[monthIndex].income += amount;
      } else {
        monthlyData[monthIndex].expenses += amount;
      }
      
      monthlyData[monthIndex].netFlow = monthlyData[monthIndex].income - monthlyData[monthIndex].expenses;
    });

    return monthlyData;
  }

  getEmptyMonthlyCashFlow() {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map(month => ({
      month,
      income: 0,
      expenses: 0,
      netFlow: 0
    }));
  }

  async getExpensesByCategory() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('transaction_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "type_c"}}
        ],
        where: [{
          "FieldName": "type_c",
          "Operator": "EqualTo",
          "Values": ["expense"],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error("Failed to fetch expense data:", response);
        return [];
      }

      const expenses = response.data || [];
      const categoryTotals = {};

      expenses.forEach(expense => {
        const category = expense.category_c || 'Uncategorized';
        const amount = parseFloat(expense.amount_c || 0);
        
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += amount;
      });

      return Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount,
        percentage: 0 // Will be calculated in component
      }));
    } catch (error) {
      console.error("Error getting expenses by category:", error);
      return [];
    }
  }
}

export default new CashFlowService();