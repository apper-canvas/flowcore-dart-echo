import { getApperClient } from "@/services/apperClient";
import salesOrderLineService from "./salesOrderLineService";

class SalesOrderService {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('sales_order_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "sales_order_number_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "delivery_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "customer_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error("Failed to fetch sales orders:", response);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching sales orders:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.getRecordById('sales_order_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "sales_order_number_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "delivery_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "customer_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ]
      });

      if (!response.success) {
        throw new Error(response.message || "Sales order not found");
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching sales order ${id}:`, error);
      throw error;
    }
  }

  async create(salesOrderData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const salesOrderNumber = this.generateSalesOrderNumber();

      const params = {
        records: [{
          Name: salesOrderNumber,
          sales_order_number_c: salesOrderNumber,
          customer_c: parseInt(salesOrderData.customer_c || salesOrderData.customerId),
          order_date_c: salesOrderData.order_date_c || salesOrderData.orderDate,
          delivery_date_c: salesOrderData.delivery_date_c || salesOrderData.deliveryDate,
          status_c: salesOrderData.status_c || salesOrderData.status || 'Open',
          total_amount_c: parseFloat(salesOrderData.total_amount_c || salesOrderData.totalAmount || 0),
          description_c: salesOrderData.description_c || salesOrderData.description || ''
        }]
      };

      const response = await apperClient.createRecord('sales_order_c', params);

      if (!response.success) {
        console.error("Failed to create sales order:", response);
        throw new Error(response.message);
      }

      let createdSalesOrder = null;
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} sales order records:`, failed);
        }

        if (successful.length > 0) {
          createdSalesOrder = successful[0].data;
        }
      }

      return createdSalesOrder;
    } catch (error) {
      console.error("Error creating sales order:", error);
      throw error;
    }
  }

  async update(id, salesOrderData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const params = {
        records: [{
          Id: parseInt(id),
          customer_c: parseInt(salesOrderData.customer_c || salesOrderData.customerId),
          order_date_c: salesOrderData.order_date_c || salesOrderData.orderDate,
          delivery_date_c: salesOrderData.delivery_date_c || salesOrderData.deliveryDate,
          status_c: salesOrderData.status_c || salesOrderData.status,
          total_amount_c: parseFloat(salesOrderData.total_amount_c || salesOrderData.totalAmount || 0),
          description_c: salesOrderData.description_c || salesOrderData.description || ''
        }]
      };

      const response = await apperClient.updateRecord('sales_order_c', params);

      if (!response.success) {
        console.error("Failed to update sales order:", response);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} sales order records:`, failed);
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating sales order:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.deleteRecord('sales_order_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error("Failed to delete sales order:", response);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} sales order records:`, failed);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting sales order:", error);
      throw error;
    }
  }

  async getByStatus(status) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('sales_order_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "sales_order_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "customer_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        where: [{
          "FieldName": "status_c",
          "Operator": "EqualTo",
          "Values": [status],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error("Failed to fetch sales orders by status:", response);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching sales orders by status:", error);
      return [];
    }
  }

  async getByCustomerId(customerId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('sales_order_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "sales_order_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "customer_c"}}
        ],
        where: [{
          "FieldName": "customer_c",
          "Operator": "EqualTo",
          "Values": [parseInt(customerId)],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error("Failed to fetch sales orders by customer:", response);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching sales orders by customer:", error);
      return [];
    }
  }

  async getRecentSalesOrders(limit = 10) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('sales_order_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "sales_order_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "customer_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": limit, "offset": 0}
      });

      if (!response.success) {
        console.error("Failed to fetch recent sales orders:", response);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching recent sales orders:", error);
      return [];
    }
}

  // Handle creating sales order with line items
  async createWithLines(salesOrderData, lineItems = []) {
    try {
      // Create the sales order first
      const salesOrder = await this.create(salesOrderData);
      
      // If line items provided, create them
      if (lineItems.length > 0) {
        const linesData = lineItems.map(item => ({
          sales_order_id: salesOrder.Id,
          item_id: item.item_id || item.productId,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_code_id: item.tax_code_id || 1,
          line_total: item.line_total,
          Name: `Line for ${salesOrder.Name || salesOrder.sales_order_number_c}`
        }));
        
        await salesOrderLineService.createMultiple(linesData);
      }
      
      return salesOrder;
    } catch (error) {
      console.error("Error creating sales order with lines:", error);
      throw error;
    }
  }

  // Handle updating sales order with line items
  async updateWithLines(id, salesOrderData, lineItems = []) {
    try {
      // Update the sales order first
      const salesOrder = await this.update(id, salesOrderData);
      
      // Delete existing line items for this sales order
      await salesOrderLineService.deleteBySalesOrderId(id);
      
      // Create new line items
      if (lineItems.length > 0) {
        const linesData = lineItems.map(item => ({
          sales_order_id: parseInt(id),
          item_id: item.item_id || item.productId,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_code_id: item.tax_code_id || 1,
          line_total: item.line_total,
          Name: `Line for ${salesOrder.Name || salesOrder.sales_order_number_c}`
        }));
        
        await salesOrderLineService.createMultiple(linesData);
      }
      
      return salesOrder;
    } catch (error) {
      console.error("Error updating sales order with lines:", error);
      throw error;
    }
  }

  // Get sales order with its line items
  async getWithLines(id) {
    try {
      const [salesOrder, lineItems] = await Promise.all([
        this.getById(id),
        salesOrderLineService.getBySalesOrderId(id)
      ]);
      
      if (salesOrder) {
        salesOrder.lineItems = lineItems;
      }
      
      return salesOrder;
    } catch (error) {
      console.error("Error fetching sales order with lines:", error);
      throw error;
    }
  }

  generateSalesOrderNumber() {
    const timestamp = Date.now().toString().slice(-6);
    return `SO-${timestamp}`;
  }
}

export default new SalesOrderService();