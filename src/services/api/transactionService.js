import mockData from "../mockData/transactions.json";

class TransactionService {
  constructor() {
    this.transactions = [...mockData];
  }

  async getAll() {
    await this.delay();
    return [...this.transactions];
  }

  async getById(id) {
    await this.delay();
    const transaction = this.transactions.find(t => t.Id === parseInt(id));
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { ...transaction };
  }

  async create(transactionData) {
    await this.delay();
    const newTransaction = {
      Id: this.getNextId(),
      ...transactionData,
      date: new Date().toISOString(),
      relatedOrderId: transactionData.relatedOrderId || null
    };
    this.transactions.push(newTransaction);
    return { ...newTransaction };
  }

  async update(id, transactionData) {
    await this.delay();
    const index = this.transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    this.transactions[index] = {
      ...this.transactions[index],
      ...transactionData,
      Id: parseInt(id)
    };
    
    return { ...this.transactions[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    this.transactions.splice(index, 1);
    return true;
  }

  async getByType(type) {
    await this.delay();
    return this.transactions.filter(t => t.type.toLowerCase() === type.toLowerCase());
  }

  async getByDateRange(startDate, endDate) {
    await this.delay();
    return this.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
    });
  }

  async getSummary() {
    await this.delay();
    const income = this.transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = this.transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses
    };
  }

  async getRecentTransactions(limit = 10) {
    await this.delay();
    return this.transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }

  getNextId() {
    return Math.max(...this.transactions.map(t => t.Id), 0) + 1;
  }

  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new TransactionService();