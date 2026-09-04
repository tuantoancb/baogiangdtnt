import {NextRequest,NextResponse} from 'next/server';

export async function GET(request:NextRequest,{params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const url=new URL('/app.html',request.url);
  url.searchParams.set('gv',slug);
  return NextResponse.redirect(url);
}
