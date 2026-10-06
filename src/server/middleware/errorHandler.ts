import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) {
    return;
  }

  const status = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== "production";

  let code = "INTERNAL_ERROR";
  let message = "Terjadi kesalahan internal pada server.";

  if (err.name === "ValidationError" || err.name === "ZodError") {
    code = "VALIDATION_ERROR";
    message = err.errors?.[0]?.message || err.message || "Validasi data gagal.";
  } else if (err.name === "JsonWebTokenError") {
    code = "AUTH_INVALID";
    message = "Token autentikasi tidak valid.";
  } else if (err.name === "TokenExpiredError") {
    code = "AUTH_EXPIRED";
    message = "Token autentikasi telah kadaluarsa.";
  } else if (err.name === "UnauthorizedError" || status === 401) {
    code = "AUTH_REQUIRED";
    message = err.message || "Akses memerlukan autentikasi.";
  } else if (status === 403) {
    code = "FORBIDDEN";
    message = err.message || "Akses ditolak: Anda tidak memiliki wewenang.";
  } else if (status === 404) {
    code = "NOT_FOUND";
    message = err.message || "Resource tidak ditemukan.";
  } else if (status === 409) {
    code = "CONFLICT";
    message = err.message || "Data konflik.";
  } else if (status === 429) {
    code = "RATE_LIMITED";
    message = err.message || "Terlalu banyak permintaan.";
  }

  if (status >= 500) {
    console.error(`[API Error ${req.method} ${req.originalUrl}]:`, err?.message || err);
  }

  return res.status(status).json({
    error: {
      code,
      message,
      ...(isDev && err.stack ? { details: err.message } : {})
    },
    message
  });
}
