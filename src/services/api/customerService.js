import mockData from "../mockData/customers.json";

class CustomerService {
  constructor() {
    this.customers = [...mockData];
  }

  async getAll() {
    await this.delay();
    return [...this.customers];
  }

  async getById(id) {
    await this.delay();
    const customer = this.customers.find(c => c.Id === parseInt(id));
    if (!customer) {
      throw new Error("Customer not found");
    }
    return { ...customer };
  }

  async create(customerData) {
    await this.delay();
    const newCustomer = {
      Id: this.getNextId(),
      ...customerData,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString()
    };
    this.customers.push(newCustomer);
    return { ...newCustomer };
  }

  async update(id, customerData) {
    await this.delay();
    const index = this.customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Customer not found");
    }
    
    this.customers[index] = {
      ...this.customers[index],
      ...customerData,
      Id: parseInt(id)
    };
    
    return { ...this.customers[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Customer not found");
    }
    
    this.customers.splice(index, 1);
    return true;
  }

  async updateCustomerStats(customerId, orderTotal) {
    await this.delay();
    const customer = this.customers.find(c => c.Id === parseInt(customerId));
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += orderTotal;
    }
  }

  async getTopCustomers(limit = 5) {
    await this.delay();
    return this.customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  }

  getNextId() {
    return Math.max(...this.customers.map(c => c.Id), 0) + 1;
  }

  delay(ms = 250) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new CustomerService();