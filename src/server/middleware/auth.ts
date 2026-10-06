import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AuditLogModel, NotificationModel } from "../db";

const rawSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === "production" && (!rawSecret || rawSecret.length < 16)) {
  console.error("FATAL: JWT_SECRET must be set and at least 16 characters in production.");
}

export const JWT_SECRET = rawSecret || "guyubrukun_jwt_secret_dev_2026_secure_key";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh_token_secret`;

export const clients = new Set<Response>();

export function broadcastEvent(event: string, data?: any) {
  for (const client of clients) {
    try {
      client.write(`event: ${event}\ndata: ${JSON.stringify(data || {})}\n\n`);
    } catch {
      clients.delete(client);
    }
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(input: string, stored: string): boolean {
  if (stored && stored.startsWith('$2') && stored.length >= 50) {
    return bcrypt.compareSync(input, stored);
  }
  return input === stored;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: 'admin' | 'warga' | 'bendahara' | 'sekretaris' | 'pengurus' | 'developer';
  nama: string;
  rtId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const pathName = req.path;
  if (!pathName.startsWith("/api/")) {
    return next();
  }

  const publicRoutes = [
    "/api/login",
    "/api/register",
    "/api/refresh-token",
    "/api/health",
    "/api/public/rt-list",
  ];

  if (publicRoutes.includes(pathName) || pathName.startsWith("/api/tangerang-logo-proxy") || pathName.startsWith("/api/stream")) {
    return next();
  }

  const authHeader = req.headers.authorization;
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    return res.status(401).json({
      error: {
        code: "AUTH_REQUIRED",
        message: "Autentikasi diperlukan. Silakan login terlebih dahulu."
      }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    // Set headers for compatibility with internal routes
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-nama'] = decoded.nama;
    req.headers['x-rt-id'] = decoded.rtId;
    next();
  } catch (err: any) {
    const isExpired = err?.name === "TokenExpiredError";
    return res.status(401).json({
      error: {
        code: isExpired ? "AUTH_EXPIRED" : "AUTH_INVALID",
        message: isExpired ? "Sesi telah berakhir. Silakan refresh token atau login kembali." : "Token tidak valid."
      }
    });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: { code: "AUTH_REQUIRED", message: "Autentikasi diperlukan." }
      });
    }

    if (user.role === 'developer' || allowedRoles.includes(user.role)) {
      return next();
    }

    return res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: `Akses ditolak: role '${user.role}' tidak memiliki izin untuk tindakan ini.`
      }
    });
  };
}

export function getScopedRtId(req: Request): string {
  if (req.user?.role === 'developer') {
    return (req.headers['x-rt-id'] as string) || req.user?.rtId || 'rt01';
  }
  return req.user?.rtId || (req.headers['x-rt-id'] as string) || 'rt01';
}

export function safeAuditPayload(val: any): any {
  if (val === null || val === undefined) return null;
  try {
    if (typeof val?.toObject === 'function') {
      val = val.toObject({ depopulate: true, getters: false, virtuals: false });
    }
    const clean = (obj: any, depth = 0): any => {
      if (depth > 4) return '[Max Depth]';
      if (obj === null || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) {
        return obj.slice(0, 20).map(item => clean(item, depth + 1));
      }
      const res: any = {};
      for (const k of Object.keys(obj)) {
        if (k.toLowerCase().includes('password')) {
          res[k] = '*****';
          continue;
        }
        if (k.startsWith('$') || k === '__v') continue;
        const v = obj[k];
        if (typeof v === 'string' && v.startsWith('data:') && v.length > 200) {
          res[k] = '[Dokumen Media / Base64]';
        } else {
          res[k] = clean(v, depth + 1);
        }
      }
      return res;
    };
    return clean(val);
  } catch {
    return null;
  }
}

export async function logAudit(rtId: string, user: string, action: string, details: string, before?: any, after?: any) {
  try {
    await AuditLogModel.create({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      user: user || "Sistem",
      action,
      details,
      before: safeAuditPayload(before),
      after: safeAuditPayload(after),
      rtId: rtId || "rt01",
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error("Failed to write audit trail log:", e);
  }
}

export async function addNotification(rtId: string = 'rt01', title: string, message: string, updaterName: string = 'Sistem', resource?: string, resourceId?: string) {
  try {
    const newNotif = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      title,
      message,
      updaterName,
      resource,
      resourceId,
      time: new Date().toISOString(),
      read: false,
      rtId: rtId || 'rt01'
    };
    await NotificationModel.create(newNotif);
    broadcastEvent('update', { type: 'notifications', rtId });
  } catch (e) {
    console.error("Failed to write notification:", e);
  }
}
