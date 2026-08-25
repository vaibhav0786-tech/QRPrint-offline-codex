export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorMode = 'bw' | 'color';
export type PaymentMethod = 'cash' | 'upi';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type JobStatus = 'queued' | 'spooling' | 'printing' | 'ready' | 'completed' | 'failed' | 'cancelled';

export interface MerchantProfile {
  shopName: string;
  ownerName: string;
  staffNames: string[];
  staffCount: number;
  printerCount: number;
  defaultPrinter: string;
  address: string;
  mobile: string;
  email: string;
  port: number;
  addFrontPage: boolean;
}

export interface OperationalSettings {
  paperSizes: string[];
  bwPricePerPage: number;
  colorPricePerPage: number;
  defaultCopies: number;
  enableAutoPrint: boolean;
  requireCustomerEmail: boolean;
  upiId: string;
  accentColor: string;
  theme: ThemeMode;
}

export interface PrintPreferences {
  colorMode: ColorMode;
  copies: number;
  paperSize: string;
  duplex: boolean;
  addFrontPage: boolean;
  notes: string;
}

export interface CustomerDetails {
  name: string;
  mobile: string;
  email?: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  pages: number;
  previewUrl?: string;
}

export interface PrintJob {
  id: string;
  createdAt: string;
  customer: CustomerDetails;
  files: UploadedDocument[];
  preferences: PrintPreferences;
  payment: { method: PaymentMethod; status: PaymentStatus; amount: number; reference?: string };
  status: JobStatus;
  progress: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}
