import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from '@/lib/uploadthing';

const fallback = async () =>
  Response.json({ error: 'UploadThing is not configured' }, { status: 500 });

export const { GET, POST } = (() => {
  try {
    return createRouteHandler({ router: ourFileRouter });
  } catch (err) {
    console.error('UploadThing route init failed:', err);
    return { GET: fallback, POST: fallback };
  }
})();
