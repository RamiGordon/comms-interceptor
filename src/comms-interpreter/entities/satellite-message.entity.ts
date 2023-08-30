import * as joi from 'joi';

export class SatelliteMessage {
  name: string;
  distance: number;
  message: string[];

  constructor({
    name,
    distance,
    message,
  }: {
    name: string;
    distance: number;
    message: string[];
  }) {
    this.name = name;
    this.distance = distance;
    this.message = message;
  }
}

// FIXME: typo
export const satelliteMessageSchema = joi.object({
  name: joi.string().required(),
  distance: joi.number().required(),
  message: joi.array().items(joi.string().allow('')),
});
