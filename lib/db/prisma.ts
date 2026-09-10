import { PrismaClient } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Singleton Prisma client (safe for Next.js hot-reload in dev)
// ─────────────────────────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var _prismaMain: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var _prismaDirect: PrismaClient | undefined;
}

function buildUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  // Ensure connect_timeout is present so Neon doesn't hang forever
  if (raw.includes("connect_timeout")) return raw;
  const sep = raw.includes("?") ? "&" : "?";
  return `${raw}${sep}connect_timeout=30&pool_timeout=30`;
}

const poolerUrl = buildUrl(process.env.DATABASE_URL);
// Prefer explicit DIRECT_URL, fall back to stripping "-pooler" from pooler URL
const directRaw =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL?.replace("-pooler.", ".");
const directUrl = buildUrl(directRaw);

if (!poolerUrl) {
  throw new Error(
    "[DB] DATABASE_URL is not set. Add it to your .env file or Vercel environment variables."
  );
}

export const prisma: PrismaClient =
  global._prismaMain ??
  new PrismaClient({
    datasources: { db: { url: poolerUrl } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

const directClient: PrismaClient =
  global._prismaDirect ??
  (directUrl && directUrl !== poolerUrl
    ? new PrismaClient({
      datasources: { db: { url: directUrl } },
      log: ["error"],
    })
    : prisma);

if (process.env.NODE_ENV !== "production") {
  global._prismaMain = prisma;
  global._prismaDirect = directClient;
}

// ─────────────────────────────────────────────────────────────────────────────
// withDbRetry — tries pooler first, then direct connection, with retries
// ─────────────────────────────────────────────────────────────────────────────
function isTransient(err: unknown): boolean {
  if (!err) return false;
  const str = String(err);
  const msg = String((err as Error)?.message ?? "").toLowerCase();
  const stack = String((err as Error)?.stack ?? "").toLowerCase();
  const code = String((err as { code?: string })?.code ?? "").toLowerCase();
  const full = `${str} ${msg} ${stack} ${code}`.toLowerCase();

  return (
    full.includes("reach") ||
    full.includes("etimedout") ||
    full.includes("econnreset") ||
    full.includes("econnrefused") ||
    full.includes("enotfound") ||
    full.includes("timeout") ||
    full.includes("connection") ||
    full.includes("connect") ||
    full.includes("closed") ||
    full.includes("terminated") ||
    full.includes("pool") ||
    full.includes("ssl") ||
    full.includes("tls") ||
    full.includes("engine") ||
    full.includes("prismaclient") ||
    full.includes("postgreserror") ||
    full.includes("socket") ||
    full.includes("reset") ||
    full.includes("handshake") ||
    full.includes("500") ||
    full.includes("503") ||
    full.includes("504") ||
    code === "p1000" ||
    code === "p1001" ||
    code === "p1002" ||
    code === "p1003" ||
    code === "p1008" ||
    code === "p1017" ||
    code === "p2024"
  );
}

export async function withDbRetry<T>(
  fn: (client: PrismaClient) => Promise<T>,
  retries = 3,
  delayMs = 1500
): Promise<T> {
  let lastErr: unknown;

  // ── Phase 1: try the pooler connection with retries ──
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(prisma);
    } catch (err) {
      lastErr = err;
      if (isTransient(err) && attempt < retries) {
        const wait = Math.min(delayMs * Math.pow(1.5, attempt), 5000);
        console.warn(
          `[DB] Pooler attempt ${attempt + 1}/${retries + 1} failed. Retrying in ${Math.round(wait)}ms…`
        );
        await new Promise((r) => setTimeout(r, wait));
      } else {
        break;
      }
    }
  }

  // ── Phase 2: try direct connection fallback if available ──
  if (directClient && directClient !== prisma) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.warn(`[DB] Direct connection attempt ${attempt + 1}…`);
        return await fn(directClient);
      } catch (directErr) {
        lastErr = directErr;
        if (isTransient(directErr) && attempt < 1) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }
  }

  throw lastErr;
}
