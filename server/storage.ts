import { 
  type User, 
  type Dataset, 
  type DatasetRequest, 
  type Proposal, 
  type Purchase, 
  type Message,
  type InsertUser, 
  type InsertDataset, 
  type InsertDatasetRequest, 
  type InsertProposal, 
  type InsertPurchase, 
  type InsertMessage 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserOtp(email: string, otpCode: string, otpExpires: Date): Promise<User | undefined>;
  verifyOtp(email: string, otpCode: string): Promise<User | undefined>;

  // Dataset methods
  getDataset(id: string): Promise<Dataset | undefined>;
  getDatasets(filters?: { category?: string; format?: string; search?: string }): Promise<Dataset[]>;
  getDatasetsBySeller(sellerId: string): Promise<Dataset[]>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset | undefined>;
  deleteDataset(id: string): Promise<boolean>;

  // Dataset Request methods
  getDatasetRequest(id: string): Promise<DatasetRequest | undefined>;
  getDatasetRequests(filters?: { category?: string; status?: string }): Promise<DatasetRequest[]>;
  getDatasetRequestsByBuyer(buyerId: string): Promise<DatasetRequest[]>;
  createDatasetRequest(request: InsertDatasetRequest): Promise<DatasetRequest>;
  updateDatasetRequest(id: string, updates: Partial<DatasetRequest>): Promise<DatasetRequest | undefined>;

  // Proposal methods
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalsByRequest(requestId: string): Promise<Proposal[]>;
  getProposalsBySeller(sellerId: string): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal | undefined>;

  // Purchase methods
  getPurchase(id: string): Promise<Purchase | undefined>;
  getPurchasesByBuyer(buyerId: string): Promise<Purchase[]>;
  getPurchasesByDataset(datasetId: string): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: string, updates: Partial<Purchase>): Promise<Purchase | undefined>;
  hasPurchased(buyerId: string, datasetId: string): Promise<boolean>;

  // Message methods
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]>;
  getConversations(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private datasets: Map<string, Dataset> = new Map();
  private datasetRequests: Map<string, DatasetRequest> = new Map();
  private proposals: Map<string, Proposal> = new Map();
  private purchases: Map<string, Purchase> = new Map();
  private messages: Map<string, Message> = new Map();

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role as "buyer" | "seller",
      rating: "0",
      totalDatasets: 0,
      totalPurchases: 0,
      totalEarnings: "0",
      isVerified: false,
      otpCode: null,
      otpExpires: null,
      stripeCustomerId: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserOtp(email: string, otpCode: string, otpExpires: Date): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) return undefined;

    const updatedUser = { ...user, otpCode, otpExpires, updatedAt: new Date() };
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }

  async verifyOtp(email: string, otpCode: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user || !user.otpCode || !user.otpExpires) return undefined;
    if (user.otpCode !== otpCode || user.otpExpires < new Date()) return undefined;

    const updatedUser = { 
      ...user, 
      otpCode: null, 
      otpExpires: null, 
      isVerified: true,
      updatedAt: new Date() 
    };
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }

  // Dataset methods
  async getDataset(id: string): Promise<Dataset | undefined> {
    return this.datasets.get(id);
  }

  async getDatasets(filters?: { category?: string; format?: string; search?: string }): Promise<Dataset[]> {
    let datasets = Array.from(this.datasets.values()).filter(d => d.isAvailable);
    
    if (filters?.category && filters.category !== 'All Categories') {
      datasets = datasets.filter(d => d.category === filters.category);
    }
    if (filters?.format) {
      datasets = datasets.filter(d => d.format === filters.format);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      datasets = datasets.filter(d => 
        d.title.toLowerCase().includes(search) || 
        d.description.toLowerCase().includes(search) ||
        d.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    return datasets.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getDatasetsBySeller(sellerId: string): Promise<Dataset[]> {
    return Array.from(this.datasets.values())
      .filter(d => d.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const id = randomUUID();
    const now = new Date();
    const dataset: Dataset = {
      ...insertDataset,
      id,
      downloads: 0,
      isAvailable: true,
      createdAt: now,
      updatedAt: now,
    };
    this.datasets.set(id, dataset);
    
    // Update seller's dataset count
    const seller = this.users.get(insertDataset.sellerId);
    if (seller) {
      await this.updateUser(seller.id, { totalDatasets: seller.totalDatasets + 1 });
    }
    
    return dataset;
  }

  async updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset | undefined> {
    const dataset = this.datasets.get(id);
    if (!dataset) return undefined;

    const updatedDataset = { ...dataset, ...updates, updatedAt: new Date() };
    this.datasets.set(id, updatedDataset);
    return updatedDataset;
  }

  async deleteDataset(id: string): Promise<boolean> {
    return this.datasets.delete(id);
  }

  // Dataset Request methods
  async getDatasetRequest(id: string): Promise<DatasetRequest | undefined> {
    return this.datasetRequests.get(id);
  }

  async getDatasetRequests(filters?: { category?: string; status?: string }): Promise<DatasetRequest[]> {
    let requests = Array.from(this.datasetRequests.values());
    
    if (filters?.category && filters.category !== 'All Categories') {
      requests = requests.filter(r => r.category === filters.category);
    }
    if (filters?.status) {
      requests = requests.filter(r => r.status === filters.status);
    }
    
    return requests.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getDatasetRequestsByBuyer(buyerId: string): Promise<DatasetRequest[]> {
    return Array.from(this.datasetRequests.values())
      .filter(r => r.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createDatasetRequest(insertRequest: InsertDatasetRequest): Promise<DatasetRequest> {
    const id = randomUUID();
    const now = new Date();
    const request: DatasetRequest = {
      ...insertRequest,
      id,
      status: "open",
      acceptedProposalId: null,
      createdAt: now,
      updatedAt: now,
    };
    this.datasetRequests.set(id, request);
    return request;
  }

  async updateDatasetRequest(id: string, updates: Partial<DatasetRequest>): Promise<DatasetRequest | undefined> {
    const request = this.datasetRequests.get(id);
    if (!request) return undefined;

    const updatedRequest = { ...request, ...updates, updatedAt: new Date() };
    this.datasetRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Proposal methods
  async getProposal(id: string): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async getProposalsByRequest(requestId: string): Promise<Proposal[]> {
    return Array.from(this.proposals.values())
      .filter(p => p.requestId === requestId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getProposalsBySeller(sellerId: string): Promise<Proposal[]> {
    return Array.from(this.proposals.values())
      .filter(p => p.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = randomUUID();
    const now = new Date();
    const proposal: Proposal = {
      ...insertProposal,
      id,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.proposals.set(id, proposal);
    return proposal;
  }

  async updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal | undefined> {
    const proposal = this.proposals.get(id);
    if (!proposal) return undefined;

    const updatedProposal = { ...proposal, ...updates, updatedAt: new Date() };
    this.proposals.set(id, updatedProposal);
    return updatedProposal;
  }

  // Purchase methods
  async getPurchase(id: string): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async getPurchasesByBuyer(buyerId: string): Promise<Purchase[]> {
    return Array.from(this.purchases.values())
      .filter(p => p.buyerId === buyerId)
      .sort((a, b) => new Date(b.purchasedAt!).getTime() - new Date(a.purchasedAt!).getTime());
  }

  async getPurchasesByDataset(datasetId: string): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter(p => p.datasetId === datasetId);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = randomUUID();
    const now = new Date();
    const purchase: Purchase = {
      ...insertPurchase,
      id,
      status: "pending",
      purchasedAt: now,
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async updatePurchase(id: string, updates: Partial<Purchase>): Promise<Purchase | undefined> {
    const purchase = this.purchases.get(id);
    if (!purchase) return undefined;

    const updatedPurchase = { ...purchase, ...updates };
    this.purchases.set(id, updatedPurchase);
    return updatedPurchase;
  }

  async hasPurchased(buyerId: string, datasetId: string): Promise<boolean> {
    return Array.from(this.purchases.values()).some(
      p => p.buyerId === buyerId && p.datasetId === datasetId && p.status === "completed"
    );
  }

  // Message methods
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => 
        (m.senderId === user1Id && m.receiverId === user2Id) ||
        (m.senderId === user2Id && m.receiverId === user1Id)
      )
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async getConversations(userId: string): Promise<Message[]> {
    const userMessages = Array.from(this.messages.values())
      .filter(m => m.senderId === userId || m.receiverId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    // Get the latest message for each conversation
    const conversations = new Map<string, Message>();
    userMessages.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, message);
      }
    });

    return Array.from(conversations.values());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      isRead: false,
      createdAt: now,
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export const storage = new MemStorage();
