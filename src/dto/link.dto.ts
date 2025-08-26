import { IsString, IsUrl, IsOptional, IsDateString } from 'class-validator';

export class CreateLinkDto {
  @IsUrl({}, { message: 'Please provide a valid URL' })
  long_url: string;

  // @IsOptional()
  // @IsDateString()
  // expiresAt?: string;
}

export class LinkResponseDto {
  id: number;
  long_url: string;
  short_url: string;
  createdAt: Date;
  // expiresAt?: Date;
  click_count?: number;
}
