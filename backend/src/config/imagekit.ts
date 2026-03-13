import ImageKit from '@imagekit/nodejs';

/**
 * ImageKit.io SDK singleton.
 *
 * Required env vars:
 *   IMAGEKIT_PRIVATE_KEY   – Your ImageKit private API key
 *   IMAGEKIT_URL_ENDPOINT  – e.g. https://ik.imagekit.io/<your_id>
 *
 * The SDK uses the private key for server-side authentication.
 * publicKey is only required for client-side / presigned uploads — we don't
 * use those here, but we pass it anyway so the SDK doesn't warn.
 */
const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? '',
});

/** True when all three ImageKit credentials are present in the environment. */
export function isImageKitConfigured(): boolean {
  return !!(
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  );
}

export default imagekit;
