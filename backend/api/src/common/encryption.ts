import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const MIN_KEY_ENTROPY_BITS = 128;

function deriveKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required. Generate one with: openssl rand -hex 32',
    );
  }

  if (raw.length < 32) {
    throw new Error(
      `ENCRYPTION_KEY must be at least 32 characters long (got ${raw.length}). Generate one with: openssl rand -hex 32`,
    );
  }

  const entropyCheck = Buffer.from(raw, 'utf8');
  let uniqueBytes = 0;
  const seen = new Set<number>();
  for (const byte of entropyCheck) {
    if (!seen.has(byte)) {
      seen.add(byte);
      uniqueBytes++;
    }
  }
  if (uniqueBytes < MIN_KEY_ENTROPY_BITS / 8) {
    throw new Error(
      `ENCRYPTION_KEY has insufficient entropy (${uniqueBytes} unique bytes, need >= ${MIN_KEY_ENTROPY_BITS / 8}). The key must not be all-zeros or a repeated pattern. Generate one with: openssl rand -hex 32`,
    );
  }

  return createHash('sha256').update(raw).digest();
}

export function encrypt(plaintext: string): string {
  const key = deriveKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  const key = deriveKey();
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }
  const [ivHex, tagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function isEncrypted(value: string): boolean {
  return /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/.test(value);
}
