import { getApperClient } from "@/services/apperClient";

// Mock data storage for sales order lines (since table doesn't exist in database)
let mockSalesOrderLines = [
  {
    Id: 1,
    sales_order_id: 1,
    item_id: 1,
    quantity: 2,
    unit_price: 150.00,
    tax_code_id: 1,
    line_total: 300.00,
    Name: "Sales Order Line 1",
    CreatedOn: "2024-01-15T10:00:00Z",
    ModifiedOn: "2024-01-15T10:00:00Z"
  },
  {
    Id: 2,
    sales_order_id: 1,
    item_id: 2,
    quantity: 1,
    unit_price: 500.00,
    tax_code_id: 1,
    line_total: 500.00,
    Name: "Sales Order Line 2",
    CreatedOn: "2024-01-15T11:00:00Z",
    ModifiedOn: "2024-01-15T11:00:00Z"
  },
  {
    Id: 3,
    sales_order_id: 2,
    item_id: 3,
    quantity: 3,
    unit_price: 75.00,
    tax_code_id: 1,
    line_total: 225.00,
    Name: "Sales Order Line 3",
    CreatedOn: "2024-01-16T09:00:00Z",
    ModifiedOn: "2024-01-16T09:00:00Z"
  }
];

let nextId = 4;

// Delay helper for realistic API simulation
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SalesOrderLineService {
  async getAll() {
    await delay(300);
    return [...mockSalesOrderLines];
  }

  async getById(id) {
    await delay(200);
    const line = mockSalesOrderLines.find(item => item.Id === parseInt(id));
    return line ? { ...line } : null;
  }

  async getBySalesOrderId(salesOrderId) {
    await delay(250);
    const lines = mockSalesOrderLines.filter(item => item.sales_order_id === parseInt(salesOrderId));
    return lines.map(line => ({ ...line }));
  }

  async create(lineData) {
    await delay(400);
    const newLine = {
      Id: nextId++,
      sales_order_id: parseInt(lineData.sales_order_id),
      item_id: parseInt(lineData.item_id),
      quantity: parseFloat(lineData.quantity || 1),
      unit_price: parseFloat(lineData.unit_price || 0),
      tax_code_id: parseInt(lineData.tax_code_id || 1),
      line_total: parseFloat(lineData.line_total || 0),
      Name: lineData.Name || `Sales Order Line ${nextId - 1}`,
      CreatedOn: new Date().toISOString(),
      ModifiedOn: new Date().toISOString()
    };
    
    mockSalesOrderLines.push(newLine);
    return { ...newLine };
  }

  async createMultiple(linesData) {
    await delay(500);
    const createdLines = [];
    
    for (const lineData of linesData) {
      const newLine = {
        Id: nextId++,
        sales_order_id: parseInt(lineData.sales_order_id),
        item_id: parseInt(lineData.item_id),
        quantity: parseFloat(lineData.quantity || 1),
        unit_price: parseFloat(lineData.unit_price || 0),
        tax_code_id: parseInt(lineData.tax_code_id || 1),
        line_total: parseFloat(lineData.line_total || 0),
        Name: lineData.Name || `Sales Order Line ${nextId - 1}`,
        CreatedOn: new Date().toISOString(),
        ModifiedOn: new Date().toISOString()
      };
      
      mockSalesOrderLines.push(newLine);
      createdLines.push({ ...newLine });
    }
    
    return createdLines;
  }

  async update(id, lineData) {
    await delay(350);
    const index = mockSalesOrderLines.findIndex(item => item.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Sales order line not found");
    }

    const updatedLine = {
      ...mockSalesOrderLines[index],
      sales_order_id: parseInt(lineData.sales_order_id || mockSalesOrderLines[index].sales_order_id),
      item_id: parseInt(lineData.item_id || mockSalesOrderLines[index].item_id),
      quantity: parseFloat(lineData.quantity !== undefined ? lineData.quantity : mockSalesOrderLines[index].quantity),
      unit_price: parseFloat(lineData.unit_price !== undefined ? lineData.unit_price : mockSalesOrderLines[index].unit_price),
      tax_code_id: parseInt(lineData.tax_code_id || mockSalesOrderLines[index].tax_code_id),
      line_total: parseFloat(lineData.line_total !== undefined ? lineData.line_total : mockSalesOrderLines[index].line_total),
      Name: lineData.Name || mockSalesOrderLines[index].Name,
      ModifiedOn: new Date().toISOString()
    };

    mockSalesOrderLines[index] = updatedLine;
    return { ...updatedLine };
  }

  async delete(id) {
    await delay(250);
    const index = mockSalesOrderLines.findIndex(item => item.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Sales order line not found");
    }

    mockSalesOrderLines.splice(index, 1);
    return { success: true, message: "Sales order line deleted successfully" };
  }

  async deleteBySalesOrderId(salesOrderId) {
    await delay(300);
    const originalLength = mockSalesOrderLines.length;
    mockSalesOrderLines = mockSalesOrderLines.filter(item => item.sales_order_id !== parseInt(salesOrderId));
    const deletedCount = originalLength - mockSalesOrderLines.length;
    
    return { success: true, message: `${deletedCount} sales order lines deleted successfully` };
  }

  // Helper method to calculate line total
  calculateLineTotal(quantity, unitPrice, taxRate = 0) {
    const subtotal = parseFloat(quantity) * parseFloat(unitPrice);
    const tax = subtotal * parseFloat(taxRate);
    return subtotal + tax;
  }

  // Helper method to get tax codes (mock data)
  async getTaxCodes() {
    await delay(200);
    return [
      { Id: 1, Name: "Standard Tax", Rate: 0.08 },
      { Id: 2, Name: "Reduced Tax", Rate: 0.05 },
      { Id: 3, Name: "Zero Tax", Rate: 0.0 },
      { Id: 4, Name: "Exempt", Rate: 0.0 }
    ];
  }
}

export default new SalesOrderLineService();