import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';

export class TopsecretSplitCreateDto {
  @ApiProperty({
    example: 145.6,
    description:
      'The distance between the sender of the message and the satellite',
  })
  distance: number;

  @ApiProperty({
    example: ['May', '', 'force', '', '', 'you'],
    description: 'Messages received by each satellite',
  })
  message: string[];

  constructor({ distance, message }: { distance: number; message: string[] }) {
    this.distance = distance;
    this.message = message;
  }
}

export const TopsecretSplitCreateDtoSchema = joi.object({
  distance: joi.number().required(),
  message: joi.array().items(joi.string().allow('')).required(),
});
