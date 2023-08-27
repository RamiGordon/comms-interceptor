import { JoiValidationPipe } from './joi-validation.pipe';
import { BadRequestException } from '@nestjs/common';
import * as joi from 'joi';

describe('JoiValidationPipe', () => {
  const schema = joi.object({
    name: joi.string().required(),
    age: joi.number(),
  });
  const pipe = new JoiValidationPipe(schema);

  it('should transform valueif it passes validation', () => {
    const value = { name: 'John Snow', age: 33 };
    const transformedValue = pipe.transform(value, Object.create({}));

    expect(transformedValue).toBe(value);
  });

  it('should throw BadRequestException if value fails validation', () => {
    const value = { age: 33 };

    expect(() => pipe.transform(value, Object.create({}))).toThrow(
      BadRequestException,
    );
  });
});
