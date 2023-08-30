import { ApiProperty } from '@nestjs/swagger';

export class TopsecretResponseDto {
  @ApiProperty({
    example: 'May the force be with you',
    description: 'The decoded message',
  })
  message: string;

  @ApiProperty({
    example: { x: 2, y: 3 },
    description: 'The decoded message',
  })
  position: { x: number; y: number };

  constructor({
    message,
    position,
  }: {
    position: { x: number; y: number };
    message: string;
  }) {
    this.position = position;
    this.message = message;
  }
}
