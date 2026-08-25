import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import QRCode from 'qrcode';
import type { QrPrintJob, QrPrintSpec } from '@qrprint/shared-types';
import { discoverPrinters, printAndDelete, runTestPrint } from '../printer/windowsPrinter.js';
import { MVP_LIMITS, CUSTOMER_COLLECTION_MESSAGE } from './mvpConfig.js';
import { requireLocalApiToken } from './security.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: true } });
const port = Number(process.env.QRPRINT_PORT ?? 8787);
const merchantId = process.env.QRPRINT_MERCHANT_ID ?? 'local-demo-shop';
const publicBaseUrl = process.env.QRPRINT_PUBLIC_BASE_URL ?? `http://localhost:${port}`;
const dataDir = process.env.QRPRINT_DATA_DIR ?? '.qrprint-data';
const uploadDir = path.join(dataDir, 'spool');
mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: MVP_LIMITS.maxFileSizeBytes, files: MVP_LIMITS.maxFilesPerJob },
  fileFilter: (_req, file, cb) => {
    if (MVP_LIMITS.allowedMimeTypes.includes(file.mimetype as 'application/pdf')) return cb(null, true);
    cb(new Error('QRPrint MVP accepts PDF files only.'));
  },
});
const jobs = new Map<string, QrPrintJob>();

app.use(cors({ origin: true }));
app.use(express.json());
app.use('/api', requireLocalApiToken);

app.get('/health', (_req, res) => res.json({ ok: true, merchantId, offlineCore: true, mode: 'mvp-lan-first' }));
app.get('/api/merchant/profile', async (_req, res) => {
  res.json({ merchantId, businessName: process.env.QRPRINT_BUSINESS_NAME, upiId: process.env.QRPRINT_UPI_ID, dashboardPinEnabled: Boolean(process.env.QRPRINT_DASHBOARD_PIN), customerCollectionMessage: CUSTOMER_COLLECTION_MESSAGE, printers: await discoverPrinters() });
});
app.get('/api/merchant/qr', async (_req, res) => {
  const url = `${publicBaseUrl}/m/${merchantId}`;
  res.json({ url, dataUrl: await QRCode.toDataURL(url) });
});
app.post('/api/jobs', upload.array('files'), (req, res) => {
  const files = (req.files as Express.Multer.File[]).map(file => ({ id: randomUUID(), originalName: file.originalname, mimeType: file.mimetype as any, sizeBytes: file.size, pageCount: Number(req.body.pageCount ?? 1), tempPath: file.path }));
  const spec: QrPrintSpec = JSON.parse(req.body.spec);
  const job: QrPrintJob = { id: `QP-${Date.now()}`, merchantId, customerName: req.body.customerName, customerPhone: req.body.customerPhone, files, spec, amountPaise: Number(req.body.amountPaise), status: 'pending_payment', paymentProvider: req.body.paymentProvider ?? 'razorpay', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  jobs.set(job.id, job);
  io.emit('job:update', job);
  res.status(201).json(job);
});
app.post('/api/jobs/:id/payment-confirmed', async (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  job.status = 'payment_successful'; job.paymentReference = req.body.paymentReference; job.updatedAt = new Date().toISOString(); io.emit('job:update', job);
  if (process.env.QRPRINT_AUTO_PRINT === 'true') await printAndDelete(job, process.env.QRPRINT_DEFAULT_PRINTER);
  job.status = process.env.QRPRINT_AUTO_PRINT === 'true' ? 'completed' : 'queued_for_printing'; job.updatedAt = new Date().toISOString(); io.emit('job:update', job);
  res.json(job);
});
app.post('/api/printers/test-print', async (req, res) => {
  await runTestPrint(req.body?.printerName);
  res.json({ ok: true });
});

app.post('/api/jobs/:id/print', async (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'queued_for_printing' && job.status !== 'payment_successful') {
    return res.status(409).json({ error: `Job cannot be printed from status ${job.status}` });
  }
  job.status = 'printing'; job.updatedAt = new Date().toISOString(); io.emit('job:update', job);
  try {
    await printAndDelete(job, req.body?.printerName ?? process.env.QRPRINT_DEFAULT_PRINTER);
    job.status = 'completed'; job.updatedAt = new Date().toISOString(); io.emit('job:update', job);
    res.json(job);
  } catch (error) {
    job.status = 'failed'; job.updatedAt = new Date().toISOString(); io.emit('job:update', job);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Print failed' });
  }
});

app.get('/api/jobs', (_req, res) => res.json([...jobs.values()]));

httpServer.listen(port, () => console.log(`QRPrint merchant server running at ${publicBaseUrl}`));
