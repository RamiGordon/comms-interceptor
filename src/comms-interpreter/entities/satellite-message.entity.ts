import * as joi from 'joi';

export class SatelliteMessage {
  name: string;
  distance: number;
  message: string[];
}

export const satelliteMessageSchema = joi.object({
  name: joi.string().required(),
  distance: joi.number().required(),
  message: joi.array().items(joi.string().allow('')),
});
