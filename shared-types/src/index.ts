export type QrPrintJobStatus =
  | 'pending_payment'
  | 'payment_successful'
  | 'payment_unsuccessful'
  | 'queued_for_printing'
  | 'printing'
  | 'completed'
  | 'failed'
  | 'deleted';

export type QrPrintColorMode = 'bw' | 'color';
export type QrPrintSidedness = 'single' | 'double';
export type QrPrintPaperSize = 'A4' | 'Letter' | 'Legal';

export interface QrPrintFileMeta {
  id: string;
  originalName: string;
  mimeType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'image/jpeg' | 'image/png';
  sizeBytes: number;
  pageCount: number;
  tempPath?: string;
  deletedAt?: string;
}

export interface QrPrintSpec {
  colorMode: QrPrintColorMode;
  sidedness: QrPrintSidedness;
  paperSize: QrPrintPaperSize;
  copies: number;
  pageRange: string;
}

export interface QrPrintJob {
  id: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  files: QrPrintFileMeta[];
  spec: QrPrintSpec;
  amountPaise: number;
  status: QrPrintJobStatus;
  paymentProvider: 'razorpay' | 'upi_qr';
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}
