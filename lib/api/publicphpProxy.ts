import { NextResponse } from 'next/server';
export async function phpProxyPublic(phpEndpoint: string, request: Request) {
  const body = await request.json().catch(() => ({}));
  const res = await fetch(`${process.env.API_URL}/${phpEndpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.API_KEY}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}