import { NextResponse } from 'next/server';

// This route forwards multipart/form-data directly to PHP
// so profile images are streamed through without being decoded
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    const apiUrl = process.env.API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    let body: BodyInit;
    const forwardHeaders: Record<string, string> = {
      Authorization: `Bearer ${apiKey ?? ''}`,
    };

    if (contentType.includes('multipart/form-data')) {
      // Forward raw body — let the browser's boundary header pass through
      // We do NOT set Content-Type manually so the boundary value is preserved
      body = await request.blob();
      forwardHeaders['Content-Type'] = contentType;
    } else {
      // JSON fallback (no image)
      const json = await request.json().catch(() => ({}));
      body = JSON.stringify(json);
      forwardHeaders['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: forwardHeaders,
      body,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (err: any) {
    console.error('[register route]', err);
    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
