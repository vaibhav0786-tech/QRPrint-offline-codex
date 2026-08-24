'use client';
import { useMemo, useState } from 'react';
import type { QrPrintSpec } from '@qrprint/shared-types';

export default function MerchantOrderPage({ params }: { params: { merchantId: string } }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const maxFiles = 5;
  const [spec, setSpec] = useState<QrPrintSpec>({ colorMode: 'bw', sidedness: 'single', paperSize: 'A4', copies: 1, pageRange: 'All' });
  const pages = 1;
  const price = useMemo(() => (spec.colorMode === 'color' ? 10 : 2) * spec.copies * pages * (spec.sidedness === 'double' ? 0.9 : 1), [spec]);
  return <main style={{padding:20,background:'#10131f',color:'#f5f7ff',minHeight:'100vh',fontFamily:'system-ui'}}>
    <h1>QRPrint</h1><p>Merchant: {params.merchantId}</p>
    <p>PDF only for MVP · Max 5 files · 25 MB each · Razorpay payment · manual merchant print</p>
    <input multiple type="file" accept="application/pdf,.pdf" onChange={e => setFiles(e.target.files)} />
    {files && files.length > maxFiles && <p style={{color:'#ffb4ab'}}>Please upload no more than {maxFiles} PDF files.</p>}
    <select value={spec.colorMode} onChange={e => setSpec({...spec, colorMode:e.target.value as any})}><option value="bw">Black & white</option><option value="color">Color</option></select>
    <select value={spec.sidedness} onChange={e => setSpec({...spec, sidedness:e.target.value as any})}><option value="single">Single-sided</option><option value="double">Double-sided</option></select>
    <select value={spec.paperSize} onChange={e => setSpec({...spec, paperSize:e.target.value as any})}><option>A4</option><option>Letter</option><option>Legal</option></select>
    <input min={1} type="number" value={spec.copies} onChange={e => setSpec({...spec, copies:Number(e.target.value)})} />
    <strong>₹{price.toFixed(2)}</strong>
    <button disabled={!files || files.length > maxFiles}>Pay with Razorpay, then submit to the merchant queue</button>
    <p>After printing: Your print is ready. Show your collection PIN at the counter.</p>
  </main>;
}
