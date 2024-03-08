import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


export function middleware(request: NextRequest) {
    /*const url = request.nextUrl.clone()
    const target = request.nextUrl.pathname.substr(3);
    url.pathname = target;
    return NextResponse.rewrite(new URL(target, request.nextUrl));*/
    console.log('iicicici');
    return NextResponse.next();
}

export const config = {
    matcher: ['/'],
}