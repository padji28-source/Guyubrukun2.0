import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Terlalu banyak permintaan dari IP ini, silakan coba lagi beberapa saat lagi."
    },
    data: []
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Terlalu banyak percobaan pendaftaran akun. Silakan coba lagi setelah 1 jam."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

// Brute-force protection by IP + Username
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function checkBruteForce(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const username = String(req.body?.username || '').trim().toLowerCase();
  const key = `${ip}_${username}`;

  const record = failedAttempts.get(key);
  if (record && record.lockedUntil > Date.now()) {
    const minutesLeft = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return res.status(429).json({
      error: {
        code: "ACCOUNT_TEMPORARILY_LOCKED",
        message: `Akun ini terkunci sementara karena terlalu banyak percobaan gagal. Silakan coba lagi dalam ${minutesLeft} menit.`
      }
    });
  }

  next();
}

export function recordFailedLogin(req: Request) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const username = String(req.body?.username || '').trim().toLowerCase();
  const key = `${ip}_${username}`;

  const record = failedAttempts.get(key) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min lock
  }
  failedAttempts.set(key, record);
}

export function clearFailedLogin(req: Request) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const username = String(req.body?.username || '').trim().toLowerCase();
  const key = `${ip}_${username}`;
  failedAttempts.delete(key);
}
