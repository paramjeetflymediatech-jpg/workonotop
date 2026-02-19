import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import mime from 'mime';

export async function GET(request, { params }) {
    const { path: filePathParams } = params;

    // Construct the full file path from the URL parameters
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...filePathParams);

    try {
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        // Read the file properly
        const fileBuffer = fs.readFileSync(filePath);

        // Get the correct MIME type
        const contentType = mime.getType(filePath) || 'application/octet-stream';

        // Return the response with the file
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
