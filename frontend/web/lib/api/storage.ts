import { createAuthedRequest, type AuthTokenGetter } from '@/lib/api/client';

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
}

export function createStorageApi(getToken: AuthTokenGetter) {
  const request = createAuthedRequest(getToken);

  return {
    getUploadUrl: (filename: string, contentType: string) =>
      request<UploadUrlResponse>('/storage/upload-url', {
        method: 'POST',
        body: { filename, contentType },
      }),
    getPublicUrl: (key: string) =>
      request<{ url: string }>(`/storage/public-url?key=${encodeURIComponent(key)}`),
  };
}
