import { NextRequest, NextResponse } from "next/server";

const RITUAL_RPC = "https://rpc.ritualfoundation.org";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const upstream = await fetch(RITUAL_RPC, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status:  upstream.status,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  } catch (err) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32603, message: "RPC proxy error" } },
      { status: 502, headers: CORS }
    );
  }
}
