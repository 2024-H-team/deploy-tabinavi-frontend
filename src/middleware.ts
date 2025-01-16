import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/register'];
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050/api';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/images') ||
        pathname.endsWith('.ico') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.jpeg') ||
        pathname.endsWith('.webp')
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;

    if (!token && !PUBLIC_PATHS.includes(pathname)) {
        const url = new URL('/', request.url);
        return NextResponse.redirect(url);
    }

    if (token) {
        try {
            const response = await fetch(`${API_URL}auth/verify-token`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const url = new URL('/', request.url);
                return NextResponse.redirect(url);
            }

            if (PUBLIC_PATHS.includes(pathname)) {
                const url = new URL('/home', request.url);
                return NextResponse.redirect(url);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            const url = new URL('/', request.url);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}
