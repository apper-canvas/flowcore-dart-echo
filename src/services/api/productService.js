import { getApperClient } from "@/services/apperClient";

class ProductService {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('product_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "sku_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "cost_c"}},
          {"field": {"Name": "stock_level_c"}},
          {"field": {"Name": "reorder_point_c"}},
          {"field": {"Name": "unit_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.getRecordById('product_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "sku_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "cost_c"}},
          {"field": {"Name": "stock_level_c"}},
          {"field": {"Name": "reorder_point_c"}},
          {"field": {"Name": "unit_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      });

      if (!response.success) {
        throw new Error(response.message || "Product not found");
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  async create(productData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const params = {
        records: [{
          Name: productData.name || productData.Name || '',
          sku_c: productData.sku || productData.sku_c || '',
          description_c: productData.description || productData.description_c || '',
          category_c: productData.category || productData.category_c || '',
          price_c: parseFloat(productData.price || productData.price_c || 0),
          cost_c: parseFloat(productData.cost || productData.cost_c || 0),
          stock_level_c: parseInt(productData.stockLevel || productData.stock_level_c || 0),
          reorder_point_c: parseInt(productData.reorderPoint || productData.reorder_point_c || 0),
          unit_c: productData.unit || productData.unit_c || 'pcs'
        }]
      };

      const response = await apperClient.createRecord('product_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} product records:`, failed);
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async update(id, productData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const params = {
        records: [{
          Id: parseInt(id),
          Name: productData.name || productData.Name || '',
          sku_c: productData.sku || productData.sku_c || '',
          description_c: productData.description || productData.description_c || '',
          category_c: productData.category || productData.category_c || '',
          price_c: parseFloat(productData.price || productData.price_c || 0),
          cost_c: parseFloat(productData.cost || productData.cost_c || 0),
          stock_level_c: parseInt(productData.stockLevel || productData.stock_level_c || 0),
          reorder_point_c: parseInt(productData.reorderPoint || productData.reorder_point_c || 0),
          unit_c: productData.unit || productData.unit_c || 'pcs'
        }]
      };

      const response = await apperClient.updateRecord('product_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} product records:`, failed);
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.deleteRecord('product_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} product records:`, failed);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  async getLowStockProducts() {
    try {
      const products = await this.getAll();
      return products.filter(p => (p.stock_level_c || 0) <= (p.reorder_point_c || 0));
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      return [];
    }
  }

  async getByCategory(category) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      const response = await apperClient.fetchRecords('product_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "sku_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "stock_level_c"}},
          {"field": {"Name": "reorder_point_c"}}
        ],
        where: [{
          "FieldName": "category_c",
          "Operator": "EqualTo",
          "Values": [category],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
  }
}
export default new ProductService();