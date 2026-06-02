import { createUploadthing, createRouteHandler } from 'uploadthing/next';

// Build a simple FileRouter exposing an `image` endpoint that accepts images.
const ut = createUploadthing();
const router = ut({ image: ['image'] });

// The UploadThing server handler. It reads `process.env.UPLOADTHING_TOKEN` automatically.
const handler = createRouteHandler({ router });

export const POST = handler.POST;
export const GET = handler.GET;
