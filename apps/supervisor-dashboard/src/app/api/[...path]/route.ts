import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API_URL = 'http://localhost:8000/api/v1';

async function handleProxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const token = req.cookies.get('access_token')?.value;

  const url = `${DJANGO_API_URL}/${path}/${req.nextUrl.search}`;

  const headers = new Headers();
  headers.set('Content-Type', req.headers.get('Content-Type') || 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const method = req.method;
  let body: any = null;

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      body = await req.formData();
      headers.delete('Content-Type');
    } else {
      body = await req.text();
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: { 'Content-Type': contentType },
      });
    }
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error connecting to API' }, { status: 500 });
  }
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as DELETE,
  handleProxy as PATCH,
};
