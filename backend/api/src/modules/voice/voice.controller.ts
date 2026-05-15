import { Controller, Post, UseInterceptors, UploadedFile, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceService } from './voice.service';

interface UploadedAudio {
  buffer: Buffer;
  mimetype: string;
}

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('stt')
  @UseInterceptors(FileInterceptor('audio'))
  async speechToText(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 25 * 1024 * 1024 }),
        ],
        fileIsRequired: true,
      }),
    )
    file: UploadedAudio,
  ) {
    const result = await this.voiceService.transcribe(file.buffer, file.mimetype);
    return result;
  }
}
