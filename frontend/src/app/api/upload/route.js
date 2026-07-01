import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No files received.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + '_' + file.name.replaceAll(' ', '_');
    
    // Write to the public/uploads directory so it can be served publicly
    const filepath = path.join(process.cwd(), 'public/uploads', filename);
    await writeFile(filepath, buffer);

    // Return the URL to access the uploaded file
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Error occurred while uploading image:', error);
    return NextResponse.json({ error: 'Message: ' + error.message }, { status: 500 });
  }
}
