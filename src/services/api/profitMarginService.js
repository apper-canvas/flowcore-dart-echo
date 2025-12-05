import { getApperClient } from "@/services/apperClient";

class ProfitMarginService {
  async getProductProfitMargins() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) throw new Error("ApperClient not initialized");

      // Get all products with cost and price data
      const productsResponse = await apperClient.fetchRecords('product_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "sku_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "cost_c"}}
        ]
      });

      if (!productsResponse.success) {
        console.error("Failed to fetch products:", productsResponse);
        return [];
      }

      const products = productsResponse.data || [];
      
      // Calculate profit margins for each product
      const profitMargins = products.map(product => {
        const price = parseFloat(product.price_c || 0);
        const cost = parseFloat(product.cost_c || 0);
        const profit = price - cost;
        const marginPercent = price > 0 ? (profit / price) * 100 : 0;

        return {
          id: product.Id,
          name: product.Name,
          sku: product.sku_c,
          category: product.category_c,
          price: price,
          cost: cost,
          profit: profit,
          marginPercent: marginPercent,
          marginStatus: this.getMarginStatus(marginPercent)
        };
      });

      // Sort by margin percentage descending
      return profitMargins.sort((a, b) => b.marginPercent - a.marginPercent);
    } catch (error) {
      console.error("Error getting product profit margins:", error);
      return [];
    }
  }

  getMarginStatus(marginPercent) {
    if (marginPercent >= 50) return 'excellent';
    if (marginPercent >= 30) return 'good';
    if (marginPercent >= 15) return 'fair';
    if (marginPercent >= 0) return 'poor';
    return 'loss';
  }

  async getCategoryProfitSummary() {
    try {
      const products = await this.getProductProfitMargins();
      const categoryMap = {};

      products.forEach(product => {
        const category = product.category || 'Uncategorized';
        
        if (!categoryMap[category]) {
          categoryMap[category] = {
            category,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            productCount: 0,
            averageMargin: 0
          };
        }

        categoryMap[category].totalRevenue += product.price;
        categoryMap[category].totalCost += product.cost;
        categoryMap[category].totalProfit += product.profit;
        categoryMap[category].productCount += 1;
      });

      // Calculate average margins
      Object.values(categoryMap).forEach(category => {
        category.averageMargin = category.totalRevenue > 0 
          ? (category.totalProfit / category.totalRevenue) * 100 
          : 0;
      });

      return Object.values(categoryMap).sort((a, b) => b.averageMargin - a.averageMargin);
    } catch (error) {
      console.error("Error getting category profit summary:", error);
      return [];
    }
  }

  async getTopProfitableProducts(limit = 10) {
    try {
      const products = await this.getProductProfitMargins();
      return products
        .filter(product => product.profit > 0)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting top profitable products:", error);
      return [];
    }
  }

  async getLowMarginProducts(threshold = 15) {
    try {
      const products = await this.getProductProfitMargins();
      return products.filter(product => product.marginPercent < threshold);
    } catch (error) {
      console.error("Error getting low margin products:", error);
      return [];
    }
  }
}

export default new ProfitMarginService();