import { NextRequest } from "next/server";
import { handleApi } from "@/lib/api-router";
import { ensureIndexes } from "@/lib/db";

let indexesReady = false;

async function init() {
  if (!indexesReady) {
    await ensureIndexes();
    indexesReady = true;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  await init();
  const { path } = await params;
  return handleApi(req, path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  await init();
  const { path } = await params;
  return handleApi(req, path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  await init();
  const { path } = await params;
  return handleApi(req, path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  await init();
  const { path } = await params;
  return handleApi(req, path);
}
