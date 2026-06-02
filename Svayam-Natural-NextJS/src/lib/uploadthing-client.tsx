import { generateUploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/lib/uploadthing';

const uploadthingUrl = process.env.NEXT_PUBLIC_UPLOADTHING_URL;

export const UploadDropzone = generateUploadDropzone<OurFileRouter>(
	uploadthingUrl ? { url: uploadthingUrl } : undefined
);
