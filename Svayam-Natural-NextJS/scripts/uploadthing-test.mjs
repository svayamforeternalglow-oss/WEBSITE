import dotenv from 'dotenv';
dotenv.config();

import { UTApi } from 'uploadthing/server';

const targetUrl = process.env.UPLOAD_TEST_URL;
if (!targetUrl) {
  console.error('Please set UPLOAD_TEST_URL to a public image URL to test uploading from URL.');
  process.exit(1);
}

async function run() {
  try {
    const ut = new UTApi();
    console.log('Uploading', targetUrl);
    const res = await ut.uploadFilesFromUrl([targetUrl]);
    console.log('Upload result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Upload test failed:', err);
    process.exit(1);
  }
}

run();
