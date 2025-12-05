import { getApperClient } from "@/services/apperClient";

class TransactionService {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('transaction_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "related_order_id_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.getRecordById('transaction_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "related_order_id_c"}}
        ]
      });

      if (!response.success) {
        throw new Error(response.message || "Transaction not found");
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      throw error;
    }
  }

  async create(transactionData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const params = {
        records: [{
          Name: transactionData.description_c || transactionData.description || '',
          amount_c: parseFloat(transactionData.amount_c || transactionData.amount || 0),
          category_c: transactionData.category_c || transactionData.category || '',
          description_c: transactionData.description_c || transactionData.description || '',
          date_c: transactionData.date_c || new Date().toISOString().split('T')[0],
          notes_c: transactionData.notes_c || transactionData.notes || '',
          type_c: transactionData.type_c || transactionData.type || 'income',
          related_order_id_c: transactionData.related_order_id_c || transactionData.relatedOrderId || null
        }]
      };

      const response = await apperClient.createRecord('transaction_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} transaction records:`, failed);
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  async update(id, transactionData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const params = {
        records: [{
          Id: parseInt(id),
          Name: transactionData.description_c || transactionData.description || '',
          amount_c: parseFloat(transactionData.amount_c || transactionData.amount || 0),
          category_c: transactionData.category_c || transactionData.category || '',
          description_c: transactionData.description_c || transactionData.description || '',
          date_c: transactionData.date_c || transactionData.date,
          notes_c: transactionData.notes_c || transactionData.notes || '',
          type_c: transactionData.type_c || transactionData.type || 'income'
        }]
      };

      const response = await apperClient.updateRecord('transaction_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} transaction records:`, failed);
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.deleteRecord('transaction_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} transaction records:`, failed);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  }

  async getByType(type) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('transaction_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "type_c"}}
        ],
        where: [{
          "FieldName": "type_c",
          "Operator": "EqualTo",
          "Values": [type.toLowerCase()],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching transactions by type:", error);
      return [];
    }
  }

  async getSummary() {
    try {
      const transactions = await this.getAll();
      
      const income = transactions
        .filter(t => t.type_c === "income")
        .reduce((sum, t) => sum + (t.amount_c || 0), 0);
      
      const expenses = transactions
        .filter(t => t.type_c === "expense")
        .reduce((sum, t) => sum + (t.amount_c || 0), 0);
      
      return {
        totalIncome: income,
        totalExpenses: expenses,
        netIncome: income - expenses
      };
    } catch (error) {
      console.error("Error getting transaction summary:", error);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0
      };
    }
  }

  async getRecentTransactions(limit = 10) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('transaction_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": limit, "offset": 0}
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      return [];
    }
  }
}

export default new TransactionService();