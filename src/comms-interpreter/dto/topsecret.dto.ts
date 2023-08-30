import * as joi from 'joi';
import {
  SatelliteMessage,
  satelliteMessageSchema,
} from '../entities/satellite-message.entity';
import { ApiProperty } from '@nestjs/swagger';

export class TopsecretDto {
  @ApiProperty({
    example: [
      {
        name: 'kenobi',
        distance: 100.0,
        message: ['May', '', '', 'be', '', ''],
      },
      {
        name: 'skywalker',
        distance: 115.5,
        message: ['', 'the', '', '', '', 'you'],
      },
      {
        name: 'sato',
        distance: 142.7,
        message: ['', '', 'force', '', 'with', ''],
      },
    ],
    description: 'Messages received by each satellite',
  })
  satellites: SatelliteMessage[];

  constructor(satellites: SatelliteMessage[]) {
    this.satellites = satellites;
  }
}

export const TopsecretDtoSchema = joi.object({
  satellites: joi.array().items(satelliteMessageSchema),
});
