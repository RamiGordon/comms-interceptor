import * as joi from 'joi';

export class TopsecretSplitCreateDto {
  distance: number;
  message: string[];

  constructor({ distance, message }: { distance: number; message: string[] }) {
    this.distance = distance;
    this.message = message;
  }
}

export const TopsecretSplitCreateDtoSchema = joi.object({
  distance: joi.number().required(),
  message: joi.array().items(joi.string().allow('')),
});
