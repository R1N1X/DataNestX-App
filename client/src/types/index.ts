export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller';
  avatarUrl?: string;
  rating?: number;
  totalDatasets?: number;
  totalPurchases?: number;
  totalEarnings?: number;
  isVerified?: boolean;
}

export interface Dataset {
  id: string;
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  format: string;
  dataType: string;
  license: string;
  sellerId: string;
  seller?: User;
  fileName: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  downloads: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetRequest {
  id: string;
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  status: 'open' | 'in_progress' | 'fulfilled' | 'cancelled';
  buyerId: string;
  buyer?: User;
  acceptedProposalId?: string;
  proposals?: Proposal[];
  proposalCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  _id: string;
  requestId: string;
  request?: DatasetRequest;
  sellerId: string;
  seller?: User;
  price: number;
  deliveryTime: number;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  _id: string;
  buyerId: string;
  buyer?: User;
  datasetId: string;
  dataset?: Dataset;
  amount: number;
  stripePaymentIntentId?: string;
  status: 'pending' | 'completed' | 'failed';
  purchasedAt: string;
}

export interface Message {
  id: string;
  _id: string;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  otherUser?: User;
  content: string;
  datasetId?: string;
  requestId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FileUpload {
  filename: string;
  mimetype: string;
  path: string;
  size: number;
}
