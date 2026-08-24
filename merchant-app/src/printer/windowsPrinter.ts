import { unlink } from 'node:fs/promises';
import type { QrPrintJob } from '@qrprint/shared-types';

export async function discoverPrinters() {
  try {
    const printer = await import('pdf-to-printer');
    return await printer.getPrinters();
  } catch {
    return [{ name: 'Demo Printer', isDefault: true, status: 'offline-demo' }];
  }
}

export async function printAndDelete(job: QrPrintJob, printerName?: string) {
  const printer = await import('pdf-to-printer');
  for (const file of job.files) {
    if (!file.tempPath) continue;
    if (file.mimeType === 'application/pdf') {
      await printer.print(file.tempPath, { printer: printerName, copies: job.spec.copies });
    }
    if (process.env.QRPRINT_DELETE_AFTER_PRINT !== 'false') {
      await unlink(file.tempPath);
      file.deletedAt = new Date().toISOString();
    }
  }
}
