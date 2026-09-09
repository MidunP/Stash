import { PrismaClient } from "@prisma/client";

function formatUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  let formatted = url;
  if (!formatted.includes("connect_timeout")) {
    const separator = formatted.includes("?") ? "&" : "?";
    formatted = `${formatted}${separator}connect_timeout=30&pool_timeout=30`;
  }
  return formatted;
}

const rawUrl = process.env.DATABASE_URL;
const primaryUrl = formatUrl(rawUrl);
const directUrl = formatUrl(process.env.DIRECT_URL || rawUrl?.replace("-pooler.", "."));

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  fallbackPrisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(primaryUrl ? { datasources: { db: { url: primaryUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const fallbackPrisma =
  globalForPrisma.fallbackPrisma ??
  (directUrl && directUrl !== primaryUrl
    ? new PrismaClient({
      datasources: { db: { url: directUrl } },
      log: ["error"],
    })
    : prisma);

if (process.env.NODE_ENV !== "production") globalForPrisma.fallbackPrisma = fallbackPrisma;

/**
 * Executes a database operation with automatic retry logic and fallback to direct connection.
 */
export async function withDbRetry<T>(
  fn: (client: PrismaClient) => Promise<T>,
  retries = 4,
  delayMs = 2500
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(prisma);
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || "";
      const isConnectionError =
        msg.includes("Can't reach database server") ||
        msg.includes("connect") ||
        msg.includes("Connection") ||
        msg.includes("PrismaClientInitializationError") ||
        msg.includes("ETIMEDOUT") ||
        msg.includes("DATABASE_URL") ||
        msg.includes("timeout") ||
        msg.includes("Engine") ||
        err?.code === "P1001" ||
        err?.code === "P1002";

      if (isConnectionError && attempt < retries) {
        console.warn(`[DB Retry] Primary connection attempt ${attempt + 1}/${retries} failed. Retrying in ${delayMs}ms...`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        break;
      }
    }
  }

  if (fallbackPrisma !== prisma) {
    try {
      console.warn("[DB Retry] Primary pooled connection failed. Attempting Direct DB fallback...");
      return await fn(fallbackPrisma);
    } catch (fallbackErr) {
      console.error("[DB Retry] Fallback direct connection also failed:", fallbackErr);
    }
  }

  throw lastError;
}
