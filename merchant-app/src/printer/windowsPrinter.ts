import { mkdtemp, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
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

export async function runTestPrint(printerName?: string) {
  const dir = await mkdtemp(path.join(tmpdir(), 'qrprint-test-'));
  const testFile = path.join(dir, 'qrprint-test.txt');
  await writeFile(testFile, `QRPrint test print\n${new Date().toISOString()}\n`, 'utf8');
  // Real Windows text printing will be implemented in the Electron shell; this endpoint proves dashboard-to-backend wiring.
  return { printerName, testFile };
}
