// ═══════════════════════════════════════════════════════════
// VEL AI — Cloudflare R2 Storage Service
// ═══════════════════════════════════════════════════════════

import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

type StorageFolder = 'exports' | 'cad' | 'recordings' | 'thumbnails';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private client: S3Client | undefined;
  private bucket: string;

  constructor() {
    this.bucket = process.env.R2_BUCKET_NAME || 'vel-ai-storage';
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      this.logger.warn('R2 storage not configured — file uploads disabled');
      return;
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
      requestHandler: {
        requestTimeout: parseInt(process.env.R2_REQUEST_TIMEOUT || '30000', 10),
      },
    });
  }

  private get isAvailable(): boolean {
    return this.client !== undefined;
  }

  async upload(
    content: Buffer | string,
    contentType: string,
    folder: StorageFolder,
  ): Promise<{ key: string; url: string }> {
    if (!this.isAvailable) {
      throw new Error('R2 storage not configured');
    }
    const key = `${folder}/${uuidv4()}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: content,
        ContentType: contentType,
      }),
    );

    return {
      key,
      url: `${process.env.R2_PUBLIC_URL || ''}/${key}`,
    };
  }

  async createUploadUrl(
    filename: string,
    contentType: string,
    folder: StorageFolder = 'exports',
  ): Promise<{ key: string; uploadUrl: string }> {
    if (!this.isAvailable) {
      throw new Error('R2 storage not configured');
    }
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder}/${uuidv4()}-${safeName}`;

    const uploadUrl = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 900 },
    );

    return { key, uploadUrl };
  }

  getPublicUrl(key: string): string {
    return `${process.env.R2_PUBLIC_URL || ''}/${key}`;
  }

  async getDownloadUrl(key: string): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('R2 storage not configured');
    }
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: 3600 },
    );
  }

  async delete(key: string): Promise<void> {
    if (!this.isAvailable) return;
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
