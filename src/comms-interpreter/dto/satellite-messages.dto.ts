import * as joi from 'joi';
import {
  SatelliteMessage,
  satelliteMessageSchema,
} from '../entities/satellite-message.entity';

export class SatelliteMessagesDto {
  satellites: SatelliteMessage[];

  constructor(satellites: SatelliteMessage[]) {
    this.satellites = satellites;
  }
}

export const SatelliteMessagesDtoSchema = joi.object({
  satellites: joi.array().items(satelliteMessageSchema),
});
