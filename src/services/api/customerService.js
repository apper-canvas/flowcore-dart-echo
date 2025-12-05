import { getApperClient } from "@/services/apperClient";

class CustomerService {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('customer_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "emergency_phone_c"}},
          {"field": {"Name": "emergency_name_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
  }

async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.getRecordById('customer_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "emergency_phone_c"}},
          {"field": {"Name": "emergency_name_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      });

      if (!response.success) {
        throw new Error(response.message || "Customer not found");
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  }

async create(customerData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const params = {
        records: [{
          Name: customerData.name || customerData.Name || '',
          email_c: customerData.email || customerData.email_c || '',
          phone_c: customerData.phone || customerData.phone_c || '',
          address_c: customerData.address || customerData.address_c || '',
          Tags: customerData.tags || customerData.Tags || '',
          emergency_phone_c: customerData.emergencyPhone || customerData.emergency_phone_c || '',
          emergency_name_c: customerData.emergencyName || customerData.emergency_name_c || ''
        }]
      };

      const response = await apperClient.createRecord('customer_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} customer records:`, failed);
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

async update(id, customerData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const params = {
        records: [{
          Id: parseInt(id),
          Name: customerData.name || customerData.Name || '',
          email_c: customerData.email || customerData.email_c || '',
          phone_c: customerData.phone || customerData.phone_c || '',
          address_c: customerData.address || customerData.address_c || '',
          Tags: customerData.tags || customerData.Tags || '',
          emergency_phone_c: customerData.emergencyPhone || customerData.emergency_phone_c || '',
          emergency_name_c: customerData.emergencyName || customerData.emergency_name_c || ''
        }]
      };

      const response = await apperClient.updateRecord('customer_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} customer records:`, failed);
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.deleteRecord('customer_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} customer records:`, failed);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }

  async updateCustomerStats(customerId, orderTotal) {
    // This functionality would be handled by database triggers or calculated fields
    // in a real implementation, so we'll keep it as a placeholder
    try {
      console.log(`Customer ${customerId} stats would be updated with order total ${orderTotal}`);
      return true;
    } catch (error) {
      console.error("Error updating customer stats:", error);
      return false;
    }
  }

  async getTopCustomers(limit = 5) {
    try {
      // This would require aggregated data from orders
      // For now, we'll return customers ordered by creation date as a placeholder
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('customer_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
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
      console.error("Error fetching top customers:", error);
      return [];
    }
}
}

export default new CustomerService();