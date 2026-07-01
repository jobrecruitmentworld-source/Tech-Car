import { NextResponse } from 'next/server';

const PHP_API_URL = 'http://127.0.0.1:8000/api/blogs.php';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  
  try {
    const res = await fetch(`${PHP_API_URL}?${query}`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy GET Error:", error);
    return NextResponse.json({ error: 'Failed to connect to PHP backend' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch(PHP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy POST Error:", error);
    return NextResponse.json({ error: 'Failed to connect to PHP backend' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const res = await fetch(PHP_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy PUT Error:", error);
    return NextResponse.json({ error: 'Failed to connect to PHP backend' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  try {
    const res = await fetch(`${PHP_API_URL}?id=${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy DELETE Error:", error);
    return NextResponse.json({ error: 'Failed to connect to PHP backend' }, { status: 500 });
  }
}
