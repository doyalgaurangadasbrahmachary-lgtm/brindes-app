import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sku = searchParams.get('sku');

  if (!sku) {
    return NextResponse.json({ error: 'SKU is required' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'maestra.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Database not found' }, { status: 500 });
    }
    const fileData = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(fileData);
    
    const product = products.find((p: any) => p.id === sku.toUpperCase());

    if (product) {
      return NextResponse.json(product);
    } else {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching product data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
