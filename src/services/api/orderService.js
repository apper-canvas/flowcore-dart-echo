import mockData from "../mockData/orders.json";

class OrderService {
  constructor() {
    this.orders = [...mockData];
  }

  async getAll() {
    await this.delay();
    return [...this.orders];
  }

  async getById(id) {
    await this.delay();
    const order = this.orders.find(o => o.Id === parseInt(id));
    if (!order) {
      throw new Error("Order not found");
    }
    return { ...order };
  }

  async create(orderData) {
    await this.delay();
    const newOrder = {
      Id: this.getNextId(),
      orderNumber: this.generateOrderNumber(),
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.orders.push(newOrder);
    return { ...newOrder };
  }

  async update(id, orderData) {
    await this.delay();
    const index = this.orders.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Order not found");
    }
    
    this.orders[index] = {
      ...this.orders[index],
      ...orderData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.orders[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.orders.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Order not found");
    }
    
    this.orders.splice(index, 1);
    return true;
  }

  async getByStatus(status) {
    await this.delay();
    return this.orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }

  async getByCustomerId(customerId) {
    await this.delay();
    return this.orders.filter(o => o.customerId === parseInt(customerId));
  }

  async getRecentOrders(limit = 10) {
    await this.delay();
    return this.orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  getNextId() {
    return Math.max(...this.orders.map(o => o.Id), 0) + 1;
  }

  generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-6);
    return `ORD-${timestamp}`;
  }

  delay(ms = 350) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new OrderService();