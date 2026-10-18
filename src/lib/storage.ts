/**
 * Object storage adapter (fake-gcs-server locally, GCS in production).
 * Env-driven; swap endpoints without changing call sites.
 */

export type PutObjectInput = {
  key: string;
  body: Buffer | Uint8Array;
  contentType?: string;
};

export type StorageAdapter = {
  putObject: (input: PutObjectInput) => Promise<void>;
  getSignedUrl: (key: string, expiresSeconds?: number) => Promise<string>;
  deleteObject: (key: string) => Promise<void>;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

/** Stub adapter — wires env placeholders; implement S3/GCS SDK calls next. */
export function getStorage(): StorageAdapter {
  const bucket = process.env.STORAGE_BUCKET ?? "meal-assets";
  const endpoint =
    process.env.STORAGE_ENDPOINT ?? "http://localhost:4443";
  const publicHost =
    process.env.STORAGE_PUBLIC_HOST ?? endpoint;

  return {
    async putObject({ key }) {
      // Phase 2: upload via @google-cloud/storage (fake-gcs or real GCS).
      console.info(
        `[storage] putObject bucket=${bucket} key=${key} endpoint=${endpoint}`,
      );
    },
    async getSignedUrl(key, expiresSeconds = 3600) {
      return `${publicHost}/storage/v1/b/${bucket}/o/${encodeURIComponent(key)}?alt=media&expires=${expiresSeconds}`;
    },
    async deleteObject(key) {
      console.info(`[storage] deleteObject bucket=${bucket} key=${key}`);
    },
  };
}

export function storageConfigSummary() {
  return {
    endpoint: process.env.STORAGE_ENDPOINT ?? "http://localhost:4443",
    bucket: process.env.STORAGE_BUCKET ?? "meal-assets",
    publicHost: process.env.STORAGE_PUBLIC_HOST,
    // GCS prod placeholders (document only until Phase 4):
    gcsBucket: process.env.GCS_BUCKET,
    gcsProjectId: process.env.GCS_PROJECT_ID,
  };
}

export { requireEnv };
