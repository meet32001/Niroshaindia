import { NextResponse } from 'next/server';

export async function GET() {
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  const secKey = process.env.CLERK_SECRET_KEY || '';

  let instanceDomain = 'Unknown';
  try {
    const base64Part = pubKey.replace(/^pk_test_/, '');
    instanceDomain = Buffer.from(base64Part, 'base64').toString('utf-8').replace(/\$$/, '');
  } catch {
    instanceDomain = 'Failed to decode';
  }

  return NextResponse.json({
    publishableKeyPrefix: pubKey.substring(0, 20) + '...',
    publishableKeyLength: pubKey.length,
    decodedInstanceDomain: instanceDomain,
    secretKeyPrefix: secKey.substring(0, 15) + '...',
    secretKeyLength: secKey.length,
    nodeEnv: process.env.NODE_ENV,
  });
}
