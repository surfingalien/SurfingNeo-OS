import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { createHash } from 'crypto';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface AuthContext {
  userId: string;
  role: 'admin' | 'service' | 'readonly';
  projectIds: string[];
}

export async function verifyAuth(req: NextRequest): Promise<AuthContext | null> {
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (bearerToken) {
    try {
      const { payload } = await jwtVerify(bearerToken, JWT_SECRET, {
        clockTolerance: 60, maxTokenAge: '24h',
      });
      return payload as unknown as AuthContext;
    } catch { return null; }
  }

  const apiKey = req.headers.get('x-api-key');
  if (apiKey) {
    const validKeys = JSON.parse(process.env.API_KEYS_JSON || '{}');
    for (const [keyId, keyData] of Object.entries(validKeys)) {
      if (timingSafeCompare(apiKey, keyId)) {
        return {
          userId: (keyData as any).userId || keyId,
          role: (keyData as any).role || 'service',
          projectIds: (keyData as any).projectIds || ['*'],
        };
      }
    }
  }

  const sessionCookie = req.cookies.get('session')?.value;
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
      return payload as unknown as AuthContext;
    } catch { return null; }
  }

  return null;
}

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a), bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return createHash('sha256').update(bufA).digest('hex') === 
         createHash('sha256').update(bufB).digest('hex');
}

export function withAuth(
  handler: (req: NextRequest, auth: AuthContext) => Promise<NextResponse>,
  requiredRole?: AuthContext['role']
) {
  return async (req: NextRequest) => {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    if (requiredRole && auth.role !== requiredRole && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS' }, { status: 403 });
    }
    return handler(req, auth);
  };
}