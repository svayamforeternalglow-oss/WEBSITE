import { generateUploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/lib/uploadthing';

const uploadthingUrl = process.env.NEXT_PUBLIC_UPLOADTHING_URL;

if (typeof window !== 'undefined') {
  console.warn(
    '[UploadThing] NEXT_PUBLIC_UPLOADTHING_URL =',
    uploadthingUrl ?? '(not set, will use default: ' + window.location.origin + '/api/uploadthing)'
  );
}

export const UploadDropzone = generateUploadDropzone<OurFileRouter>(
	uploadthingUrl ? { url: uploadthingUrl } : undefined
);
