import { getApperClient } from "@/services/apperClient";

class OrderService {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('order_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "customer_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.getRecordById('order_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "customer_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ]
      });

      if (!response.success) {
        throw new Error(response.message || "Order not found");
      }

      // Get order items
      const itemsResponse = await apperClient.fetchRecords('order_item_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "product_name_c"}},
          {"field": {"Name": "quantity_c"}},
          {"field": {"Name": "unit_price_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "product_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        where: [{
          "FieldName": "order_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(id)],
          "Include": true
        }]
      });

      if (itemsResponse.success) {
        response.data.items = itemsResponse.data || [];
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  }

  async create(orderData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const orderNumber = this.generateOrderNumber();

      // Create order
      const orderParams = {
        records: [{
          Name: orderNumber,
          order_number_c: orderNumber,
          customer_id_c: parseInt(orderData.customerId || orderData.customer_id_c),
          status_c: orderData.status || orderData.status_c || 'pending',
          notes_c: orderData.notes || orderData.notes_c || '',
          subtotal_c: parseFloat(orderData.subtotal || orderData.subtotal_c || 0),
          tax_c: parseFloat(orderData.tax || orderData.tax_c || 0),
          total_c: parseFloat(orderData.total || orderData.total_c || 0)
        }]
      };

      const orderResponse = await apperClient.createRecord('order_c', orderParams);

      if (!orderResponse.success) {
        console.error(orderResponse.message);
        throw new Error(orderResponse.message);
      }

      let createdOrder = null;
      if (orderResponse.results) {
        const successful = orderResponse.results.filter(r => r.success);
        const failed = orderResponse.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} order records:`, failed);
        }

        if (successful.length > 0) {
          createdOrder = successful[0].data;
        }
      }

      // Create order items if provided
      if (createdOrder && orderData.items && orderData.items.length > 0) {
        const itemRecords = orderData.items.map(item => ({
          Name: item.productName || item.product_name_c || 'Order Item',
          order_id_c: createdOrder.Id,
          product_id_c: parseInt(item.productId || item.product_id_c),
          product_name_c: item.productName || item.product_name_c || '',
          quantity_c: parseInt(item.quantity || item.quantity_c || 0),
          unit_price_c: parseFloat(item.unitPrice || item.unit_price_c || 0),
          total_c: parseFloat(item.total || item.total_c || 0)
        }));

        const itemsParams = { records: itemRecords };
        const itemsResponse = await apperClient.createRecord('order_item_c', itemsParams);

        if (itemsResponse.success && itemsResponse.results) {
          const successfulItems = itemsResponse.results.filter(r => r.success);
          const failedItems = itemsResponse.results.filter(r => !r.success);

          if (failedItems.length > 0) {
            console.error(`Failed to create ${failedItems.length} order item records:`, failedItems);
          }

          createdOrder.items = successfulItems.map(r => r.data);
        }
      }

      return createdOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async update(id, orderData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const params = {
        records: [{
          Id: parseInt(id),
          customer_id_c: parseInt(orderData.customerId || orderData.customer_id_c),
          status_c: orderData.status || orderData.status_c,
          notes_c: orderData.notes || orderData.notes_c || '',
          subtotal_c: parseFloat(orderData.subtotal || orderData.subtotal_c || 0),
          tax_c: parseFloat(orderData.tax || orderData.tax_c || 0),
          total_c: parseFloat(orderData.total || orderData.total_c || 0)
        }]
      };

      const response = await apperClient.updateRecord('order_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} order records:`, failed);
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      // First delete order items
      await apperClient.fetchRecords('order_item_c', {
        fields: [{"field": {"Name": "Id"}}],
        where: [{
          "FieldName": "order_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(id)],
          "Include": true
        }]
      }).then(async (itemsResponse) => {
        if (itemsResponse.success && itemsResponse.data && itemsResponse.data.length > 0) {
          const itemIds = itemsResponse.data.map(item => item.Id);
          await apperClient.deleteRecord('order_item_c', { RecordIds: itemIds });
        }
      });

      // Then delete order
      const response = await apperClient.deleteRecord('order_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} order records:`, failed);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  }

  async getByStatus(status) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('order_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "customer_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        where: [{
          "FieldName": "status_c",
          "Operator": "EqualTo",
          "Values": [status.toLowerCase()],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching orders by status:", error);
      return [];
    }
  }

  async getByCustomerId(customerId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('order_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "customer_id_c"}}
        ],
        where: [{
          "FieldName": "customer_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(customerId)],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching orders by customer:", error);
      return [];
    }
  }

  async getRecentOrders(limit = 10) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('order_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "customer_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
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
      console.error("Error fetching recent orders:", error);
      return [];
    }
  }

  generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-6);
    return `ORD-${timestamp}`;
  }
}

export default new OrderService();