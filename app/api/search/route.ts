import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'maestra.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    const fileData = await fs.promises.readFile(filePath, 'utf8');
    const products = JSON.parse(fileData);

    const qLower = query.toLowerCase();
    
    const filtered = products.filter((p: any) => 
      p.id.toLowerCase().includes(qLower) || 
      p.name.toLowerCase().includes(qLower)
    ).slice(0, 100);

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
