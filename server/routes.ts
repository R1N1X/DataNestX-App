import type { Express, Request } from "express";
import { createServer, type Server } from "http";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertDatasetSchema, 
  insertDatasetRequestSchema, 
  insertProposalSchema,
  insertMessageSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Stripe from "stripe";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY not found. Payment functionality will be disabled.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
}) : null;

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Create uploads directory
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    // Allow various file types for datasets
    const allowedTypes = [
      'text/csv',
      'application/json',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/xml',
      'application/zip',
      'image/jpeg',
      'image/png',
      'audio/wav',
      'audio/mpeg',
      'video/mp4'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a valid dataset file.'));
    }
  }
});

// Email transporter setup (using Gmail as example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Generate OTP
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Send OTP email
async function sendOTPEmail(email: string, otpCode: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'DataNestX - Your Login OTP',
      html: `
        <h2>Your DataNestX Login Code</h2>
        <p>Your 6-digit verification code is:</p>
        <h1 style="color: #14b8a6; font-size: 2em; letter-spacing: 0.5em;">${otpCode}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `
    });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}

// Middleware for authentication
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      // Generate and send OTP
      const otpCode = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await storage.updateUserOtp(user.email, otpCode, otpExpires);
      await sendOTPEmail(user.email, otpCode);

      res.json({ 
        message: "Registration successful. Please check your email for OTP verification.",
        email: user.email 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate and send OTP
      const otpCode = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await storage.updateUserOtp(user.email, otpCode, otpExpires);
      await sendOTPEmail(user.email, otpCode);

      res.json({ 
        message: "OTP sent to your email. Please verify to complete login.",
        email: user.email 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otpCode } = req.body;

      const user = await storage.verifyOtp(email, otpCode);
      if (!user) {
        return res.status(401).json({ error: "Invalid or expired OTP" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          rating: user.rating,
          totalDatasets: user.totalDatasets,
          totalPurchases: user.totalPurchases,
          totalEarnings: user.totalEarnings
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const otpCode = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      
      await storage.updateUserOtp(user.email, otpCode, otpExpires);
      await sendOTPEmail(user.email, otpCode);

      res.json({ message: "OTP resent successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Dataset routes
  app.get("/api/datasets", async (req, res) => {
    try {
      const { category, format, search } = req.query;
      const datasets = await storage.getDatasets({
        category: category as string,
        format: format as string,
        search: search as string
      });

      // Populate seller information
      const datasetsWithSellers = await Promise.all(
        datasets.map(async (dataset) => {
          const seller = await storage.getUser(dataset.sellerId);
          return {
            ...dataset,
            seller: seller ? {
              id: seller.id,
              name: seller.name,
              email: seller.email,
              role: seller.role,
              avatarUrl: seller.avatarUrl,
              rating: seller.rating,
              totalDatasets: seller.totalDatasets
            } : null
          };
        })
      );

      res.json(datasetsWithSellers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/datasets/:id", async (req, res) => {
    try {
      const dataset = await storage.getDataset(req.params.id);
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }

      const seller = await storage.getUser(dataset.sellerId);
      
      res.json({
        ...dataset,
        seller: seller ? {
          id: seller.id,
          name: seller.name,
          email: seller.email,
          role: seller.role,
          avatarUrl: seller.avatarUrl,
          rating: seller.rating,
          totalDatasets: seller.totalDatasets
        } : null
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/datasets", authenticateToken, upload.single('dataset'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Dataset file is required" });
      }

      const datasetData = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        tags: JSON.parse(req.body.tags || '[]'),
        format: req.body.format,
        dataType: req.body.dataType,
        license: req.body.license,
        sellerId: req.user.id,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        filePath: req.file.path,
        mimeType: req.file.mimetype
      };

      const validatedData = insertDatasetSchema.parse(datasetData);
      const dataset = await storage.createDataset(validatedData);

      res.json(dataset);
    } catch (error: any) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/datasets/download/:id", authenticateToken, async (req, res) => {
    try {
      const dataset = await storage.getDataset(req.params.id);
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }

      // Check if user owns the dataset or has purchased it
      const isOwner = dataset.sellerId === req.user.id;
      const hasPurchased = await storage.hasPurchased(req.user.id, dataset.id);

      if (!isOwner && !hasPurchased) {
        return res.status(403).json({ error: "Access denied. Purchase required." });
      }

      // Check if file exists
      if (!fs.existsSync(dataset.filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      // Increment download count
      await storage.updateDataset(dataset.id, { 
        downloads: dataset.downloads + 1 
      });

      // Send file
      res.setHeader('Content-Disposition', `attachment; filename="${dataset.fileName}"`);
      res.setHeader('Content-Type', dataset.mimeType);
      
      const fileStream = fs.createReadStream(dataset.filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dataset Request routes
  app.get("/api/requests", async (req, res) => {
    try {
      const { category, status } = req.query;
      const requests = await storage.getDatasetRequests({
        category: category as string,
        status: status as string
      });

      // Populate buyer information and proposal counts
      const requestsWithDetails = await Promise.all(
        requests.map(async (request) => {
          const buyer = await storage.getUser(request.buyerId);
          const proposals = await storage.getProposalsByRequest(request.id);
          
          return {
            ...request,
            buyer: buyer ? {
              id: buyer.id,
              name: buyer.name,
              email: buyer.email,
              role: buyer.role,
              avatarUrl: buyer.avatarUrl,
              rating: buyer.rating
            } : null,
            proposalCount: proposals.length
          };
        })
      );

      res.json(requestsWithDetails);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/requests/:id", async (req, res) => {
    try {
      const request = await storage.getDatasetRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      const buyer = await storage.getUser(request.buyerId);
      const proposals = await storage.getProposalsByRequest(request.id);

      // Populate proposal details with seller information
      const proposalsWithSellers = await Promise.all(
        proposals.map(async (proposal) => {
          const seller = await storage.getUser(proposal.sellerId);
          return {
            ...proposal,
            seller: seller ? {
              id: seller.id,
              name: seller.name,
              email: seller.email,
              role: seller.role,
              avatarUrl: seller.avatarUrl,
              rating: seller.rating,
              totalDatasets: seller.totalDatasets
            } : null
          };
        })
      );

      res.json({
        ...request,
        buyer: buyer ? {
          id: buyer.id,
          name: buyer.name,
          email: buyer.email,
          role: buyer.role,
          avatarUrl: buyer.avatarUrl,
          rating: buyer.rating
        } : null,
        proposals: proposalsWithSellers
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/requests", authenticateToken, async (req, res) => {
    try {
      const requestData = {
        ...req.body,
        buyerId: req.user.id,
        deadline: new Date(req.body.deadline)
      };

      const validatedData = insertDatasetRequestSchema.parse(requestData);
      const request = await storage.createDatasetRequest(validatedData);

      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Proposal routes
  app.post("/api/proposals", authenticateToken, async (req, res) => {
    try {
      const proposalData = {
        ...req.body,
        sellerId: req.user.id
      };

      const validatedData = insertProposalSchema.parse(proposalData);
      const proposal = await storage.createProposal(validatedData);

      res.json(proposal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/proposals/:id/accept", authenticateToken, async (req, res) => {
    try {
      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }

      const request = await storage.getDatasetRequest(proposal.requestId);
      if (!request || request.buyerId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update proposal status
      await storage.updateProposal(proposal.id, { status: "accepted" });
      
      // Update request status
      await storage.updateDatasetRequest(request.id, { 
        status: "in_progress",
        acceptedProposalId: proposal.id
      });

      res.json({ message: "Proposal accepted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Purchase and Payment routes
  app.post("/api/create-payment-intent", authenticateToken, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Payment processing not available" });
      }

      const { datasetId } = req.body;
      
      const dataset = await storage.getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }

      // Check if user already purchased
      const alreadyPurchased = await storage.hasPurchased(req.user.id, datasetId);
      if (alreadyPurchased) {
        return res.status(400).json({ error: "Dataset already purchased" });
      }

      const amount = Math.round(parseFloat(dataset.price) * 100); // Convert to cents

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          datasetId,
          buyerId: req.user.id,
          sellerId: dataset.sellerId
        }
      });

      // Create pending purchase record
      await storage.createPurchase({
        buyerId: req.user.id,
        datasetId,
        amount: dataset.price,
        stripePaymentIntentId: paymentIntent.id
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: parseFloat(dataset.price)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/confirm-payment", authenticateToken, async (req, res) => {
    try {
      const { paymentIntentId } = req.body;

      // Find purchase by payment intent ID
      const purchases = await storage.getPurchasesByBuyer(req.user.id);
      const purchase = purchases.find(p => p.stripePaymentIntentId === paymentIntentId);

      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }

      // Update purchase status
      await storage.updatePurchase(purchase.id, { status: "completed" });

      // Update buyer's purchase count
      await storage.updateUser(req.user.id, { 
        totalPurchases: req.user.totalPurchases + 1 
      });

      // Update seller's earnings
      const dataset = await storage.getDataset(purchase.datasetId);
      if (dataset) {
        const seller = await storage.getUser(dataset.sellerId);
        if (seller) {
          const newEarnings = parseFloat(seller.totalEarnings) + parseFloat(purchase.amount);
          await storage.updateUser(seller.id, { 
            totalEarnings: newEarnings.toString() 
          });
        }
      }

      res.json({ message: "Payment confirmed successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User dashboard routes
  app.get("/api/user/purchases", authenticateToken, async (req, res) => {
    try {
      const purchases = await storage.getPurchasesByBuyer(req.user.id);
      
      const purchasesWithDatasets = await Promise.all(
        purchases.map(async (purchase) => {
          const dataset = await storage.getDataset(purchase.datasetId);
          return {
            ...purchase,
            dataset
          };
        })
      );

      res.json(purchasesWithDatasets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/user/datasets", authenticateToken, async (req, res) => {
    try {
      const datasets = await storage.getDatasetsBySeller(req.user.id);
      res.json(datasets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/user/requests", authenticateToken, async (req, res) => {
    try {
      const requests = await storage.getDatasetRequestsByBuyer(req.user.id);
      
      const requestsWithProposals = await Promise.all(
        requests.map(async (request) => {
          const proposals = await storage.getProposalsByRequest(request.id);
          return {
            ...request,
            proposalCount: proposals.length
          };
        })
      );

      res.json(requestsWithProposals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/user/proposals", authenticateToken, async (req, res) => {
    try {
      const proposals = await storage.getProposalsBySeller(req.user.id);
      
      const proposalsWithRequests = await Promise.all(
        proposals.map(async (proposal) => {
          const request = await storage.getDatasetRequest(proposal.requestId);
          return {
            ...proposal,
            request
          };
        })
      );

      res.json(proposalsWithRequests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Message routes
  app.get("/api/messages/conversations", authenticateToken, async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.user.id);
      
      const conversationsWithUsers = await Promise.all(
        conversations.map(async (message) => {
          const otherUserId = message.senderId === req.user.id ? message.receiverId : message.senderId;
          const otherUser = await storage.getUser(otherUserId);
          
          return {
            ...message,
            otherUser: otherUser ? {
              id: otherUser.id,
              name: otherUser.name,
              email: otherUser.email,
              role: otherUser.role,
              avatarUrl: otherUser.avatarUrl
            } : null
          };
        })
      );

      res.json(conversationsWithUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/messages/:otherUserId", authenticateToken, async (req, res) => {
    try {
      const messages = await storage.getMessagesBetweenUsers(req.user.id, req.params.otherUserId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/messages", authenticateToken, async (req, res) => {
    try {
      const messageData = {
        ...req.body,
        senderId: req.user.id
      };

      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);

      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
