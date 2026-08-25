import { AuditLogEntry, MerchantProfile, OperationalSettings, PrintJob } from '../types';

export const defaultMerchantProfile: MerchantProfile = {
  shopName: 'QRPrint Express',
  ownerName: 'Demo Owner',
  staffNames: ['Counter Staff'],
  staffCount: 1,
  printerCount: 2,
  defaultPrinter: 'Front Desk LaserJet',
  address: 'Main Market Road',
  mobile: '+1 555 0100',
  email: 'owner@example.com',
  port: 3000,
  addFrontPage: true,
};

export const defaultSettings: OperationalSettings = {
  paperSizes: ['A4', 'A3', 'Letter', 'Legal'],
  bwPricePerPage: 2,
  colorPricePerPage: 10,
  defaultCopies: 1,
  enableAutoPrint: false,
  requireCustomerEmail: false,
  upiId: 'merchant@upi',
  accentColor: '#6366f1',
  theme: 'auto',
};

export const demoJobs: PrintJob[] = [
  {
    id: 'QP-1042',
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    customer: { name: 'Aarav Mehta', mobile: '+91 98765 43210', email: 'aarav@example.com' },
    files: [{ id: 'f1', name: 'visa-application.pdf', sizeBytes: 845210, type: 'application/pdf', pages: 6 }],
    preferences: { colorMode: 'bw', copies: 2, paperSize: 'A4', duplex: true, addFrontPage: true, notes: 'Staple if possible' },
    payment: { method: 'upi', status: 'paid', amount: 24, reference: 'UPI-DEMO-1042' },
    status: 'printing',
    progress: 62,
  },
  {
    id: 'QP-1043',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    customer: { name: 'Maya Shah', mobile: '+91 90000 11111' },
    files: [{ id: 'f2', name: 'school-project.png', sizeBytes: 405210, type: 'image/png', pages: 1 }],
    preferences: { colorMode: 'color', copies: 1, paperSize: 'A4', duplex: false, addFrontPage: false, notes: '' },
    payment: { method: 'cash', status: 'pending', amount: 10 },
    status: 'queued',
    progress: 0,
  },
];

export const defaultLogs: AuditLogEntry[] = [
  { id: 'log-1', timestamp: new Date().toISOString(), level: 'info', message: 'Local QRPrint daemon initialized with SQLite WAL mode.' },
];
