import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;
const BCRYPT_PREFIXES = ["$2a$", "$2b$", "$2x$", "$2y$"] as const;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    if (!BCRYPT_PREFIXES.some((prefix) => hash.startsWith(prefix))) return false;
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
