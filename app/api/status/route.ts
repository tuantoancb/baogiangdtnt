import{NextResponse}from'next/server';export function GET(){return NextResponse.json({ok:true,backendConfigured:true,version:'4.145.0'},{headers:{'cache-control':'no-store'}})}
