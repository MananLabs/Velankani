import { IsString, IsNotEmpty } from 'class-validator';

export class ConsensusStreamDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsString()
  @IsNotEmpty()
  tileId!: string;

  @IsString()
  @IsNotEmpty()
  requestId!: string;
}
