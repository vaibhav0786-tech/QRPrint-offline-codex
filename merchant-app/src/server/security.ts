import type { Request, Response, NextFunction } from 'express';

export function requireLocalApiToken(req: Request, res: Response, next: NextFunction) {
  const configuredToken = process.env.QRPRINT_LOCAL_API_TOKEN;
  if (!configuredToken) return next();

  const providedToken = req.header('x-qrprint-token');
  if (providedToken !== configuredToken) {
    return res.status(401).json({ error: 'Invalid QRPrint local API token' });
  }

  next();
}
