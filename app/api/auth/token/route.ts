import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: NextRequest) {
  const { apiKey, projectIds } = await req.json();
  const validKeys = JSON.parse(process.env.API_KEYS_JSON || '{}');
  const keyData = validKeys[apiKey];
  if (!keyData) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  const token = await new SignJWT({ userId: keyData.userId, role: keyData.role, projectIds: projectIds || keyData.projectIds })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('24h').sign(JWT_SECRET);
  return NextResponse.json({ token, expiresIn: 86400 });
}