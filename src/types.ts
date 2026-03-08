import { Type } from "@google/genai";

export interface User {
  id: string;
  name: string;
  email: string;
  averageSpendBaseline: number;
  lastKnownLocation: {
    lat: number;
    lng: number;
    timestamp: number;
  };
  kycStatus: "verified" | "pending" | "failed";
  hasCompletedOnboarding: boolean;
  balance: number;
}

export interface Contact {
  id: string;
  name: string;
  upiId: string;
  avatar: string;
  lastTransaction?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  recipientName: string;
  amount: number;
  timestamp: number;
  type: 'UPI' | 'CREDIT_CARD' | 'RECHARGE' | 'TRANSFER';
  status: 'SAFE' | 'FLAGGED' | 'BLOCKED';
  riskScore: number;
  reasonCodes?: string;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  userId: string;
  riskScore: number;
  reasonCodes: string[];
  timestamp: number;
}
