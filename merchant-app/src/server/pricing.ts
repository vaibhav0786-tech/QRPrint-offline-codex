import type { QrPrintSpec } from '@qrprint/shared-types';
export function calculatePricePaise(spec: QrPrintSpec, pages: number) {
  const pageRate = spec.colorMode === 'color' ? 1000 : 200;
  const duplexDiscount = spec.sidedness === 'double' ? 0.9 : 1;
  return Math.ceil(pageRate * pages * spec.copies * duplexDiscount);
}
