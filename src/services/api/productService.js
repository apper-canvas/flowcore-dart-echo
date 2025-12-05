import mockData from "../mockData/products.json";

class ProductService {
  constructor() {
    this.products = [...mockData];
  }

  async getAll() {
    await this.delay();
    return [...this.products];
  }

  async getById(id) {
    await this.delay();
    const product = this.products.find(p => p.Id === parseInt(id));
    if (!product) {
      throw new Error("Product not found");
    }
    return { ...product };
  }

  async create(productData) {
    await this.delay();
    const newProduct = {
      Id: this.getNextId(),
      ...productData,
      createdAt: new Date().toISOString()
    };
    this.products.push(newProduct);
    return { ...newProduct };
  }

  async update(id, productData) {
    await this.delay();
    const index = this.products.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Product not found");
    }
    
    this.products[index] = {
      ...this.products[index],
      ...productData,
      Id: parseInt(id)
    };
    
    return { ...this.products[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.products.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Product not found");
    }
    
    this.products.splice(index, 1);
    return true;
  }

  async getLowStockProducts() {
    await this.delay();
    return this.products.filter(p => p.stockLevel <= p.reorderPoint);
  }

  async getByCategory(category) {
    await this.delay();
    return this.products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  getNextId() {
    return Math.max(...this.products.map(p => p.Id), 0) + 1;
  }

  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new ProductService();