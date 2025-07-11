export class TranslateBlockResponseDto {
  success: boolean;
  translations: Record<string, any>;
  error?: string;
}