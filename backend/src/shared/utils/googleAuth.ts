import jwt from 'jsonwebtoken';
import AppError from './appError';
import logger from './logger';

interface GoogleJwksKey {
  kty: string;
  alg: string;
  use: string;
  kid: string;
  n: string;
  e: string;
}

interface GoogleJwksResponse {
  keys: GoogleJwksKey[];
}

interface GoogleTokenPayload {
  iss: string;
  aud: string;
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  exp: number;
}

// In-memory cache for Google's public JWKs
let cachedKeys: GoogleJwksKey[] = [];
let cacheExpiresAt = 0;

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

/**
 * Converts a JWK RSA key (n, e) into a PEM-formatted public key string.
 */
function jwkToPem(jwk: GoogleJwksKey): string {
  const nBuffer = Buffer.from(jwk.n, 'base64url');
  const eBuffer = Buffer.from(jwk.e, 'base64url');

  // Build DER sequence for RSA Public Key
  const encodeLength = (len: number): Buffer => {
    if (len < 128) return Buffer.from([len]);
    if (len < 256) return Buffer.from([0x81, len]);
    return Buffer.from([0x82, (len >> 8) & 0xff, len & 0xff]);
  };

  const encodeInteger = (buf: Buffer): Buffer => {
    // Add leading zero if high bit is set (to keep positive in ASN.1)
    const needsPadding = buf[0] & 0x80;
    const value = needsPadding ? Buffer.concat([Buffer.from([0]), buf]) : buf;
    return Buffer.concat([Buffer.from([0x02]), encodeLength(value.length), value]);
  };

  const rsaPublicKeyDer = Buffer.concat([
    Buffer.from([0x30]), // Sequence
    encodeLength(
      encodeInteger(nBuffer).length + encodeInteger(eBuffer).length
    ),
    encodeInteger(nBuffer),
    encodeInteger(eBuffer),
  ]);

  // Wrap in SubjectPublicKeyInfo header for RS256
  const rsaAlgorithmIdentifier = Buffer.from([
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01,
    0x01, 0x05, 0x00,
  ]);

  const bitString = Buffer.concat([
    Buffer.from([0x03]),
    encodeLength(rsaPublicKeyDer.length + 1),
    Buffer.from([0x00]), // unused bits
    rsaPublicKeyDer,
  ]);

  const spkiDer = Buffer.concat([
    Buffer.from([0x30]),
    encodeLength(rsaAlgorithmIdentifier.length + bitString.length),
    rsaAlgorithmIdentifier,
    bitString,
  ]);

  const base64Pem = spkiDer.toString('base64').match(/.{1,64}/g)?.join('\n');
  return `-----BEGIN PUBLIC KEY-----\n${base64Pem}\n-----END PUBLIC KEY-----`;
}

async function fetchGooglePublicKeys(): Promise<GoogleJwksKey[]> {
  const now = Date.now();
  if (cachedKeys.length > 0 && now < cacheExpiresAt) {
    return cachedKeys;
  }

  try {
    const res = await fetch(GOOGLE_JWKS_URL);
    if (!res.ok) {
      throw new Error(`Google JWKS HTTP ${res.status}`);
    }

    // Cache control parsing (default 1 hour)
    const cacheControl = res.headers.get('cache-control') || '';
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    const maxAgeSec = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;

    const data = (await res.json()) as GoogleJwksResponse;
    cachedKeys = data.keys || [];
    cacheExpiresAt = now + maxAgeSec * 1000;
    return cachedKeys;
  } catch (err: any) {
    logger.error(`[GoogleAuth] Failed to fetch Google public keys: ${err.message}`);
    throw new AppError('Google authentication service is temporarily unavailable', 503);
  }
}

/**
 * Cryptographically verifies a Google ID token server-side without external SDK dependencies.
 * Validates signature, issuer, audience, and expiration.
 */
export async function verifyGoogleIdToken(
  idToken: string,
  expectedClientId: string
): Promise<GoogleTokenPayload> {
  // Decode header without verification to get `kid`
  const unverified = jwt.decode(idToken, { complete: true });
  if (!unverified || typeof unverified === 'string' || !unverified.header?.kid) {
    throw new AppError('Malformed Google ID token header', 400);
  }

  const kid = unverified.header.kid;
  const keys = await fetchGooglePublicKeys();
  const matchingKey = keys.find((k) => k.kid === kid);

  if (!matchingKey) {
    throw new AppError('Invalid Google ID token: signing key not recognized', 401);
  }

  const pemPublicKey = jwkToPem(matchingKey);

  let payload: GoogleTokenPayload;
  try {
    payload = jwt.verify(idToken, pemPublicKey, {
      algorithms: ['RS256'],
    }) as GoogleTokenPayload;
  } catch (err: any) {
    throw new AppError(`Invalid Google ID token signature or expired: ${err.message}`, 401);
  }

  if (!GOOGLE_ISSUERS.includes(payload.iss)) {
    throw new AppError('Invalid Google ID token issuer', 401);
  }

  if (payload.aud !== expectedClientId) {
    throw new AppError('Google ID token was not issued for this application', 401);
  }

  return payload;
}
