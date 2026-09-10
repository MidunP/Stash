import { PrismaClient } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Singleton Prisma client (safe for Next.js hot-reload in dev)
// In production (Vercel serverless), we create a fresh client each module load.
// ─────────────────────────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var _prismaMain: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var _prismaDirect: PrismaClient | undefined;
}

function ensureParams(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  // Parse existing params
  const hasConnectTimeout = raw.includes("connect_timeout");
  const hasPoolTimeout = raw.includes("pool_timeout");
  const hasConnLimit = raw.includes("connection_limit");
  const hasPgBouncer = raw.includes("pgbouncer");

  const sep = raw.includes("?") ? "&" : "?";
  const parts: string[] = [raw];

  if (!hasConnectTimeout) parts.push("connect_timeout=10");
  if (!hasPoolTimeout && raw.includes("pooler")) parts.push("pool_timeout=10");
  if (!hasConnLimit) parts.push("connection_limit=1");
  if (!hasPgBouncer && raw.includes("pooler")) parts.push("pgbouncer=true");

  if (parts.length === 1) return raw; // nothing to add
  const extra = parts.slice(1).join("&");
  return `${raw}${sep}${extra}`;
}

const poolerUrl = ensureParams(process.env.DATABASE_URL);
const directRaw =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL?.replace("-pooler.", ".");
const directUrl = ensureParams(directRaw);

if (!poolerUrl) {
  throw new Error(
    "[DB] DATABASE_URL is not set. Add it to your .env file or Vercel environment variables."
  );
}

function makeClient(url: string, label: string): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// In development, reuse across hot-reloads. In production, create fresh per
// module invocation (correct for Vercel serverless — each function is isolated).
export const prisma: PrismaClient =
  process.env.NODE_ENV !== "production"
    ? (global._prismaMain ?? (global._prismaMain = makeClient(poolerUrl, "pooler")))
    : makeClient(poolerUrl, "pooler");

const directClient: PrismaClient =
  directUrl && directUrl !== poolerUrl
    ? (process.env.NODE_ENV !== "production"
      ? (global._prismaDirect ?? (global._prismaDirect = makeClient(directUrl, "direct")))
      : makeClient(directUrl, "direct"))
    : prisma;

// ─────────────────────────────────────────────────────────────────────────────
// isTransient — determine whether an error is a retriable connection error
// ─────────────────────────────────────────────────────────────────────────────
function isTransient(err: unknown): boolean {
  if (!err) return false;
  const full = [
    String(err),
    (err as Error)?.message ?? "",
    String((err as { code?: string })?.code ?? ""),
  ]
    .join(" ")
    .toLowerCase();

  return (
    full.includes("can't reach") ||
    full.includes("etimedout") ||
    full.includes("econnreset") ||
    full.includes("econnrefused") ||
    full.includes("enotfound") ||
    full.includes("timeout") ||
    full.includes("connection") ||
    full.includes("connect") ||
    full.includes("closed") ||
    full.includes("terminated") ||
    full.includes("socket") ||
    full.includes("reset") ||
    full.includes("engine") ||
    full.includes("prismaclient") ||
    full.includes("p1000") ||
    full.includes("p1001") ||
    full.includes("p1002") ||
    full.includes("p1008") ||
    full.includes("p1017")
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// withDbRetry — tries pooler first with retries, then falls back to direct URL
// Designed to work within Vercel's 10s Hobby / 60s Pro function timeout.
// ─────────────────────────────────────────────────────────────────────────────
export async function withDbRetry<T>(
  fn: (client: PrismaClient) => Promise<T>,
  retries = 2,          // max 2 retries on pooler (3 total attempts)
  delayMs = 800         // short delay — we need to stay within Vercel's timeout
): Promise<T> {
  let lastErr: unknown;

  // ── Phase 1: pooler with quick retries ──
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(prisma);
    } catch (err) {
      lastErr = err;
      if (isTransient(err) && attempt < retries) {
        const wait = delayMs * (attempt + 1); // 800ms, 1600ms
        console.warn(
          `[DB] Pooler attempt ${attempt + 1}/${retries + 1} failed. Retrying in ${wait}ms… Error: ${(err as Error)?.message}`
        );
        await new Promise((r) => setTimeout(r, wait));
      } else {
        break;
      }
    }
  }

  // ── Phase 2: immediate direct connection fallback ──
  if (directClient !== prisma) {
    console.warn("[DB] Pooler exhausted. Trying direct connection…");
    try {
      return await fn(directClient);
    } catch (directErr) {
      console.error("[DB] Direct connection also failed:", (directErr as Error)?.message);
      lastErr = directErr;
    }
  }

  throw lastErr;
}
