import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL
    || process.env.NEXT_PUBLIC_API_URL_FALLBACK
    || 'https://api.svayamnatural.com/api/v1';
  return base.replace(/\/$/, '');
};

const verifyAdmin = async (req: Request) => {
  const apiBase = getApiBase();
  const auth = req.headers.get('authorization') || '';

  if (!apiBase || !auth) {
    throw new UploadThingError('Unauthorized');
  }

  const res = await fetch(`${apiBase}/users/profile`, {
    headers: { Authorization: auth },
  });

  if (!res.ok) {
    throw new UploadThingError('Unauthorized');
  }

  const user = await res.json();
  if (!user || user.role !== 'admin') {
    throw new UploadThingError('Unauthorized');
  }

  return { userId: user._id || 'admin' };
};

export const ourFileRouter = {
  productImages: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 6,
    },
  })
    .middleware(async ({ req }) => verifyAdmin(req))
    .onUploadComplete(async ({ file }) => {
      const url = file.ufsUrl || file.url;
      return { url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
