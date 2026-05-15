import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { R2Service } from './r2.service';

@Controller('storage')
@UseGuards(ClerkAuthGuard)
export class StorageController {
  constructor(private readonly r2Service: R2Service) {}

  @Post('upload-url')
  async getUploadUrl(
    @Body()
    body: {
      filename: string;
      contentType: string;
    },
  ) {
    return this.r2Service.createUploadUrl(body.filename, body.contentType);
  }

  @Get('public-url')
  async getPublicUrl(@Query('key') key: string) {
    return { url: this.r2Service.getPublicUrl(key) };
  }
}
