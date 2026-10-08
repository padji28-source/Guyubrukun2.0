// Cache TTL policies based on data volatility requirements
export const CACHE_TTL_POLICIES: { pattern: RegExp; ttlMs: number }[] = [
  // Profile (5 - 10 minutes)
  { pattern: /\/api\/profile|\/api\/warga\/[^\/]+(?!\/dokumen)/i, ttlMs: 5 * 60 * 1000 },
  
  // Master data & Static permissions (10 minutes)
  { pattern: /\/api\/menu-permissions|\/api\/public\/rt-list|\/api\/tangerang-logo-proxy/i, ttlMs: 10 * 60 * 1000 },
  
  // Dashboard (30 - 60 seconds)
  { pattern: /\/api\/dashboard|\/api\/developer\/stats/i, ttlMs: 30 * 1000 },
  
  // Kas RT (15 - 30 seconds)
  { pattern: /\/api\/data\/kas|\/api\/kas/i, ttlMs: 20 * 1000 },
  
  // Iuran Warga (15 - 30 seconds)
  { pattern: /\/api\/data\/iuran|\/api\/iuran/i, ttlMs: 20 * 1000 },
  
  // Notifikasi (5 - 15 seconds)
  { pattern: /\/api\/notifications/i, ttlMs: 10 * 1000 },
  
  // Voting (10 - 30 seconds)
  { pattern: /\/api\/voting|\/api\/data\/voting/i, ttlMs: 15 * 1000 },

  // Warga list & General resource list
  { pattern: /\/api\/warga|\/api\/data\/umkm|\/api\/data\/acara|\/api\/data\/laporan|\/api\/data\/surat|\/api\/data\/media|\/api\/data\/dokumen|\/api\/data\/inventaris|\/api\/data\/tamu|\/api\/data\/notulen/i, ttlMs: 30 * 1000 },
  
  // Audit logs (15 seconds)
  { pattern: /\/api\/audit-logs/i, ttlMs: 15 * 1000 },
];

export const DEFAULT_CACHE_TTL = 30 * 1000;

export function getTtlForUrl(url: string): number {
  for (const policy of CACHE_TTL_POLICIES) {
    if (policy.pattern.test(url)) {
      return policy.ttlMs;
    }
  }
  return DEFAULT_CACHE_TTL;
}
