export class CreateBlockLocaleDto {
  name: string;
  language: string;
  content: string;
  blockId: number;
  description?: string;
  meta?: any;
  isActive?: boolean;
} 